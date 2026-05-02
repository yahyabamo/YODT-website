import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchPartners, upsertPartner, deletePartner } from "@/service/supabaseData";
import { Badge, Spinner, Inp, Sel, Modal, B } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface Partner {
    id: string;
    name: string;
    name_ar?: string;
    name_en?: string;
    name_tr?: string;
    status: "active" | "inactive";
    website?: string;
    offers_count?: number;
    logo_url?: string;
    description_ar?: string;
    description_en?: string;
    description_tr?: string;
    category?: string;
    city?: string;
    show_on_homepage?: boolean;
    order_index?: number;
    phone?: string;
    crm_status?: string;
    internal_notes?: string;
}

type PartnerForm = Partial<Partner>;

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb",
    borderRadius: 10, fontSize: 14, background: "#fff", boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: 70 };

const BLANK: PartnerForm = { name: "", name_ar: "", name_en: "", name_tr: "", website: "", status: "active", logo_url: "", description_ar: "", description_en: "", description_tr: "", category: "", city: "", show_on_homepage: false, order_index: 0, phone: "", crm_status: "cold", internal_notes: "" };

async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "activity_unsigned");
    formData.append("folder", "partners");
    const res = await fetch("https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
}

function FieldLabel({ label }: { label: string }) {
    return <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 5 }}>{label}</label>;
}

function TriInput({ label, ar, en, tr, onAr, onEn, onTr, multiline }: { label: string; ar: string; en: string; tr: string; onAr: (v: string) => void; onEn: (v: string) => void; onTr: (v: string) => void; multiline?: boolean }) {
    const Tag = multiline ? "textarea" : "input";
    const st = multiline ? textareaStyle : inputStyle;
    return (
        <div style={{ marginBottom: 16 }}>
            <FieldLabel label={label} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Tag style={{ ...st, direction: "rtl" }} placeholder="عربي" value={ar} onChange={(e: any) => onAr(e.target.value)} />
                <Tag style={{ ...st, direction: "ltr" }} placeholder="English" value={en} onChange={(e: any) => onEn(e.target.value)} />
                <Tag style={{ ...st, direction: "ltr" }} placeholder="Türkçe" value={tr} onChange={(e: any) => onTr(e.target.value)} />
            </div>
        </div>
    );
}

export default function PartnersAdmin() {
    useRoleGuard(['partners']);
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Partner | null>(null);
    const [form, setForm] = useState<PartnerForm>(BLANK);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const f = (key: keyof PartnerForm) => (val: any) => setForm((p) => ({ ...p, [key]: val }));

    const load = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try { const data = await fetchPartners(); setPartners((data || []) as Partner[]); }
        catch { toast.error("فشل تحميل الشركاء"); }
        finally { if (showLoading) setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing(null); setForm(BLANK); setSelectedImage(null); setModal(true); };
    const openEdit = (p: Partner) => { setEditing(p); setForm({ ...p }); setSelectedImage(null); setModal(true); };

    const save = async () => {
        if (!form.name && !form.name_ar) { toast.error("يرجى إدخال الاسم"); return; }
        setSaving(true);
        try {
            let logoUrl = form.logo_url;
            if (selectedImage) logoUrl = await uploadImage(selectedImage);
            const payload: any = {
                name:            form.name         || form.name_en || form.name_ar || "",
                name_ar:         form.name_ar      || null,
                name_en:         form.name_en      || null,
                name_tr:         form.name_tr      || null,
                website:         form.website      || null,
                status:          form.status       || "active",
                logo_url:        logoUrl           || null,
                description_ar:  form.description_ar  || null,
                description_en:  form.description_en  || null,
                description_tr:  form.description_tr  || null,
                category:        form.category     || null,
                city:            form.city         || null,
                show_on_homepage: !!form.show_on_homepage,
                order_index:     form.order_index  ?? 0,
                phone:           form.phone        || null,
                crm_status:      form.crm_status   || "cold",
                internal_notes:  form.internal_notes || null,
            };
            if (editing) payload.id = editing.id;
            await upsertPartner(payload);
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false); load(false);
        } catch (err: any) { toast.error(err.message || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const toggleStatus = async (e: React.MouseEvent, p: Partner) => {
        e.stopPropagation();
        try {
            await upsertPartner({ id: p.id, name: p.name, website: p.website, status: p.status === "active" ? "inactive" : "active", logo_url: p.logo_url } as any);
            toast.success("تم التحديث"); load(false);
        } catch (err: any) { toast.error(err.message || "فشل التحديث"); }
    };

    const del = (e: React.MouseEvent, p: Partner) => {
        e.stopPropagation(); e.preventDefault();
        setConfirm({
            title: "تأكيد الحذف", message: `حذف "${p.name_ar || p.name || "الشريك"}"؟`, danger: true,
            onConfirm: async () => {
                try { await deletePartner(p.id); setConfirm(null); toast.success("تم الحذف"); load(false); }
                catch (err: any) { toast.error(err.message || "فشل الحذف"); }
            }
        });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة الشركاء</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{partners.length} شركاء</p>
                </div>
                <button onClick={openNew} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة شريك</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0] flex flex-col">
                            <div className="flex items-center gap-3 mb-3.5">
                                {p.logo_url ? (
                                    <img src={p.logo_url} alt={p.name_ar || p.name} className="w-[52px] h-[52px] rounded-2xl object-cover shrink-0 border border-gray-100" />
                                ) : (
                                    <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[22px] shrink-0" style={{ background: B }}>{(p.name_ar || p.name)[0]}</div>
                                )}
                                <div className="flex-1 min-w-0 pr-1">
                                    <div className="font-bold text-[#111] mb-0.5 truncate">{p.name_ar || p.name}</div>
                                    {p.name_en && <div className="text-[11px] text-[#9ca3af] truncate">{p.name_en}</div>}
                                    {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-[11px] text-[#3b82f6] truncate block">{p.website}</a>}
                                </div>
                                <Badge type={p.status}>{p.status === "active" ? "نشط" : "معطل"}</Badge>
                            </div>

                            {/* Extra meta */}
                            <div className="bg-[#f8fafc] rounded-xl px-3 py-2 mb-3.5 grid grid-cols-2 gap-2 text-[12px]">
                                {p.category && <span className="text-[#6b7280]">📁 {p.category}</span>}
                                {p.city && <span className="text-[#6b7280]">📍 {p.city}</span>}
                                <span className="text-[#6b7280]">🏠 الصفحة الرئيسية: <span className="font-bold" style={{ color: p.show_on_homepage ? '#059669' : '#9ca3af' }}>{p.show_on_homepage ? 'ظاهر' : 'مخفي'}</span></span>
                                <span className="text-[#6b7280]">🔢 ترتيب: <span className="font-bold text-[#111]">{p.order_index ?? 0}</span></span>
                            </div>

                            <div className="flex gap-2 flex-wrap mt-auto">
                                <button type="button" onClick={() => openEdit(p)} className="flex-1 py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-xs text-[#374151]">تعديل</button>
                                <button type="button" onClick={(e) => toggleStatus(e, p)} className="flex-1 py-2 rounded-lg border-none cursor-pointer font-semibold text-xs" style={{ background: p.status === "active" ? "#fef3c7" : "#d1fae5", color: p.status === "active" ? "#d97706" : "#059669" }}>{p.status === "active" ? "تعطيل" : "تفعيل"}</button>
                                <button type="button" onClick={(e) => del(e, p)} className="w-[34px] h-[34px] rounded-lg border-none bg-[#fee2e2] cursor-pointer text-[#dc2626] text-sm flex items-center justify-center shrink-0">🗑</button>
                            </div>
                        </div>
                    ))}
                    {!partners.length && <div className="text-center py-12 text-[#9ca3af] col-span-full"><div className="text-[40px] mb-2">🤝</div><p>لا يوجد شركاء بعد</p></div>}
                </div>
            )}

            <Modal open={modal} title={editing ? "تعديل الشريك" : "شريك جديد"} onClose={() => setModal(false)}>
                <TriInput label="اسم الشريك *" ar={form.name_ar || ""} en={form.name_en || form.name || ""} tr={form.name_tr || ""} onAr={f("name_ar")} onEn={(v) => setForm((p) => ({ ...p, name_en: v, name: v }))} onTr={f("name_tr")} />
                <TriInput label="الوصف" ar={form.description_ar || ""} en={form.description_en || ""} tr={form.description_tr || ""} onAr={f("description_ar")} onEn={f("description_en")} onTr={f("description_tr")} multiline />

                {/* Logo */}
                <div style={{ marginBottom: 16 }}>
                    <FieldLabel label="شعار الشريك" />
                    {form.logo_url && !selectedImage && <img src={form.logo_url} alt="preview" style={{ width: 60, height: 60, objectFit: "contain", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 8 }} />}
                    <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} style={{ width: "100%", marginBottom: 6 }} />
                    <input style={inputStyle} value={form.logo_url || ""} onChange={(e) => f("logo_url")(e.target.value)} placeholder="أو ضع رابط الصورة" />
                </div>

                <Inp label="الموقع الإلكتروني" value={form.website || ""} onChange={(e: any) => f("website")(e.target.value)} placeholder="https://example.com" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                        <FieldLabel label="الفئة" />
                        <input style={inputStyle} value={form.category || ""} onChange={(e) => f("category")(e.target.value)} placeholder="Education / Medical" />
                    </div>
                    <div>
                        <FieldLabel label="المدينة" />
                        <input style={inputStyle} value={form.city || ""} onChange={(e) => f("city")(e.target.value)} placeholder="Istanbul" />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                        <FieldLabel label="ترتيب الظهور" />
                        <input style={{ ...inputStyle, width: "100%" }} type="number" value={form.order_index ?? 0} onChange={(e) => f("order_index")(+e.target.value)} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            <input type="checkbox" checked={!!form.show_on_homepage} onChange={(e) => f("show_on_homepage")(e.target.checked)} />
                            عرض على الصفحة الرئيسية
                        </label>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <Inp label="رقم التواصل (CRM)" value={form.phone || ""} onChange={(e: any) => f("phone")(e.target.value)} placeholder="+90..." />
                    <Sel label="حالة العلاقة (CRM)" value={form.crm_status || "cold"} onChange={(e: any) => f("crm_status")(e.target.value)}>
                        <option value="cold">بارد (لم يتم التواصل)</option>
                        <option value="in_talks">قيد التفاوض</option>
                        <option value="active">داعم / نشط</option>
                        <option value="lapsed">منقطع</option>
                    </Sel>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <FieldLabel label="ملاحظات داخلية (CRM)" />
                    <textarea 
                        style={textareaStyle} 
                        value={form.internal_notes || ""} 
                        onChange={(e) => f("internal_notes")(e.target.value)} 
                        placeholder="تفاصيل التواصل الداخلي..."
                    />
                </div>

                <Sel label="الحالة العامة (على الموقع)" value={form.status} onChange={(e: any) => f("status")(e.target.value)}>
                    <option value="active">نشط</option>
                    <option value="inactive">معطل</option>
                </Sel>

                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
                </button>
            </Modal>
        </div>
    );
}
