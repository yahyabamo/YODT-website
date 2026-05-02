'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Link2, Loader2, ChevronRight, Users, Layout, ChevronDown, ChevronUp } from 'lucide-react';
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
    adminGetTrackRequests,
    adminHandleTrackRequest,
    adminRemoveMemberFromTrack,
} from '@/lib/queries';
import type { Track, LibraryItem } from '@/integrations/supabase/types';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useNavigate } from 'react-router-dom';

export default function AdminTracksPage() {
    const navigate = useNavigate();
    useRoleGuard(['busla']);

    // Data State
    const [tracks, setTracks] = useState<any[]>([]);
    const [books, setBooks] = useState<LibraryItem[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Assign book state
    const [assignTrackId, setAssignTrackId] = useState<string | null>(null);
    const [assignBookId, setAssignBookId] = useState('');

    // UI State
    const [activeTab, setActiveTab] = useState<'requests' | 'tracks'>('tracks');
    const [expandedMembersTrackId, setExpandedMembersTrackId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [{ data: tracksData }, booksData, { data: requestsData }] = await Promise.all([
            supabase
                .from('tracks')
                // Added profiles(full_name) to fetch the actual names of the members
                .select('*, track_books(library_items(title), is_current), track_members(id, profiles(full_name))')
                .order('created_at', { ascending: false }),
            getLibraryItems('book'),
            adminGetTrackRequests(),
        ]);
        setTracks(tracksData ?? []);
        setBooks(booksData);
        setRequests(requestsData ?? []);
        console.log(`Admin Dashboard: Fetched ${requestsData?.length ?? 0} pending requests.`);
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

    const handleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
        setProcessingId(requestId);
        const { error } = await adminHandleTrackRequest(requestId, status);
        if (error) {
            toast.error(error.message || 'فشل معالجة الطلب');
        } else {
            toast.success(`تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب`);
            fetchData();
        }
        setProcessingId(null);
    };

    const toggleMembersList = (trackId: string) => {
        setExpandedMembersTrackId(prev => prev === trackId ? null : trackId);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-10" dir="rtl">
            <div className="max-w-4xl mx-auto px-4 pt-6">
                <button
                    onClick={() => navigate('/admin/busla')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold mb-4"
                >
                    <ChevronRight size={18} /> العودة للقائمة
                </button>
                <PageHeader title="إدارة المدارات" />

                {/* Tabs Navigation */}
                <div className="flex bg-slate-200/60 p-1.5 rounded-xl mb-8 mt-6">
                    <button
                        onClick={() => setActiveTab('tracks')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'tracks'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        <Layout className="h-4 w-4" />
                        المدارات والمحتوى
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'requests'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        طلبات الانضمام
                        {requests.length > 0 && (
                            <span className="bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                                {requests.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Content: Requests */}
                {activeTab === 'requests' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {requests.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {requests.map((req) => (
                                    <Card key={req.id} className="shadow-sm border-slate-200 hover:border-blue-200 transition-colors">
                                        <CardContent className="p-5 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-base">
                                                        {req.profiles?.full_name || 'مستخدم غير معروف'}
                                                    </h3>
                                                    {(req.academic_profile?.university || req.academic_profile?.major) && (
                                                        <p className="text-xs text-slate-500 mt-1.5 font-medium">
                                                            🎓 {req.academic_profile.university} - {req.academic_profile.major}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                                                    {req.tracks?.title || 'مدار محذوف'}
                                                </span>
                                            </div>

                                            {req.approved_tracks && req.approved_tracks.length > 0 && (
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-slate-500 text-xs font-semibold block mb-2">عضو حالياً في:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {req.approved_tracks.map((trackName: string, idx: number) => (
                                                            <span key={idx} className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded text-[11px] font-medium">
                                                                {trackName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                    disabled={processingId === req.id}
                                                    onClick={() => handleRequest(req.id, 'approved')}
                                                >
                                                    {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'قبول الطلب'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                                    disabled={processingId === req.id}
                                                    onClick={() => handleRequest(req.id, 'rejected')}
                                                >
                                                    رفض
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                <Users className="h-12 w-12 mb-4 text-slate-300" />
                                <p className="text-lg font-medium">لا توجد طلبات انضمام معلقة حالياً</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Tracks & Creation */}
                {activeTab === 'tracks' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Create Track Form */}
                        <Card className="shadow-sm border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-blue-600" />
                                    إنشاء مدار جديد
                                </h2>
                            </div>
                            <CardContent className="p-5">
                                <div className="grid gap-4 md:grid-cols-12">
                                    <div className="md:col-span-4">
                                        <input
                                            type="text"
                                            placeholder="اسم المدار *"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-6">
                                        <input
                                            type="text"
                                            placeholder="الوصف (اختياري)"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button
                                            className="w-full h-full bg-slate-900 hover:bg-slate-800"
                                            onClick={handleCreate}
                                            disabled={saving || !title.trim()}
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إضافة'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tracks List */}
                        <div>
                            <h2 className="font-bold text-lg text-slate-800 mb-4 px-1">المدارات الحالية</h2>
                            {loading ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {tracks.map((track) => {
                                        const currentBook = track.track_books?.find((b: any) => b.is_current);
                                        const memberCount = track.track_members?.length ?? 0;
                                        const isAssigning = assignTrackId === track.id;
                                        const isShowingMembers = expandedMembersTrackId === track.id;

                                        return (
                                            <Card key={track.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 pr-2">
                                                            <h3 className="font-bold text-slate-800 text-lg">{track.title}</h3>
                                                            {track.description && (
                                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{track.description}</p>
                                                            )}
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                <button
                                                                    onClick={() => toggleMembersList(track.id)}
                                                                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors text-xs px-2.5 py-1 rounded-md font-medium cursor-pointer border border-slate-200"
                                                                >
                                                                    <Users size={12} /> {memberCount} عضو
                                                                    {isShowingMembers ? <ChevronUp size={12} className="ml-1 text-slate-400" /> : <ChevronDown size={12} className="ml-1 text-slate-400" />}
                                                                </button>
                                                                {currentBook?.library_items && (
                                                                    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium">
                                                                        <BookOpen size={12} /> {currentBook.library_items.title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(track.id)}
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                                                            title="حذف المدار"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {/* Expanded Members List */}
                                                    {isShowingMembers && (
                                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                                                            <h4 className="text-xs font-bold text-slate-600 mb-2 border-b border-slate-200 pb-2">قائمة الأعضاء:</h4>
                                                            {memberCount > 0 ? (
                                                                <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                                                    {track.track_members
                                                                        .filter((m: any) => m.status === 'approved' || !m.status)
                                                                        .map((member: any) => (
                                                                            <li key={member.id} className="text-sm text-slate-700 flex items-center justify-between group/member">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                                                    <span className="truncate">{member.profiles?.full_name || 'مستخدم غير معروف'}</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        if (confirm(`هل أنت متأكد من إزالة ${member.profiles?.full_name || 'هذا المستخدم'} من المدار؟`)) {
                                                                                            const { error } = await adminRemoveMemberFromTrack(member.id);
                                                                                            if (error) toast.error('فشل الإزالة');
                                                                                            else {
                                                                                                toast.success('تمت الإزالة');
                                                                                                fetchData();
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                    className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/member:opacity-100 transition-all"
                                                                                    title="إزالة من المدار"
                                                                                >
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-xs text-slate-500 text-center py-2">لا يوجد أعضاء في هذا المدار حتى الآن.</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="pt-2 border-t border-slate-100">
                                                        {isAssigning ? (
                                                            <div className="flex flex-col gap-2 animate-in fade-in">
                                                                <select
                                                                    value={assignBookId}
                                                                    onChange={(e) => setAssignBookId(e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    <option value="">اختر كتاباً...</option>
                                                                    {books.map((b) => (
                                                                        <option key={b.id} value={b.id}>{b.title}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" className="flex-1" onClick={handleAssignBook} disabled={!assignBookId}>
                                                                        حفظ التعيين
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setAssignTrackId(null)}>
                                                                        إلغاء
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                                                                onClick={() => setAssignTrackId(track.id)}
                                                            >
                                                                <Link2 className="h-4 w-4 ml-1.5" />
                                                                {currentBook ? 'تغيير الكتاب الحالي' : 'تعيين كتاب للمدار'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}

                                    {tracks.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                            <Layout className="h-10 w-10 mb-3 text-slate-300" />
                                            <p className="font-medium">لا توجد مدارات بعد</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}