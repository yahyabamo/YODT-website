'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getTracks, joinTrack, leaveTrack } from '@/lib/queries';
import type { Track } from '@/integrations/supabase/types';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

interface TrackPageState {
    track: any;
    userId: string | null;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    bookmarkedPages: Set<number>;
    noteInput: string;
    savingNote: boolean;
    showAllNotes: boolean;
    showSearch: boolean;
    searchQuery: string;

    chatInput: string;
    sendingMsg: boolean;
}
export default function TracksPage() {
    const [tracks, setTracks] = useState<(Track & { is_pending?: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const [state, setState] = useState<TrackPageState>({
        track: null,
        userId: null,
        loading: true,
        currentPage: 1,
        totalPages: 0,
        bookmarkedPages: new Set(),
        noteInput: '',
        savingNote: false,
        showAllNotes: false,
        showSearch: false,
        searchQuery: '',
        chatInput: '',
        sendingMsg: false,
    });



    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null);
        });
    }, []);

    const fetchTracks = async (uid: string) => {
        setLoading(true);
        const data = await getTracks(uid);
        setTracks(data);
        setLoading(false);
    };

    useEffect(() => {
        if (userId) fetchTracks(userId);
    }, [userId]);

    const handleJoin = async (track: any) => {
        if (!userId) return;
        setActionLoading(track.id);

        if (track.is_member) {
            const { error } = await leaveTrack(track.id, userId);
            if (error) {
                toast.error('حدث خطأ');
            } else {
                toast.info('تم مغادرة المدار');
                fetchTracks(userId);
            }
        } else {
            console.log(`Sending join request for track: ${track.title}`);
            const { error } = await joinTrack(track.id, userId);
            if (error) {
                console.error("Join request failed:", error);
                toast.error('فشل إرسال الطلب: ' + error);
            } else {
                console.log("Join request sent successfully to database.");
                toast.success('تم إرسال طلب الانضمام بنجاح');
                fetchTracks(userId);
            }
        }
        setActionLoading(null);
    };
    const updateState = useCallback((updates: Partial<TrackPageState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/busla')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                            {'المدارات'}
                        </h1>
                        {/* <Button size="icon" variant="ghost" className="h-10 w-10">
                            <Share2 className="h-5 w-5 text-slate-600" />
                        </Button> */}
                    </div>
                </div>
            </header>

            <div className="px-4 py-4 max-w-lg mx-auto">
                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Tracks */}
                {!loading && (
                    <div className="space-y-4">
                        {tracks.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد مدارات حالياً</p>
                            </div>
                        )}

                        {tracks.map((track, index) => {
                            const totalPages =
                                track.current_book ? 100 : 0; // placeholder — actual comes from PDF metadata
                            const progressPct =
                                totalPages > 0
                                    ? Math.round(((track.user_progress ?? 0) / totalPages) * 100)
                                    : 0;

                            return (
                                <Card
                                    key={track.id}
                                    className={cn(
                                        'shadow-soft animate-slide-up overflow-hidden',
                                        track.is_member && 'border-red-700 border'
                                    )}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <CardContent className="p-0">
                                        {/* Top colored bar */}
                                        <div className="gradient-primary px-4 py-2 flex items-center justify-between">
                                            <span className="text-white text-xs font-medium">
                                                {track.is_member ? '✓ عضو' : 'مدار قراءة'}
                                            </span>
                                            {track.current_book && (
                                                <span className="text-white/70 text-xs line-clamp-1 max-w-[180px]">
                                                    {track.current_book.title}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <div>
                                                <h3 className="font-bold text-base">{track.title}</h3>
                                                {track.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {track.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-primary" />
                                                    <span>{track.member_count ?? 0} عضو</span>
                                                </div>
                                                {track.current_book && (
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="h-4 w-4 text-primary" />
                                                        <span>صفحة {track.user_progress ?? 0}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress bar (only for members) */}
                                            {track.is_member && track.current_book && (
                                                <div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                        <span>تقدمك</span>
                                                        <span>{progressPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-1.5">
                                                        <div
                                                            className="gradient-primary h-1.5 rounded-full transition-all"
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {track.is_member ? (
                                                    <>
                                                        <Link to={`/busla/track/${track.id}`} className="flex-1">
                                                            <Button className="w-full" size="sm">
                                                                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                                                                {track.current_book ? 'متابعة القراءة' : 'فتح المدار'}
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleJoin(track)}
                                                            disabled={actionLoading === track.id}
                                                            className="text-xs"
                                                        >
                                                            مغادرة
                                                        </Button>
                                                    </>
                                                ) : track.is_pending ? (
                                                    <Button
                                                        className="w-full"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled
                                                    >
                                                        قيد الانتظار...
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="w-full"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleJoin(track)}
                                                        disabled={actionLoading === track.id}
                                                    >
                                                        {actionLoading === track.id ? 'جاري...' : 'طلب انضمام'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}