import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchOffers, fetchPartners, upsertOffer, deleteOffer } from "@/service/supabaseData";
import { Avatar, Badge, Spinner, Inp, Sel, Tex, Modal, Field, B, fmtDate } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { Plus, X } from "lucide-react";

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb",
    borderRadius: 10, fontSize: 14, background: "#fff", boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: 70 };

async function uploadImage(file: File, folder: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "activity_unsigned");
    formData.append("folder", folder);
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

// ─── Multi-Image Manager ───────────────────────────────────────
function ImageManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput]   = useState("");

    const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
    const addUrl = () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        onChange([...images, trimmed]);
        setUrlInput("");
    };
    const upload = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadImage(file, "offers");
            onChange([...images, url]);
            toast.success("تم رفع الصورة");
        } catch { toast.error("فشل رفع الصورة"); }
        finally { setUploading(false); }
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <FieldLabel label="صور العرض" />

            {/* Current images */}
            {images.length > 0 && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    {images.map((img, i) => (
                        <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                            <img src={img} alt={`صورة ${i + 1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb", display: "block" }} />
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#dc2626", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
                            >
                                <X size={11} />
                            </button>
                            {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 9, textAlign: "center", borderRadius: "0 0 9px 9px", padding: "2px 0" }}>رئيسية</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload file */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <label style={{ flex: 1, padding: "9px 14px", background: "#f3f4f6", border: "1px dashed #d1d5db", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#374151", textAlign: "center", display: "block" }}>
                    {uploading ? "⏳ جاري الرفع..." : "📁 رفع صورة من الجهاز"}
                    <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) { upload(f); e.target.value = ""; } }}
                    />
                </label>
            </div>

            {/* URL input */}
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="أو أضف رابط صورة مباشر"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                    dir="ltr"
                />
                <button type="button" onClick={addUrl} style={{ padding: "9px 14px", background: B, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <Plus size={14} /> إضافة
                </button>
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>يمكنك إضافة أكثر من صورة. الصورة الأولى هي الرئيسية.</div>
        </div>
    );
}

const BLANK_FORM = {
    title: "", title_ar: "", title_en: "", title_tr: "",
    partner_id: "",
    description: "", description_ar: "", description_en: "", description_tr: "",
    target_audience_ar: "", target_audience_en: "", target_audience_tr: "",
    contact_method_ar: "", contact_method_en: "", contact_method_tr: "",
    contact_link: "",
    discount_percentage: 0, expires_at: "", status: "active",
    image_url: "", image_urls: [] as string[],
    show_on_homepage: false, order_index: 0,
};

export default function OffersAdmin() {
    useRoleGuard(['offers']);
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();

    const [offers,   setOffers]   = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [editing,  setEditing]  = useState<any | null>(null);
    const [form,     setForm]     = useState<typeof BLANK_FORM>(BLANK_FORM);
    const [openImage, setOpenImage] = useState<string | null>(null);

    const f = (key: keyof typeof BLANK_FORM) => (val: any) => setForm((p) => ({ ...p, [key]: val }));

    const load = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [offersData, partnersData] = await Promise.all([fetchOffers(), fetchPartners()]);
            setOffers(offersData || []);
            setPartners(partnersData || []);
        } catch { toast.error("فشل تحميل العروض"); }
        finally { if (showLoading) setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openEdit = (o: any) => {
        setEditing(o);
        setForm({
            title: o.title || "", title_ar: o.title_ar || "", title_en: o.title_en || "", title_tr: o.title_tr || "",
            partner_id: o.partner_id || o.partners?.id || "",
            description: o.description || "", description_ar: o.description_ar || "", description_en: o.description_en || "", description_tr: o.description_tr || "",
            target_audience_ar: o.target_audience_ar || "", target_audience_en: o.target_audience_en || "", target_audience_tr: o.target_audience_tr || "",
            contact_method_ar: o.contact_method_ar || "", contact_method_en: o.contact_method_en || "", contact_method_tr: o.contact_method_tr || "",
            contact_link: o.contact_link || "",
            discount_percentage: o.discount_percentage ?? 0,
            expires_at: o.expires_at?.slice(0, 10) || "",
            status: o.status || "active",
            image_url: o.image_url || "",
            image_urls: Array.isArray(o.image_urls) ? o.image_urls : (o.image_url ? [o.image_url] : []),
            show_on_homepage: !!o.show_on_homepage,
            order_index: o.order_index ?? 0,
        });
        setModal(true);
    };

    const openNew = () => { setEditing(null); setForm(BLANK_FORM); setModal(true); };

    const save = async () => {
        if (!form.title && !form.title_ar) { toast.error("يرجى إدخال العنوان"); return; }
        if (!form.partner_id) { toast.error("يرجى اختيار الشريك"); return; }
        setSaving(true);
        try {
            const allImages = form.image_urls.filter(Boolean);
            const primaryImage = allImages[0] || form.image_url || null;
            const payload: any = {
                title:          form.title          || form.title_en || form.title_ar || "",
                title_ar:       form.title_ar       || null,
                title_en:       form.title_en       || null,
                title_tr:       form.title_tr       || null,
                partner_id:     form.partner_id,
                description:    form.description    || form.description_ar || null,
                description_ar: form.description_ar || null,
                description_en: form.description_en || null,
                description_tr: form.description_tr || null,
                target_audience_ar:  form.target_audience_ar  || null,
                target_audience_en:  form.target_audience_en  || null,
                target_audience_tr:  form.target_audience_tr  || null,
                contact_method_ar:   form.contact_method_ar   || null,
                contact_method_en:   form.contact_method_en   || null,
                contact_method_tr:   form.contact_method_tr   || null,
                contact_link:        form.contact_link         || null,
                discount_percentage: Number(form.discount_percentage),
                expires_at:          form.expires_at || null,
                status:              form.status,
                image_url:           primaryImage,
                image_urls:          allImages.length ? allImages : null,
                show_on_homepage:    !!form.show_on_homepage,
                order_index:         form.order_index ?? 0,
            };
            if (editing) payload.id = editing.id;
            await upsertOffer(payload);
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false); load(false);
        } catch (err: any) { toast.error(err.message || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const toggleOffer = async (e: React.MouseEvent, o: any) => {
        e.stopPropagation();
        try {
            await upsertOffer({ id: o.id, title: o.title, partner_id: o.partner_id || o.partners?.id, description: o.description, discount_percentage: o.discount_percentage, expires_at: o.expires_at || null, status: o.status === "active" ? "inactive" : "active", image_url: o.image_url });
            toast.success("تم التحديث"); load(false);
        } catch (err: any) { toast.error(err.message || "فشل التحديث"); }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة العروض</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{offers.length} عروض</p>
                </div>
                <button onClick={openNew} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة عرض</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-[13px] text-right">
                            <thead>
                                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                                    {["العرض", "الشريك", "الخصم", "الانتهاء", "الرئيسية", "الحالة", "إجراءات"].map((h) => (
                                        <th key={h} className="p-3 md:px-4 md:py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {offers.map((o) => (
                                    <tr key={o.id} className="border-b border-[#fafafa] hover:bg-gray-50">
                                        <td className="p-3 md:px-4 md:py-3">
                                            <div className="flex items-center gap-3">
                                                {o.image_url && (
                                                    <img src={o.image_url} alt={o.title_ar || o.title} className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-90" onClick={() => setOpenImage(o.image_url)} />
                                                )}
                                                <div>
                                                    <span className="font-bold text-[#111] block">{o.title_ar || o.title}</span>
                                                    {o.title_en && <span className="text-[11px] text-[#9ca3af]">{o.title_en}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 md:px-4 md:py-3 text-[#6b7280] whitespace-nowrap">{o.partners?.name_ar || o.partners?.name || "—"}</td>
                                        <td className="p-3 md:px-4 md:py-3"><span className="font-black text-lg" style={{ color: B }}>{o.discount_percentage}%</span></td>
                                        <td className="p-3 md:px-4 md:py-3 text-[#9ca3af] text-[12px] whitespace-nowrap">{o.expires_at ? fmtDate(o.expires_at) : "—"}</td>
                                        <td className="p-3 md:px-4 md:py-3 whitespace-nowrap">
                                            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 700, background: o.show_on_homepage ? "rgba(16,185,129,0.12)" : "#f3f4f6", color: o.show_on_homepage ? "#059669" : "#9ca3af" }}>
                                                {o.show_on_homepage ? "ظاهر" : "مخفي"}
                                            </span>
                                        </td>
                                        <td className="p-3 md:px-4 md:py-3 whitespace-nowrap"><Badge type={o.status}>{o.status === "active" ? "نشط" : "معطل"}</Badge></td>
                                        <td className="p-3 md:px-4 md:py-3">
                                            <div className="flex gap-1.5 flex-nowrap">
                                                <button type="button" onClick={() => openEdit(o)} className="w-7 h-7 rounded-lg border-none bg-[#f3f4f6] cursor-pointer text-[13px] flex items-center justify-center">✏️</button>
                                                <button type="button" onClick={(e) => toggleOffer(e, o)} className="w-7 h-7 rounded-lg border-none cursor-pointer text-[13px] flex items-center justify-center" style={{ background: o.status === "active" ? "#fef3c7" : "#d1fae5", color: o.status === "active" ? "#d97706" : "#059669" }}>{o.status === "active" ? "⏸" : "▶"}</button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); e.preventDefault();
                                                        setConfirm({
                                                            title: "تأكيد الحذف", message: `حذف "${o.title_ar || o.title}"؟`, danger: true,
                                                            onConfirm: async () => {
                                                                try { await deleteOffer(o.id); setConfirm(null); toast.success("تم الحذف"); load(false); }
                                                                catch (err: any) { toast.error(err.message || "فشل الحذف"); }
                                                            }
                                                        });
                                                    }}
                                                    className="w-7 h-7 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer text-[13px] flex items-center justify-center"
                                                >🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!offers.length && <div className="text-center py-12 text-[#9ca3af]"><div className="text-[40px] mb-2">🏷️</div><p>لا توجد عروض بعد</p></div>}
                    </div>
                </div>
            )}

            <Modal open={modal} title={editing ? "تعديل العرض" : "عرض جديد"} onClose={() => setModal(false)}>
                <TriInput label="عنوان العرض *" ar={form.title_ar} en={form.title_en || form.title} tr={form.title_tr} onAr={f("title_ar")} onEn={(v) => setForm((p) => ({ ...p, title_en: v, title: v }))} onTr={f("title_tr")} />
                <TriInput label="وصف العرض" ar={form.description_ar} en={form.description_en} tr={form.description_tr} onAr={f("description_ar")} onEn={f("description_en")} onTr={f("description_tr")} multiline />
                <TriInput label="الفئة المستهدفة" ar={form.target_audience_ar} en={form.target_audience_en} tr={form.target_audience_tr} onAr={f("target_audience_ar")} onEn={f("target_audience_en")} onTr={f("target_audience_tr")} />
                <TriInput label="طريقة التواصل" ar={form.contact_method_ar} en={form.contact_method_en} tr={form.contact_method_tr} onAr={f("contact_method_ar")} onEn={f("contact_method_en")} onTr={f("contact_method_tr")} />

                <Inp label="رابط التواصل المباشر" value={form.contact_link} onChange={(e: any) => f("contact_link")(e.target.value)} placeholder="https://wa.me/..." />

                <Field label="الشريك *">
                    <select value={form.partner_id} onChange={(e) => f("partner_id")(e.target.value)} style={inputStyle}>
                        <option value="">اختر الشريك</option>
                        {partners.map((p: any) => <option key={p.id} value={p.id}>{p.name_ar || p.name}</option>)}
                    </select>
                </Field>

                {/* Multi-image manager */}
                <ImageManager images={form.image_urls} onChange={(imgs) => setForm((p) => ({ ...p, image_urls: imgs, image_url: imgs[0] || "" }))} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <Inp label="نسبة الخصم %" type="number" min="0" max="100" value={form.discount_percentage} onChange={(e: any) => f("discount_percentage")(e.target.value)} placeholder="20" />
                    <Inp label="تاريخ الانتهاء" type="date" value={form.expires_at} onChange={(e: any) => f("expires_at")(e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                        <FieldLabel label="ترتيب الظهور" />
                        <input style={inputStyle} type="number" value={form.order_index} onChange={(e) => f("order_index")(+e.target.value)} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", paddingTop: 22 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            <input type="checkbox" checked={!!form.show_on_homepage} onChange={(e) => f("show_on_homepage")(e.target.checked)} />
                            عرض على الصفحة الرئيسية
                        </label>
                    </div>
                </div>

                <Sel label="الحالة" value={form.status} onChange={(e: any) => f("status")(e.target.value)}>
                    <option value="active">نشط</option>
                    <option value="inactive">معطل</option>
                </Sel>

                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
                </button>
            </Modal>

            {/* Lightbox */}
            {openImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 cursor-zoom-out" onClick={() => setOpenImage(null)}>
                    <div className="relative max-w-4xl w-full flex flex-col items-center">
                        <button onClick={() => setOpenImage(null)} className="absolute -top-14 right-0 p-2 text-white/80 hover:text-white rounded-full bg-black/40">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        <img src={openImage} alt="تكبير الصورة" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}
        </div>
    );
}
