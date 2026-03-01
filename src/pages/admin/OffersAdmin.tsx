import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchOffers, fetchPartners, upsertOffer, deleteOffer } from "@/service/supabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Badge, Spinner, Inp, Sel, Tex, Modal, Field, B, fmtDate } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb",
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit"
};

async function uploadImage(file: File, folder: string): Promise<string> {
    const cloudName = "dknz5c7d0";
    const uploadPreset = "activity_unsigned"; // ممكن تغير الاسم لو عملت preset خاص بالعروض

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
}

export default function OffersAdmin() {
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();

    const [offers, setOffers] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState<any>({ title: "", partner_id: "", description: "", discount_percentage: 0, expires_at: "", status: "active", image_url: "" });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [openImage, setOpenImage] = useState<string | null>(null);

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

    const save = async () => {
        if (!form.title) { toast.error("يرجى إدخال العنوان"); return; }
        if (!form.partner_id) { toast.error("يرجى اختيار الشريك"); return; }
        setSaving(true);
        try {
            let finalImageUrl = form.image_url;
            if (selectedImage) {
                finalImageUrl = await uploadImage(selectedImage, "offers");
            }
            const payload = { title: form.title, partner_id: form.partner_id, description: form.description, discount_percentage: Number(form.discount_percentage), expires_at: form.expires_at || null, status: form.status, image_url: finalImageUrl };
            const finalPayload = editing ? { ...payload, id: editing.id } : payload;
            console.log("Saving Offer Payload:", finalPayload);
            await upsertOffer(finalPayload);
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false); load(false);
        } catch (err: any) { toast.error(err.message || err.details || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const toggleOffer = async (e: React.MouseEvent, o: any) => {
        e.stopPropagation();
        const cleanPayload = {
            id: o.id,
            title: o.title,
            partner_id: o.partner_id || o.partners?.id,
            description: o.description,
            discount_percentage: o.discount_percentage,
            expires_at: o.expires_at || null,
            status: o.status === "active" ? "inactive" : "active",
            image_url: o.image_url
        };
        console.log("Toggling Offer Payload:", cleanPayload);
        try { await upsertOffer(cleanPayload); toast.success("تم التحديث"); load(false); }
        catch (err: any) { toast.error(err.message || err.details || "فشل التحديث"); }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة العروض</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{offers.length} عروض</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ title: "", partner_id: "", description: "", discount_percentage: 0, expires_at: "", status: "active", image_url: "" }); setSelectedImage(null); setModal(true) }} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة عرض</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-[13px] text-right">
                            <thead>
                                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                                    {["العرض", "الشريك", "الخصم", "الانتهاء", "الحالة", "إجراءات"].map(h => (
                                        <th key={h} className="p-3 md:px-4 md:py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>{offers.map(o => (
                                <tr key={o.id} className="border-b border-[#fafafa] hover:bg-gray-50">
                                    <td className="p-3 md:px-4 md:py-3">
                                        <div className="flex items-center gap-3">
                                            {o.image_url && (
                                                <img
                                                    src={o.image_url}
                                                    alt={o.title}
                                                    className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setOpenImage(o.image_url)}
                                                />
                                            )}
                                            <span className="font-bold text-[#111] whitespace-nowrap">
                                                {o.title}
                                            </span>
                                        </div>
                                    </td>                                    <td className="p-3 md:px-4 md:py-3 text-[#6b7280] whitespace-nowrap">{o.partners?.name || "—"}</td>
                                    <td className="p-3 md:px-4 md:py-3"><span className="font-black text-lg" style={{ color: B }}>{o.discount_percentage}%</span></td>
                                    <td className="p-3 md:px-4 md:py-3 text-[#9ca3af] text-[12px] whitespace-nowrap">{o.expires_at ? fmtDate(o.expires_at) : "—"}</td>
                                    <td className="p-3 md:px-4 md:py-3 whitespace-nowrap"><Badge type={o.status}>{o.status === "active" ? "نشط" : "معطل"}</Badge></td>
                                    <td className="p-3 md:px-4 md:py-3">
                                        <div className="flex gap-1.5 flex-nowrap">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(o); setForm({ title: o.title, description: o.description || "", image_url: o.image_url || "", partner_id: o.partner_id || o.partners?.id || "", discount_percentage: o.discount_percentage, expires_at: o.expires_at?.slice(0, 10) || "", status: o.status }); setSelectedImage(null); setModal(true) }} className="w-7 h-7 rounded-lg border-none bg-[#f3f4f6] cursor-pointer text-[13px] flex items-center justify-center shrink-0 hover:bg-gray-200">✏️</button>
                                            <button type="button" onClick={(e) => toggleOffer(e, o)} className="w-7 h-7 rounded-lg border-none cursor-pointer text-[13px] flex items-center justify-center shrink-0" style={{ background: o.status === "active" ? "#fef3c7" : "#d1fae5", color: o.status === "active" ? "#d97706" : "#059669" }}>{o.status === "active" ? "⏸" : "▶"}</button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    console.log("Triggering delete modal for:", o.id);
                                                    setConfirm({
                                                        title: "تأكيد الحذف",
                                                        message: `حذف "${o.title}"؟`,
                                                        danger: true,
                                                        onConfirm: async () => {
                                                            console.log("CRITICAL: Delete button clicked for ID:", o.id);
                                                            try {
                                                                await deleteOffer(o.id);
                                                                setConfirm(null);
                                                                toast.success("تم الحذف بنجاح");
                                                                load(false);
                                                            } catch (err: any) {
                                                                // THIS PART IS CRUCIAL FOR DEBUGGING
                                                                console.error("FULL DELETE ERROR:", err);
                                                                toast.error(err.message || err.details || "فشل الحذف");
                                                            }
                                                        }
                                                    })
                                                }}
                                                className="w-7 h-7 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer text-[13px] flex items-center justify-center shrink-0 hover:bg-red-200"
                                            >
                                                🗑
                                            </button>                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                        {!offers.length && <div className="text-center py-12 text-[#9ca3af]"><div className="text-[40px] mb-2">🏷️</div><p>لا توجد عروض بعد</p></div>}
                    </div>
                </div>
            )}

            <Modal open={modal} title={editing ? "تعديل العرض" : "عرض جديد"} onClose={() => setModal(false)}>
                <Inp label="عنوان العرض *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان العرض" />
                <Tex label="وصف العرض" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف العرض..." />
                <Field label="الشريك *">
                    <select value={form.partner_id} onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))} style={inputStyle}>
                        <option value="">اختر الشريك</option>
                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </Field>
                <Inp label="نسبة الخصم %" type="number" min="0" max="100" value={form.discount_percentage} onChange={e => setForm(f => ({ ...f, discount_percentage: e.target.value }))} placeholder="20" />
                <Inp label="تاريخ الانتهاء" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">صورة العرض (اختياري)</label>
                    <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full p-2 border border-[#e5e7eb] rounded-xl text-[14px] bg-white" />
                    {form.image_url && !selectedImage && <div className="mt-2 text-xs text-[#6b7280]">يوجد صورة محفوظة حالياً <a href={form.image_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
                </div>
                <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
                </button>
            </Modal>

            {/* Lightbox Modal */}
            {openImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200 cursor-zoom-out"
                    onClick={() => setOpenImage(null)}
                >
                    <div className="relative max-w-4xl w-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setOpenImage(null)}
                            className="absolute -top-14 right-0 md:-right-12 p-2 text-white/80 hover:text-white transition-colors rounded-full bg-black/40 hover:bg-black/60 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        <img
                            src={openImage}
                            alt="تكبير الصورة"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
