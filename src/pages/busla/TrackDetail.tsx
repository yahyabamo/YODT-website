'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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


// Lazy load PDF viewer to avoid SSR issues
import PDFViewer from '@/components/Pdfviewer';
type Tab = 'notes' | 'bookmarks' | 'chat';

export default function TrackDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // Rename router to navigate for clarity

    const [track, setTrack] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const [bookmarkedPages, setBookmarkedPages] = useState<Set<number>>(new Set());

    // Notes state
    const [notes, setNotes] = useState<Note[]>([]);
    const [noteInput, setNoteInput] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [showAllNotes, setShowAllNotes] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Bookmarks state
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

    // Chat state
    const [messages, setMessages] = useState<TrackMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    // ... other states

    // 1. Get user first
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const user = data.user?.id ?? null;
            setUserId(user);
            // If no user is found, stop loading so we don't hang forever
            if (!user) setLoading(false);
        });
    }, []);

    // 2. Fetch track data
    useEffect(() => {
        // Only fetch if we have the ID and we know the userId (even if null)
        if (!id) return;

        const fetchData = async () => {
            // If user finished checking and is null, redirect or stop loading
            if (userId === null) {
                // setLoading(false); // Optional: depends if you allow guests
                return;
            }

            setLoading(true);
            try {
                const data = await getTrackById(id, userId);
                if (!data) {
                    navigate('/busla/tracks');
                    return;
                }
                setTrack(data);
                setCurrentPage(data.last_page || 1);
            } catch (err) {
                console.error(err);
                toast.error("حدث خطأ أثناء تحميل البيانات");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // REMOVED 'navigate' from dependencies to prevent re-fire loops
    }, [userId, id]);

    // ... handle other effects similarly (remove unnecessary dependencies)

    // Fetch bookmarks
    useEffect(() => {
        if (!userId || !id) return;
        getBookmarks(id, userId).then((bk) => {
            setBookmarks(bk);
            setBookmarkedPages(new Set(bk.map((b) => b.page_number)));
        });
    }, [userId, id]);

    // Fetch messages
    useEffect(() => {
        if (!userId || !id || activeTab !== 'chat') return;
        getMessages(id).then(setMessages);
    }, [userId, id, activeTab]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle page change - debounced progress save
    const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (progressTimer.current) clearTimeout(progressTimer.current);
        progressTimer.current = setTimeout(() => {
            if (userId) updateProgress(id, userId, page);
        }, 1000);
    };

    // Save note
    const handleSaveNote = async () => {
        if (!userId || !noteInput.trim()) return;
        setSavingNote(true);
        const { data, error } = await createNote(id, userId, currentPage, noteInput.trim());
        if (error) {
            toast.error('فشل حفظ الملاحظة');
        } else if (data) {
            setNotes((prev) => [data, ...prev]);
            setNoteInput('');
            toast.success('تم حفظ الملاحظة');
        }
        setSavingNote(false);
    };

    // Delete note
    const handleDeleteNote = async (noteId: string) => {
        await deleteNote(noteId);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.info('تم حذف الملاحظة');
    };

    // Toggle bookmark
    const handleBookmarkToggle = async (page: number) => {
        if (!userId) return;
        const { added, error } = await toggleBookmark(id, userId, page);
        if (error) {
            toast.error('حدث خطأ');
            return;
        }
        if (added) {
            setBookmarkedPages((prev) => new Set([...prev, page]));
            setBookmarks((prev) => [
                ...prev,
                { id: 'temp', user_id: userId, track_id: id, page_number: page, created_at: '' },
            ]);
            toast.success(`تمت إضافة إشارة مرجعية للصفحة ${page}`);
        } else {
            setBookmarkedPages((prev) => {
                const next = new Set(prev);
                next.delete(page);
                return next;
            });
            setBookmarks((prev) => prev.filter((b) => b.page_number !== page));
            toast.info('تمت إزالة الإشارة المرجعية');
        }
    };

    // Send chat message
    const handleSendMessage = async () => {
        if (!userId || !chatInput.trim()) return;
        setSendingMsg(true);
        const { error } = await sendMessage(id, userId, chatInput.trim());
        if (error) {
            toast.error('فشل إرسال الرسالة');
        } else {
            setChatInput('');
            const updated = await getMessages(id);
            setMessages(updated);
        }
        setSendingMsg(false);
    };

    const currentPageNotes = notes.filter((n) => n.page_number === currentPage);
    const allNotes = showAllNotes ? notes : notes.filter((n) => n.page_number === currentPage);

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'notes', label: 'الملاحظات', icon: <StickyNote className="h-4 w-4" /> },
        { key: 'bookmarks', label: 'الإشارات', icon: <Bookmark className="h-4 w-4" /> },
        { key: 'chat', label: 'الدردشة', icon: <MessageCircle className="h-4 w-4" /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            <header className="sticky-header">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
                {/* No book assigned */}
                {!track?.current_book?.file_url ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>لم يُعيَّن كتاب لهذا المدار بعد</p>
                        </CardContent>
                    </Card>
                ) : (
                    /* PDF Viewer */
                    /* Replace the PDF Viewer section with this */
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-2xl">
                            <Loader2 className="h-10 w-10 animate-spin text-red-700 mb-2" />
                            <p className="text-sm text-muted-foreground">جاري تحميل قارئ الكتب...</p>
                        </div>
                    }>
                        <PDFViewer
                            url={track.current_book.file_url}
                            initialPage={currentPage}
                            isBookmarked={bookmarkedPages.has(currentPage)}
                            onPageChange={handlePageChange}
                            onBookmarkToggle={handleBookmarkToggle}
                            onTotalPages={setTotalPages}
                        />
                    </Suspense>
                )}

                {/* Progress info */}
                {track?.current_book && totalPages > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                        <span>صفحة {currentPage} من {totalPages}</span>
                        <span className="font-medium text-red-700">
                            {Math.round((currentPage / totalPages) * 100)}% مكتمل
                        </span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex rounded-xl overflow-hidden border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-all',
                                activeTab === tab.key
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── NOTES TAB ── */}
                {activeTab === 'notes' && (
                    <div className="space-y-3">
                        {/* Add note */}
                        <Card>
                            <CardContent className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        ملاحظة على الصفحة {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setShowAllNotes((v) => !v)}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        {showAllNotes ? 'الصفحة الحالية' : `الكل (${notes.length})`}
                                    </button>
                                </div>
                                <textarea
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="اكتب ملاحظتك هنا..."
                                    rows={3}
                                    className="w-full bg-muted rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-700"
                                />
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={handleSaveNote}
                                    disabled={savingNote || !noteInput.trim()}
                                >
                                    {savingNote ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 ml-1" />
                                            حفظ الملاحظة
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Notes list */}
                        {allNotes.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm py-4">
                                لا توجد ملاحظات {showAllNotes ? '' : 'لهذه الصفحة'}
                            </p>
                        ) : (
                            allNotes.map((note) => (
                                <Card key={note.id} className="shadow-soft">
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <span className="text-xs text-muted-foreground">
                                                    صفحة {note.page_number}
                                                </span>
                                                <p className="text-sm mt-0.5 leading-relaxed">{note.content}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* ── BOOKMARKS TAB ── */}
                {activeTab === 'bookmarks' && (
                    <div className="space-y-3">
                        {bookmarks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bookmark className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">لا توجد إشارات مرجعية</p>
                                <p className="text-xs mt-1">
                                    اضغط على أيقونة الإشارة في قارئ PDF لإضافتها
                                </p>
                            </div>
                        ) : (
                            bookmarks.map((bk) => (
                                <Card
                                    key={bk.id}
                                    className="shadow-soft cursor-pointer hover:border-red-700 transition-colors"
                                    onClick={() => handlePageChange(bk.page_number)}
                                >
                                    <CardContent className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-700/10 flex items-center justify-center shrink-0">
                                                <Bookmark className="h-5 w-5 text-red-700" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">صفحة {bk.page_number}</p>
                                                {totalPages > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {Math.round((bk.page_number / totalPages) * 100)}% من الكتاب
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookmarkToggle(bk.page_number);
                                            }}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* ── CHAT TAB ── */}
                {activeTab === 'chat' && (
                    <div className="space-y-3">
                        <Card>
                            <CardContent className="p-3">
                                {/* Messages */}
                                <div className="space-y-3 max-h-64 overflow-y-auto mb-3 pr-1">
                                    {messages.length === 0 && (
                                        <p className="text-center text-muted-foreground text-sm py-4">
                                            لا توجد رسائل بعد. كن أول من يتحدث!
                                        </p>
                                    )}
                                    {messages.map((msg) => {
                                        const isMe = msg.user_id === userId;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    'flex flex-col gap-0.5',
                                                    isMe ? 'items-end' : 'items-start'
                                                )}
                                            >
                                                {!isMe && (
                                                    <span className="text-xs text-muted-foreground px-1">
                                                        {msg.profiles?.full_name ?? 'مجهول'}
                                                    </span>
                                                )}
                                                <div
                                                    className={cn(
                                                        'max-w-[80%] px-3 py-2 rounded-2xl text-sm',
                                                        isMe
                                                            ? 'bg-red-700 text-white rounded-tl-sm'
                                                            : 'bg-muted text-foreground rounded-tr-sm'
                                                    )}
                                                >
                                                    {msg.message}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground px-1">
                                                    {new Date(msg.created_at).toLocaleTimeString('ar', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="اكتب رسالة..."
                                        className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={sendingMsg || !chatInput.trim()}
                                        className="shrink-0"
                                    >
                                        {sendingMsg ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}