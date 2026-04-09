import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Badge, Spinner, Inp, Sel, Tex, Modal, Field, B, fmtDate } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
    id: string; title: string; description: string; icon: string;
    color: string; category: string; is_available: boolean;
    sort_order: number; created_at: string;
}

interface ServiceRequest {
    id: string; service_id: string; student_name: string; student_id_number: string;
    phone: string; email: string; university: string; academic_year: string;
    notes: string; student_card_url: string; status: string; admin_notes: string;
    created_at: string; services?: { title: string; icon: string; color: string };
}

const ACCENT = B || "#065f46";
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    pending: { label: "قيد المراجعة", bg: "#fef3c7", color: "#d97706", icon: "⏳" },
    approved: { label: "مقبول", bg: "#d1fae5", color: "#059669", icon: "✅" },
    rejected: { label: "مرفوض", bg: "#fee2e2", color: "#dc2626", icon: "❌" },
    completed: { label: "مكتمل", bg: "#dbeafe", color: "#2563eb", icon: "🎉" },
};

const COLORS = ["#059669", "#d97706", "#7c3aed", "#0ea5e9", "#e11d48", "#0891b2", "#65a30d", "#9333ea"];
const EMOJIS = ["🤝", "📖", "💰", "🧺", "🎓", "🏥", "📚", "💊", "🍽️", "🌙", "⭐", "🏛️"];

const inpS: React.CSSProperties = {
    width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb",
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit"
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

// ─── Request Detail Modal ─────────────────────────────────────────────────────
function RequestDetailModal({ req, onClose, onUpdate }: { req: ServiceRequest; onClose: () => void; onUpdate: () => void }) {
    const [status, setStatus] = useState(req.status);
    const [adminNotes, setAdminNotes] = useState(req.admin_notes || "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from("service_requests").update({ status, admin_notes: adminNotes }).eq("id", req.id);
            if (error) throw error;
            toast.success("تم التحديث");
            onUpdate();
            onClose();
        } catch (err: any) { toast.error(err.message || "فشل التحديث"); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
                    style={{ background: req.services ? `${req.services.color}10` : "#fafafa" }}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{req.services?.icon || "📋"}</span>
                        <div>
                            <p className="text-xs font-bold text-gray-400 m-0">{req.services?.title}</p>
                            <h3 className="font-extrabold text-gray-900 m-0">{req.student_name}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border-none cursor-pointer flex items-center justify-center text-gray-500 transition-colors">✕</button>
                </div>

                <div className="p-6 space-y-4" dir="rtl">
                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            // { label: "رقم الطالب", value: req.student_id_number, icon: "🎓" },
                            { label: "الجوال", value: req.phone, icon: "📱" },
                            { label: "البريد", value: req.email || "—", icon: "📧" },
                            { label: "الجامعة", value: req.university, icon: "🏛️" },
                            { label: "السنة", value: req.academic_year || "—", icon: "📅" },
                            { label: "تاريخ الطلب", value: fmtDate(req.created_at), icon: "📆" },
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-gray-400 m-0 mb-0.5">{item.icon} {item.label}</p>
                                <p className="text-sm font-bold text-gray-800 m-0 truncate">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {req.notes && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-600 m-0 mb-1">💬 ملاحظات الطالب</p>
                            <p className="text-sm text-gray-700 m-0 leading-relaxed">{req.notes}</p>
                        </div>
                    )}

                    {/* Student ID Image */}
                    {req.student_card_url && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-2">🪪 الهوية الجامعية</p>
                            <a href={req.student_card_url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors text-sm font-bold text-gray-600 hover:text-gray-800 cursor-pointer">
                                <span>🔗</span> عرض / تحميل الهوية
                            </a>
                        </div>
                    )}

                    {/* Status Update */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">تحديث الحالة</p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button key={key} onClick={() => setStatus(key)}
                                    className="py-2 px-3 rounded-xl border-none cursor-pointer text-xs font-bold transition-all"
                                    style={{ background: status === key ? cfg.bg : "#f9fafb", color: status === key ? cfg.color : "#9ca3af", border: `2px solid ${status === key ? cfg.color + "50" : "transparent"}` }}>
                                    {cfg.icon} {cfg.label}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">ملاحظة الإدارة (اختياري)</label>
                            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                                rows={2} placeholder="رسالة للطالب..." style={{ ...inpS, resize: "vertical" }} />
                        </div>
                        <button onClick={save} disabled={saving}
                            className="w-full py-3 rounded-2xl border-none font-extrabold text-white text-sm cursor-pointer hover:opacity-90 disabled:opacity-60"
                            style={{ background: ACCENT }}>
                            {saving ? "جاري الحفظ..." : "حفظ التحديث"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AwnAdmin() {
    useRoleGuard(['3wn']);
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();

    const [tab, setTab] = useState<"services" | "requests">("services");
    const [services, setServices] = useState<Service[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
    const [reqFilter, setReqFilter] = useState("all");

    const [form, setForm] = useState({
        title: "", description: "", icon: "🤝", color: "#059669",
        category: "عام", is_available: true, sort_order: 0
    });

    const load = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [{ data: sv }, { data: rq }] = await Promise.all([
                supabase.from("services").select("*").order("sort_order"),
                supabase.from("service_requests").select("*, services(title,icon,color)").order("created_at", { ascending: false })
            ]);
            setServices(sv || []);
            setRequests(rq || []);
        } catch { toast.error("فشل تحميل البيانات"); }
        finally { if (showLoading) setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ title: "", description: "", icon: "🤝", color: "#059669", category: "عام", is_available: true, sort_order: services.length });
        setModal(true);
    };

    const openEdit = (s: Service) => {
        setEditing(s);
        setForm({ title: s.title, description: s.description || "", icon: s.icon, color: s.color, category: s.category, is_available: s.is_available, sort_order: s.sort_order });
        setModal(true);
    };

    const save = async () => {
        if (!form.title) { toast.error("يرجى إدخال العنوان"); return; }
        setSaving(true);
        try {
            if (editing) {
                const { error } = await supabase.from("services").update(form).eq("id", editing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("services").insert(form);
                if (error) throw error;
            }
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false);
            load(false);
        } catch (err: any) { toast.error(err.message || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const toggle = async (s: Service) => {
        try {
            await supabase.from("services").update({ is_available: !s.is_available }).eq("id", s.id);
            toast.success("تم التحديث");
            load(false);
        } catch { toast.error("فشل التحديث"); }
    };

    const deleteService = (s: Service) => {
        setConfirm({
            title: "تأكيد الحذف",
            message: `حذف خدمة "${s.title}"؟`,
            danger: true,
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from("services").delete().eq("id", s.id);
                    if (error) throw error;
                    setConfirm(null); toast.success("تم الحذف"); load(false);
                } catch (err: any) { toast.error(err.message || "فشل الحذف"); }
            }
        });
    };

    const filteredReqs = reqFilter === "all" ? requests : requests.filter(r => r.status === reqFilter);

    const reqStats = {
        all: requests.length,
        pending: requests.filter(r => r.status === "pending").length,
        approved: requests.filter(r => r.status === "approved").length,
        rejected: requests.filter(r => r.status === "rejected").length,
        completed: requests.filter(r => r.status === "completed").length,
    };

    return (
        <div dir="rtl">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة برنامج عون </h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{services.length} خدمة · {requests.length} طلب</p>
                </div>
                {tab === "services" && (
                    <button onClick={openAdd}
                        className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm"
                        style={{ background: ACCENT }}>+ إضافة خدمة</button>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
                {([["services", "الخدمات 📋", services.length], ["requests", "الطلبات 📥", requests.length]] as const).map(([key, label, count]) => (
                    <button key={key} onClick={() => setTab(key as any)}
                        className="px-5 py-2 rounded-lg border-none text-sm font-bold cursor-pointer transition-all"
                        style={{ background: tab === key ? "#fff" : "transparent", color: tab === key ? "#111" : "#6b7280", boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,.1)" : "none" }}>
                        {label}
                        <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-extrabold"
                            style={{ background: tab === key ? ACCENT + "15" : "#e5e7eb", color: tab === key ? ACCENT : "#6b7280" }}>{count}</span>
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : (
                <>
                    {/* ══════════════ TAB: SERVICES ══════════════ */}
                    {tab === "services" && (
                        <>
                            {services.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                    <div className="text-5xl mb-3">🤝</div>
                                    <p className="text-gray-400 font-bold">لا توجد خدمات بعد</p>
                                    <button onClick={openAdd} className="mt-4 px-6 py-2 rounded-xl border-none text-white font-bold cursor-pointer text-sm" style={{ background: ACCENT }}>إضافة أول خدمة</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {services.map(s => (
                                        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            {/* Color bar */}
                                            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg,${s.color},${s.color}80)` }} />
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                                                            style={{ background: `${s.color}18`, border: `2px solid ${s.color}25` }}>
                                                            {s.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-[#111] m-0 text-[15px]">{s.title}</p>
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block" style={{ background: `${s.color}15`, color: s.color }}>{s.category}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: s.is_available ? "#d1fae5" : "#f3f4f6", color: s.is_available ? "#059669" : "#9ca3af" }}>
                                                        {s.is_available ? "✅ نشطة" : "⏸ معطلة"}
                                                    </span>
                                                </div>
                                                {s.description && <p className="text-[13px] text-gray-500 mb-3 m-0 leading-relaxed line-clamp-2">{s.description}</p>}
                                                <div className="flex gap-2 mt-3">
                                                    <button onClick={() => openEdit(s)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">✏️ تعديل</button>
                                                    <button onClick={() => toggle(s)} className="flex-1 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors"
                                                        style={{ background: s.is_available ? "#fef3c7" : "#d1fae5", color: s.is_available ? "#d97706" : "#059669" }}>
                                                        {s.is_available ? "⏸ تعطيل" : "▶ تفعيل"}
                                                    </button>
                                                    <button onClick={() => deleteService(s)} className="w-9 h-9 rounded-xl border-none bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer text-base flex items-center justify-center transition-colors">🗑</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════ TAB: REQUESTS ══════════════ */}
                    {tab === "requests" && (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-5 gap-3 mb-5">
                                {(["all", "pending", "approved", "rejected", "completed"] as const).map(k => {
                                    const cfg = k === "all" ? { label: "الكل", bg: "#f3f4f6", color: "#374151", icon: "📋" } : STATUS_CONFIG[k];
                                    return (
                                        <button key={k} onClick={() => setReqFilter(k)}
                                            className="py-3 px-2 rounded-xl border-none cursor-pointer text-center transition-all"
                                            style={{ background: reqFilter === k ? cfg.bg : "#fff", border: `2px solid ${reqFilter === k ? cfg.color + "50" : "#f0f0f0"}` }}>
                                            <div className="text-lg mb-0.5">{cfg.icon}</div>
                                            <div className="text-xl font-extrabold" style={{ color: cfg.color }}>{reqStats[k]}</div>
                                            <div className="text-[10px] text-gray-400 font-bold">{cfg.label}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredReqs.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                    <div className="text-5xl mb-3">📭</div>
                                    <p className="text-gray-400 font-bold">لا توجد طلبات</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-[13px] text-right">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50">
                                                    {["الطالب", "الخدمة", "الجامعة", "الجوال", "تاريخ الطلب", "الحالة", "إجراءات"].map(h => (
                                                        <th key={h} className="px-4 py-3 font-bold text-[#6b7280] text-right whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredReqs.map(r => (
                                                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <p className="font-bold text-gray-900 m-0">{r.student_name}</p>
                                                            <p className="text-[11px] text-gray-400 m-0">{r.student_id_number}</p>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="flex items-center gap-1.5">
                                                                <span>{r.services?.icon || "📋"}</span>
                                                                <span className="font-bold text-gray-700">{r.services?.title || "—"}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.university || "—"}</td>
                                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap" dir="ltr">{r.phone}</td>
                                                        <td className="px-4 py-3 text-gray-400 text-[12px] whitespace-nowrap">{fmtDate(r.created_at)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                                                        <td className="px-4 py-3">
                                                            <button onClick={() => setSelectedReq(r)}
                                                                className="px-3 py-1.5 rounded-xl border-none text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity text-white"
                                                                style={{ background: ACCENT }}>
                                                                عرض 🔍
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ── Add/Edit Service Modal ── */}
            <Modal open={modal} title={editing ? "تعديل الخدمة" : "خدمة جديدة"} onClose={() => setModal(false)}>
                <Inp label="عنوان الخدمة *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: تقدم بطلب مصحف" />
                <Tex label="وصف الخدمة" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="اشرح الخدمة بإيجاز..." />
                <Inp label="التصنيف" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="مثال: ديني، مالي، غذائي" />

                {/* Icon picker */}
                <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#374151] mb-2">أيقونة الخدمة</label>
                    <div className="flex flex-wrap gap-2">
                        {EMOJIS.map(em => (
                            <button key={em} type="button" onClick={() => setForm(f => ({ ...f, icon: em }))}
                                className="w-10 h-10 rounded-xl text-xl border-none cursor-pointer transition-all"
                                style={{ background: form.icon === em ? ACCENT + "25" : "#f3f4f6", border: `2px solid ${form.icon === em ? ACCENT : "transparent"}`, transform: form.icon === em ? "scale(1.15)" : "scale(1)" }}>
                                {em}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color picker */}
                <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#374151] mb-2">لون الخدمة</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                                className="w-8 h-8 rounded-full border-none cursor-pointer transition-all"
                                style={{ background: c, border: `3px solid ${form.color === c ? "#111" : "transparent"}`, transform: form.color === c ? "scale(1.2)" : "scale(1)" }} />
                        ))}
                        <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                            className="w-8 h-8 rounded-full cursor-pointer border-none" title="اختر لون مخصص" />
                    </div>
                </div>

                {/* Preview */}
                <div className="mb-4 p-3 rounded-2xl border border-gray-100" style={{ background: `${form.color}08` }}>
                    <p className="text-[11px] font-bold text-gray-400 mb-2">معاينة البطاقة</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${form.color}20` }}>{form.icon}</div>
                        <div>
                            <p className="font-extrabold text-gray-900 m-0 text-sm">{form.title || "عنوان الخدمة"}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${form.color}20`, color: form.color }}>{form.category}</span>
                        </div>
                    </div>
                </div>

                <Sel label="الحالة" value={form.is_available ? "true" : "false"} onChange={e => setForm(f => ({ ...f, is_available: e.target.value === "true" }))}>
                    <option value="true">✅ نشطة ومتاحة</option>
                    <option value="false">⏸ معطلة</option>
                </Sel>

                <button onClick={save} disabled={saving}
                    className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white opacity-100 disabled:opacity-70 transition-opacity"
                    style={{ background: ACCENT }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة الخدمة"}
                </button>
            </Modal>

            {/* ── Request Detail Modal ── */}
            {selectedReq && (
                <RequestDetailModal req={selectedReq} onClose={() => setSelectedReq(null)} onUpdate={() => load(false)} />
            )}
        </div>
    );
}
