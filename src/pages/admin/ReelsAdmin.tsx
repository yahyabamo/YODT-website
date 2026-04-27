import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchReels, upsertReel, deleteReel, fetchComments, deleteComment } from "@/service/supabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Badge, Spinner, Inp, Sel, Tex, Modal, B, fmtDate } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface Reel {
    id: string; title: string; description: string; video_url: string;
    status: "active" | "inactive"; allow_comments: boolean; views: number;
    thumbnail_url?: string;
    reel_likes?: { count: number }[];
    reel_comments?: { count: number }[];
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

// دالة لاستخراج ID الفيديو من يوتيوب
const getYouTubeId = (url: string): string => {
    if (!url) return '';
    if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0] ?? '';
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] ?? '';
    if (url.includes('shorts/')) return url.split('shorts/')[1]?.split('?')[0] ?? '';
    return url.split('/').pop()?.split('?')[0] ?? '';
};




// دالة لاستخراج صورة من أي رابط فيديو مباشر (MP4) باستخدام Canvas
const extractFrameFromVideo = async (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous"; // لتجنب مشاكل CORS
        video.src = videoUrl;
        video.muted = true;

        video.addEventListener('loadeddata', () => {
            video.currentTime = 1; // أخذ لقطة عند الثانية رقم 1
        });

        video.addEventListener('seeked', async () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 360;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg");

                // تحويل الصورة (Base64) إلى ملف لرفعه
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], "auto-thumbnail.jpg", { type: "image/jpeg" });

                // رفع الصورة المولدة عبر Cloudinary باستخدام دالتك الأصلية!
                const uploadedUrl = await uploadImage(file);
                resolve(uploadedUrl);
            } catch (err) {
                reject(err);
            }
        });

        video.onerror = () => reject("فشل تحميل الفيديو لاستخراج الصورة");
    });
};

export default function ReelsAdmin() {
    useRoleGuard(['reels']);
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Reel | null>(null);
    const [form, setForm] = useState<Partial<Reel>>({ title: "", description: "", video_url: "", status: "active", allow_comments: true, thumbnail_url: "" });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    // Comment Moderation
    const [modModal, setModModal] = useState<Reel | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const load = async () => {
        setLoading(true);
        try { const { data } = await fetchReels({ pageSize: 100 }); setReels(data || []); }
        catch { toast.error("فشل تحميل الريلز"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const loadReelComments = async (r: Reel) => {
        setModModal(r);
        setLoadingComments(true);
        try {
            const data = await fetchComments(r.id);
            setComments(data || []);
        } catch { toast.error("فشل تحميل التعليقات"); }
        finally { setLoadingComments(false); }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
            toast.success("تم حذف التعليق");
            load(); // Refresh counts in table
        } catch { toast.error("فشل حذف التعليق"); }
    };

    const save = async () => {
        if (!form.video_url) { toast.error("يرجى إدخال رابط الفيديو"); return; }
        setSaving(true);
        try {
            let finalThumbnailUrl = form.thumbnail_url;

            // الحالة 1: الأدمن قام برفع صورة مصغرة يدوياً
            if (selectedImage) {
                finalThumbnailUrl = await uploadImage(selectedImage);
            }
            // الحالة 2: لم يتم رفع صورة، سنقوم بتوليدها تلقائياً
            else if (!finalThumbnailUrl && form.video_url) {
                // التحقق مما إذا كان الرابط من يوتيوب
                if (form.video_url.includes('youtube.com') || form.video_url.includes('youtu.be')) {
                    const ytId = getYouTubeId(form.video_url);
                    if (ytId) {
                        finalThumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                    }
                }
                // خلاف ذلك، محاولة استخراج اللقطة من رابط الفيديو المباشر (مثل MP4)
                else {
                    try {
                        toast.info("جاري استخراج صورة مصغرة تلقائياً من الفيديو...");
                        finalThumbnailUrl = await extractFrameFromVideo(form.video_url);
                    } catch (e) {
                        console.warn("لم نتمكن من استخراج صورة تلقائية، سيتم الحفظ بدونها.", e);
                    }
                }
            }

            const cleanPayload: any = {
                title: form.title,
                description: form.description,
                video_url: form.video_url,
                status: form.status,
                allow_comments: form.allow_comments,
                thumbnail_url: finalThumbnailUrl // سيتم حفظ الصورة التلقائية هنا
            };
            if (editing) cleanPayload.id = editing.id;
            console.log("Saving Reel Payload:", cleanPayload);

            await upsertReel(cleanPayload);
            toast.success(editing ? "تم التحديث" : "تم الإضافة");
            setModal(false);
            load();
        } catch (err: any) {
            toast.error(err.message || err.details || "فشل الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const del = (e: React.MouseEvent, r: Reel) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Triggering delete modal for:", r.id);
        setConfirm({
            title: "تأكيد الحذف", message: `حذف "${r.title || "الريل"}"؟`, danger: true,
            onConfirm: async () => {
                console.log("CRITICAL: Delete button clicked for ID:", r.id);
                try { await deleteReel(r.id); setConfirm(null); toast.success("تم الحذف"); load(); }
                catch (err: any) { toast.error(err.message || err.details || "فشل الحذف"); }
            }
        });
    };

    const toggleComments = async (e: React.MouseEvent, r: Reel) => {
        e.stopPropagation();
        const cleanPayload = {
            id: r.id,
            title: r.title,
            description: r.description,
            video_url: r.video_url,
            status: r.status,
            allow_comments: !r.allow_comments,
            thumbnail_url: r.thumbnail_url
        };
        console.log("Toggling Reel Comments Payload:", cleanPayload);
        try { await upsertReel(cleanPayload); toast.success("تم التحديث"); load(); }
        catch (err: any) { toast.error(err.message || err.details || "فشل التحديث"); }
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة الريلز</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{reels.length} فيديو</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ title: "", description: "", video_url: "", status: "active", allow_comments: true, thumbnail_url: "" }); setSelectedImage(null); setModal(true) }} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm" style={{ background: B }}>+ إضافة ريل</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reels.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0] overflow-hidden flex flex-col">
                            <div className="h-[120px] flex items-center justify-center text-5xl relative" style={{ background: `linear-gradient(135deg,${B}33,${B}66)` }}>
                                {r.thumbnail_url ? <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" /> : "🎬"}
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                            <div className="p-3.5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-[14px] font-bold text-[#111] flex-1 line-clamp-1 pr-1">{r.title || "ريل بدون عنوان"}</div>
                                    <div className="mr-2 shrink-0"><Badge type={r.status}>{r.status === "active" ? "نشط" : "معطل"}</Badge></div>
                                </div>
                                <div className="text-[11px] text-[#6b7280] mb-2.5 line-clamp-2 min-h-[32px]">{r.description}</div>

                                <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] p-2.5 rounded-xl mb-3.5 mt-auto">
                                    <div className="text-center">
                                        <div className="text-[10px] text-[#9ca3af] mb-0.5">👁 مشاهدة</div>
                                        <div className="text-[13px] font-extrabold text-[#111]">{(r.views || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="text-center border-l-border-r border-[#eef2f6]">
                                        <div className="text-[10px] text-[#9ca3af] mb-0.5">❤️ إعجاب</div>
                                        <div className="text-[13px] font-extrabold text-[#111]">{r.reel_likes?.[0]?.count || 0}</div>
                                    </div>
                                    {/* <div className="text-center">
                                        <div className="text-[10px] text-[#9ca3af] mb-0.5">💬 تعليق</div>
                                        <div className="text-[13px] font-extrabold text-[#111]">{r.reel_comments?.[0]?.count || 0}</div>
                                    </div> */}
                                </div>

                                <div className="flex gap-1.5 flex-wrap px-0.5">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(r); setForm({ ...r }); setSelectedImage(null); setModal(true) }} className="flex-[1_min-content] py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-[11px] text-[#374151]">🛠 تعديل</button>
                                    {/* <button type="button" onClick={(e) => { e.stopPropagation(); loadReelComments(r) }} className="flex-[1_min-content] py-2 rounded-lg border-none bg-[#f3f4f6] cursor-pointer font-semibold text-[11px] text-[#374151]">💬 التعليقات</button>
                                    <button type="button" onClick={(e) => toggleComments(e, r)} className="flex-[1.2_auto] py-2 rounded-lg border-none bg-[#e0f2fe] cursor-pointer font-semibold text-[10px] text-[#0284c7] whitespace-nowrap px-1">{r.allow_comments ? "إغلاق التعليقات" : "فتح التعليقات"}</button> */}
                                    <button type="button" onClick={(e) => del(e, r)} className="w-8 h-8 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer text-[13px] flex items-center justify-center shrink-0">🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!reels.length && <div className="text-center py-12 text-[#9ca3af] col-span-full"><div className="text-[40px] mb-2">🎬</div><p>لا توجد ريلز بعد</p></div>}
                </div>
            )}

            {/* Basic Edit Modal */}
            <Modal open={modal} title={editing ? "تعديل الريل" : "ريل جديد"} onClose={() => setModal(false)}>
                <Inp
                    label="رابط الفيديو *"
                    value={form.video_url}
                    onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                    placeholder="https://youtube.com/..."
                />                <Tex label="الوصف" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الفيديو..." />
                <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">الصورة المصغرة (اختياري)</label>
                    <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full p-2 border border-[#e5e7eb] rounded-xl text-sm bg-white" />
                    {form.thumbnail_url && !selectedImage && <div className="mt-2 text-xs text-[#6b7280]">يوجد صورة محفوظة حالياً <a href={form.thumbnail_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
                </div>
                <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
                {/* <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl px-3.5 py-2.5 mb-4">
                    <input type="checkbox" id="cmts" checked={form.allow_comments} onChange={e => setForm(f => ({ ...f, allow_comments: e.target.checked }))} className="w-4 h-4 rounded" />
                    <label htmlFor="cmts" className="text-[13px] font-semibold text-[#374151] cursor-pointer">السماح بالتعليقات</label>
                </div> */}
                <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-1 text-white opacity-100 disabled:opacity-70 transition-opacity" style={{ background: B }}>
                    {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
                </button>
            </Modal>

            {/* Comment Moderation Modal */}
            <Modal open={!!modModal} title={`تعليقات: ${modModal?.title || "ريل"}`} onClose={() => setModModal(null)} wide>
                {loadingComments ? <Spinner /> : (
                    <div className="flex flex-col gap-3">
                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-[#9ca3af]">لا توجد تعليقات على هذا الفيديو</div>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl">
                                    <Avatar name={c.profiles?.full_name || "؟"} size={36} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-[13px] text-[#111] truncate">{c.profiles?.full_name || "مستخدم"}</span>
                                            <span className="text-[10px] text-[#9ca3af] shrink-0">{fmtDate(c.created_at)}</span>
                                        </div>
                                        <div className="text-[13px] text-[#374151] break-words whitespace-pre-wrap">{c.content}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirm({
                                                title: "حذف التعليق",
                                                message: "هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع.",
                                                danger: true,
                                                onConfirm: () => { handleDeleteComment(c.id); setConfirm(null); }
                                            })
                                        }}
                                        className="w-8 h-8 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer flex items-center justify-center shrink-0 hover:bg-red-200 focus:outline-none"
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
