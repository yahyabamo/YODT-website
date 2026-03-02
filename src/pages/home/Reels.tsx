import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Send, Volume2, VolumeX, Play, Search, X, Bookmark, Share2, ChevronUp, ChevronDown, MoreVertical, Eye, Pause } from 'lucide-react';
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
    window.dispatchEvent(new Event('ios-unlocked'));
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
// Haptic Feedback Utility
// ─────────────────────────────────────────────
const haptic = {
    light: () => {
        try { (navigator as any).vibrate?.(10); } catch (_) { }
    },
    medium: () => {
        try { (navigator as any).vibrate?.(25); } catch (_) { }
    },
    heavy: () => {
        try { (navigator as any).vibrate?.(50); } catch (_) { }
    },
    success: () => {
        try { (navigator as any).vibrate?.([10, 30, 10]); } catch (_) { }
    },
};

// ─────────────────────────────────────────────
// Format count helper
// ─────────────────────────────────────────────
const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
};

// ─────────────────────────────────────────────
// Ripple Effect Hook
// ─────────────────────────────────────────────
const useRipple = () => {
    const createRipple = useCallback((e: React.TouchEvent | React.MouseEvent, container: HTMLElement) => {
        const rect = container.getBoundingClientRect();
        const x = 'touches' in e
            ? e.touches[0].clientX - rect.left
            : (e as React.MouseEvent).clientX - rect.left;
        const y = 'touches' in e
            ? e.touches[0].clientY - rect.top
            : (e as React.MouseEvent).clientY - rect.top;

        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
            position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;
            width:${size}px;height:${size}px;border-radius:50%;
            background:rgba(255,255,255,0.12);transform:scale(0);
            animation:rippleAnim 0.6s ease-out forwards;pointer-events:none;z-index:100;
        `;
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    }, []);
    return createRipple;
};

// ─────────────────────────────────────────────
// ReelVideo Component
// ─────────────────────────────────────────────
const ReelVideo = ({
    reel,
    isActive,
    onFirstInteraction,
    onSwipeUp,
    onSwipeDown,
}: {
    reel: any;
    isActive: boolean;
    onFirstInteraction: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ likes: 0, comments: 0, views: 0, isLiked: false, isSaved: false });
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
    const [showControls, setShowControls] = useState(false);
    const [showPauseIcon, setShowPauseIcon] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<any>(null);
    const controlsTimeout = useRef<any>(null);
    const lastTap = useRef(0);
    const tapTimeout = useRef<any>(null);
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
    const divId = useMemo(() => `yt-${reel.id}`, [reel.id]);
    const videoId = useMemo(() => getVideoId(reel.video_url), [reel.video_url]);
    const isActiveRef = useRef(isActive);
    const createRipple = useRipple();

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
                    onReady: () => {
                        if (destroyed) return;
                        setPlayerReady(true);
                        if (isActiveRef.current) tryPlay();
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
                    onError: (e: any) => console.error('YT error', e.data),
                },
            });
        });

        return () => {
            destroyed = true;
            stopProgress();
            clearTimeout(tapTimeout.current);
            clearTimeout(controlsTimeout.current);
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
            try { playerRef.current?.pauseVideo(); playerRef.current?.mute(); } catch (_) { }
            stopProgress();
            setProgress(0);
            setIsPaused(false);
            setShowControls(false);
            setHasStarted(false);
        }
    }, [isActive, playerReady, reel.id]);

    // ── iOS unlock ──
    useEffect(() => {
        const handleUnlock = () => {
            if (isActiveRef.current && playerRef.current) {
                playerRef.current.playVideo();
                if (!isMuted) {
                    playerRef.current.unMute();
                    playerRef.current.setVolume(100);
                }
            }
        };
        window.addEventListener('ios-unlocked', handleUnlock);
        return () => window.removeEventListener('ios-unlocked', handleUnlock);
    }, [isMuted]);

    const tryPlay = () => {
        if (!playerRef.current) return;
        try {
            playerRef.current.mute();
            playerRef.current.playVideo();
            if (iosUnlocked && !isMuted) {
                playerRef.current.unMute();
                playerRef.current.setVolume(100);
            }
        } catch (e) { console.error('Play failed:', e); }
    };

    const startProgress = () => {
        stopProgress();
        progressInterval.current = setInterval(() => {
            try {
                const cur = playerRef.current?.getCurrentTime?.() ?? 0;
                const dur = playerRef.current?.getDuration?.() ?? 1;
                if (dur > 0) setProgress((cur / dur) * 100);
            } catch (_) { stopProgress(); }
        }, 200);
    };

    const stopProgress = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
    };

    const loadStats = async () => {
        try {
            const data = await fetchReelStats(reel.id, user?.id);
            setStats(prev => ({
                views: prev.views,
                isSaved: prev.isSaved,
                ...data,
            }));
        } catch (_) { }
    };
    const loadComments = async () => {
        try { setComments(await fetchComments(reel.id)); } catch (_) { }
    };

    const showControlsTemporarily = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };

    const handleToggleLike = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للإعجاب'); return; }
        haptic.success();
        const wasLiked = stats.isLiked;
        setStats(p => ({
            ...p,
            likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
            isLiked: !wasLiked
        }));
        try {
            await toggleLike(reel.id, user.id);
        } catch {
            // Revert on error
            setStats(p => ({
                ...p,
                likes: wasLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
                isLiked: wasLiked
            }));
            toast.error('فشل تحديث الإعجاب');
        }
    };

    const handleSave = () => {
        haptic.medium();
        setIsSaved(p => !p);
        toast.success(isSaved ? 'تم إلغاء الحفظ' : 'تم الحفظ ✨', { duration: 1500 });
    };

    const handleShare = async () => {
        haptic.light();
        try {
            if (navigator.share) {
                await navigator.share({
                    title: reel.title,
                    url: reel.video_url,
                });
            } else {
                await navigator.clipboard.writeText(reel.video_url);
                toast.success('تم نسخ الرابط');
            }
        } catch (_) { }
    };

    // ── Touch handling for gestures ──
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        const dt = Date.now() - touchStart.current.time;
        touchStart.current = null;

        // Detect quick swipe gestures (not navigation scroll)
        if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx) * 2 && dt < 300) {
            return; // Let the scroll handle it
        }
    }, []);

    const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (!iosUnlocked) { markIosUnlocked(); onFirstInteraction(); }

        if (!hasStarted) {
            try {
                playerRef.current?.unMute();
                playerRef.current?.setVolume(100);
                playerRef.current?.playVideo();
                setIsMuted(false);
                setHasStarted(true);
            } catch (_) { }
            return;
        }

        // Double tap detection
        const now = Date.now();
        if (now - lastTap.current < 300) {
            clearTimeout(tapTimeout.current);
            lastTap.current = 0;
            haptic.success();
            if (!stats.isLiked) handleToggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 900);
            if (containerRef.current) createRipple(e, containerRef.current);
            return;
        }

        lastTap.current = now;
        clearTimeout(tapTimeout.current);

        if (isMuted) {
            haptic.light();
            try {
                playerRef.current?.unMute();
                playerRef.current?.setVolume(100);
                setIsMuted(false);
                if (isPaused) playerRef.current?.playVideo();
            } catch (_) { }
        } else {
            tapTimeout.current = setTimeout(() => {
                haptic.light();
                showControlsTemporarily();
                try {
                    if (isPaused) {
                        playerRef.current?.playVideo();
                        setShowPauseIcon(false);
                    } else {
                        playerRef.current?.pauseVideo();
                        setShowPauseIcon(true);
                        setTimeout(() => setShowPauseIcon(false), 1000);
                    }
                } catch (_) { }
            }, 300);
        }
    }, [hasStarted, isMuted, isPaused, stats.isLiked, handleToggleLike, onFirstInteraction, createRipple]);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        haptic.light();
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
        } catch (_) { }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        try {
            const dur = playerRef.current?.getDuration?.() ?? 0;
            if (dur > 0) { playerRef.current?.seekTo((val / 100) * dur, true); setProgress(val); }
        } catch (_) { }
    };

    const skip = (e: React.MouseEvent, s: number) => {
        e.stopPropagation();
        haptic.light();
        try {
            const cur = playerRef.current?.getCurrentTime?.() ?? 0;
            const dur = playerRef.current?.getDuration?.() ?? 0;
            playerRef.current?.seekTo(Math.max(0, Math.min(dur, cur + s)), true);
        } catch (_) { }
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
            haptic.success();
        } catch { toast.error('فشل إرسال التعليق'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden" style={{ position: 'relative' }}>
            {/* YouTube iframe */}
            <div
                id={divId}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: 'scale(1.35)', transformOrigin: 'center' }}
            />

            {/* Thumbnail */}
            {!playerReady && reel.thumbnail_url && (
                <img src={reel.thumbnail_url} className="absolute inset-0 w-full h-full object-cover z-10" alt="" />
            )}

            {/* Buffering spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                    <div className="reel-spinner" />
                </div>
            )}

            {/* Gradient overlays - cinematic */}
            <div className="absolute inset-0 pointer-events-none z-20"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 50%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.95) 100%)' }}
            />
            {/* Side fade for sidebar */}
            <div className="absolute inset-0 pointer-events-none z-20"
                style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, transparent 30%)' }}
            />

            {/* ── Touch/Click capture area ── */}
            <div
                className="absolute inset-0 z-30 cursor-pointer"
                onClick={handleInteraction}
                onTouchEnd={(e) => { e.preventDefault(); handleInteraction(e); }}
            />

            {/* ── Tap to start overlay ── */}
            {!hasStarted && playerReady && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)' }}
                >
                    <div className="play-btn-ring">
                        <div className="play-btn-inner">
                            <Play className="text-white fill-white" style={{ width: 36, height: 36, marginLeft: 4 }} />
                        </div>
                    </div>
                    <span className="text-white/80 text-sm font-medium tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
                        اضغط للتشغيل
                    </span>
                </div>
            )}

            {/* ── Pause flash icon ── */}
            {showPauseIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="pause-flash-icon">
                        <Pause className="text-white fill-white w-10 h-10" />
                    </div>
                </div>
            )}

            {/* ── Double tap heart ── */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <Heart className="text-white fill-white heart-pop" style={{ width: 96, height: 96 }} />
                </div>
            )}

            {/* ── TOP: Mute + Navigation hints ── */}
            <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
                {/* Nav up/down hints */}
                <div className="flex flex-col gap-1 opacity-0 pointer-events-none">
                    <ChevronUp className="text-white/40 w-4 h-4" />
                    <ChevronDown className="text-white/40 w-4 h-4" />
                </div>

                {/* Mute button */}
                <button
                    className="glass-btn w-10 h-10 rounded-full flex items-center justify-center ml-auto active:scale-90 transition-transform"
                    onClick={toggleMute}
                    style={{ touchAction: 'manipulation' }}
                >
                    {isMuted
                        ? <VolumeX className="text-white w-4 h-4" />
                        : <Volume2 className="text-white w-4 h-4" />
                    }
                </button>
            </div>

            {/* ── RIGHT SIDEBAR: Actions ── */}
            <div className="absolute right-3 z-40 flex flex-col items-center gap-4" style={{ bottom: 140 }}>
                {/* Like */}
                <button
                    className="flex flex-col items-center gap-1.5 group"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                    style={{ touchAction: 'manipulation' }}
                >
                    <div className={cn('action-btn', stats.isLiked && 'action-btn-liked')}>
                        <Heart className={cn('w-6 h-6 transition-all duration-300', stats.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white')} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-lg action-count">
                        {formatCount(stats.likes)}
                    </span>
                </button>

                {/* Comment */}
                <button
                    className="flex flex-col items-center gap-1.5"
                    onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); loadComments(); haptic.light(); }}
                    style={{ touchAction: 'manipulation' }}
                >
                    <div className="action-btn">
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-lg action-count">
                        {formatCount(stats.comments)}
                    </span>
                </button>

                {/* Save */}
                {/* <button
                    className="flex flex-col items-center gap-1.5"
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    style={{ touchAction: 'manipulation' }}
                >
                    <div className={cn('action-btn', isSaved && 'action-btn-saved')}>
                        <Bookmark className={cn('w-6 h-6 transition-all duration-300', isSaved ? 'fill-amber-400 text-amber-400' : 'text-white')} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-lg action-count">
                        حفظ
                    </span>
                </button> */}

                {/* Share */}
                <button
                    className="flex flex-col items-center gap-1.5"
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    style={{ touchAction: 'manipulation' }}
                >
                    <div className="action-btn">
                        <Share2 className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-lg action-count">
                        مشاركة
                    </span>
                </button>
            </div>

            {/* ── BOTTOM: Info + Progress ── */}
            <div
                className="absolute left-0 right-0 z-40 px-4"
                style={{ bottom: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress bar + skip controls */}
                {hasStarted && (
                    <div dir="ltr" className="flex items-center gap-2 mb-4">
                        <button
                            className="skip-btn text-white text-xs font-bold"
                            onClick={(e) => skip(e, -10)}
                            style={{ touchAction: 'manipulation' }}
                        >
                            -10
                        </button>

                        <div className="relative flex-1 h-8 flex items-center">
                            {/* Track */}
                            <div className="absolute left-0 right-0 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <div
                                    className="h-full rounded-full progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {/* Thumb dot */}
                            <div
                                className="absolute h-3.5 w-3.5 rounded-full bg-white shadow-lg pointer-events-none"
                                style={{ left: `calc(${progress}% - 7px)`, top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="range"
                                min={0} max={100} step={0.5}
                                value={progress}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        <button
                            className="skip-btn text-white text-xs font-bold"
                            onClick={(e) => skip(e, 10)}
                            style={{ touchAction: 'manipulation' }}
                        >
                            +10
                        </button>
                    </div>
                )}

                {/* Author + Title */}
                <div className="pointer-events-none" style={{ paddingRight: 64 }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="author-avatar">
                            {reel.author_avatar ? (
                                <img src={reel.author_avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">
                                    {(reel.author || 'أ').charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <p dir="rtl" className="text-white font-bold text-sm drop-shadow-lg">
                                @{reel.author || 'اتحاد الطلاب'}
                            </p>
                        </div>
                    </div>
                    <p dir="rtl" className="text-white/85 text-xs line-clamp-2 leading-relaxed drop-shadow-lg">
                        {reel.title}
                    </p>
                    {stats.views > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                            <Eye className="text-white/40 w-3 h-3" />
                            <span className="text-white/40 text-[10px]">{formatCount(stats.views)} مشاهدة</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── COMMENTS DRAWER ── */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" style={{ backdropFilter: 'blur(4px)' }} />
                    <Drawer.Content
                        className="flex flex-col fixed bottom-0 left-0 right-0 z-[101] comments-drawer"
                        style={{ borderRadius: '28px 28px 0 0', height: '72vh', maxHeight: '72vh' }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }} dir="rtl">
                            <div>
                                <h2 className="text-white font-bold text-base">التعليقات</h2>
                                <span className="text-white/40 text-xs">{stats.comments} تعليق</span>
                            </div>
                            <button
                                onClick={() => setIsCommentsOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                                style={{ background: 'rgba(255,255,255,0.08)' }}
                            >
                                <X className="text-white/60 w-4 h-4" />
                            </button>
                        </div>

                        {/* Comments list */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" dir="rtl" style={{ overscrollBehavior: 'contain' }}>
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <div style={{ fontSize: 48 }}>💬</div>
                                    <p className="text-white/30 text-sm">كن أول من يعلق!</p>
                                </div>
                            ) : comments.map((c) => (
                                <div key={c.id} className="flex gap-3 items-start">
                                    <div className="comment-avatar flex-shrink-0">
                                        {c.profiles?.avatar_url
                                            ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : <span className="text-white/60 text-xs font-bold">{c.profiles?.full_name?.charAt(0) || '?'}</span>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-white/70 text-xs font-semibold">{c.profiles?.full_name || 'مستخدم'}</span>
                                            <span className="text-white/25 text-[10px]">{new Date(c.created_at).toLocaleDateString('ar')}</span>
                                        </div>
                                        <p className="text-white/90 text-sm leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div
                            className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-t"
                            style={{
                                borderColor: 'rgba(255,255,255,0.08)',
                                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)'
                            }}
                            dir="rtl"
                        >
                            {user && (
                                <div className="comment-avatar flex-shrink-0">
                                    <span className="text-white/60 text-xs font-bold">
                                        {user.email?.charAt(0).toUpperCase() || 'أ'}
                                    </span>
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="أضف تعليقاً..."
                                className="flex-1 text-sm text-white placeholder-white/30 outline-none px-4 py-3 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className="send-btn w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
                            >
                                <Send className="w-4 h-4 text-white" style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
            {/* Unmute hint — shown when playing but still muted */}
            {hasStarted && isMuted && (
                <div
                    className="absolute z-40 pointer-events-none"
                    style={{ bottom: 170, left: 16 }}
                >
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-full unmute-hint"
                    >
                        <VolumeX className="text-white w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-white text-xs font-medium">اضغط لتشغيل الصوت</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// HomeReels — Main
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

    useEffect(() => {
        if (!navRef.current) return;
        const update = () => setNavHeight(navRef.current?.getBoundingClientRect().height ?? 64);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(navRef.current);
        return () => observer.disconnect();
    }, []);

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

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const index = Math.round(container.scrollTop / container.clientHeight);
        const clamped = Math.max(0, Math.min(reels.length - 1, index));
        if (clamped !== activeIndex) setActiveIndex(clamped);
    }, [activeIndex, reels.length]);

    const scrollToIndex = useCallback((index: number) => {
        const container = containerRef.current;
        if (!container) return;
        container.scrollTo({ top: index * container.clientHeight, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 120);
    }, [isSearchOpen]);

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) { setSuggestions([]); return; }
        const seen = new Set<string>();
        setSuggestions(
            reels.filter((r) => {
                const k = `${r.title}-${r.author}`;
                if (seen.has(k)) return false;
                seen.add(k);
                return r.title?.toLowerCase().includes(q) || r.author?.toLowerCase().includes(q);
            }).slice(0, 6)
        );
    }, [searchQuery, reels]);

    const navigateToReel = (id: string) => {
        const idx = reels.findIndex((r) => r.id === id);
        if (idx === -1) return;
        setActiveIndex(idx);
        scrollToIndex(idx);
        closeSearch();
    };

    const closeSearch = () => { setIsSearchOpen(false); setSearchQuery(''); setSuggestions([]); };

    const highlight = (text: string, q: string) => {
        if (!q || !text) return <span>{text}</span>;
        const i = text.toLowerCase().indexOf(q.toLowerCase());
        if (i === -1) return <span>{text}</span>;
        return (
            <span>
                {text.slice(0, i)}
                <span className="text-white font-bold bg-white/20 rounded px-0.5">{text.slice(i, i + q.length)}</span>
                {text.slice(i + q.length)}
            </span>
        );
    };

    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div className="reel-spinner" style={{ width: 48, height: 48 }} />
            <span className="text-white/30 text-sm">جارٍ التحميل...</span>
        </div>
    );

    if (reels.length === 0) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div style={{ fontSize: 64 }}>🎬</div>
            <p className="text-white/50 text-base">لا توجد مقاطع بعد</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            {/* Reel counter indicator */}
            <div className="absolute left-1/2 z-50 pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)', transform: 'translateX(-50%)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
                    <span className="text-white text-xs font-semibold">{activeIndex + 1}</span>
                    <span className="text-white/30 text-xs">/</span>
                    <span className="text-white/50 text-xs">{reels.length}</span>
                </div>
            </div>

            {/* Scroll container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto"
                style={{
                    scrollSnapType: 'y mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    overscrollBehavior: 'contain',
                }}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        className="w-full"
                        style={{
                            height: `calc(100dvh - ${navHeight}px)`,
                            minHeight: `calc(100dvh - ${navHeight}px)`,
                            scrollSnapAlign: 'start',
                            scrollSnapStop: 'always',
                        }}
                    >
                        <ReelVideo
                            reel={reel}
                            isActive={index === activeIndex}
                            onFirstInteraction={() => {
                                if (containerRef.current) containerRef.current.style.overflow = 'auto';
                            }}
                            onSwipeUp={() => scrollToIndex(Math.min(reels.length - 1, activeIndex + 1))}
                            onSwipeDown={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                        />
                    </div>
                ))}
            </div>

            {/* Bottom Nav */}
            <div
                ref={navRef}
                className="flex-shrink-0 relative z-50"
                style={{ background: 'linear-gradient(to top, #000 60%, transparent)' }}
            >
                <BottomNav />
            </div>

            {/* ── SEARCH OVERLAY ── */}
            <div className="absolute top-0 left-0 right-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    {isSearchOpen ? (
                        <>
                            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <Search className="text-white/50 w-4 h-4 flex-shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="ابحث في الريلز..."
                                    className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none text-right"
                                    dir="rtl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && suggestions[0]) navigateToReel(suggestions[0].id);
                                        if (e.key === 'Escape') closeSearch();
                                    }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="flex-shrink-0">
                                        <X className="text-white/40 w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button onClick={closeSearch} className="text-white/70 text-sm font-medium px-1 flex-shrink-0">
                                إلغاء
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                                <Search className="text-white w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Search suggestions */}
                {isSearchOpen && suggestions.length > 0 && (
                    <div className="mx-4 mt-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(15,15,15,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {suggestions.map((r) => (
                            <button
                                key={r.id}
                                className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/5 transition-colors border-b last:border-0"
                                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                                onClick={() => navigateToReel(r.id)}
                            >
                                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    {r.thumbnail_url
                                        ? <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><Search className="text-white/20 w-4 h-4" /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white/90 text-sm truncate">{highlight(r.title, searchQuery)}</div>
                                    <div className="text-white/35 text-xs mt-0.5">@{r.author}</div>
                                </div>
                                <ChevronDown className="text-white/20 w-4 h-4 flex-shrink-0 -rotate-90" />
                            </button>
                        ))}

                    </div>
                )}

            </div>

            <style>{`
                * { -webkit-tap-highlight-color: transparent; }
                ::-webkit-scrollbar { display: none; }
                .pt-safe { padding-top: env(safe-area-inset-top, 0px); }

                /* ── Spinner ── */
                .reel-spinner {
                    width: 40px; height: 40px; border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top-color: rgba(255,255,255,0.8);
                    animation: spin 0.7s linear infinite;
                }

                /* ── Play button ── */
                .play-btn-ring {
                    width: 88px; height: 88px; border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.3);
                    display: flex; align-items: center; justify-center;
                    animation: ringPulse 2s ease-in-out infinite;
                }
                .play-btn-ring { display: flex; align-items: center; justify-content: center; }
                .play-btn-inner {
                    width: 72px; height: 72px; border-radius: 50%;
                    background: rgba(255,255,255,0.18);
                    backdrop-filter: blur(16px);
                    display: flex; align-items: center; justify-content: center;
                    border: 1.5px solid rgba(255,255,255,0.3);
                }

                /* ── Glass button ── */
                .glass-btn {
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.12);
                }

                /* ── Action buttons ── */
                .action-btn {
                    width: 52px; height: 52px; border-radius: 50%;
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
                    -webkit-tap-highlight-color: transparent;
                }
                .action-btn:active { transform: scale(0.88); }
                .action-btn-liked {
                    background: rgba(239,68,68,0.18);
                    border-color: rgba(239,68,68,0.3);
                }
                .action-btn-saved {
                    background: rgba(251,191,36,0.15);
                    border-color: rgba(251,191,36,0.3);
                }
                .action-count {
                    text-shadow: 0 1px 6px rgba(0,0,0,0.8);
                    font-size: 11px;
                }

                /* ── Author avatar ── */
                .author-avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    border: 1.5px solid rgba(255,255,255,0.3);
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; flex-shrink: 0;
                }
                .comment-avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: rgba(255,255,255,0.08);
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                }

                /* ── Skip buttons ── */
                .skip-btn {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: transform 0.15s;
                    -webkit-tap-highlight-color: transparent;
                }
                .skip-btn:active { transform: scale(0.88); }

                /* ── Progress fill ── */
                .progress-fill {
                    background: linear-gradient(90deg, rgba(255,255,255,0.9), #fff);
                    transition: width 0.2s linear;
                }

                /* ── Send button ── */
                .send-btn {
                    background: #8B1A2A;
                    border: 1px solid rgba(255,255,255,0.1);
                    -webkit-tap-highlight-color: transparent;
                }
                .send-btn:not(:disabled):active { transform: scale(0.88); }

                /* ── Comments drawer ── */
                .comments-drawer {
                    background: #0f0f0f;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-bottom: none;
                }
                    .unmute-hint {
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.15);
    animation: fadeInUp 0.4s ease-out, hintPulse 2.5s ease-in-out 0.5s infinite;
}
@keyframes hintPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

                /* ── Animations ── */
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes heartPop {
                    0%  { transform: scale(0.3); opacity: 0.9; }
                    40% { transform: scale(1.5); opacity: 1; }
                    70% { transform: scale(1.1); opacity: 1; }
                    100%{ transform: scale(1.3); opacity: 0; }
                }
                @keyframes rippleAnim {
                    to { transform: scale(1); opacity: 0; }
                }
                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.06); opacity: 0.7; }
                }
                @keyframes pauseFlash {
                    0% { transform: scale(0.8); opacity: 0.9; }
                    30%{ transform: scale(1.1); opacity: 1; }
                    100%{ opacity: 0; transform: scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity:0; transform: translateY(12px); }
                    to   { opacity:1; transform: translateY(0); }
                }

                .heart-pop { animation: heartPop 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards; }
                .pause-flash-icon {
                    width: 72px; height: 72px; border-radius: 50%;
                    background: rgba(0,0,0,0.55);
                    backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center;
                    animation: pauseFlash 0.9s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default HomeReels;