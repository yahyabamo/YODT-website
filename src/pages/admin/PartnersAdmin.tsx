import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchPartners, upsertPartner } from "@/service/supabaseData";
import { Badge, Spinner, Inp, Sel, Modal, B } from "./components/AdminUI";

interface Partner {
    id: string; name: string; status: "active" | "inactive";
    website: string; offers_count: number;
}

export default function PartnersAdmin({ setConfirm }: { setConfirm: (v: any) => void }) {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Partner | null>(null);
    const [form, setForm] = useState<Partial<Partner>>({ name: "", website: "", status: "active" });

    const load = async () => {
        setLoading(true);
        try { const data = await fetchPartners(); setPartners(data || []); }
        catch { toast.error("فشل تحميل الشركاء"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.name) { toast.error("يرجى إدخال الاسم"); return; }
        setSaving(true);
        try {
            await upsertPartner(editing ? { ...form, id: editing.id } : form);
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false); load();
        } catch { toast.error("فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const toggleStatus = async (p: Partner) => {
        try {
            await upsertPartner({ ...p, status: p.status === "active" ? "inactive" : "active" });
            toast.success("تم التحديث"); load();
        } catch { toast.error("فشل التحديث"); }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة الشركاء</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{partners.length} شركاء</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ name: "", website: "", status: "active" }); setModal(true) }} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة شريك</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0] flex flex-col">
                            <div className="flex items-center gap-3 mb-3.5">
                                <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white font-extrabold text-[22px] shrink-0" style={{ background: B }}>{p.name[0]}</div>
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
                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => { setEditing(p); setForm({ ...p }); setModal(true) }} className="flex-1 py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-xs text-[#374151]">تعديل</button>
                                <button onClick={() => toggleStatus(p)} className="flex-1 py-2 rounded-lg border-none cursor-pointer font-semibold text-xs" style={{ background: p.status === "active" ? "#fef3c7" : "#d1fae5", color: p.status === "active" ? "#d97706" : "#059669" }}>{p.status === "active" ? "تعطيل" : "تفعيل"}</button>
                            </div>
                        </div>
                    ))}
                    {!partners.length && <div className="text-center py-12 text-[#9ca3af] col-span-full"><div className="text-[40px] mb-2">🤝</div><p>لا يوجد شركاء بعد</p></div>}
                </div>
            )}

            <Modal open={modal} title={editing ? "تعديل الشريك" : "شريك جديد"} onClose={() => setModal(false)}>
                <Inp label="اسم الشريك *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الشركة" />
                <Inp label="الموقع الإلكتروني" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
                <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
                </button>
            </Modal>
        </div>
    );
}
