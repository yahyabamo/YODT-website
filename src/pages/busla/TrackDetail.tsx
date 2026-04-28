'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    StickyNote,
    Bookmark,
    MessageCircle,
    Trash2,
    Send,
    Plus,
    Loader2,
    BookOpen,
    ArrowLeft,
    Search,
    X,
    Clock,
    TrendingUp,
    Share2,
    ChevronLeft,
    ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
    getTrackById,
    getNotes,
    createNote,
    deleteNote,
    getBookmarks,
    toggleBookmark,
    getMessages,
    sendMessage,
    updateProgress,
} from '@/lib/queries';
import { lazy, Suspense } from 'react';
import type { Note, Bookmark as BookmarkType, TrackMessage } from '@/integrations/supabase/types';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { AdSlot } from '@/components/ads/AdSlot';

// Lazy load PDF viewer to avoid SSR issues
const PDFViewer = lazy(() => import('@/components/Pdfviewer'));

type Tab = 'notes' | 'bookmarks' | 'chat';

interface TrackDetailPageState {
    track: any;
    userId: string | null;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    activeTab: Tab;
    bookmarkedPages: Set<number>;
    notes: Note[];
    noteInput: string;
    savingNote: boolean;
    showAllNotes: boolean;
    showSearch: boolean;
    searchQuery: string;
    bookmarks: BookmarkType[];
    messages: TrackMessage[];
    chatInput: string;
    sendingMsg: boolean;
}

export default function TrackDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Consolidated state management
    const [state, setState] = useState<TrackDetailPageState>({
        track: null,
        userId: null,
        loading: true,
        currentPage: 1,
        totalPages: 0,
        activeTab: 'notes',
        bookmarkedPages: new Set(),
        notes: [],
        noteInput: '',
        savingNote: false,
        showAllNotes: false,
        showSearch: false,
        searchQuery: '',
        bookmarks: [],
        messages: [],
        chatInput: '',
        sendingMsg: false,
    });

    const chatEndRef = useRef<HTMLDivElement>(null);
    const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Helper function to update state
    const updateState = useCallback((updates: Partial<TrackDetailPageState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    // 1. Get user on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const userId = data.user?.id ?? null;
                updateState({ userId, loading: !userId ? false : true });
            } catch (error) {
                console.error('Auth error:', error);
                updateState({ loading: false });
            }
        };
        fetchUser();
    }, []);

    // 2. Fetch track data
    useEffect(() => {
        if (!id || !state.userId) return;

        const fetchTrackData = async () => {
            updateState({ loading: true });
            try {
                const data = await getTrackById(id, state.userId!);
                if (!data) {
                    toast.error('المسار غير موجود');
                    navigate('/busla/tracks');
                    return;
                }
                updateState({
                    track: data,
                    currentPage: data.last_page || 1,
                    totalPages: data.total_pages || 0,
                });
            } catch (error) {
                console.error('Track fetch error:', error);
                toast.error('حدث خطأ أثناء تحميل البيانات');
            } finally {
                updateState({ loading: false });
            }
        };

        fetchTrackData();
    }, [state.userId, id]);

    // 3. Fetch notes
    useEffect(() => {
        if (!state.userId || !id) return;
        const fetchNotes = async () => {
            try {
                const notesData = await getNotes(id, state.userId!);
                updateState({ notes: notesData || [] });
            } catch (error) {
                console.error('Notes fetch error:', error);
            }
        };
        fetchNotes();
    }, [state.userId, id]);

    // 4. Fetch bookmarks
    useEffect(() => {
        if (!state.userId || !id) return;
        const fetchBookmarks = async () => {
            try {
                const bookmarksData = await getBookmarks(id, state.userId!);
                updateState({
                    bookmarks: bookmarksData || [],
                    bookmarkedPages: new Set(bookmarksData?.map((b) => b.page_number) || []),
                });
            } catch (error) {
                console.error('Bookmarks fetch error:', error);
            }
        };
        fetchBookmarks();
    }, [state.userId, id]);

    // 5. Fetch messages when chat tab is active
    useEffect(() => {
        if (!state.userId || !id || state.activeTab !== 'chat') return;
        const fetchMessages = async () => {
            try {
                const messagesData = await getMessages(id);
                updateState({ messages: messagesData || [] });
            } catch (error) {
                console.error('Messages fetch error:', error);
            }
        };
        fetchMessages();
    }, [state.userId, id, state.activeTab]);

    // 6. Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages]);

    // Handle page change with debounced progress save
    const handlePageChange = useCallback((page: number) => {
        updateState({ currentPage: page });
        if (progressTimer.current) clearTimeout(progressTimer.current);
        progressTimer.current = setTimeout(() => {
            if (state.userId && id) {
                updateProgress(id, state.userId, page).catch(console.error);
            }
        }, 1000);
    }, [state.userId, id]);

    // Handle total pages update from PDFViewer
    const handleTotalPagesChange = useCallback((pages: number) => {
        updateState({ totalPages: pages });
    }, []);

    // Save note
    const handleSaveNote = useCallback(async () => {
        if (!state.userId || !state.noteInput.trim() || !id) return;
        updateState({ savingNote: true });
        try {
            const { data, error } = await createNote(id, state.userId, state.currentPage, state.noteInput.trim());
            if (error) {
                toast.error('فشل حفظ الملاحظة');
            } else if (data) {
                updateState({
                    notes: [data, ...state.notes],
                    noteInput: '',
                });
                toast.success('تم حفظ الملاحظة بنجاح ✓');
            }
        } catch (error) {
            console.error('Note save error:', error);
            toast.error('حدث خطأ أثناء حفظ الملاحظة');
        } finally {
            updateState({ savingNote: false });
        }
    }, [state.userId, state.noteInput, state.currentPage, state.notes, id]);

    // Delete note
    const handleDeleteNote = useCallback(async (noteId: string) => {
        try {
            await deleteNote(noteId);
            updateState({
                notes: state.notes.filter((n) => n.id !== noteId),
            });
            toast.info('تم حذف الملاحظة');
        } catch (error) {
            console.error('Note delete error:', error);
            toast.error('فشل حذف الملاحظة');
        }
    }, [state.notes]);

    // Toggle bookmark
    const handleBookmarkToggle = useCallback(async (page: number) => {
        if (!state.userId || !id) return;
        try {
            const { added, error } = await toggleBookmark(id, state.userId, page);
            if (error) {
                toast.error('حدث خطأ');
                return;
            }
            if (added) {
                updateState({
                    bookmarkedPages: new Set([...state.bookmarkedPages, page]),
                    bookmarks: [
                        ...state.bookmarks,
                        { id: `temp-${Date.now()}`, user_id: state.userId, track_id: id, page_number: page, created_at: new Date().toISOString() },
                    ],
                });
                toast.success(`✓ تمت إضافة إشارة مرجعية للصفحة ${page}`);
            } else {
                const newBookmarkedPages = new Set(state.bookmarkedPages);
                newBookmarkedPages.delete(page);
                updateState({
                    bookmarkedPages: newBookmarkedPages,
                    bookmarks: state.bookmarks.filter((b) => b.page_number !== page),
                });
                toast.info('تمت إزالة الإشارة المرجعية');
            }
        } catch (error) {
            console.error('Bookmark toggle error:', error);
            toast.error('فشل تحديث الإشارة المرجعية');
        }
    }, [state.userId, state.bookmarkedPages, state.bookmarks, id]);

    // Send chat message
    const handleSendMessage = useCallback(async () => {
        if (!state.userId || !state.chatInput.trim() || !id) return;
        updateState({ sendingMsg: true });
        try {
            const { error } = await sendMessage(id, state.userId, state.chatInput.trim());
            if (error) {
                toast.error('فشل إرسال الرسالة');
            } else {
                updateState({ chatInput: '' });
                const updatedMessages = await getMessages(id);
                updateState({ messages: updatedMessages || [] });
                toast.success('تم إرسال الرسالة ✓');
            }
        } catch (error) {
            console.error('Message send error:', error);
            toast.error('حدث خطأ أثناء إرسال الرسالة');
        } finally {
            updateState({ sendingMsg: false });
        }
    }, [state.userId, state.chatInput, id]);

    // Memoized filtered data
    const filteredNotes = useMemo(() => {
        const pageNotes = state.notes.filter((n) => n.page_number === state.currentPage);
        if (state.showAllNotes) return state.notes;
        return pageNotes;
    }, [state.notes, state.currentPage, state.showAllNotes]);

    const searchedNotes = useMemo(() => {
        if (!state.searchQuery.trim()) return filteredNotes;
        return filteredNotes.filter((n) =>
            n.content.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
    }, [filteredNotes, state.searchQuery]);

    const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'notes', label: 'الملاحظات', icon: <StickyNote className="h-4 w-4" />, count: state.notes.length },
        { key: 'bookmarks', label: 'الإشارات', icon: <Bookmark className="h-4 w-4" />, count: state.bookmarks.length },
        { key: 'chat', label: 'الدردشة', icon: <MessageCircle className="h-4 w-4" />, count: state.messages.length },
    ];

    // Loading state
    if (state.loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-red-700 mx-auto" />
                    <p className="text-slate-600 font-medium">جاري تحميل المسار...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/busla/tracks')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                            {state.track?.name || 'المسار'}
                        </h1>
                        {/* <Button size="icon" variant="ghost" className="h-10 w-10">
                            <Share2 className="h-5 w-5 text-slate-600" />
                        </Button> */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
                <AdSlot page="track_details" position="top" />
                {/* No book assigned state */}
                {!state.track?.current_book?.file_url ? (
                    <Card className="border-0 shadow-md bg-white">
                        <CardContent className="py-16 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 bg-slate-100 rounded-full">
                                    <BookOpen className="h-12 w-12 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-600 font-medium">لم يُعيَّن كتاب لهذا المسار بعد</p>
                                <p className="text-sm text-slate-500 mt-2">سيتم إضافة الكتاب قريباً</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* PDF Viewer with Suspense */
                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-md border border-slate-200">
                                <Loader2 className="h-10 w-10 animate-spin text-red-700 mb-3" />
                                <p className="text-sm text-slate-600 font-medium">جاري تحميل قارئ الكتب...</p>
                            </div>
                        }
                    >
                        <PDFViewer
                            url={state.track.current_book.file_url}
                            currentPage={state.currentPage}
                            totalPages={state.totalPages}
                            isBookmarked={state.bookmarkedPages.has(state.currentPage)}
                            onPageChange={handlePageChange}
                            onBookmarkToggle={handleBookmarkToggle}
                            onTotalPagesChange={handleTotalPagesChange}
                        />
                    </Suspense>
                )}

                {/* Progress Info Card */}
                {state.track?.current_book?.file_url && (
                    <Card className="border-0 shadow-md bg-white">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-600 block mb-2">
                                        الصفحة الحالية
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePageChange(state.currentPage - 1)}
                                            disabled={state.currentPage <= 1}
                                            className="h-9 px-3"
                                        >
                                            السابقة
                                        </Button>
                                        <input
                                            type="number"
                                            min={1}
                                            value={state.currentPage}
                                            onChange={(e) => {
                                                const page = Math.max(1, Number(e.target.value) || 1);
                                                handlePageChange(page);
                                            }}
                                            className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePageChange(state.currentPage + 1)}
                                            disabled={state.totalPages > 0 && state.currentPage >= state.totalPages}
                                            className="h-9 px-3"
                                        >
                                            التالية
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">التقدم</p>
                                    <div className="text-2xl font-bold text-red-700">
                                        {state.totalPages > 0
                                            ? Math.round((state.currentPage / state.totalPages) * 100)
                                            : 0}
                                        %
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-300"
                                    style={{
                                        width: `${state.totalPages > 0 ? (state.currentPage / state.totalPages) * 100 : 0}%`,
                                    }}
                                />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <Clock className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-600 font-medium">قراءة</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {Math.ceil((state.totalPages || 0) / 10)}د
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <StickyNote className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-600 font-medium">ملاحظات</p>
                                    <p className="text-sm font-bold text-slate-900">{state.notes.length}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 text-center">
                                    <Bookmark className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                                    <p className="text-xs text-slate-600 font-medium">إشارات</p>
                                    <p className="text-sm font-bold text-slate-900">{state.bookmarks.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs Navigation */}
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => updateState({ activeTab: tab.key })}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                state.activeTab === tab.key
                                    ? 'bg-red-700 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                    {/* Notes Tab */}
                    {state.activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ابحث في الملاحظات..."
                                    value={state.searchQuery}
                                    onChange={(e) => updateState({ searchQuery: e.target.value })}
                                    className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                            </div>

                            {/* Note Input */}
                            <Card className="border-0 shadow-md bg-white">
                                <CardContent className="p-4 space-y-3">
                                    <textarea
                                        value={state.noteInput}
                                        onChange={(e) => updateState({ noteInput: e.target.value })}
                                        placeholder="أضف ملاحظة جديدة..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white resize-none"
                                        rows={3}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">الصفحة {state.currentPage}</span>
                                        <Button
                                            onClick={handleSaveNote}
                                            disabled={state.savingNote || !state.noteInput.trim()}
                                            className="bg-red-700 hover:bg-red-800 text-white gap-2"
                                            size="sm"
                                        >
                                            {state.savingNote ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                            حفظ الملاحظة
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Toggle All Notes */}
                            {state.notes.length > 0 && (
                                <button
                                    onClick={() => updateState({ showAllNotes: !state.showAllNotes })}
                                    className="w-full text-sm text-red-700 font-medium hover:text-red-800 transition-colors py-2"
                                >
                                    {state.showAllNotes ? '← عرض ملاحظات هذه الصفحة فقط' : '→ عرض جميع الملاحظات'}
                                </button>
                            )}

                            {/* Notes List */}
                            {searchedNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {searchedNotes.map((note) => (
                                        <Card key={note.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold text-slate-500 mb-1">
                                                            الصفحة {note.page_number}
                                                        </p>
                                                        <p className="text-sm text-slate-800 leading-relaxed">{note.content}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(note.created_at).toLocaleDateString('ar-SA')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <StickyNote className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">لا توجد ملاحظات بعد</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookmarks Tab */}
                    {state.activeTab === 'bookmarks' && (
                        <div className="space-y-3">
                            {state.bookmarks.length > 0 ? (
                                state.bookmarks.map((bookmark) => (
                                    <Card
                                        key={bookmark.id}
                                        onClick={() => handlePageChange(bookmark.page_number)}
                                        className="border-0 shadow-sm bg-white hover:shadow-md cursor-pointer transition-all"
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Bookmark className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">الصفحة {bookmark.page_number}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(bookmark.created_at).toLocaleDateString('ar-SA')}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronLeft className="h-5 w-5 text-slate-400" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Bookmark className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">لا توجد إشارات مرجعية بعد</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Tab */}
                    {state.activeTab === 'chat' && (
                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4 space-y-4">
                                {/* Messages List */}
                                <div className="max-h-96 overflow-y-auto space-y-3 mb-4">
                                    {state.messages.length > 0 ? (
                                        state.messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    'flex gap-2',
                                                    msg.user_id === state.userId ? 'justify-end' : 'justify-start'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'max-w-xs px-4 py-2 rounded-xl text-sm',
                                                        msg.user_id === state.userId
                                                            ? 'bg-red-700 text-white rounded-br-none'
                                                            : 'bg-slate-100 text-slate-900 rounded-bl-none'
                                                    )}
                                                >
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">لا توجد رسائل بعد</p>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="flex gap-2 pt-4 border-t border-slate-200">
                                    <textarea
                                        value={state.chatInput}
                                        onChange={(e) => updateState({ chatInput: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="اكتب رسالة..."
                                        className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white resize-none"
                                        rows={2}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={state.sendingMsg || !state.chatInput.trim()}
                                        className="bg-red-700 hover:bg-red-800 text-white h-10 w-10"
                                    >
                                        {state.sendingMsg ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <AdSlot page="track_details" position="bottom" className="mt-4" />
            </div>
        </div>
    );
}
