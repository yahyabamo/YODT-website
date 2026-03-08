import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import { Spinner, Inp, Sel, Tex, Modal, B, fmtDate } from "./components/AdminUI";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
    id: string; title: string; description: string; company: string;
    location: string; type: "job" | "volunteer" | "internship" | "parttime";
    salary: string; apply_mode: "form" | "link"; apply_link: string | null;
    deadline: string | null; is_active: boolean; created_at: string;
}

interface Application {
    id: string; job_id: string; student_name: string;
    phone: string; email: string | null; university: string | null; academic_year: string | null;
    notes: string | null; cv_url: string | null; student_card_url: string | null;
    status: "pending" | "reviewed" | "accepted" | "rejected"; admin_notes: string | null;
    created_at: string;
    jobs?: { title: string; type: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CFG = {
    job: { label: "وظيفة", icon: "💼", color: "#0ea5e9" },
    volunteer: { label: "تطوع", icon: "🤝", color: "#10b981" },
    internship: { label: "تدريب", icon: "🎓", color: "#8b5cf6" },
    parttime: { label: "دوام جزئي", icon: "⏰", color: "#f59e0b" },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending: { label: "قيد الانتظار", color: "#d97706", bg: "#fef3c7", icon: "⏳" },
    reviewed: { label: "قيد المراجعة", color: "#2563eb", bg: "#dbeafe", icon: "🔍" },
    accepted: { label: "مقبول", color: "#059669", bg: "#d1fae5", icon: "✅" },
    rejected: { label: "مرفوض", color: "#dc2626", bg: "#fee2e2", icon: "❌" },
};

const ACCENT = B || "#0ea5e9";

const inpS: React.CSSProperties = {
    width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb",
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────
function Tab({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
    return (
        <button onClick={onClick}
            style={{
                padding: "9px 18px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit",
                border: active ? `2px solid ${ACCENT}` : "2px solid transparent",
                background: active ? `${ACCENT}12` : "transparent",
                color: active ? ACCENT : "#6b7280", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", gap: 7, transition: "all .2s",
            }}>
            {children}
            {count !== undefined && (
                <span style={{
                    fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 99, minWidth: 20, textAlign: "center",
                    background: active ? ACCENT : "#e5e7eb",
                    color: active ? "#fff" : "#6b7280",
                }}>{count}</span>
            )}
        </button>
    );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}>
            <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>{desc}</p>
            </div>
            <button onClick={() => onChange(!checked)}
                style={{
                    width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
                    background: checked ? ACCENT : "#d1d5db", position: "relative", transition: "background .2s", flexShrink: 0,
                }}>
                <div style={{
                    position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                    transition: "left .2s", left: checked ? 23 : 3,
                }} />
            </button>
        </div>
    );
}

// ─── Job Form Modal ───────────────────────────────────────────────────────────
interface JobForm {
    title: string; description: string; company: string; location: string;
    type: "job" | "volunteer" | "internship" | "parttime";
    salary: string;
    apply_mode: "form" | "link";
    apply_link: string; deadline: string; is_active: boolean;
}

function JobFormModal({ open, editing, onClose, onSaved }: { open: boolean; editing: Job | null; onClose: () => void; onSaved: () => void }) {
    const EMPTY: JobForm = { title: "", description: "", company: "", location: "", type: "job", salary: "", apply_mode: "form", apply_link: "", deadline: "", is_active: true };
    const [form, setForm] = useState<JobForm>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editing) {
            setForm({
                title: editing.title,
                description: editing.description || "",
                company: editing.company,
                location: editing.location || "",
                type: editing.type,
                salary: editing.salary || "",
                apply_mode: editing.apply_mode,
                apply_link: editing.apply_link || "",
                deadline: editing.deadline?.slice(0, 10) || "",
                is_active: editing.is_active,
            });
        } else { setForm(EMPTY); }
    }, [editing, open]);

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        if (!form.title.trim()) return toast.error("يرجى إدخال عنوان الفرصة");
        if (!form.company.trim()) return toast.error("يرجى إدخال اسم الجهة");
        if (form.apply_mode === "link" && !form.apply_link?.trim()) return toast.error("يرجى إدخال رابط التقديم");
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                company: form.company.trim(),
                location: form.location.trim() || null,
                type: form.type,
                salary: form.salary.trim() || null,
                apply_mode: form.apply_mode,
                apply_link: form.apply_mode === "link" ? (form.apply_link?.trim() || null) : null,
                deadline: form.deadline || null,
                is_active: form.is_active,
            };
            if (editing) {
                const { error } = await supabase.from("jobs").update(payload).eq("id", editing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("jobs").insert(payload);
                if (error) throw error;
            }
            toast.success(editing ? "تم تحديث الفرصة ✅" : "تم إضافة الفرصة ✅");
            onSaved(); onClose();
        } catch (err: any) { toast.error(err.message || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const typeCfg = TYPE_CFG[form.type as keyof typeof TYPE_CFG];

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto"
                style={{ background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "mIn .3s ease" }}
                dir="rtl">

                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-6 py-5"
                    style={{ background: `linear-gradient(135deg,${typeCfg.color}12,${typeCfg.color}04)`, borderBottom: `1px solid ${typeCfg.color}22`, borderRadius: "24px 24px 0 0" }}>
                    <div className="flex items-center gap-3">
                        <span style={{ fontSize: 24, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeCfg.color}18`, borderRadius: 12 }}>{typeCfg.icon}</span>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: "#111" }}>
                            {editing ? "✏️ تعديل الفرصة" : "✨ نشر فرصة جديدة"}
                        </h3>
                    </div>
                    <button onClick={onClose}
                        style={{ background: "#f3f4f6", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>×</button>
                </div>

                <div className="p-6 flex flex-col gap-4">

                    {/* Type selector */}
                    <div>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>نوع الفرصة</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.entries(TYPE_CFG) as [string, typeof TYPE_CFG.job][]).map(([key, cfg]) => (
                                <button key={key} onClick={() => set("type", key)}
                                    style={{
                                        padding: "10px 14px", borderRadius: 12, border: `2px solid ${form.type === key ? cfg.color : "#e5e7eb"}`,
                                        background: form.type === key ? `${cfg.color}12` : "#fafafa",
                                        color: form.type === key ? cfg.color : "#6b7280",
                                        fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                                        transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    }}>
                                    {cfg.icon} {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic fields */}
                    <LabelInp label="عنوان الفرصة *" value={form.title} onChange={v => set("title", v)} color={typeCfg.color} />
                    <LabelInp label="اسم الجهة / الشركة *" value={form.company} onChange={v => set("company", v)} color={typeCfg.color} />

                    <div className="grid grid-cols-2 gap-3">
                        <LabelInp label="المدينة / الموقع" value={form.location} onChange={v => set("location", v)} color={typeCfg.color} />
                        <LabelInp label="الراتب / التعويض" value={form.salary} onChange={v => set("salary", v)} color={typeCfg.color} />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>التفاصيل والوصف</label>
                        <textarea value={form.description} onChange={e => set("description", e.target.value)}
                            placeholder="اكتب وصفاً تفصيلياً للفرصة، المتطلبات، المهام..."
                            rows={4} style={{ ...inpS, resize: "none", lineHeight: 1.75 }}
                            onFocus={e => (e.target.style.borderColor = typeCfg.color)}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                    </div>

                    {/* Deadline */}
                    <LabelInp label="آخر موعد للتقديم" value={form.deadline} onChange={v => set("deadline", v)} placeholder="" color={typeCfg.color} type="date" />

                    {/* Apply mode */}
                    <div>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>طريقة التقديم</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: "form", label: "نموذج داخلي", icon: "📋", desc: "الطالب يملأ نموذج في التطبيق" },
                                { key: "link", label: "رابط خارجي", icon: "🔗", desc: "توجيه الطالب لموقع خارجي" },
                            ].map(opt => (
                                <button key={opt.key} onClick={() => set("apply_mode", opt.key)}
                                    style={{
                                        padding: "12px", borderRadius: 14, border: `2px solid ${form.apply_mode === opt.key ? typeCfg.color : "#e5e7eb"}`,
                                        background: form.apply_mode === opt.key ? `${typeCfg.color}10` : "#fafafa",
                                        cursor: "pointer", fontFamily: "inherit", textAlign: "right", transition: "all .15s",
                                    }}>
                                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 800, color: form.apply_mode === opt.key ? typeCfg.color : "#374151" }}>
                                        {opt.icon} {opt.label}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* External link (conditional) */}
                    {form.apply_mode === "link" && (
                        <LabelInp label="رابط التقديم الخارجي *" value={form.apply_link || ""} onChange={v => set("apply_link", v)} placeholder="https://careers.example.com/apply" color={typeCfg.color} type="url" />
                    )}

                    {/* Status toggle */}
                    <Toggle
                        label="الفرصة منشورة ومتاحة"
                        desc="هل تريد إتاحة هذه الفرصة للطلاب الآن؟"
                        checked={form.is_active}
                        onChange={v => set("is_active", v)}
                    />

                    {/* Preview strip */}
                    <div className="p-3 rounded-2xl" style={{ background: `${typeCfg.color}08`, border: `1px solid ${typeCfg.color}20` }}>
                        <p style={{ fontSize: 10.5, fontWeight: 800, color: "#9ca3af", margin: "0 0 8px", letterSpacing: .5 }}>معاينة البطاقة</p>
                        <div className="flex items-center gap-3">
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${typeCfg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{typeCfg.icon}</div>
                            <div className="min-w-0">
                                <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{form.title || "عنوان الفرصة"}</p>
                                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{form.company || "اسم الجهة"} {form.location && `· ${form.location}`}</p>
                            </div>
                            <span style={{ marginRight: "auto", flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${typeCfg.color}15`, color: typeCfg.color }}>{typeCfg.label}</span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button onClick={save} disabled={saving}
                        style={{
                            width: "100%", padding: "14px", borderRadius: 16, border: "none",
                            background: saving ? "#9ca3af" : `linear-gradient(135deg,${typeCfg.color},${typeCfg.color}cc)`,
                            color: "#fff", fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer",
                            fontFamily: "inherit", boxShadow: saving ? "none" : `0 4px 20px ${typeCfg.color}44`,
                            transition: "all .2s",
                        }}>
                        {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "نشر الفرصة"}
                    </button>
                </div>

                <style>{`@keyframes mIn { from{opacity:0;transform:scale(.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
            </div>
        </div>
    );
}

// ─── Application Detail Modal ─────────────────────────────────────────────────
function AppDetailModal({ app, onClose, onUpdated }: { app: Application; onClose: () => void; onUpdated: () => void }) {
    const [status, setStatus] = useState(app.status);
    const [adminNotes, setAdminNotes] = useState(app.admin_notes || "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from("job_applications")
                .update({ status, admin_notes: adminNotes || null }).eq("id", app.id);
            if (error) throw error;
            toast.success("تم تحديث حالة الطلب ✅");
            onUpdated(); onClose();
        } catch (err: any) { toast.error(err.message || "فشل التحديث"); }
        finally { setSaving(false); }
    };

    const jobType = (app.jobs?.type as keyof typeof TYPE_CFG) || "job";
    const tcfg = TYPE_CFG[jobType];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
                style={{ background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "mIn .3s ease" }}
                dir="rtl">

                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-6 py-5"
                    style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", borderRadius: "24px 24px 0 0" }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: "#111" }}>
                            {tcfg.icon} تفاصيل الطلب
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                            {app.jobs?.title} • {fmtDate(app.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={app.status} />
                        <button onClick={onClose}
                            style={{ background: "#f3f4f6", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>×</button>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-5">

                    {/* Student grid */}
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: .5 }}>بيانات الطالب</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "الاسم الكامل", value: app.student_name, icon: "👤" },
                                { label: "رقم الجوال", value: app.phone, icon: "📱" },
                                { label: "البريد الإلكتروني", value: app.email || "—", icon: "📧" },
                                { label: "الجامعة", value: app.university || "—", icon: "🏛️" },
                                { label: "السنة الدراسية", value: app.academic_year || "—", icon: "📅" },
                            ].map(({ label, value, icon }) => (
                                <div key={label} className="p-3 rounded-xl" style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}>
                                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{icon} {label}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: 13.5, color: "#111", fontWeight: 700 }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {app.notes && (
                        <div className="p-3 rounded-xl" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11.5, fontWeight: 700, color: "#92400e" }}>📝 ملاحظات الطالب</p>
                            <p style={{ margin: 0, fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>{app.notes}</p>
                        </div>
                    )}

                    {/* Files */}
                    {(app.cv_url || app.student_card_url) && (
                        <div className="flex flex-col gap-2">
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", margin: 0 }}>📎 الملفات المرفوعة</p>
                            {app.cv_url && (
                                <a href={app.cv_url} target="_blank" rel="noreferrer"
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: `${ACCENT}0a`, border: `1.5px solid ${ACCENT}25`, borderRadius: 12, textDecoration: "none", color: ACCENT, fontSize: 13, fontWeight: 700 }}>
                                    <span style={{ fontSize: 18 }}>📄</span> عرض السيرة الذاتية
                                    <span style={{ marginRight: "auto", fontSize: 11, opacity: .6 }}>↗ فتح</span>
                                </a>
                            )}
                            {app.student_card_url && (
                                <a href={app.student_card_url} target="_blank" rel="noreferrer"
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: `${ACCENT}0a`, border: `1.5px solid ${ACCENT}25`, borderRadius: 12, textDecoration: "none", color: ACCENT, fontSize: 13, fontWeight: 700 }}>
                                    <span style={{ fontSize: 18 }}>🪪</span> عرض البطاقة الجامعية
                                    <span style={{ marginRight: "auto", fontSize: 11, opacity: .6 }}>↗ فتح</span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Status update */}
                    <div style={{ border: "1.5px solid #f0f0f0", borderRadius: 16, padding: 16 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 800, color: "#374151", marginBottom: 12 }}>⚙️ تحديث حالة الطلب</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                                <button key={key} onClick={() => setStatus(key as any)}
                                    style={{
                                        padding: "10px 12px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                                        border: `2px solid ${status === key ? cfg.color : "#e5e7eb"}`,
                                        background: status === key ? cfg.bg : "#fafafa",
                                        color: status === key ? cfg.color : "#6b7280",
                                        fontWeight: 700, fontSize: 12.5, transition: "all .15s",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}>
                                    {cfg.icon} {cfg.label}
                                </button>
                            ))}
                        </div>
                        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>ملاحظة للإدارة</label>
                        <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                            placeholder="أضف ملاحظة..." rows={3}
                            style={{ ...inpS, resize: "none", lineHeight: 1.7, marginBottom: 12 }}
                            onFocus={e => (e.target.style.borderColor = ACCENT)}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                        <button onClick={save} disabled={saving}
                            style={{
                                width: "100%", padding: "12px", background: saving ? "#9ca3af" : `linear-gradient(135deg,${ACCENT},${ACCENT}cc)`,
                                color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14,
                                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                            }}>
                            {saving ? "جاري التحديث..." : "حفظ التحديث"}
                        </button>
                    </div>
                </div>

                <style>{`@keyframes mIn { from{opacity:0;transform:scale(.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
            </div>
        </div>
    );
}

// ─── Small Input helper ───────────────────────────────────────────────────────
function LabelInp({ label, value, onChange, placeholder, color, type = "text" }: any) {
    return (
        <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                style={inpS}
                onFocus={e => (e.target.style.borderColor = color)}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
        </div>
    );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function JobAdmin() {
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const [tab, setTab] = useState<"jobs" | "applications">("jobs");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [jobModal, setJobModal] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const load = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [{ data: jData }, { data: aData }] = await Promise.all([
                supabase.from("jobs").select("*").order("created_at", { ascending: false }),
                supabase.from("job_applications").select("*, jobs(title,type)").order("created_at", { ascending: false }),
            ]);
            setJobs(jData || []);
            setApps(aData || []);
        } catch { toast.error("فشل تحميل البيانات"); }
        finally { if (showLoading) setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const toggleJob = async (j: Job) => {
        try {
            const { error } = await supabase.from("jobs").update({ is_active: !j.is_active }).eq("id", j.id);
            if (error) throw error;
            toast.success(j.is_active ? "تم إيقاف الفرصة" : "تم تفعيل الفرصة");
            load(false);
        } catch (err: any) { toast.error(err.message || "فشل التحديث"); }
    };

    const deleteJob = (j: Job) => {
        setConfirm({
            title: "حذف الفرصة", message: `هل تريد حذف "${j.title}"؟ سيتم حذف جميع الطلبات المرتبطة بها.`, danger: true,
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from("jobs").delete().eq("id", j.id);
                    if (error) throw error;
                    setConfirm(null); toast.success("تم الحذف"); load(false);
                } catch (err: any) { toast.error(err.message || "فشل الحذف"); }
            }
        });
    };

    const filteredJobs = jobs.filter(j => {
        const matchType = typeFilter === "all" || j.type === typeFilter;
        const q = search.toLowerCase();
        return matchType && (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
    });

    const filteredApps = apps.filter(a => {
        const matchStatus = statusFilter === "all" || a.status === statusFilter;
        const q = search.toLowerCase();
        return matchStatus && (!q || a.student_name.toLowerCase().includes(q));
    });

    const pendingCount = apps.filter(a => a.status === "pending").length;

    const statsApps = Object.fromEntries(
        ["pending", "reviewed", "accepted", "rejected"].map(k => [k, apps.filter(a => a.status === k).length])
    );

    return (
        <div dir="rtl">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">💼 إدارة الوظائف والتطوع</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">
                        {jobs.length} فرصة منشورة · {apps.length} طلب مقدم
                    </p>
                </div>
                {tab === "jobs" && (
                    <button onClick={() => { setEditingJob(null); setJobModal(true); }}
                        className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm"
                        style={{ background: ACCENT }}>
                        + نشر فرصة جديدة
                    </button>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <Tab active={tab === "jobs"} onClick={() => { setTab("jobs"); setSearch(""); }} count={jobs.length}>
                    📋 الفرص المنشورة
                </Tab>
                <Tab active={tab === "applications"} onClick={() => { setTab("applications"); setSearch(""); }} count={pendingCount}>
                    📥 الطلبات المقدمة
                    {pendingCount > 0 && <span style={{ color: "#ef4444", fontSize: 11 }}>(جديد)</span>}
                </Tab>
            </div>

            {loading ? <Spinner /> : (
                <>
                    {/* ════════ TAB: JOBS ════════ */}
                    {tab === "jobs" && (
                        <div>
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 بحث..."
                                    style={{ ...inpS, maxWidth: 240 }} />
                                <div className="flex gap-2 flex-wrap">
                                    {[{ k: "all", label: "الكل" }, ...Object.entries(TYPE_CFG).map(([k, c]) => ({ k, label: c.label }))].map(opt => (
                                        <button key={opt.k} onClick={() => setTypeFilter(opt.k)}
                                            style={{
                                                padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                                                border: typeFilter === opt.k ? `2px solid ${ACCENT}` : "2px solid transparent",
                                                background: typeFilter === opt.k ? `${ACCENT}12` : "#f3f4f6",
                                                color: typeFilter === opt.k ? ACCENT : "#374151",
                                                fontWeight: 700, fontSize: 12, transition: "all .15s",
                                            }}>{opt.label}</button>
                                    ))}
                                </div>
                            </div>

                            {filteredJobs.length === 0 ? (
                                <div className="text-center py-16 rounded-2xl" style={{ background: "#fafafa", border: "1.5px dashed #e5e7eb" }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
                                    <p style={{ color: "#6b7280", fontWeight: 700 }}>لا توجد فرص بعد</p>
                                    <button onClick={() => setJobModal(true)}
                                        className="mt-4 px-6 py-2 rounded-xl border-none text-white font-bold cursor-pointer text-sm"
                                        style={{ background: ACCENT }}>انشر أول فرصة</button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-[13px] text-right">
                                            <thead>
                                                <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                                                    {["الفرصة", "النوع", "الجهة", "الموقع", "الراتب", "الموعد", "الحالة", "إجراءات"].map(h => (
                                                        <th key={h} className="px-4 py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredJobs.map(j => {
                                                    const tc = TYPE_CFG[j.type];
                                                    const appCount = apps.filter(a => a.job_id === j.id).length;
                                                    return (
                                                        <tr key={j.id} className="border-b border-[#fafafa] hover:bg-gray-50" style={{ opacity: j.is_active ? 1 : .6 }}>
                                                            <td className="px-4 py-3">
                                                                <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{j.title}</p>
                                                                <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>
                                                                    📋 {appCount} {appCount === 1 ? "طلب" : "طلبات"}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                                    style={{ background: `${tc.color}15`, color: tc.color }}>
                                                                    {tc.icon} {tc.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">{j.company}</td>
                                                            <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">{j.location || "—"}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span style={{ fontWeight: 700, color: tc.color }}>{j.salary || "—"}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-[#9ca3af] text-[12px] whitespace-nowrap">
                                                                {j.deadline ? new Date(j.deadline).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) : "—"}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                                    style={{ background: j.is_active ? "#d1fae5" : "#f3f4f6", color: j.is_active ? "#059669" : "#6b7280" }}>
                                                                    {j.is_active ? "✅ نشطة" : "⏸ معطلة"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-1.5">
                                                                    <button onClick={() => { setEditingJob(j); setJobModal(true); }}
                                                                        style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                                                                    <button onClick={() => toggleJob(j)}
                                                                        style={{ width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", background: j.is_active ? "#fef3c7" : "#d1fae5", color: j.is_active ? "#d97706" : "#059669" }}>
                                                                        {j.is_active ? "⏸" : "▶"}
                                                                    </button>
                                                                    <button onClick={() => deleteJob(j)}
                                                                        style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════ TAB: APPLICATIONS ════════ */}
                    {tab === "applications" && (
                        <div>
                            {/* Stats row */}
                            <div className="grid grid-cols-4 gap-3 mb-5">
                                {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                                    <button key={key} onClick={() => setStatusFilter(key)}
                                        className="py-3 px-2 rounded-xl border-none cursor-pointer text-center transition-all"
                                        style={{ background: statusFilter === key ? cfg.bg : "#fff", border: `2px solid ${statusFilter === key ? cfg.color + "50" : "#f0f0f0"}` }}>
                                        <div style={{ fontSize: 20, marginBottom: 2 }}>{cfg.icon}</div>
                                        <div style={{ fontSize: 22, fontWeight: 900, color: cfg.color }}>{statsApps[key] || 0}</div>
                                        <div style={{ fontSize: 10.5, color: "#9ca3af", fontWeight: 700 }}>{cfg.label}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Search & filter */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 بحث باسم الطالب أو رقمه..."
                                    style={{ ...inpS, maxWidth: 280 }} />
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => setStatusFilter("all")}
                                        style={{ padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, border: statusFilter === "all" ? `2px solid ${ACCENT}` : "2px solid transparent", background: statusFilter === "all" ? `${ACCENT}12` : "#f3f4f6", color: statusFilter === "all" ? ACCENT : "#374151", transition: "all .15s" }}>
                                        الكل ({apps.length})
                                    </button>
                                </div>
                            </div>

                            {filteredApps.length === 0 ? (
                                <div className="text-center py-16 rounded-2xl" style={{ background: "#fafafa", border: "1.5px dashed #e5e7eb" }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                                    <p style={{ color: "#6b7280", fontWeight: 700 }}>لا توجد طلبات</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-[13px] text-right">
                                            <thead>
                                                <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                                                    {["الطالب", "الفرصة", "الجامعة", "الجوال", "تاريخ التقديم", "الحالة", "إجراءات"].map(h => (
                                                        <th key={h} className="px-4 py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredApps.map(a => {
                                                    const jobType = (a.jobs?.type as keyof typeof TYPE_CFG) || "job";
                                                    const tc = TYPE_CFG[jobType];
                                                    return (
                                                        <tr key={a.id} className="border-b border-[#fafafa] hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApp(a)}>
                                                            <td className="px-4 py-3">
                                                                <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{a.student_name}</p>
                                                                <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>{a.university}</p>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                                                                    <span>{tc.icon}</span>
                                                                    <span style={{ color: "#374151", fontWeight: 600 }}>{a.jobs?.title || "—"}</span>
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-[#6b7280]">{a.university || "—"}</td>
                                                            <td className="px-4 py-3 text-[#6b7280]" dir="ltr">{a.phone}</td>
                                                            <td className="px-4 py-3 text-[#9ca3af] text-[12px] whitespace-nowrap">{fmtDate(a.created_at)}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                                                            <td className="px-4 py-3">
                                                                <button onClick={e => { e.stopPropagation(); setSelectedApp(a); }}
                                                                    style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${ACCENT}40`, background: `${ACCENT}0a`, color: ACCENT, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                                                                    عرض 🔍
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <JobFormModal open={jobModal} editing={editingJob} onClose={() => { setJobModal(false); setEditingJob(null); }} onSaved={() => load(false)} />
            {selectedApp && <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} onUpdated={() => load(false)} />}
        </div>
    );
}