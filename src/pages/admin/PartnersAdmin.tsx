import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchPartners, upsertPartner, deletePartner } from "@/service/supabaseData";
import { Badge, Spinner, Inp, Sel, Tex, Modal, B } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface Partner {
    id: string; name: string; status: "active" | "inactive";
    website: string; offers_count?: number; logo_url?: string;
}

async function uploadImage(file: File): Promise<string> {
    const cloudName = "dknz5c7d0";
    const uploadPreset = "activity_unsigned";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "partners");

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

export default function PartnersAdmin() {
    useRoleGuard(['partners']);
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Partner | null>(null);
    const [form, setForm] = useState<Partial<Partner>>({ name: "", website: "", status: "active", logo_url: "" });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const load = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try { const data = await fetchPartners(); setPartners(data || []); }
        catch { toast.error("فشل تحميل الشركاء"); }
        finally { if (showLoading) setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.name) { toast.error("يرجى إدخال الاسم"); return; }
        setSaving(true);
        try {
            let finalImageUrl = form.logo_url;
            if (selectedImage) {
                finalImageUrl = await uploadImage(selectedImage);
            }
            const cleanPayload: any = {
                name: form.name,
                website: form.website,
                status: form.status,
                logo_url: finalImageUrl
            };
            if (editing) cleanPayload.id = editing.id;
            console.log("Saving Partner Payload:", cleanPayload);
            await upsertPartner(cleanPayload);
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false); load(false);
        } catch (err: any) { toast.error(err.message || err.details || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const toggleStatus = async (e: React.MouseEvent, p: Partner) => {
        e.stopPropagation();
        const cleanPayload = {
            id: p.id,
            name: p.name,
            website: p.website,
            status: p.status === "active" ? "inactive" : "active",
            logo_url: p.logo_url
        };
        console.log("Toggling Partner Payload:", cleanPayload);
        try {
            await upsertPartner(cleanPayload);
            toast.success("تم التحديث"); load(false);
        } catch (err: any) { toast.error(err.message || err.details || "فشل التحديث"); }
    };

    const del = (e: React.MouseEvent, p: Partner) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Triggering delete modal for:", p.id);
        setConfirm({
            title: "تأكيد الحذف", message: `حذف "${p.name || "الشريك"}"؟`, danger: true,
            onConfirm: async () => {
                console.log("CRITICAL: Delete button clicked for ID:", p.id);
                try { await deletePartner(p.id); setConfirm(null); toast.success("تم الحذف"); load(false); }
                catch (err: any) { toast.error(err.message || err.details || "فشل الحذف"); }
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
                <button onClick={() => { setEditing(null); setForm({ name: "", website: "", status: "active", logo_url: "" }); setSelectedImage(null); setModal(true) }} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة شريك</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0] flex flex-col">
                            <div className="flex items-center gap-3 mb-3.5">
                                {p.logo_url ? (
                                    <img src={p.logo_url} alt={p.name} className="w-[52px] h-[52px] rounded-2xl object-cover shrink-0 border border-gray-100" />
                                ) : (
                                    <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[22px] shrink-0" style={{ background: B }}>{p.name[0]}</div>
                                )}
                                <div className="flex-1 min-w-0 pr-1">
                                    <div className="font-bold text-[#111] mb-0.5 truncate">{p.name}</div>
                                    {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-[11px] text-[#3b82f6] truncate block">{p.website}</a>}
                                </div>
                                <Badge type={p.status}>{p.status === "active" ? "نشط" : "معطل"}</Badge>
                            </div>
                            <div className="bg-[#f8fafc] rounded-xl px-3 py-2 mb-3.5 flex justify-between text-[13px]">
                                <span className="text-[#6b7280]">🏷️ عدد العروض</span>
                                <span className="font-extrabold text-[#111]">{(p as any).offers?.[0]?.count ?? p.offers_count ?? 0}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-auto">
                                <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(p); setForm({ ...p }); setSelectedImage(null); setModal(true) }} className="flex-1 py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-xs text-[#374151]">تعديل</button>
                                <button type="button" onClick={(e) => toggleStatus(e, p)} className="flex-1 py-2 rounded-lg border-none cursor-pointer font-semibold text-xs" style={{ background: p.status === "active" ? "#fef3c7" : "#d1fae5", color: p.status === "active" ? "#d97706" : "#059669" }}>{p.status === "active" ? "تعطيل" : "تفعيل"}</button>
                                <button type="button" onClick={(e) => del(e, p)} className="w-[34px] h-[34px] rounded-lg border-none bg-[#fee2e2] cursor-pointer text-[#dc2626] text-sm flex items-center justify-center shrink-0">🗑</button>
                            </div>
                        </div>
                    ))}
                    {!partners.length && <div className="text-center py-12 text-[#9ca3af] col-span-full"><div className="text-[40px] mb-2">🤝</div><p>لا يوجد شركاء بعد</p></div>}
                </div>
            )}

            <Modal open={modal} title={editing ? "تعديل الشريك" : "شريك جديد"} onClose={() => setModal(false)}>
                <Inp label="اسم الشريك *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الشركة" />
                <Inp label="الموقع الإلكتروني" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
                <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">شعار الممول (اختياري)</label>
                    <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full p-2 border border-[#e5e7eb] rounded-xl text-sm bg-white" />
                    {form.logo_url && !selectedImage && <div className="mt-2 text-xs text-[#6b7280]">يوجد شعار محفوظ حالياً <a href={form.logo_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
                </div>
                <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
                </button>
            </Modal>
        </div>
    );
}
