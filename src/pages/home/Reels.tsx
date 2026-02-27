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

// iOS requires a user gesture before any video can play.
// Once the user taps once anywhere, we flip this and all
// subsequent videos auto-start without needing another tap.
let iosUnlocked = false;
const iosUnlockCallbacks: (() => void)[] = [];
const markIosUnlocked = () => {
    if (iosUnlocked) return;
    iosUnlocked = true;
    iosUnlockCallbacks.forEach(cb => cb());
    iosUnlockCallbacks.length = 0;
};
const whenIosUnlocked = (cb: () => void) => {
    if (iosUnlocked) { cb(); return; }
    iosUnlockCallbacks.push(cb);
};

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
            loadStats();
            incrementViewCount(reel.id);
            setAutoplayAttempted(true);

            if (iosUnlocked) {
                // Already unlocked — play immediately
                playerRef.current?.playVideo();
            } else {
                // Try anyway (desktop/Android). On iOS silently fails.
                // Register so we auto-play the moment user first taps.
                playerRef.current?.playVideo();
                whenIosUnlocked(() => {
                    if (playerRef.current) playerRef.current.playVideo();
                });
            }
        } else {
            playerRef.current?.pauseVideo();
            stopProgressTracking();
            setProgress(0);
            setHasStarted(false);
            setAutoplayAttempted(false);
            setIsMuted(true);
        }
    }, [isActive, playerReady]);

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
    // First tap: unlocks iOS audio/video policy + starts video
    // Double tap: like
    // Single tap (running): unmute first, then toggle pause
    const handleTap = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const now = Date.now();

        // ── iOS first-start: video not playing yet ──
        if (!hasStarted) {
            markIosUnlocked();           // unlock all future auto-plays globally
            playerRef.current?.playVideo();
            setHasStarted(true);         // optimistic; confirmed by onStateChange
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
            playerRef.current?.unMute();
            playerRef.current?.setVolume(100);
            setIsMuted(false);
            if (isPaused) playerRef.current?.playVideo();
        } else {
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
        if (dur > 0) playerRef.current?.seekTo((val / 100) * dur);
    };

    const handleSkip = (e: React.MouseEvent, seconds: number) => {
        e.stopPropagation();
        const current = playerRef.current?.getCurrentTime?.() ?? 0;
        playerRef.current?.seekTo(current + seconds);
    };

    const handleAddComment = async () => {
        if (!user || !newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await addComment(reel.id, user.id, newComment);
            setNewComment('');
            await loadComments();
            setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        } catch { toast.error('فشل في إضافة التعليق'); }
        finally { setIsSubmitting(false); }
    };

    const handleOpenComments = () => {
        loadComments();
        setIsCommentsOpen(true);
    };

    // ── Main container: flex column, full height, constrained ──
    return (
        <div
            onClick={handleTap}
            className="relative w-full h-full bg-black flex flex-col"
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* ── YouTube player: flex-1 to fill available space ── */}
            <div
                className="relative flex-1 w-full overflow-hidden bg-black"
                style={{
                    flex: 1,
                    minHeight: 0, // Important: allows flex to shrink below content size
                }}
            >
                <div
                    id={divId}
                    className="w-full h-full"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />

                {/* ── Heart animation on double tap ── */}
                {showHeart && (
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                            animation: 'heartPop 0.9s ease-out forwards',
                        }}
                    >
                        <Heart
                            className="text-white drop-shadow-lg"
                            size={80}
                            fill="white"
                        />
                    </div>
                )}
            </div>

            {/* ── Bottom overlay: controls + info (fixed height, no flex) ── */}
            <div
                className="relative w-full bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"
                style={{
                    paddingTop: 60,
                    paddingBottom: 16,
                    paddingLeft: 16,
                    paddingRight: 16,
                }}
            >
                {/* ── Mute button + progress bar + skip button ── */}
                {!isPaused && (
                    <div className="flex items-center gap-3 mb-4 pointer-events-auto">
                        {/* Mute button */}
                        <button
                            className="text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                                width: 36,
                                height: 36,
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                            onClick={handleToggleMute}
                        >
                            {isMuted ? (
                                <VolumeX size={18} />
                            ) : (
                                <Volume2 size={18} />
                            )}
                        </button>

                        {/* Progress bar */}
                        <div
                            className="flex-1 relative h-1 rounded-full overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                            }}
                        >
                            <div
                                className="h-full bg-white transition-all"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
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
                                width: 36,
                                height: 36,
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                            onClick={(e) => handleSkip(e, 10)}
                        >
                            +10
                        </button>
                    </div>
                )}

                {/* ── Video info: author + title ── */}
                <div className="pointer-events-none" dir="rtl">
                    <h3 className="text-white font-bold text-base mb-0.5 drop-shadow-lg">
                        @{reel.author || 'اتحاد الطلاب'}
                    </h3>
                    <p className="text-white/85 text-sm line-clamp-2 leading-relaxed drop-shadow" style={{ paddingLeft: 56 }}>
                        {reel.title}
                    </p>
                </div>

                {/* ── Right sidebar: like, comment, share icons ── */}
                <div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 pointer-events-auto"
                    style={{
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                >
                    {/* Like button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLike();
                        }}
                        className="flex flex-col items-center gap-1 transition-transform active:scale-75"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: stats.isLiked ? '#8B1A2A' : 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Heart
                                size={24}
                                className="text-white"
                                fill={stats.isLiked ? 'white' : 'none'}
                            />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow">{stats.likes}</span>
                    </button>

                    {/* Comment button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenComments();
                        }}
                        className="flex flex-col items-center gap-1 transition-transform active:scale-75"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <MessageCircle size={24} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow">{stats.comments}</span>
                    </button>

                    {/* Share button */}
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center gap-1 transition-transform active:scale-75"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Share2 size={24} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow">شارك</span>
                    </button>

                    {/* Music icon */}
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center gap-1 transition-transform active:scale-75"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Music2 size={24} className="text-white" />
                        </div>
                    </button>
                </div>
            </div>

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
    const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    // ── Intersection Observer for auto-play on scroll ──
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = reelRefs.current.indexOf(entry.target as HTMLDivElement);
                        if (index !== -1 && index !== activeIndex) {
                            setActiveIndex(index);
                        }
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of the reel is visible
                root: containerRef.current,
            }
        );

        reelRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            reelRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [reels, activeIndex]);

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
                            ref={(el) => {
                                reelRefs.current[index] = el;
                            }}
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
