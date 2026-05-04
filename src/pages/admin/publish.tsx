import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { ImagePlus, Send, Facebook, Instagram, Loader2, X, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialMediaManager() {
    useRoleGuard(['published']);
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [caption, setCaption] = useState('');
    const [postFB, setPostFB] = useState(true);
    const [postIG, setPostIG] = useState(true);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'fb' | 'ig'>('fb');
    const [postTG, setPostTG] = useState(true); // <-- ADD THIS

    // Generate local preview URLs whenever files change
    useEffect(() => {
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        // Cleanup memory to avoid leaks
        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [files]);

    async function uploadImageToCloudinary(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "activity_unsigned");
        formData.append("folder", "partners");
        const res = await fetch("https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");
        return data.secure_url;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handlePublish = async () => {
        if (files.length === 0) return toast.error('الرجاء اختيار صورة واحدة على الأقل');
        if (!caption) return toast.error('الرجاء كتابة تفاصيل المنشور');
        if (!postFB && !postIG) return toast.error('يجب اختيار منصة واحدة على الأقل');

        setLoading(true);

        try {
            toast.loading('جاري رفع الوسائط...', { id: 'post' });
            const uploadPromises = files.map(f => uploadImageToCloudinary(f));
            const mediaUrls = await Promise.all(uploadPromises);

            toast.loading('جاري النشر على منصات التواصل...', { id: 'post' });
            const payload = {
                mediaUrls,
                caption,
                postFacebook: postFB,
                postInstagram: postIG,
                postTelegram: postTG // <-- ADD THIS
            };
            const { data, error } = await supabase.functions.invoke('post-to-socials', {
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });

            if (error) throw error;
            if (data?.errors && data.errors.length > 0) {
                console.error(data.errors);
                toast.error('حدثت مشكلة جزئية، راجع السجلات.', { id: 'post' });
            } else {
                toast.success('تم النشر بنجاح!', { id: 'post' });
                setFiles([]);
                setCaption('');
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ غير متوقع', { id: 'post' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* RIGHT COLUMN: The Control Form */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900">نشر المحتوى (Media Center)</h1>

                    {/* Media Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">الصور</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <ImagePlus className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600">اضغط لاختيار ملفات أو اسحبها هنا</p>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <span className="text-sm text-gray-600 truncate mr-2">{file.name}</span>
                                        <button onClick={() => removeFile(index)} className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors z-20">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Caption */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">النص (Caption)</label>
                        <textarea
                            rows={5}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="اكتب تفاصيل المنشور هنا..."
                            className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Platforms */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">منصات النشر</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${postFB ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input type="checkbox" checked={postFB} onChange={(e) => setPostFB(e.target.checked)} className="hidden" />
                                <Facebook className={postFB ? 'text-blue-600' : 'text-gray-400'} />
                                <span className={`font-medium ${postFB ? 'text-blue-700' : 'text-gray-500'}`}>فيسبوك</span>
                            </label>

                            <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${postIG ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                                <input type="checkbox" checked={postIG} onChange={(e) => setPostIG(e.target.checked)} className="hidden" />
                                <Instagram className={postIG ? 'text-pink-600' : 'text-gray-400'} />
                                <span className={`font-medium ${postIG ? 'text-pink-700' : 'text-gray-500'}`}>انستقرام</span>
                            </label>

                            {/* NEW Telegram Button */}
                            <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${postTG ? 'border-sky-500 bg-sky-50' : 'border-gray-200'}`}>
                                <input type="checkbox" checked={postTG} onChange={(e) => setPostTG(e.target.checked)} className="hidden" />
                                <Send className={postTG ? 'text-sky-500' : 'text-gray-400'} style={{ transform: 'rotate(-45deg)', marginTop: '-4px' }} />
                                <span className={`font-medium ${postTG ? 'text-sky-700' : 'text-gray-500'}`}>تيليجرام</span>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handlePublish}
                        disabled={loading || files.length === 0}
                        className="w-full bg-black text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                        {loading ? 'جاري النشر...' : 'نشر الآن'}
                    </button>
                </div>

                {/* LEFT COLUMN: The Live Preview */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center" dir="ltr">
                    <div className="w-full flex justify-center gap-4 mb-6">
                        <button onClick={() => setActiveTab('fb')} className={`px-4 py-2 font-semibold rounded-full ${activeTab === 'fb' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 shadow-sm'}`}>Facebook Preview</button>
                        <button onClick={() => setActiveTab('ig')} className={`px-4 py-2 font-semibold rounded-full ${activeTab === 'ig' ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 shadow-sm'}`}>Instagram Preview</button>
                    </div>

                    {/* MOCKUP CONTAINER */}
                    <div className="w-full max-w-[400px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

                        {/* HEADER */}
                        <div className="flex items-center p-3 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">School Name</p>
                                {activeTab === 'fb' ? <p className="text-xs text-gray-500">Just now • 🌍</p> : null}
                            </div>
                            <MoreHorizontal className="text-gray-500" size={20} />
                        </div>

                        {/* FACEBOOK CAPTION (Above Image) */}
                        {activeTab === 'fb' && caption && (
                            <div className="p-3 text-sm text-gray-900 whitespace-pre-wrap" dir="rtl">{caption}</div>
                        )}

                        {/* MEDIA PLACEHOLDER / CAROUSEL */}
                        <div className="bg-gray-100 w-full aspect-square relative flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                            {previewUrls.length > 0 ? (
                                previewUrls.map((url, i) => (
                                    <img key={i} src={url} className="w-full h-full object-cover flex-shrink-0 snap-center" alt="Preview" />
                                ))
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    <ImagePlus size={40} className="mb-2" />
                                    <span className="text-sm font-medium">Image Preview</span>
                                </div>
                            )}
                        </div>

                        {/* INSTAGRAM FOOTER (Icons + Caption Below Image) */}
                        {activeTab === 'ig' && (
                            <div className="p-3">
                                <div className="flex items-center gap-3 mb-3">
                                    <Heart size={24} className="text-gray-900" />
                                    <MessageCircle size={24} className="text-gray-900" />
                                    <Share2 size={24} className="text-gray-900" />
                                </div>
                                {caption && (
                                    <div className="text-sm text-gray-900" dir="rtl">
                                        <span className="font-semibold mr-2">School_Name</span>
                                        <span className="whitespace-pre-wrap">{caption}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}