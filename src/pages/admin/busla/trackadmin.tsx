'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Link2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
    adminCreateTrack,
    adminDeleteTrack,
    adminAssignBook,
    getLibraryItems,
} from '@/lib/queries';
import type { Track, LibraryItem } from '@/integrations/supabase/types';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function AdminTracksPage() {
    useRoleGuard(['busla']);
    const [tracks, setTracks] = useState<any[]>([]);
    const [books, setBooks] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Assign book state
    const [assignTrackId, setAssignTrackId] = useState<string | null>(null);
    const [assignBookId, setAssignBookId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [{ data: tracksData }, booksData] = await Promise.all([
            supabase
                .from('tracks')
                .select('*, track_books(library_items(title), is_current), track_members(id)')
                .order('created_at', { ascending: false }),
            getLibraryItems('book'),
        ]);
        setTracks(tracksData ?? []);
        setBooks(booksData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!title.trim()) return toast.error('أدخل اسم المدار');
        setSaving(true);
        const { error } = await adminCreateTrack(title.trim(), description.trim());
        if (error) {
            toast.error('فشل إنشاء المدار: ' + error);
        } else {
            toast.success('تم إنشاء المدار');
            setTitle('');
            setDescription('');
            fetchData();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المدار؟')) return;
        const { error } = await adminDeleteTrack(id);
        if (error) {
            toast.error('فشل الحذف');
        } else {
            toast.success('تم الحذف');
            fetchData();
        }
    };

    const handleAssignBook = async () => {
        if (!assignTrackId || !assignBookId) return;
        const { error } = await adminAssignBook(assignTrackId, assignBookId);
        if (error) {
            toast.error('فشل تعيين الكتاب');
        } else {
            toast.success('تم تعيين الكتاب للمدار');
            setAssignTrackId(null);
            setAssignBookId('');
            fetchData();
        }
    };

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl">
            <PageHeader title="إدارة المدارات" />

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Create Track Form */}
                <Card className="shadow-soft">
                    <CardContent className="p-4 space-y-3">
                        <h2 className="font-bold text-base">إنشاء مدار جديد</h2>
                        <input
                            type="text"
                            placeholder="اسم المدار *"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                        <textarea
                            placeholder="الوصف (اختياري)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                        <Button
                            className="w-full"
                            onClick={handleCreate}
                            disabled={saving || !title.trim()}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <><Plus className="h-4 w-4 ml-1" />إنشاء المدار</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Tracks List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tracks.map((track) => {
                            const currentBook = track.track_books?.find((b: any) => b.is_current);
                            const memberCount = track.track_members?.length ?? 0;
                            const isAssigning = assignTrackId === track.id;

                            return (
                                <Card key={track.id} className="shadow-soft">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{track.title}</h3>
                                                {track.description && (
                                                    <p className="text-sm text-muted-foreground">{track.description}</p>
                                                )}
                                                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>{memberCount} عضو</span>
                                                    {currentBook?.library_items && (
                                                        <span className="text-red-700">
                                                            📖 {currentBook.library_items.title}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(track.id)}
                                                className="text-muted-foreground hover:text-destructive shrink-0 mr-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Assign book toggle */}
                                        {isAssigning ? (
                                            <div className="flex gap-2">
                                                <select
                                                    value={assignBookId}
                                                    onChange={(e) => setAssignBookId(e.target.value)}
                                                    className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                                >
                                                    <option value="">اختر كتاباً...</option>
                                                    {books.map((b) => (
                                                        <option key={b.id} value={b.id}>{b.title}</option>
                                                    ))}
                                                </select>
                                                <Button size="sm" onClick={handleAssignBook} disabled={!assignBookId}>
                                                    تعيين
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setAssignTrackId(null)}>
                                                    إلغاء
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setAssignTrackId(track.id)}
                                            >
                                                <Link2 className="h-4 w-4 ml-1" />
                                                {currentBook ? 'تغيير الكتاب' : 'تعيين كتاب'}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {tracks.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">لا توجد مدارات بعد</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
