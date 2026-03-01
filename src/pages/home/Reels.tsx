import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Send, Volume2, VolumeX, Play, Search, X } from 'lucide-react';
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
// YouTube IFrame API — loaded ONCE globally
// ─────────────────────────────────────────────
const ytReadyCallbacks: (() => void)[] = [];
let ytApiState: 'idle' | 'loading' | 'ready' = 'idle';
let iosUnlocked = false;

const markIosUnlocked = () => {
    if (iosUnlocked) return;
    iosUnlocked = true;
    // Dispatch event to notify all players
    window.dispatchEvent(new Event('ios-unlocked'));
};

let globalMuted = true; // tracks user's mute preference across videos

const loadYouTubeAPI = (onReady: () => void) => {
    if (ytApiState === 'ready') { onReady(); return; }
    ytReadyCallbacks.push(onReady);
    if (ytApiState === 'loading') return;
    ytApiState = 'loading';
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api ';
    tag.async = true;
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
const ReelVideo = ({
    reel,
    isActive,
    onFirstInteraction
}: {
    reel: any;
    isActive: boolean;
    onFirstInteraction: () => void;
}) => {
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
    const [hasStarted, setHasStarted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<any>(null);
    const lastTap = useRef(0);
    const tapTimeout = useRef<any>(null);
    const divId = useMemo(() => `yt-${reel.id}`, [reel.id]);
    const videoId = useMemo(() => getVideoId(reel.video_url), [reel.video_url]);
    const isActiveRef = useRef(isActive);
    const hasInteracted = useRef(false);

    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

    // ── Init YT player ──
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
                    enablejsapi: 1,
                },
                events: {
                    onReady: (event: any) => {
                        if (destroyed) return;
                        setPlayerReady(true);
                        // If already active when ready, try to play
                        if (isActiveRef.current) {
                            tryPlay();
                        }
                    },
                    onStateChange: (e: any) => {
                        if (destroyed) return;
                        const S = (window as any).YT?.PlayerState;
                        if (!S) return;

                        if (e.data === S.PLAYING) {
                            setIsPaused(false);
                            setIsBuffering(false);
                            setHasStarted(true);
                            startProgress();
                        } else if (e.data === S.PAUSED) {
                            setIsPaused(true);
                            stopProgress();
                        } else if (e.data === S.BUFFERING) {
                            setIsBuffering(true);
                        } else if (e.data === S.ENDED) {
                            playerRef.current?.seekTo(0, true);
                            playerRef.current?.playVideo();
                        }
                    },
                    onError: (e: any) => {
                        console.error('YT error', e.data);
                    },
                },
            });
        });

        return () => {
            destroyed = true;
            stopProgress();
            clearTimeout(tapTimeout.current);
            try { playerRef.current?.destroy(); } catch (_) { }
            playerRef.current = null;
        };
    }, [reel.id, videoId, divId]);

    // ── Handle active state changes ──
    useEffect(() => {
        if (!playerReady) return;

        if (isActive) {
            loadStats();
            incrementViewCount(reel.id);
            tryPlay();
        } else {
            try {
                playerRef.current?.pauseVideo();
                playerRef.current?.mute();
            } catch (e) { }
            stopProgress();
            setProgress(0);
            setIsPaused(false);
            setHasStarted(false);
            setIsMuted(true);
        }
    }, [isActive, playerReady, reel.id]);

    // ── Listen for iOS unlock ──
    useEffect(() => {
        const handleUnlock = () => {
            if (isActiveRef.current && playerRef.current) {
                try {
                    if (!globalMuted) {
                        playerRef.current.unMute();
                        playerRef.current.setVolume(100);
                        setIsMuted(false);
                    }
                    playerRef.current.playVideo();
                } catch (e) { }
            }
        };
        window.addEventListener('ios-unlocked', handleUnlock);
        return () => window.removeEventListener('ios-unlocked', handleUnlock);
    }, []);

    const tryPlay = () => {
        if (!playerRef.current) return;
        try {
            if (globalMuted) {
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
                playerRef.current.setVolume(100);
            }
            playerRef.current.playVideo();
            setIsMuted(globalMuted);
        } catch (e) {
            console.error('Play failed:', e);
        }
    };

    const startProgress = () => {
        stopProgress();
        progressInterval.current = setInterval(() => {
            try {
                const cur = playerRef.current?.getCurrentTime?.() ?? 0;
                const dur = playerRef.current?.getDuration?.() ?? 1;
                if (dur > 0) setProgress((cur / dur) * 100);
            } catch (e) { stopProgress(); }
        }, 200);
    };

    const stopProgress = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
    };

    const loadStats = async () => {
        if (!user?.id) {
            try { setStats(await fetchReelStats(reel.id, undefined)); } catch (_) { }
            return;
        }
        try { setStats(await fetchReelStats(reel.id, user.id)); } catch (_) { }
    };

    const loadComments = async () => {
        try { setComments(await fetchComments(reel.id)); } catch (_) { }
    };

    const handleToggleLike = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للإعجاب'); return; }
        try {
            const { liked } = await toggleLike(reel.id, user.id);
            setStats(p => ({
                ...p,
                likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1),
                isLiked: liked
            }));
        } catch { toast.error('فشل تحديث الإعجاب'); }
    };

    const handleInteraction = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!iosUnlocked) {
            markIosUnlocked();
            onFirstInteraction();
        }

        if (!hasStarted) {
            // First tap on this video — unmute and play
            try {
                playerRef.current?.unMute();
                playerRef.current?.setVolume(100);
                playerRef.current?.playVideo();
                setIsMuted(false);
                globalMuted = false; // remember user wants sound
            } catch (e) { }
            return;
        }

        // Double tap detection
        const now = Date.now();
        if (now - lastTap.current < 300) {
            clearTimeout(tapTimeout.current);
            lastTap.current = 0;
            if (!stats.isLiked) handleToggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
            return;
        }

        lastTap.current = now;
        clearTimeout(tapTimeout.current);

        // Single tap — toggle pause only (mute handled by mute button)
        // Single tap — unmute first, then pause/resume
        tapTimeout.current = setTimeout(() => {
            try {
                if (isMuted) {
                    playerRef.current?.unMute();
                    playerRef.current?.setVolume(100);
                    setIsMuted(false);
                    globalMuted = false;
                } else {
                    if (isPaused) {
                        playerRef.current?.playVideo();
                    } else {
                        playerRef.current?.pauseVideo();
                    }
                }
            } catch (e) { }
        }, 300);
    }, [hasStarted, isPaused, stats.isLiked, handleToggleLike, onFirstInteraction]);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!iosUnlocked) markIosUnlocked();

        try {
            if (isMuted) {
                playerRef.current?.unMute();
                playerRef.current?.setVolume(100);
                setIsMuted(false);
            } else {
                playerRef.current?.mute();
                setIsMuted(true);
            }
        } catch (e) { }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        try {
            const dur = playerRef.current?.getDuration?.() ?? 0;
            if (dur > 0) {
                playerRef.current?.seekTo((val / 100) * dur, true);
                setProgress(val);
            }
        } catch (e) { }
    };

    const skip = (e: React.MouseEvent, s: number) => {
        e.stopPropagation();
        try {
            const cur = playerRef.current?.getCurrentTime?.() ?? 0;
            const dur = playerRef.current?.getDuration?.() ?? 0;
            const newTime = Math.max(0, Math.min(dur, cur + s));
            playerRef.current?.seekTo(newTime, true);
        } catch (e) { }
    };

    const handleAddComment = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للتعليق'); return; }
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const c = await addComment(reel.id, user.id, newComment);
            setComments(p => [c, ...p]);
            setStats(p => ({ ...p, comments: p.comments + 1 }));
            setNewComment('');
        } catch { toast.error('فشل إرسال التعليق'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
            {/* YouTube iframe */}
            <div
                id={divId}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    transform: 'scale(1.35)',
                    transformOrigin: 'center',
                }}
            />

            {/* Thumbnail while loading */}
            {!playerReady && reel.thumbnail_url && (
                <img
                    src={reel.thumbnail_url}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    alt=""
                />
            )}

            {/* Buffering */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 pointer-events-none z-20"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.9) 100%)'
                }}
            />

            {/* Touch/Click area - CRITICAL: must be pointer-events-auto to capture touches */}
            <div
                className="absolute inset-0 z-30 cursor-pointer"
                onClick={handleInteraction}
            />

            {/* Tap to start overlay */}
            {/* {!hasStarted && playerReady && (
                <div
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)'
                    }}
                >
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(12px)',
                            border: '2px solid rgba(255,255,255,0.4)'
                        }}
                    >
                        <Play className="text-white w-10 h-10 fill-white ml-1" />
                    </div>
                    <span
                        className="text-white text-sm font-medium px-5 py-2 rounded-full"
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(6px)'
                        }}
                    >
                        اضغط للتشغيل
                    </span>
                </div>
            )} */}
            {/* Unmute hint — shows when playing but muted */}
            {hasStarted && isMuted && !isPaused && (
                <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-40">
                    <div
                        className="flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                    >
                        <VolumeX className="text-white w-4 h-4" />
                        <span className="text-white text-sm font-medium">اضغط لتشغيل الصوت</span>
                    </div>
                </div>
            )}
            {/* Pause indicator */}
            {hasStarted && isPaused && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <Play className="text-white w-8 h-8 fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Heart animation */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <Heart
                        className="text-white fill-white"
                        style={{
                            width: 88,
                            height: 88,
                            animation: 'heartPop 0.8s ease-out forwards'
                        }}
                    />
                </div>
            )}

            {/* Mute button */}
            <button
                className="absolute z-40 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{
                    top: 14,
                    right: 14,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}
                onClick={toggleMute}
            >
                {isMuted ? <VolumeX className="text-white w-5 h-5" /> : <Volume2 className="text-white w-5 h-5" />}
            </button>

            {/* Action sidebar */}
            <div
                className="absolute right-3 z-40 flex flex-col items-center gap-5"
                style={{ bottom: 140 }}
            >
                <button
                    className="flex flex-col items-center gap-1"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <Heart className={cn(
                            'w-6 h-6 transition-all',
                            stats.isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                        )} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">
                        {stats.likes.toLocaleString()}
                    </span>
                </button>

                <button
                    className="flex flex-col items-center gap-1"
                    onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); loadComments(); }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">
                        {stats.comments.toLocaleString()}
                    </span>
                </button>
            </div>

            {/* Bottom info */}
            <div
                className="absolute left-0 right-0 z-40 px-4"
                style={{ bottom: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {hasStarted && (
                    <div dir="ltr" className="flex items-center gap-2 mb-3">
                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0 w-9 h-9 active:scale-90 transition-transform"
                            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
                            onClick={(e) => skip(e, -10)}
                        >
                            −10
                        </button>

                        <div className="relative flex-1 h-7 flex items-center">
                            <div
                                className="absolute left-0 right-0 h-1 rounded-full overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.3)' }}
                            >
                                <div
                                    className="h-full bg-white rounded-full"
                                    style={{ width: `${progress}%`, transition: 'width 0.2s linear' }}
                                />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={0.5}
                                value={progress}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0 w-9 h-9 active:scale-90 transition-transform"
                            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
                            onClick={(e) => skip(e, 10)}
                        >
                            +10
                        </button>

                    </div>
                )}

                <div className="pointer-events-none" style={{ paddingLeft: 60 }}>
                    <p dir="rtl" className="text-white font-bold text-sm mb-0.5 drop-shadow-md">
                        @{reel.author || 'اتحاد الطلاب'}
                    </p>
                    <p dir="rtl" className="text-white/90 text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                        {reel.title}
                    </p>
                </div>
            </div>

            {/* Comments Drawer */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" />
                    <Drawer.Content
                        className="flex flex-col fixed bottom-0 left-0 right-0 z-[101]"
                        style={{
                            borderRadius: '24px 24px 0 0',
                            background: '#111',
                            height: '70vh'
                        }}
                    >
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1.5 rounded-full bg-white/30" />
                        </div>
                        <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10" dir="rtl">
                            <h2 className="text-white font-bold text-base">
                                التعليقات ({stats.comments})
                            </h2>
                            <button onClick={() => setIsCommentsOpen(false)}>
                                <X className="text-white/50 w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" dir="rtl">
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-white/40 text-sm gap-2">
                                    <MessageCircle className="w-10 h-10 opacity-30" />
                                    <span>كن أول من يعلق!</span>
                                </div>
                            ) : comments.map((c) => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                                        {c.profiles?.avatar_url ? (
                                            <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-white/60 font-bold">
                                                {c.profiles?.full_name?.charAt(0) || '؟'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white/80">{c.profiles?.full_name || 'مستخدم'}</div>
                                        <div className="text-sm text-white/90 mt-0.5 leading-relaxed">{c.content}</div>
                                        <div className="text-[10px] text-white/40 mt-1">
                                            {new Date(c.created_at).toLocaleDateString('ar')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10" dir="rtl">
                            <input
                                type="text"
                                placeholder="أضف تعليقاً..."
                                className="flex-1 text-sm text-white placeholder-white/40 outline-none px-4 py-3 rounded-full"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.15)'
                                }}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all"
                                style={{ background: '#8B1A2A' }}
                            >
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            <style>{`
                @keyframes heartPop {
                    0% { transform: scale(0.5); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────
// HomeReels — Fixed scrolling
// ─────────────────────────────────────────────
const HomeReels = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [navHeight, setNavHeight] = useState(64);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Measure nav height
    useEffect(() => {
        if (!navRef.current) return;
        const updateHeight = () => {
            const h = navRef.current?.getBoundingClientRect().height ?? 64;
            setNavHeight(h);
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Load reels
    useEffect(() => { loadReels(); }, []);

    const loadReels = async () => {
        try {
            const { data } = await fetchReels({ pageSize: 50 });
            setReels((data || []).filter((r: any) => r.status === 'active'));
        } catch {
            toast.error('حدث خطأ في تحميل الريلز');
        } finally {
            setLoading(false);
        }
    };

    // ── SCROLL HANDLER — Fixed ──
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const height = container.clientHeight;

        // Calculate which video is in center view
        const index = Math.round(scrollTop / height);
        const clampedIndex = Math.max(0, Math.min(reels.length - 1, index));

        if (clampedIndex !== activeIndex) {
            setActiveIndex(clampedIndex);
        }
    }, [activeIndex, reels.length]);

    // ── SCROLL TO SPECIFIC REEL ──
    const scrollToIndex = useCallback((index: number) => {
        const container = containerRef.current;
        if (!container) return;

        const height = container.clientHeight;
        container.scrollTo({
            top: index * height,
            behavior: 'smooth'
        });
    }, []);

    // Search focus
    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    // Search suggestions
    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) { setSuggestions([]); return; }
        const seen = new Set<string>();
        setSuggestions(reels.filter((r) => {
            const k = `${r.title}-${r.author}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return r.title?.toLowerCase().includes(q) || r.author?.toLowerCase().includes(q);
        }).slice(0, 6));
    }, [searchQuery, reels]);

    const navigateToReel = (id: string) => {
        const idx = reels.findIndex((r) => r.id === id);
        if (idx === -1) return;

        setActiveIndex(idx);
        scrollToIndex(idx);
        closeSearch();
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSuggestions([]);
    };

    const highlight = (text: string, q: string) => {
        if (!q || !text) return <span>{text}</span>;
        const i = text.toLowerCase().indexOf(q.toLowerCase());
        if (i === -1) return <span>{text}</span>;
        return (
            <span>
                {text.slice(0, i)}
                <span className="text-white font-bold bg-white/20 rounded px-0.5">
                    {text.slice(i, i + q.length)}
                </span>
                {text.slice(i + q.length)}
            </span>
        );
    };

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            {/* Scroll container — CRITICAL FIXES HERE */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto snap-y snap-mandatory"
                style={{
                    scrollSnapType: 'y mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        ref={(el) => { itemRefs.current[index] = el; }}
                        className="w-full snap-start snap-always"
                        style={{
                            height: `calc(100vh - ${navHeight}px)`,
                            minHeight: `calc(100vh - ${navHeight}px)`,
                        }}
                    >
                        <ReelVideo
                            reel={reel}
                            isActive={index === activeIndex}
                            onFirstInteraction={() => {
                                // Ensure scroll works after first interaction
                                if (containerRef.current) {
                                    containerRef.current.style.overflow = 'auto';
                                }
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* BottomNav */}
            <div
                ref={navRef}
                className="flex-shrink-0 relative z-50"
                style={{ background: 'linear-gradient(to top, #000 70%, transparent)' }}
            >
                <BottomNav />
            </div>

            {/* Search */}
            <div className="absolute top-0 left-0 right-0 z-50 pt-safe-top">
                <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    {isSearchOpen ? (
                        <>
                            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/20">
                                <Search className="text-white/60 w-4 h-4" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="ابحث..."
                                    className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none text-right"
                                    dir="rtl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') navigateToReel(suggestions[0]?.id);
                                        if (e.key === 'Escape') closeSearch();
                                    }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
                                        <X className="text-white/50 w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button onClick={closeSearch} className="text-white text-sm px-2">
                                إلغاء
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-xl border border-white/20 active:scale-90 transition-transform"
                            >
                                <Search className="text-white w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isSearchOpen && suggestions.length > 0 && (
                    <div className="mx-4 mt-1 rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 overflow-hidden">
                        {suggestions.map((r, i) => (
                            <button
                                key={r.id}
                                className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                onClick={() => navigateToReel(r.id)}
                            >
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                    {r.thumbnail_url ? (
                                        <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Search className="text-white/30 w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm truncate">{highlight(r.title, searchQuery)}</div>
                                    <div className="text-white/50 text-xs">@{highlight(r.author, searchQuery)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                * { -webkit-tap-highlight-color: transparent; }
                ::-webkit-scrollbar { display: none; }
                .snap-y { scroll-snap-type: y mandatory; }
                .snap-start { scroll-snap-align: start; }
                .snap-always { scroll-snap-stop: always; }
                .pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
            `}</style>
        </div>
    );
};

export default HomeReels;