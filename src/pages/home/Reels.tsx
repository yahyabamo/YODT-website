import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Music2, Send, Volume2, VolumeX, Play, Search, X, ChevronUp } from 'lucide-react';
import { Drawer } from 'vaul';
import {
    fetchReels, toggleLike, addComment,
    fetchComments, incrementViewCount, fetchReelStats
} from '@/service/supabaseData';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const BOTTOM_NAV_HEIGHT = 80; // px — adjust to match your BottomNav actual height

// ─────────────────────────────────────────────
// YouTube IFrame API — loaded ONCE globally
// ─────────────────────────────────────────────
const ytReadyCallbacks: (() => void)[] = [];
let ytApiState: 'idle' | 'loading' | 'ready' = 'idle';

const loadYouTubeAPI = (onReady: () => void) => {
    if (ytApiState === 'ready') { onReady(); return; }
    ytReadyCallbacks.push(onReady);
    if (ytApiState === 'loading') return;
    ytApiState = 'loading';
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => {
        ytApiState = 'ready';
        ytReadyCallbacks.forEach(cb => cb());
        ytReadyCallbacks.length = 0;
    };
};

const getVideoId = (url: string): string => {
    if (!url) return '';
    if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0] ?? '';
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] ?? '';
    if (url.includes('shorts/')) return url.split('shorts/')[1]?.split('?')[0] ?? '';
    return url.split('/').pop()?.split('?')[0] ?? '';
};

// ─────────────────────────────────────────────
// ReelVideo
// ─────────────────────────────────────────────
const ReelVideo = ({ reel, isActive }: { reel: any; isActive: boolean }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ likes: 0, comments: 0, isLiked: false });
    const [showHeart, setShowHeart] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [playerReady, setPlayerReady] = useState(false);
    // Whether video has been started by a user gesture (required for iOS)
    const [hasStarted, setHasStarted] = useState(false);
    // Whether the player attempted autoplay (desktop/Android)
    const [autoplayAttempted, setAutoplayAttempted] = useState(false);

    const playerRef = useRef<any>(null);
    const progressInterval = useRef<any>(null);
    const lastTap = useRef<number>(0);
    const tapTimeout = useRef<any>(null);
    const divId = `yt-player-${reel.id}`;
    const videoId = getVideoId(reel.video_url);

    // ── Init YouTube player ──
    useEffect(() => {
        let destroyed = false;

        loadYouTubeAPI(() => {
            if (destroyed || playerRef.current) return;

            playerRef.current = new (window as any).YT.Player(divId, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    loop: 1,
                    playlist: videoId,
                    playsinline: 1,
                    mute: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: () => {
                        if (destroyed) return;
                        setPlayerReady(true);
                    },
                    onStateChange: (e: any) => {
                        if (destroyed) return;
                        const YTState = (window as any).YT?.PlayerState;
                        if (!YTState) return;
                        if (e.data === YTState.PLAYING) {
                            setIsPaused(false);
                            setHasStarted(true);
                            startProgressTracking();
                        } else if (e.data === YTState.PAUSED) {
                            setIsPaused(true);
                            stopProgressTracking();
                        } else if (e.data === YTState.ENDED) {
                            playerRef.current?.seekTo(0);
                            playerRef.current?.playVideo();
                        }
                    },
                    onError: (e: any) => console.error('YT error:', e.data, reel.video_url),
                }
            });
        });

        return () => {
            destroyed = true;
            stopProgressTracking();
            clearTimeout(tapTimeout.current);
            try { playerRef.current?.destroy(); } catch (_) { }
            playerRef.current = null;
            setPlayerReady(false);
            setHasStarted(false);
            setAutoplayAttempted(false);
        };
    }, [reel.id]);

    // ── Play/pause when active state changes ──
    useEffect(() => {
        if (!playerReady) return;

        if (isActive) {
            // Attempt autoplay (works on desktop/Android, silently fails on iOS)
            const playPromise = playerRef.current?.playVideo();
            setAutoplayAttempted(true);
            loadStats();
            incrementViewCount(reel.id);
        } else {
            playerRef.current?.pauseVideo();
            stopProgressTracking();
            setProgress(0);
            setHasStarted(false);
            setAutoplayAttempted(false);
            setIsMuted(true);
        }
    }, [isActive, playerReady]);

    // ── Show tap-to-start overlay if autoplay didn't fire after 800ms ──
    // (iOS will not trigger onStateChange PLAYING so hasStarted stays false)
    useEffect(() => {
        if (!isActive || !autoplayAttempted) return;
        // If still not started after 800ms, iOS blocked it — overlay stays visible
    }, [autoplayAttempted, isActive]);

    const startProgressTracking = () => {
        stopProgressTracking();
        progressInterval.current = setInterval(() => {
            if (!playerRef.current) return;
            const current = playerRef.current.getCurrentTime?.() ?? 0;
            const dur = playerRef.current.getDuration?.() ?? 1;
            if (dur > 0) setProgress((current / dur) * 100);
        }, 250);
    };

    const stopProgressTracking = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
    };

    const loadStats = async () => {
        try { const data = await fetchReelStats(reel.id, user?.id); setStats(data); } catch (_) { }
    };

    const loadComments = async () => {
        try { const data = await fetchComments(reel.id); setComments(data); } catch (_) { }
    };

    const handleToggleLike = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للإعجاب بالفيديو'); return; }
        try {
            const { liked } = await toggleLike(reel.id, user.id);
            setStats(prev => ({ ...prev, likes: liked ? prev.likes + 1 : prev.likes - 1, isLiked: liked }));
        } catch { toast.error('فشل في تحديث الإعجاب'); }
    };

    // ── Tap handler ──
    // First tap (iOS / video not started): starts + unmutes
    // Double tap: like
    // Single tap (video running): toggle mute → then toggle pause
    const handleTap = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const now = Date.now();

        // ── iOS first-start: video not playing yet ──
        if (!hasStarted) {
            playerRef.current?.playVideo();
            setHasStarted(true); // optimistic — real confirm from onStateChange
            return;
        }

        // ── Double tap → like ──
        if (now - lastTap.current < 300) {
            clearTimeout(tapTimeout.current);
            lastTap.current = 0;
            if (!stats.isLiked) handleToggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 900);
            return;
        }

        lastTap.current = now;
        clearTimeout(tapTimeout.current);

        if (isMuted) {
            // First unmute tap
            playerRef.current?.unMute();
            playerRef.current?.setVolume(100);
            setIsMuted(false);
            if (isPaused) playerRef.current?.playVideo();
        } else {
            // Single tap → pause / resume after double-tap window
            tapTimeout.current = setTimeout(() => {
                if (isPaused) {
                    playerRef.current?.playVideo();
                } else {
                    playerRef.current?.pauseVideo();
                }
            }, 300);
        }
    }, [hasStarted, isMuted, isPaused, stats.isLiked, handleToggleLike]);

    const handleToggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMuted) {
            playerRef.current?.unMute();
            playerRef.current?.setVolume(100);
            setIsMuted(false);
        } else {
            playerRef.current?.mute();
            setIsMuted(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        const dur = playerRef.current?.getDuration?.() ?? 0;
        if (dur > 0) playerRef.current?.seekTo((val / 100) * dur, true);
        setProgress(val);
    };

    const handleSkip = (e: React.MouseEvent, seconds: number) => {
        e.stopPropagation();
        const current = playerRef.current?.getCurrentTime?.() ?? 0;
        playerRef.current?.seekTo(current + seconds, true);
    };

    const handleAddComment = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للتعليق'); return; }
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const comment = await addComment(reel.id, user.id, newComment);
            setComments(prev => [comment, ...prev]);
            setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
            setNewComment('');
        } catch { toast.error('فشل إرسال التعليق'); }
        finally { setIsSubmitting(false); }
    };

    // Show tap-to-start: player is ready, active, but video hasn't started
    const showTapToStart = playerReady && isActive && !hasStarted;

    return (
        <div
            className="relative w-full snap-start bg-black flex items-center justify-center overflow-hidden"
            style={{ height: '100%' }}
        >
            {/* YouTube player target */}
            <div
                id={divId}
                className="absolute inset-0 w-full h-full"
                style={{
                    transform: 'scale(1.6)',
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                }}
            />

            {/* Thumbnail placeholder */}
            {!playerReady && reel.thumbnail_url && (
                <img
                    src={reel.thumbnail_url}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 z-10"
                    alt=""
                />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none z-20" />

            {/* Full-screen tap layer */}
            <div
                className="absolute inset-0 z-30"
                onClick={handleTap}
                style={{ cursor: 'pointer' }}
            />

            {/* ── Tap-to-start overlay (iOS) ── */}
            {showTapToStart && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-40 gap-4 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)',
                    }}
                >
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(12px)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 0 40px rgba(255,255,255,0.1)',
                        }}
                    >
                        <Play className="text-white w-12 h-12 fill-white ml-1" />
                    </div>
                    <span
                        className="text-white text-base font-medium tracking-wide"
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '999px',
                            padding: '8px 20px',
                        }}
                    >
                        اضغط للتشغيل
                    </span>
                </div>
            )}

            {/* Pause indicator */}
            {hasStarted && isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <Play className="text-white w-10 h-10 fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Heart animation */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <Heart
                        className="text-white fill-white"
                        style={{
                            width: 96,
                            height: 96,
                            animation: 'heartPop 0.9s ease-out forwards',
                        }}
                    />
                </div>
            )}

            {/* ── Top-right controls ── */}
            <div className="absolute top-safe right-4 z-40 flex flex-col items-end gap-2" style={{ top: 16 }}>
                {/* Mute button */}
                <button
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
                    onClick={handleToggleMute}
                >
                    {isMuted
                        ? <VolumeX className="text-white w-5 h-5" />
                        : <Volume2 className="text-white w-5 h-5" />
                    }
                </button>

                {/* Hint: tap for sound */}
                {isMuted && hasStarted && isActive && (
                    <div
                        className="rounded-full px-3 py-1 pointer-events-none"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    >
                        <span className="text-white text-xs">اضغط للصوت</span>
                    </div>
                )}
            </div>

            {/* ── Action sidebar ── */}
            <div
                className="absolute right-3 z-40 flex flex-col gap-5"
                style={{ bottom: BOTTOM_NAV_HEIGHT + 80 }}
            >
                {/* Like */}
                <button
                    className="flex flex-col items-center gap-1"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90"
                        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                    >
                        <Heart
                            className={cn('w-6 h-6 transition-all', stats.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white fill-transparent')}
                        />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow">{stats.likes.toLocaleString()}</span>
                </button>

                {/* Comment */}
                <button
                    className="flex flex-col items-center gap-1"
                    onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); loadComments(); }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                    >
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow">{stats.comments.toLocaleString()}</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center gap-1">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                    >
                        <Share2 className="text-white w-5 h-5" />
                    </div>
                </button>
            </div>

            {/* ── Video info ── */}
            <div
                className="absolute left-3 z-40 pointer-events-none"
                style={{
                    right: 76,
                    bottom: BOTTOM_NAV_HEIGHT + (hasStarted ? 64 : 20),
                    transition: 'bottom 0.3s ease',
                }}
                dir="rtl"
            >
                <h3 className="text-white font-bold text-base mb-1 drop-shadow-lg">
                    @{reel.author || 'اتحاد الطلاب'}
                </h3>
                <p className="text-white/85 text-sm line-clamp-2 leading-relaxed drop-shadow">
                    {reel.title}
                </p>
            </div>

            {/* ── Progress bar + skip controls ── */}
            {/* Anchored ABOVE the BottomNav, always visible when video starts */}
            {hasStarted && (
                <div
                    className="absolute left-0 right-0 z-40 px-3"
                    style={{ bottom: BOTTOM_NAV_HEIGHT + 12 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-2">
                        {/* Skip back */}
                        <button
                            className="text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                                width: 38,
                                height: 38,
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                            onClick={(e) => handleSkip(e, -10)}
                        >
                            −10
                        </button>

                        {/* Progress track */}
                        <div className="relative flex-1" style={{ height: 36, display: 'flex', alignItems: 'center' }}>
                            {/* Track background */}
                            <div
                                className="absolute left-0 right-0 rounded-full overflow-hidden"
                                style={{ height: 4, background: 'rgba(255,255,255,0.25)' }}
                            >
                                {/* Filled portion */}
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${progress}%`,
                                        background: 'white',
                                        transition: 'width 0.25s linear',
                                    }}
                                />
                            </div>
                            {/* Invisible range input over track */}
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={0.1}
                                value={progress}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                style={{ height: '100%' }}
                            />
                        </div>

                        {/* Skip forward */}
                        <button
                            className="text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                                width: 38,
                                height: 38,
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                            onClick={(e) => handleSkip(e, 10)}
                        >
                            +10
                        </button>
                    </div>
                </div>
            )}

            {/* ── Comments Drawer ── */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
                    <Drawer.Content
                        className="flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none"
                        style={{
                            borderRadius: '20px 20px 0 0',
                            background: '#111',
                            height: '72vh',
                            maxHeight: '72vh',
                        }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }} dir="rtl">
                                <h2 className="text-white font-bold text-base">التعليقات ({stats.comments})</h2>
                                <button onClick={() => setIsCommentsOpen(false)}>
                                    <X className="text-white/50 w-5 h-5" />
                                </button>
                            </div>

                            {/* Comments list */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" dir="rtl">
                                {comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-white/40 text-sm gap-2">
                                        <MessageCircle className="w-8 h-8 opacity-30" />
                                        <span>لا توجد تعليقات بعد. كن أول من يعلق!</span>
                                    </div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                                                style={{ background: 'rgba(255,255,255,0.1)' }}>
                                                {comment.profiles?.avatar_url
                                                    ? <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center text-xs text-white/60 font-bold">
                                                        {comment.profiles?.full_name?.charAt(0) || '؟'}
                                                    </div>
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-white/80">{comment.profiles?.full_name || 'مستخدم'}</div>
                                                <div className="text-sm text-white/90 mt-0.5 leading-relaxed">{comment.content}</div>
                                                <div className="text-[10px] text-white/30 mt-1">
                                                    {new Date(comment.created_at).toLocaleDateString('ar')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input */}
                            <div
                                className="flex items-center gap-2 px-4 py-3 flex-shrink-0 border-t"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                                }}
                                dir="rtl"
                            >
                                <input
                                    type="text"
                                    placeholder="أضف تعليقاً..."
                                    className="flex-1 text-sm text-white placeholder-white/30 outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: 999,
                                        padding: '10px 16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity active:scale-90"
                                    style={{ background: '#8B1A2A' }}
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            <style>{`
                @keyframes heartPop {
                    0%   { transform: scale(0.5); opacity: 1; }
                    50%  { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────
// HomeReels
// ─────────────────────────────────────────────
const HomeReels = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadReels(); }, []);

    useEffect(() => {
        if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [isSearchOpen]);

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) { setSuggestions([]); setShowSuggestions(false); return; }
        const seen = new Set<string>();
        const results = reels.filter(r => {
            const key = `${r.title}-${r.author}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return (
                r.title?.toLowerCase().includes(q) ||
                r.author?.toLowerCase().includes(q)
            );
        }).slice(0, 6);
        setSuggestions(results);
        setShowSuggestions(true);
    }, [searchQuery, reels]);

    const loadReels = async () => {
        try {
            const { data } = await fetchReels({ pageSize: 50 });
            setReels((data || []).filter((r: any) => r.status === 'active'));
        } catch { toast.error('حدث خطأ في تحميل الريلز'); }
        finally { setLoading(false); }
    };

    // ── Scroll snapping: detect active index ──
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;
        const itemHeight = containerRef.current.clientHeight;
        const index = Math.round(scrollTop / itemHeight);
        if (index !== activeIndex) setActiveIndex(index);
    }, [activeIndex]);

    const navigateToReel = (reelId: string) => {
        const index = reels.findIndex(r => r.id === reelId);
        if (index === -1) return;
        setActiveIndex(index);
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: index * containerRef.current.clientHeight,
                behavior: 'smooth',
            });
        }
        closeSearch();
    };

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        const first = suggestions[0];
        if (first) navigateToReel(first.id);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query || !text) return <span>{text}</span>;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return <span>{text}</span>;
        return (
            <span>
                {text.slice(0, idx)}
                <span className="text-white font-bold">{text.slice(idx, idx + query.length)}</span>
                {text.slice(idx + query.length)}
            </span>
        );
    };

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div
                className="rounded-full border-t-2 border-white"
                style={{ width: 36, height: 36, animation: 'spin 0.8s linear infinite' }}
            />
        </div>
    );

    return (
        <>
            {/* Full-screen black canvas */}
            <div
                className="fixed inset-0 bg-black flex flex-col"
                style={{ zIndex: 0 }}
            >
                {/* ── Floating search bar (top, above videos) ── */}
                <div
                    className="absolute left-0 right-0 z-50"
                    style={{ top: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}
                >
                    <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                        {isSearchOpen ? (
                            <>
                                <div
                                    className="flex-1 flex items-center gap-2"
                                    style={{
                                        background: 'rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(16px)',
                                        borderRadius: 999,
                                        padding: '10px 16px',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                    }}
                                >
                                    <Search className="text-white/50 w-4 h-4 flex-shrink-0" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="ابحث عن فيديو أو مستخدم..."
                                        className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none text-right"
                                        dir="rtl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearchSubmit();
                                            if (e.key === 'Escape') closeSearch();
                                        }}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
                                            <X className="text-white/40 w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={closeSearch}
                                    className="text-white/70 text-sm whitespace-nowrap flex-shrink-0"
                                >
                                    إلغاء
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex justify-end">
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{
                                        background: 'rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                    }}
                                >
                                    <Search className="text-white w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    {isSearchOpen && showSuggestions && suggestions.length > 0 && (
                        <div
                            className="mx-4 overflow-hidden"
                            style={{
                                borderRadius: 16,
                                background: 'rgba(20,20,20,0.92)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            {suggestions.map((reel, i) => (
                                <button
                                    key={reel.id}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/5 transition-colors"
                                    style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
                                    onClick={() => navigateToReel(reel.id)}
                                >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        {reel.thumbnail_url
                                            ? <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center">
                                                <Search className="text-white/30 w-4 h-4" />
                                            </div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0" dir="rtl">
                                        <div className="text-white/90 text-sm truncate">
                                            {highlightMatch(reel.title || '', searchQuery)}
                                        </div>
                                        <div className="text-white/40 text-xs mt-0.5">
                                            @{highlightMatch(reel.author || 'اتحاد الطلاب', searchQuery)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {reels.filter(r =>
                                r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.author?.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length > 6 && (
                                    <button
                                        className="w-full py-3 text-center text-white/40 text-xs active:bg-white/5"
                                        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                                        onClick={handleSearchSubmit}
                                    >
                                        عرض جميع النتائج
                                    </button>
                                )}
                        </div>
                    )}

                    {/* No results */}
                    {isSearchOpen && searchQuery.trim() && suggestions.length === 0 && (
                        <div
                            className="mx-4 py-6 text-center"
                            style={{
                                borderRadius: 16,
                                background: 'rgba(20,20,20,0.92)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <p className="text-white/40 text-sm">لا توجد نتائج لـ "{searchQuery}"</p>
                        </div>
                    )}
                </div>

                {/* ── Scroll container ── */}
                {/* Uses clientHeight for each snap item, so progress bar math is accurate */}
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="absolute inset-0"
                    style={{
                        overflowY: 'scroll',
                        scrollSnapType: 'y mandatory',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        // leave room for bottom nav
                        paddingBottom: BOTTOM_NAV_HEIGHT,
                    }}
                >
                    {reels.map((reel, index) => (
                        <div
                            key={reel.id}
                            style={{
                                height: `calc(100dvh - ${BOTTOM_NAV_HEIGHT}px)`,
                                scrollSnapAlign: 'start',
                                scrollSnapStop: 'always',
                                flexShrink: 0,
                            }}
                        >
                            <ReelVideo reel={reel} isActive={index === activeIndex} />
                        </div>
                    ))}
                </div>

                {/* ── Bottom Nav pinned at bottom ── */}
                <div
                    className="absolute left-0 right-0 bottom-0 z-50"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    }}
                >
                    <BottomNav />
                </div>
            </div>

            <style>{`
                div::-webkit-scrollbar { display: none; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default HomeReels;