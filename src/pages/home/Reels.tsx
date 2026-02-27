import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Send, Volume2, VolumeX, Play, Search, X } from 'lucide-react';
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

// iOS requires user gesture before audio/video can play
// We track this globally across all reels
let iosUnlocked = false;
const pendingPlayers: Set<() => void> = new Set();

const markIosUnlocked = () => {
    if (iosUnlocked) return;
    iosUnlocked = true;
    pendingPlayers.forEach(fn => {
        try { fn(); } catch (e) { console.error('Player unlock error:', e); }
    });
    pendingPlayers.clear();
};

const playWhenUnlocked = (playFn: () => void, playerId: string) => {
    // Create a wrapped function that includes cleanup
    const wrappedFn = () => {
        try { playFn(); } catch (e) { console.error('Play error:', e); }
    };

    if (iosUnlocked) {
        wrappedFn();
    } else {
        pendingPlayers.add(wrappedFn);
        // Auto-cleanup after 10s to prevent memory leaks
        setTimeout(() => pendingPlayers.delete(wrappedFn), 10000);
    }
};

const loadYouTubeAPI = (onReady: () => void) => {
    if (ytApiState === 'ready') { onReady(); return; }
    ytReadyCallbacks.push(onReady);
    if (ytApiState === 'loading') return;
    ytApiState = 'loading';
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
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
    onIosUnlock
}: {
    reel: any;
    isActive: boolean;
    onIosUnlock: () => void;
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
    const progressInterval = useRef<any>(null);
    const lastTap = useRef(0);
    const tapTimeout = useRef<any>(null);
    const divId = useMemo(() => `yt-${reel.id}-${Math.random().toString(36).substr(2, 9)}`, [reel.id]);
    const videoId = useMemo(() => getVideoId(reel.video_url), [reel.video_url]);
    const isActiveRef = useRef(isActive);
    const playerReadyRef = useRef(playerReady);

    // Keep refs in sync
    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
    useEffect(() => { playerReadyRef.current = playerReady; }, [playerReady]);

    // ── Init YT player ──
    useEffect(() => {
        let destroyed = false;
        let initTimeout: any;

        loadYouTubeAPI(() => {
            if (destroyed || playerRef.current) return;

            // Small delay to prevent initialization race conditions
            initTimeout = setTimeout(() => {
                if (destroyed) return;

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
                        onReady: () => {
                            if (!destroyed) {
                                setPlayerReady(true);
                                // Preload video for instant playback
                                playerRef.current?.cueVideoById?.(videoId);
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
                            console.error('YT error', e.data, 'Video ID:', videoId);
                            // Auto-retry on error
                            if (isActiveRef.current) {
                                setTimeout(() => {
                                    if (playerRef.current && isActiveRef.current) {
                                        playerRef.current.loadVideoById(videoId);
                                    }
                                }, 1000);
                            }
                        },
                    },
                });
            }, 100);
        });

        return () => {
            destroyed = true;
            clearTimeout(initTimeout);
            stopProgress();
            clearTimeout(tapTimeout.current);
            try {
                if (playerRef.current?.destroy) {
                    playerRef.current.destroy();
                }
            } catch (_) { }
            playerRef.current = null;
            setPlayerReady(false);
            setHasStarted(false);
        };
    }, [reel.id, videoId]);

    // ── Activate / deactivate with improved timing ──
    useEffect(() => {
        if (!playerReady) return;

        const handleActivation = () => {
            if (isActive) {
                loadStats();
                incrementViewCount(reel.id);

                // Always try to play immediately (works on Android/Desktop)
                try {
                    playerRef.current?.playVideo();
                } catch (e) { console.error('Immediate play failed:', e); }

                // Also queue for iOS unlock
                playWhenUnlocked(() => {
                    if (playerRef.current && isActiveRef.current) {
                        playerRef.current.playVideo();
                        // Ensure muted state is correct for autoplay policies
                        if (isMuted) playerRef.current.mute();
                    }
                }, divId);
            } else {
                try {
                    playerRef.current?.pauseVideo();
                    playerRef.current?.mute(); // Reset to muted for next play
                } catch (e) { }
                stopProgress();
                setProgress(0);
                setHasStarted(false);
                setIsMuted(true);
                setIsPaused(false);
            }
        };

        handleActivation();
    }, [isActive, playerReady, reel.id, divId, isMuted]);

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

    const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        const now = Date.now();

        // First interaction unlocks iOS globally
        if (!iosUnlocked) {
            markIosUnlocked();
            onIosUnlock();
        }

        // First tap on this specific video
        if (!hasStarted) {
            try {
                playerRef.current?.playVideo();
                playerRef.current?.unMute();
                playerRef.current?.setVolume(100);
                setIsMuted(false);
                setHasStarted(true);
            } catch (e) { console.error('Start play error:', e); }
            return;
        }

        // Double tap detection (300ms window)
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

        // Single tap logic
        if (isMuted) {
            // Unmute and continue playing
            try {
                playerRef.current?.unMute();
                playerRef.current?.setVolume(100);
                setIsMuted(false);
                if (isPaused) playerRef.current?.playVideo();
            } catch (e) { }
        } else {
            // Toggle play/pause with delay to distinguish from double-tap
            tapTimeout.current = setTimeout(() => {
                try {
                    if (isPaused) {
                        playerRef.current?.playVideo();
                    } else {
                        playerRef.current?.pauseVideo();
                    }
                } catch (e) { }
            }, 300);
        }
    }, [hasStarted, isMuted, isPaused, stats.isLiked, handleToggleLike, onIosUnlock]);

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
        <div className="relative w-full h-full bg-black overflow-hidden touch-none">
            {/* YouTube iframe with aggressive scaling to remove letterbox */}
            <div
                id={divId}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    transform: 'scale(1.35)',
                    transformOrigin: 'center',
                    // Ensure video fills container on all aspect ratios
                    minWidth: '100%',
                    minHeight: '100%'
                }}
            />

            {/* Thumbnail while loading */}
            {!playerReady && reel.thumbnail_url && (
                <img
                    src={reel.thumbnail_url}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    alt=""
                    loading="eager"
                />
            )}

            {/* Buffering indicator */}
            {isBuffering && hasStarted && (
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

            {/* Full-area tap layer - supports both mouse and touch */}
            <div
                className="absolute inset-0 z-30 touch-manipulation"
                onClick={handleTap}
                onTouchStart={(e) => {
                    // Prevent default to stop zoom/scroll conflicts
                    if (e.touches.length === 1) handleTap(e);
                }}
            />

            {/* Tap-to-start overlay (iOS) */}
            {playerReady && isActive && !hasStarted && !isBuffering && (
                <div
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 pointer-events-none animate-fade-in"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)'
                    }}
                >
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-slow"
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(12px)',
                            border: '2px solid rgba(255,255,255,0.4)'
                        }}
                    >
                        <Play className="text-white w-10 h-10 fill-white ml-1" />
                    </div>
                    <span
                        className="text-white text-sm font-medium"
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(6px)',
                            borderRadius: 999,
                            padding: '8px 20px'
                        }}
                    >
                        اضغط للتشغيل
                    </span>
                </div>
            )}

            {/* Pause indicator */}
            {hasStarted && isPaused && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-fade-in">
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
                    top: 'max(14px, env(safe-area-inset-top))',
                    right: 14,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                    <VolumeX className="text-white w-5 h-5" />
                ) : (
                    <Volume2 className="text-white w-5 h-5" />
                )}
            </button>

            {/* Action sidebar */}
            <div
                className="absolute right-3 z-40 flex flex-col items-center gap-5"
                style={{ bottom: 'calc(155px + env(safe-area-inset-bottom, 0px))' }}
            >
                <button
                    className="flex flex-col items-center gap-1 group"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                    aria-label="Like"
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform group-active:bg-white/20"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <Heart className={cn(
                            'w-6 h-6 transition-all duration-200',
                            stats.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white fill-transparent'
                        )} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">
                        {stats.likes.toLocaleString()}
                    </span>
                </button>

                <button
                    className="flex flex-col items-center gap-1"
                    onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); loadComments(); }}
                    aria-label="Comments"
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

            {/* Bottom info block */}
            <div
                className="absolute left-0 right-0 z-40 px-4"
                style={{
                    bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress bar */}
                {hasStarted && (
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0 active:scale-90 transition-transform"
                            style={{
                                width: 34,
                                height: 34,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(6px)'
                            }}
                            onClick={(e) => skip(e, 10)}
                            aria-label="Skip forward 10s"
                        >
                            +10
                        </button>

                        <div className="relative flex-1 flex items-center" style={{ height: 28 }}>
                            <div
                                className="absolute left-0 right-0 rounded-full overflow-hidden"
                                style={{ height: 4, background: 'rgba(255,255,255,0.3)' }}
                            >
                                <div
                                    className="h-full rounded-full bg-white shadow-sm"
                                    style={{
                                        width: `${progress}%`,
                                        transition: progress > 0 ? 'width 0.2s linear' : 'none'
                                    }}
                                />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={0.5}
                                value={progress}
                                onChange={handleSeek}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-manipulation"
                                aria-label="Video progress"
                            />
                        </div>

                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0 active:scale-90 transition-transform"
                            style={{
                                width: 34,
                                height: 34,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(6px)'
                            }}
                            onClick={(e) => skip(e, -10)}
                            aria-label="Skip back 10s"
                        >
                            −10
                        </button>
                    </div>
                )}

                {/* Author + title */}
                <div dir="rtl" className="pointer-events-none" style={{ paddingLeft: 60 }}>
                    <p className="text-white font-bold text-sm mb-0.5 drop-shadow-md">
                        @{reel.author || 'اتحاد الطلاب'}
                    </p>
                    <p className="text-white/90 text-xs line-clamp-2 leading-relaxed drop-shadow-md">
                        {reel.title}
                    </p>
                </div>
            </div>

            {/* Comments Drawer */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                    <Drawer.Content
                        className="flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none"
                        style={{
                            borderRadius: '24px 24px 0 0',
                            background: '#111',
                            height: '75vh',
                            maxHeight: '600px'
                        }}
                    >
                        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                            <div className="w-12 h-1.5 rounded-full bg-white/30" />
                        </div>
                        <div
                            className="flex items-center justify-between px-4 pb-3 flex-shrink-0 border-b border-white/10"
                            dir="rtl"
                        >
                            <h2 className="text-white font-bold text-base">
                                التعليقات ({stats.comments})
                            </h2>
                            <button
                                onClick={() => setIsCommentsOpen(false)}
                                className="p-2 -m-2 active:opacity-50 transition-opacity"
                            >
                                <X className="text-white/50 w-5 h-5" />
                            </button>
                        </div>
                        <div
                            className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain"
                            dir="rtl"
                        >
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-white/40 text-sm gap-2">
                                    <MessageCircle className="w-10 h-10 opacity-30" />
                                    <span>كن أول من يعلق!</span>
                                </div>
                            ) : comments.map((c) => (
                                <div key={c.id} className="flex gap-3 animate-fade-in">
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                                        {c.profiles?.avatar_url ? (
                                            <img
                                                src={c.profiles.avatar_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-white/60 font-bold">
                                                {c.profiles?.full_name?.charAt(0) || '؟'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-white/80 truncate">
                                            {c.profiles?.full_name || 'مستخدم'}
                                        </div>
                                        <div className="text-sm text-white/90 mt-0.5 leading-relaxed break-words">
                                            {c.content}
                                        </div>
                                        <div className="text-[10px] text-white/40 mt-1">
                                            {new Date(c.created_at).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="flex items-center gap-2 px-4 py-3 border-t border-white/10 flex-shrink-0"
                            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
                            dir="rtl"
                        >
                            <input
                                type="text"
                                placeholder="أضف تعليقاً..."
                                className="flex-1 text-sm text-white placeholder-white/40 outline-none"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: 999,
                                    padding: '12px 18px',
                                    border: '1px solid rgba(255,255,255,0.15)'
                                }}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-90 transition-all"
                                style={{ background: '#8B1A2A' }}
                                aria-label="Send comment"
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
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
                .touch-manipulation { touch-action: manipulation; }
                .touch-none { touch-action: none; }
            `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────
// HomeReels — Improved scrolling & auto-play
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
    const scrollTimeoutRef = useRef<any>(null);
    const lastScrollTime = useRef(0);
    const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

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
    }, [loading]);

    // Load reels
    useEffect(() => { loadReels(); }, []);

    // Search focus
    useEffect(() => {
        if (isSearchOpen) {
            const t = setTimeout(() => searchInputRef.current?.focus(), 100);
            return () => clearTimeout(t);
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

    // ── INTERSECTION OBSERVER for reliable visibility detection ──
    useEffect(() => {
        if (!containerRef.current || reels.length === 0) return;

        const options = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: [0.5, 0.75, 1.0], // Multiple thresholds for better precision
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            // Find the most visible reel
            let maxVisible: { index: number; ratio: number } | null = null;

            entries.forEach((entry) => {
                const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    if (!maxVisible || entry.intersectionRatio > maxVisible.ratio) {
                        maxVisible = { index, ratio: entry.intersectionRatio };
                    }
                }
            });

            if (maxVisible) {
                setActiveIndex(maxVisible.index);
            }
        };

        intersectionObserverRef.current = new IntersectionObserver(handleIntersection, options);

        // Observe all reel containers
        const children = containerRef.current.children;
        for (let i = 0; i < children.length; i++) {
            children[i].setAttribute('data-index', i.toString());
            intersectionObserverRef.current.observe(children[i]);
        }

        return () => {
            intersectionObserverRef.current?.disconnect();
        };
    }, [reels.length]);

    // ── SMOOTH SCROLL with momentum handling ──
    const handleScroll = useCallback(() => {
        const now = Date.now();
        lastScrollTime.current = now;

        // Debounce rapid scroll events
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            const el = containerRef.current;
            if (!el) return;

            const height = el.clientHeight;
            const scrollTop = el.scrollTop;
            const index = Math.round(scrollTop / height);
            const boundedIndex = Math.max(0, Math.min(reels.length - 1, index));

            if (boundedIndex !== activeIndex) {
                setActiveIndex(boundedIndex);
            }
        }, 50);
    }, [activeIndex, reels.length]);

    const navigateToReel = (id: string) => {
        const idx = reels.findIndex((r) => r.id === id);
        if (idx === -1) return;

        setActiveIndex(idx);
        const el = containerRef.current;
        if (el) {
            el.scrollTo({
                top: idx * el.clientHeight,
                behavior: 'smooth'
            });
        }
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

    // Handle iOS unlock from child components
    const handleIosUnlock = useCallback(() => {
        // This ensures the parent knows iOS is unlocked
        // Additional logic can be added here if needed
    }, []);

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 10 }}>
            {/* Scroll container with improved snap behavior */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overscroll-y-contain"
                style={{
                    scrollSnapType: 'y mandatory',
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch', // Smooth iOS scrolling
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                } as any}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        className="w-full relative"
                        style={{
                            height: `calc(100dvh - ${navHeight}px)`, // Modern browsers
                            scrollSnapAlign: 'start',
                            scrollSnapStop: 'always',
                            // Ensure each reel takes full viewport space
                            minHeight: `calc(100dvh - ${navHeight}px)`,
                        }}
                    >
                        <ReelVideo
                            reel={reel}
                            isActive={index === activeIndex}
                            onIosUnlock={handleIosUnlock}
                        />
                    </div>
                ))}
            </div>

            {/* BottomNav */}
            <div
                ref={navRef}
                className="flex-shrink-0 relative z-50"
                style={{
                    background: 'linear-gradient(to top, #000 70%, transparent)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}
            >
                <BottomNav />
            </div>

            {/* Floating search bar */}
            <div
                className="absolute left-0 right-0 z-50 pointer-events-none"
                style={{
                    top: 0,
                    paddingTop: 'env(safe-area-inset-top, 0px)'
                }}
            >
                <div className="px-4 pt-3 pb-2 flex items-center gap-3 pointer-events-auto">
                    {isSearchOpen ? (
                        <>
                            <div
                                className="flex-1 flex items-center gap-2"
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 999,
                                    padding: '10px 16px',
                                    border: '1px solid rgba(255,255,255,0.25)'
                                }}
                            >
                                <Search className="text-white/60 w-4 h-4 flex-shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="ابحث عن فيديو أو مستخدم..."
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
                                    <button
                                        onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                                        className="p-1 -m-1 active:opacity-50 transition-opacity"
                                    >
                                        <X className="text-white/50 w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={closeSearch}
                                className="text-white/80 text-sm whitespace-nowrap flex-shrink-0 active:opacity-50 transition-opacity px-2"
                            >
                                إلغاء
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                                aria-label="Search"
                            >
                                <Search className="text-white w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Search suggestions */}
                {isSearchOpen && suggestions.length > 0 && (
                    <div
                        className="mx-4 mt-1 overflow-hidden shadow-2xl"
                        style={{
                            borderRadius: 16,
                            background: 'rgba(20,20,20,0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.15)'
                        }}
                    >
                        {suggestions.map((r, i) => (
                            <button
                                key={r.id}
                                className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/10 transition-colors"
                                style={{
                                    borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'
                                }}
                                onClick={() => navigateToReel(r.id)}
                            >
                                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                                    {r.thumbnail_url ? (
                                        <img
                                            src={r.thumbnail_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Search className="text-white/30 w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-right" dir="rtl">
                                    <div className="text-white/95 text-sm font-medium truncate">
                                        {highlight(r.title || '', searchQuery)}
                                    </div>
                                    <div className="text-white/50 text-xs mt-0.5">
                                        @{highlight(r.author || '', searchQuery)}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* No results */}
                {isSearchOpen && searchQuery.trim() && suggestions.length === 0 && (
                    <div
                        className="mx-4 mt-1 py-6 text-center"
                        style={{
                            borderRadius: 16,
                            background: 'rgba(20,20,20,0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.15)'
                        }}
                    >
                        <p className="text-white/50 text-sm">
                            لا توجد نتائج لـ "{searchQuery}"
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                * { -webkit-tap-highlight-color: transparent; }
                ::-webkit-scrollbar { display: none; }
                .overscroll-y-contain { overscroll-behavior-y: contain; }
            `}</style>
        </div>
    );
};

export default HomeReels;