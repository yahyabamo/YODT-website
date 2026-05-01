import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchPartners, upsertPartner, deletePartner, fetchCadres, upsertCadre, deleteCadre } from "@/service/supabaseData";
import { Badge, Spinner, Inp, Sel, Modal, B } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const SUPPORTER_CATEGORIES = ["تعليمي", "غذائي", "بلديات", "جمعيات", "تجار", "مطاعم", "كافيهات", "مراكز تدريب", "جهات خدمية"];
const CADRE_CATEGORIES = ["طالب", "دكاترة", "مشايخ", "كتاب", "مدربون", "أكاديميون", "أصحاب مشاريع"];

export default function RelationsAdmin() {
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();

    const [activeTab, setActiveTab] = useState<"supporter" | "cadre">("supporter");
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState<any>({});

    const load = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            if (activeTab === "supporter") {
                const data = await fetchPartners();
                setRecords(data || []);
            } else {
                const data = await fetchCadres();
                setRecords(data || []);
            }
        } catch (err) {
            toast.error("فشل تحميل البيانات");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [activeTab]);

    const openNew = () => {
        setEditing(null);
        setForm({ crm_status: "cold" }); // القيم الافتراضية
        setModal(true);
    };

    const openEdit = (item: any) => {
        setEditing(item);
        setForm({ ...item });
        setModal(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            if (activeTab === "supporter") {
                if (!form.name) return toast.error("يرجى إدخال اسم الجهة");
                const payload = {
                    id: editing?.id,
                    name: form.name,
                    category: form.category,
                    phone: form.phone,
                    crm_status: form.crm_status || "cold",
                    internal_notes: form.internal_notes,
                    status: form.status || "active" // للحفاظ على توافق الجدول القديم
                };
                await upsertPartner(payload);
            } else {
                if (!form.full_name) return toast.error("يرجى إدخال اسم الكادر");
                const payload = {
                    id: editing?.id,
                    full_name: form.full_name,
                    profession_category: form.profession_category || CADRE_CATEGORIES[0],
                    phone: form.phone,
                    crm_status: form.crm_status || "cold",
                    internal_notes: form.internal_notes
                };
                await upsertCadre(payload);
            }

            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false);
            load(false);
        } catch (err: any) {
            toast.error(err.message || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const del = (e: React.MouseEvent, item: any) => {
        e.stopPropagation(); e.preventDefault();
        const itemName = activeTab === "supporter" ? item.name : item.full_name;
        setConfirm({
            title: "تأكيد الحذف", message: `حذف "${itemName}" بشكل نهائي؟`, danger: true,
            onConfirm: async () => {
                try {
                    if (activeTab === "supporter") await deletePartner(item.id);
                    else await deleteCadre(item.id);
                    setConfirm(null); toast.success("تم الحذف"); load(false);
                }
                catch (err: any) { toast.error(err.message || "فشل الحذف"); }
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string, color: string, bg: string }> = {
            cold: { label: "بارد (لم يتم التواصل)", color: "#6b7280", bg: "#f3f4f6" },
            in_talks: { label: "قيد التفاوض", color: "#d97706", bg: "#fef3c7" },
            active: { label: "داعم / نشط", color: "#059669", bg: "#d1fae5" },
            lapsed: { label: "منقطع", color: "#dc2626", bg: "#fee2e2" }
        };
        const s = map[status] || map.cold;
        return <span style={{ color: s.color, backgroundColor: s.bg, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: "bold" }}>{s.label}</span>;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">نظام العلاقات والكفاءات</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">إدارة بيانات التواصل الداخلي والداعمين</p>
                </div>
                <button onClick={openNew} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>
                    + إضافة {activeTab === "supporter" ? "جهة داعمة" : "كفاءة يمنية"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab("supporter")}
                    className={`px-4 py-2 font-bold rounded-lg transition-colors border-none cursor-pointer ${activeTab === "supporter" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-500 hover:bg-gray-100"}`}
                >
                    🏢 الداعمون (جهات)
                </button>
                <button
                    onClick={() => setActiveTab("cadre")}
                    className={`px-4 py-2 font-bold rounded-lg transition-colors border-none cursor-pointer ${activeTab === "cadre" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-500 hover:bg-gray-100"}`}
                >
                    👥 الكادر اليمني (أفراد)
                </button>
            </div>

            {/* Grid */}
            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {records.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0] flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 truncate pr-2">
                                    <h3 className="m-0 font-bold text-[#111] text-lg truncate">
                                        {activeTab === "supporter" ? item.name : item.full_name}
                                    </h3>
                                    <span className="text-[#6b7280] text-xs">
                                        {activeTab === "supporter" ? item.category : item.profession_category}
                                    </span>
                                </div>
                                {getStatusBadge(item.crm_status)}
                            </div>

                            <div className="space-y-2 mb-4 text-sm mt-2">
                                {item.phone && <div className="flex items-center gap-2 text-gray-600">📞 {item.phone}</div>}
                                {item.internal_notes && <div className="flex items-center gap-2 text-gray-500 text-xs mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">📝 {item.internal_notes}</div>}
                            </div>

                            <div className="flex gap-2 mt-auto pt-3">
                                <button type="button" onClick={() => openEdit(item)} className="flex-1 py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-xs text-[#374151]">تعديل</button>
                                <button type="button" onClick={(e) => del(e, item)} className="w-[34px] h-[34px] rounded-lg border-none bg-[#fee2e2] cursor-pointer text-[#dc2626] text-sm flex items-center justify-center shrink-0">🗑</button>
                            </div>
                        </div>
                    ))}
                    {!records.length && <div className="text-center py-12 text-[#9ca3af] col-span-full"><p>لا يوجد بيانات لعرضها</p></div>}
                </div>
            )}

            {/* Modal */}
            <Modal open={modal} title={editing ? "تعديل البيانات" : "إضافة جديدة"} onClose={() => setModal(false)}>
                {activeTab === "supporter" ? (
                    <>
                        <Inp label="اسم الجهة الداعمة *" value={form.name || ""} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
                        <Sel label="التصنيف" value={form.category || ""} onChange={(e: any) => setForm({ ...form, category: e.target.value })}>
                            <option value="">اختر تصنيفاً...</option>
                            {SUPPORTER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Sel>
                    </>
                ) : (
                    <>
                        <Inp label="الاسم الكامل *" value={form.full_name || ""} onChange={(e: any) => setForm({ ...form, full_name: e.target.value })} />
                        <Sel label="فئة الكادر" value={form.profession_category || ""} onChange={(e: any) => setForm({ ...form, profession_category: e.target.value })}>
                            <option value="">اختر الفئة...</option>
                            {CADRE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Sel>
                    </>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                    <Inp label="رقم التواصل" value={form.phone || ""} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} placeholder="مثال: +90555..." />
                    <Sel label="حالة العلاقة" value={form.crm_status || "cold"} onChange={(e: any) => setForm({ ...form, crm_status: e.target.value })}>
                        <option value="cold">بارد (لم يتم التواصل)</option>
                        <option value="in_talks">قيد التفاوض</option>
                        <option value="active">داعم / نشط</option>
                        <option value="lapsed">منقطع</option>
                    </Sel>
                </div>

                <div className="mb-4">
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 5 }}>ملاحظات داخلية لفريق العلاقات</label>
                    <textarea
                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit" }}
                        value={form.internal_notes || ""}
                        onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                        placeholder="اكتب نتيجة آخر اتصال أو أي تفاصيل هامة هنا..."
                    />
                </div>

                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : "حفظ البيانات"}
                </button>
            </Modal>
        </div>
    );
}