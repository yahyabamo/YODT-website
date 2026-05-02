'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2, Upload, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    getLibraryItems,
    createLibraryItem,
    deleteLibraryItem,
    uploadLibraryFile,
} from '@/lib/queries';
import type { LibraryItem } from '@/integrations/supabase/types';
import { LIBRARY_TYPE_LABELS } from '@/integrations/supabase/types';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = {
    title: '',
    description: '',
    type: 'book' as const,
};

export default function AdminLibraryPage() {
    useRoleGuard(['busla']);
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [showForm, setShowForm] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const fetchItems = async () => {
        setLoading(true);
        const data = await getLibraryItems();
        setItems(data);
        setLoading(false);
    };

    async function uploadFile(file: File): Promise<string> {
        const cloudName = "dknz5c7d0";
        const uploadPreset = "activity_unsigned";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "student_cards");

        // Use /auto/ so Cloudinary handles PDFs correctly
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "فشل رفع الملف");

        // This will now return a URL containing /raw/upload/ or /files/upload/
        return data.secure_url;
    }

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = async () => {
        if (!form.title.trim()) return toast.error('أدخل عنوان العنصر');
        setSaving(true);

        let fileUrl: string | null = null;

        if (file) {
            setUploadProgress('جاري الرفع إلى Cloudinary...');
            try {
                // Use the new function here
                fileUrl = await uploadFile(file);
            } catch (error: any) {
                toast.error('فشل رفع الملف: ' + error.message);
                setSaving(false);
                setUploadProgress('');
                return;
            }
            setUploadProgress('');
        }

        // Now save the Cloudinary URL to your Supabase Database table
        const { error } = await createLibraryItem({
            title: form.title.trim(),
            description: form.description.trim() || null,
            type: form.type,
            file_url: fileUrl, // This is now the Cloudinary secure_url
            cover_url: null,
        });

        if (error) {
            toast.error('فشل إضافة العنصر: ' + error);
        } else {
            toast.success('تم إضافة العنصر للمكتبة');
            setForm(EMPTY_FORM);
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            setShowForm(false);
            fetchItems();
        }
        setSaving(false);
    };
    const handleDelete = async (item: LibraryItem) => {
        if (!confirm(`هل أنت متأكد من حذف "${item.title}"؟`)) return;
        const { error } = await deleteLibraryItem(item.id);
        if (error) toast.error('فشل الحذف');
        else {
            toast.success('تم الحذف');
            fetchItems();
        }
    };

    const setField = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl">
            <button
                onClick={() => navigate('/admin/busla')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold mb-4"
            >
                <ChevronRight size={18} /> العودة للقائمة
            </button>
            <PageHeader title="إدارة المكتبة" />

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Add button */}
                <Button
                    className="w-full"
                    onClick={() => setShowForm((v) => !v)}
                    variant={showForm ? 'outline' : 'default'}
                >
                    <Plus className="h-4 w-4 ml-1" />
                    {showForm ? 'إلغاء' : 'إضافة عنصر للمكتبة'}
                </Button>

                {/* Create Form */}
                {showForm && (
                    <Card className="shadow-soft">
                        <CardContent className="p-4 space-y-3">
                            <h2 className="font-bold">عنصر جديد</h2>
                            <input
                                placeholder="العنوان *"
                                value={form.title}
                                onChange={(e) => setField('title', e.target.value)}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <textarea
                                placeholder="الوصف (اختياري)"
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                                rows={2}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <select
                                value={form.type}
                                onChange={(e) => setField('type', e.target.value)}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                            >
                                <option value="book">كتاب</option>
                                <option value="course">دورة</option>
                                <option value="lecture">محاضرة</option>
                                <option value="summary">ملخص</option>
                            </select>

                            {/* File upload */}
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1.5">
                                    رفع ملف PDF (اختياري)
                                </label>
                                <div
                                    className={cn(
                                        'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors',
                                        file ? 'border-red-700 bg-red-50' : 'border-muted-foreground/20 hover:border-red-700/50'
                                    )}
                                    onClick={() => fileRef.current?.click()}
                                >
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-red-700">
                                            <FileText className="h-5 w-5" />
                                            <span className="text-sm font-medium truncate max-w-[200px]">
                                                {file.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground">
                                            <Upload className="h-6 w-6 mx-auto mb-1" />
                                            <p className="text-xs">اضغط لاختيار ملف PDF</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                />
                            </div>

                            {uploadProgress && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {uploadProgress}
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleCreate}
                                disabled={saving || !form.title.trim()}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ في المكتبة'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Items */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {items.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">المكتبة فارغة</p>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <Card key={item.id} className="shadow-soft">
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="bg-red-700/10 p-2 rounded-lg shrink-0">
                                                <BookOpen className="h-4 w-4 text-red-700" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-muted-foreground">
                                                        {LIBRARY_TYPE_LABELS[item.type] ?? item.type}
                                                    </span>
                                                    {item.file_url && (
                                                        <a
                                                            href={item.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-red-700 hover:underline"
                                                        >
                                                            عرض الملف
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
