import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchActivities, fetchActivityAttendees, upsertActivity, deleteActivity } from "@/service/supabaseData";
import { Avatar, Badge, Spinner, Inp, Sel, Tex, Modal, B, fmtDate } from "./components/AdminUI";
// import { uploadImage } from '@/service/cloudinary';
import { useOutletContext } from "react-router-dom";

interface Activity {
    id: string; title: string; description: string; event_date: string;
    location: string; max_attendees: number; points_reward: number;
    status: "active" | "inactive" | "draft"; image_url: string;
    activity_registrations?: { count: number }[];
}

interface ActivityRegistration {
    user_id: string; profiles?: { full_name: string }; count?: number; created_at?: string; status?: "attended" | "registered";
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb",
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit"
};
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

export default function ActivitiesAdmin() {
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Activity | null>(null);
    const [form, setForm] = useState<Partial<Activity>>({ title: "", description: "", event_date: "", location: "", max_attendees: 0, points_reward: 0, status: "active", image_url: "" });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [attendanceModal, setAttendanceModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [openImage, setOpenImage] = useState<string | null>(null);

    const load = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try { const { data } = await fetchActivities({ pageSize: 100 }); setActivities(data || []); }
        catch { toast.error("فشل تحميل الفعاليات"); }
        finally { if (showLoading) setLoading(false); }
    };

    const loadAttendees = async (activityId: string) => {
        setLoadingAttendees(true);
        try {
            const data = await fetchActivityAttendees(activityId);
            setAttendees(data);
        } catch (error) {
            toast.error('فشل تحميل قائمة الحضور');
        } finally {
            setLoadingAttendees(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing(null); setForm({ title: "", description: "", event_date: "", location: "", max_attendees: 0, points_reward: 0, status: "active", image_url: "" }); setSelectedImage(null); setModal(true); };
    const openEdit = (a: Activity) => { setEditing(a); setForm({ ...a, event_date: a.event_date?.slice(0, 10) || "" }); setSelectedImage(null); setModal(true); };

    const save = async () => {
        if (!form.title) { toast.error("يرجى إدخال العنوان"); return; }
        setSaving(true);
        try {
            let finalImageUrl = form.image_url;
            if (selectedImage) {
                finalImageUrl = await uploadImage(selectedImage);
            }
            const cleanPayload: any = {
                title: form.title,
                description: form.description,
                event_date: form.event_date || null,
                location: form.location,
                max_attendees: form.max_attendees,
                points_reward: form.points_reward,
                status: form.status,
                image_url: finalImageUrl
            };
            if (editing) cleanPayload.id = editing.id;

            console.log("Saving Activity Payload:", cleanPayload);
            await upsertActivity(cleanPayload);
            toast.success(editing ? "تم التحديث" : "تم الإنشاء");
            setModal(false);
            load(false); // Refresh without loader flash
        } catch (err: any) { toast.error(err.message || err.details || "فشل الحفظ"); }
        finally { setSaving(false); }
    };

    const del = (e: React.MouseEvent, a: Activity) => {
        e.stopPropagation();
        e.preventDefault();
        setConfirm({
            title: "تأكيد الحذف", message: `حذف "${a.title || "الفعالية"}"؟`, danger: true,
            onConfirm: async () => {
                console.log("CRITICAL: Delete button clicked for ID:", a.id);
                try { await deleteActivity(a.id); toast.success("تم الحذف"); load(false); }
                catch (err: any) { toast.error(err.message || err.details || "فشل الحذف"); }
            }
        });
    };

    const toggle = async (e: React.MouseEvent, a: Activity) => {
        e.stopPropagation();
        const ns = a.status === "active" ? "inactive" : "active";
        const cleanPayload = {
            id: a.id,
            title: a.title,
            description: a.description,
            event_date: a.event_date || null,
            location: a.location,
            max_attendees: a.max_attendees,
            points_reward: a.points_reward,
            status: ns,
            image_url: a.image_url
        };
        console.log("Toggling Activity Payload:", cleanPayload);
        try { await upsertActivity(cleanPayload); toast.success("تم التحديث"); load(false); }
        catch (err: any) { toast.error(err.message || err.details || "فشل التحديث"); }
    };

    const sColor: any = { active: "#059669", inactive: "#9ca3af", draft: "#d97706" };
    const sLabel: any = { active: "نشط", inactive: "معطل", draft: "مسودة" };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة الفعاليات</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{activities.length} فعاليات</p>
                </div>
                <button onClick={openNew} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة فعالية</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activities.map(a => (
                        <div key={a.id} className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0] overflow-hidden flex flex-col">
                            {a.image_url && (
                                <img
                                    src={a.image_url}
                                    alt={a.title}
                                    className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setOpenImage(a.image_url)}
                                />
                            )}
                            <div className="h-1" style={{ background: sColor[a.status] }} />
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2.5">
                                    <div className="flex-1">
                                        <div className="text-[15px] font-bold text-[#111] mb-1">{a.title}</div>
                                        <div className="text-xs text-[#6b7280] line-clamp-2">{a.description}</div>
                                    </div>
                                    <div className="mr-2 shrink-0"><Badge type={a.status}>{sLabel[a.status]}</Badge></div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 mb-3.5 flex-1">
                                    {[["📅", fmtDate(a.event_date)], ["📍", a.location || "—"], ["👥", `${a.max_attendees} مقعد`], ["⭐", `${a.points_reward} نقطة`], ["🎟️", `حجوزات: ${a.activity_registrations?.[0]?.count || 0} `]].map(([ic, v], i) => (
                                        <div key={i} className="flex items-center gap-1 text-[11px] text-[#6b7280]"><span>{ic}</span><span className="truncate">{v}</span></div>
                                    ))}
                                </div>

                                <div className="flex gap-2 flex-wrap sm:flex-nowrap mt-auto pt-2">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(a); }} className="flex-1 py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-xs text-[#374151]">تعديل</button>
                                    <button type="button" onClick={(e) => toggle(e, a)} className="flex-1 py-2 rounded-lg border-none cursor-pointer font-semibold text-xs" style={{ background: a.status === "active" ? "#fef3c7" : "#d1fae5", color: a.status === "active" ? "#d97706" : "#059669" }}>{a.status === "active" ? "تعطيل" : "تفعيل"}</button>
                                    <button type="button" onClick={(e) => del(e, a)} className="w-[34px] h-[34px] rounded-lg border-none bg-[#fee2e2] cursor-pointer text-[#dc2626] text-sm flex items-center justify-center shrink-0">🗑</button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedActivity(a); loadAttendees(a.id); setAttendanceModal(true); }}
                                        className="flex-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition whitespace-nowrap"
                                    >
                                        🎟️ الحضور
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!activities.length && <div className="text-center py-12 text-[#9ca3af] col-span-full"><div className="text-[40px] mb-2">🎯</div><p>لا توجد فعاليات بعد</p></div>}
                </div>
            )}

            {/* Basic Edit Modal */}
            <Modal open={modal} title={editing ? "تعديل الفعالية" : "فعالية جديدة"} onClose={() => setModal(false)} wide>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <div className="col-span-1 md:col-span-2"><Inp label="العنوان *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="اسم الفعالية" /></div>
                    <div className="col-span-1 md:col-span-2"><Tex label="الوصف" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الفعالية..." /></div>
                    <div className="col-span-1 md:col-span-2 mb-4">
                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">صورة الفعالية (اختياري)</label>
                        <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full p-2 border border-[#e5e7eb] rounded-xl text-sm bg-white" />
                        {form.image_url && !selectedImage && <div className="mt-2 text-xs text-[#6b7280]">يوجد صورة محفوظة حالياً <a href={form.image_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
                    </div>
                    <Inp label="التاريخ" type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
                    <Inp label="المكان" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Istanbul..." />
                    <Inp label="أقصى عدد حضور" type="number" value={form.max_attendees} onChange={e => setForm(f => ({ ...f, max_attendees: Number(e.target.value) }))} placeholder="200" />
                    <Inp label="نقاط المكافأة" type="number" value={form.points_reward} onChange={e => setForm(f => ({ ...f, points_reward: Number(e.target.value) }))} placeholder="100" />
                    <div className="col-span-1 md:col-span-2"><Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option><option value="draft">مسودة</option></Sel></div>
                </div>
                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-1 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إنشاء الفعالية"}
                </button>
            </Modal>

            {/* Attendance Modal */}
            {attendanceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAttendanceModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h2 className="text-xl font-bold truncate pr-2">حضور الفعالية: {selectedActivity?.title}</h2>
                            <button onClick={() => setAttendanceModal(false)} className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg p-2 flex items-center justify-center shrink-0">✕</button>
                        </div>

                        <div className="overflow-y-auto flex-1 h-full min-h-[200px]">
                            {loadingAttendees ? (
                                <div className="flex justify-center items-center h-full min-h-[150px]"><Spinner /></div>
                            ) : attendees.length === 0 ? (
                                <div className="text-center py-12 text-gray-500"><div className="text-3xl mb-2">🎟️</div>لا يوجد طلاب مسجلين بعد</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm border-collapse min-w-[400px]">
                                        <thead className="bg-[#fafafa]">
                                            <tr>
                                                <th className="py-3 px-4 text-[#6b7280] font-bold border-b border-[#f3f4f6]">الاسم</th>
                                                <th className="py-3 px-4 text-[#6b7280] font-bold border-b border-[#f3f4f6]">الجامعة</th>
                                                <th className="py-3 px-4 text-[#6b7280] font-bold border-b border-[#f3f4f6]">وقت التسجيل</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendees.map((att, idx) => (
                                                <tr key={idx} className="border-b border-[#f9fafb] hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-semibold">{att.profiles?.full_name || '—'}</td>
                                                    <td className="py-3 px-4 text-gray-600 truncate max-w-[150px]" title={att.profiles?.university || ''}>{att.profiles?.university || '—'}</td>
                                                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{new Date(att.created_at).toLocaleString('ar')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
