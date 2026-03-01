import { useState, useEffect, useRef, useCallback } from 'react';
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
let globalMuted = true;

const markIosUnlocked = () => { iosUnlocked = true; };

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
// ReelVideo — Pure UI shell (no YT player logic)
// ─────────────────────────────────────────────
const ReelVideo = ({
    reel,
    isActive,
    isMuted,
    isPaused,
    isBuffering,
    hasStarted,
    progress,
    onInteraction,
    onToggleMute,
    onSeek,
    onSkip,
    onFirstInteraction,
}: {
    reel: any;
    isActive: boolean;
    isMuted: boolean;
    isPaused: boolean;
    isBuffering: boolean;
    hasStarted: boolean;
    progress: number;
    onInteraction: (e?: React.MouseEvent) => void;
    onToggleMute: (e: React.MouseEvent) => void;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSkip: (e: React.MouseEvent, seconds: number) => void;
    onFirstInteraction: () => void;
}) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ likes: 0, comments: 0, isLiked: false });
    const [showHeart, setShowHeart] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const lastTap = useRef(0);
    const tapTimeout = useRef<any>(null);

    // Load stats & increment view when reel becomes active
    useEffect(() => {
        if (!isActive) return;
        fetchReelStats(reel.id, user?.id ?? undefined)
            .then(s => setStats(s))
            .catch(() => { });
        incrementViewCount(reel.id);
    }, [isActive, reel.id, user?.id]);

    const handleToggleLike = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للإعجاب'); return; }
        try {
            const { liked } = await toggleLike(reel.id, user.id);
            setStats(p => ({ ...p, likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1), isLiked: liked }));
        } catch { toast.error('فشل تحديث الإعجاب'); }
    };

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!iosUnlocked) { markIosUnlocked(); onFirstInteraction(); }

        const now = Date.now();
        const isDouble = now - lastTap.current < 300;
        lastTap.current = now;

        if (isDouble) {
            clearTimeout(tapTimeout.current);
            lastTap.current = 0;
            if (!stats.isLiked) handleToggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
            return;
        }

        clearTimeout(tapTimeout.current);
        tapTimeout.current = setTimeout(() => onInteraction(e), 300);
    }, [stats.isLiked, onInteraction, onFirstInteraction]);

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
        <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Thumbnail — shown while buffering / switching */}
            {(!hasStarted || isBuffering) && reel.thumbnail_url && (
                <img src={reel.thumbnail_url} className="absolute inset-0 w-full h-full object-cover z-10" alt="" />
            )}

            {/* Buffering spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
            )}

            {/* Gradient overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.9) 100%)' }}
            />

            {/* Touch capture */}
            <div className="absolute inset-0 z-30 cursor-pointer" onClick={handleClick} />

            {/* Unmute hint */}
            {hasStarted && isMuted && !isPaused && (
                <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-40">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <VolumeX className="text-white w-4 h-4" />
                        <span className="text-white text-sm font-medium">اضغط لتشغيل الصوت</span>
                    </div>
                </div>
            )}

            {/* Pause indicator */}
            {hasStarted && isPaused && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <Play className="text-white w-8 h-8 fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Heart animation */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <Heart className="text-white fill-white" style={{ width: 88, height: 88, animation: 'heartPop 0.8s ease-out forwards' }} />
                </div>
            )}

            {/* Mute button */}
            <button
                className="absolute z-40 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ top: 14, right: 14, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
                onClick={onToggleMute}
            >
                {isMuted ? <VolumeX className="text-white w-5 h-5" /> : <Volume2 className="text-white w-5 h-5" />}
            </button>

            {/* Sidebar actions */}
            <div className="absolute right-3 z-40 flex flex-col items-center gap-5" style={{ bottom: 140 }}>
                <button className="flex flex-col items-center gap-1" onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                        <Heart className={cn('w-6 h-6 transition-all', stats.isLiked ? 'fill-red-500 text-red-500' : 'text-white')} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{stats.likes.toLocaleString()}</span>
                </button>

                <button className="flex flex-col items-center gap-1" onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); fetchComments(reel.id).then(setComments).catch(() => { }); }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{stats.comments.toLocaleString()}</span>
                </button>
            </div>

            {/* Bottom info + progress bar */}
            <div className="absolute left-0 right-0 z-40 px-4" style={{ bottom: 20 }} onClick={(e) => e.stopPropagation()}>
                {hasStarted && (
                    <div dir="ltr" className="flex items-center gap-2 mb-3">
                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0 w-9 h-9 active:scale-90 transition-transform"
                            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
                            onClick={(e) => onSkip(e, -10)}
                        >−10</button>

                        <div className="relative flex-1 h-7 flex items-center">
                            <div className="absolute left-0 right-0 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
                                <div className="h-full bg-white rounded-full" style={{ width: `${progress}%`, transition: 'width 0.2s linear' }} />
                            </div>
                            <input type="range" min={0} max={100} step={0.5} value={progress} onChange={onSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>

                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0 w-9 h-9 active:scale-90 transition-transform"
                            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
                            onClick={(e) => onSkip(e, 10)}
                        >+10</button>
                    </div>
                )}

                <div className="pointer-events-none" style={{ paddingLeft: 60 }}>
                    <p dir="rtl" className="text-white font-bold text-sm mb-0.5 drop-shadow-md">@{reel.author || 'اتحاد الطلاب'}</p>
                    <p dir="rtl" className="text-white/90 text-xs line-clamp-2 leading-relaxed drop-shadow-md">{reel.title}</p>
                </div>
            </div>

            {/* Comments Drawer */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" />
                    <Drawer.Content className="flex flex-col fixed bottom-0 left-0 right-0 z-[101]" style={{ borderRadius: '24px 24px 0 0', background: '#111', height: '70vh' }}>
                        <div className="flex justify-center pt-3 pb-2"><div className="w-12 h-1.5 rounded-full bg-white/30" /></div>
                        <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10" dir="rtl">
                            <h2 className="text-white font-bold text-base">التعليقات ({stats.comments})</h2>
                            <button onClick={() => setIsCommentsOpen(false)}><X className="text-white/50 w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" dir="rtl">
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-white/40 text-sm gap-2">
                                    <MessageCircle className="w-10 h-10 opacity-30" /><span>كن أول من يعلق!</span>
                                </div>
                            ) : comments.map((c) => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                                        {c.profiles?.avatar_url
                                            ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-xs text-white/60 font-bold">{c.profiles?.full_name?.charAt(0) || '؟'}</div>
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white/80">{c.profiles?.full_name || 'مستخدم'}</div>
                                        <div className="text-sm text-white/90 mt-0.5 leading-relaxed">{c.content}</div>
                                        <div className="text-[10px] text-white/40 mt-1">{new Date(c.created_at).toLocaleDateString('ar')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10" dir="rtl">
                            <input
                                type="text" placeholder="أضف تعليقاً..."
                                className="flex-1 text-sm text-white placeholder-white/40 outline-none px-4 py-3 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}
                                className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all"
                                style={{ background: '#8B1A2A' }}>
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            <style>{`
                @keyframes heartPop {
                    0%   { transform: scale(0.5); opacity: 1; }
                    50%  { transform: scale(1.4); opacity: 1; }
                    100% { transform: scale(1);   opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────
// HomeReels — Owns the ONE shared YT.Player
// ─────────────────────────────────────────────
const HomeReels = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [navHeight, setNavHeight] = useState(64);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    // ── Shared player UI state ──
    const [isMuted, setIsMuted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [progress, setProgress] = useState(0);

    // ── Refs ──
    const sharedPlayerRef = useRef<any>(null);
    const playerReadyRef = useRef(false);
    const progressInterval = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Slot ref — the wrapper div inside the active reel that holds the moved player
    const playerSlotRef = useRef<HTMLDivElement | null>(null);

    // Stable refs for use inside YT callbacks (avoids stale closures)
    const reelsRef = useRef<any[]>([]);
    const activeIndexRef = useRef(0);
    useEffect(() => { reelsRef.current = reels; }, [reels]);
    useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

    // ── Progress tracking ──
    const stopProgress = useCallback(() => {
        if (progressInterval.current) { clearInterval(progressInterval.current); progressInterval.current = null; }
    }, []);

    const startProgress = useCallback(() => {
        stopProgress();
        progressInterval.current = setInterval(() => {
            try {
                const cur = sharedPlayerRef.current?.getCurrentTime?.() ?? 0;
                const dur = sharedPlayerRef.current?.getDuration?.() ?? 1;
                if (dur > 0) setProgress((cur / dur) * 100);
            } catch { stopProgress(); }
        }, 200);
    }, [stopProgress]);

    // ── Unmute helper ──
    const unmute = useCallback(() => {
        try {
            sharedPlayerRef.current?.unMute();
            sharedPlayerRef.current?.setVolume(100);
            setIsMuted(false);
            globalMuted = false;
        } catch (_) { }
    }, []);

    // ── Load video for index ──
    const loadVideoForIndex = useCallback((index: number) => {
        const reel = reelsRef.current[index];
        if (!reel || !sharedPlayerRef.current || !playerReadyRef.current) return;
        const vid = getVideoId(reel.video_url);
        if (!vid) return;

        setHasStarted(false);
        setIsPaused(false);
        setIsBuffering(false);
        setProgress(0);
        stopProgress();

        // loadVideoById auto-plays (player is trusted after first onReady)
        sharedPlayerRef.current.loadVideoById({ videoId: vid, startSeconds: 0 });

        // Apply current mute preference immediately
        if (globalMuted) {
            sharedPlayerRef.current.mute();
            setIsMuted(true);
        } else {
            sharedPlayerRef.current.unMute();
            sharedPlayerRef.current.setVolume(100);
            setIsMuted(false);
        }
    }, [stopProgress]);

    // ── Initialize one shared player ──
    useEffect(() => {
        let destroyed = false;

        const onReady = () => {
            if (destroyed) return;
            playerReadyRef.current = true;
            // Load first video if reels are already available
            if (reelsRef.current.length > 0) loadVideoForIndex(activeIndexRef.current);
        };

        const onStateChange = (e: any) => {
            if (destroyed) return;
            const S = (window as any).YT?.PlayerState;
            if (!S) return;

            if (e.data === S.PLAYING) {
                setIsPaused(false);
                setIsBuffering(false);
                setHasStarted(true);
                startProgress();
                if (iosUnlocked && !globalMuted) unmute();
            } else if (e.data === S.PAUSED) {
                setIsPaused(true);
                stopProgress();
            } else if (e.data === S.BUFFERING) {
                setIsBuffering(true);
            } else if (e.data === S.ENDED) {
                sharedPlayerRef.current?.seekTo(0, true);
                sharedPlayerRef.current?.playVideo();
            }
        };

        loadYouTubeAPI(() => {
            if (destroyed || sharedPlayerRef.current) return;
            sharedPlayerRef.current = new (window as any).YT.Player('yt-shared-player', {
                videoId: '',
                playerVars: {
                    autoplay: 0, controls: 0, modestbranding: 1,
                    rel: 0, iv_load_policy: 3, loop: 0,
                    playsinline: 1, mute: 1,
                    origin: window.location.origin, enablejsapi: 1,
                },
                events: { onReady, onStateChange },
            });
        });

        return () => {
            destroyed = true;
            stopProgress();
            try { sharedPlayerRef.current?.destroy(); } catch (_) { }
            sharedPlayerRef.current = null;
            playerReadyRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Move the shared player iframe into the active reel's slot ──
    // This is the critical DOM-append that keeps one iframe alive while
    // visually positioning it inside the currently visible reel card.
    useEffect(() => {
        const playerEl = document.getElementById('yt-shared-player');
        const slot = playerSlotRef.current;
        if (!playerEl || !slot) return;
        // appendChild moves (not clones) the node — the YT iframe inside is preserved
        slot.appendChild(playerEl);
    }, [activeIndex]);

    // ── Switch video on activeIndex change ──
    useEffect(() => {
        if (!playerReadyRef.current || reels.length === 0) return;
        loadVideoForIndex(activeIndex);
    }, [activeIndex, reels, loadVideoForIndex]);

    // ── After reels load: start first video if player is ready ──
    useEffect(() => {
        if (reels.length > 0 && playerReadyRef.current) {
            loadVideoForIndex(0);
        }
    }, [reels, loadVideoForIndex]);

    // ── Nav height ──
    useEffect(() => {
        if (!navRef.current) return;
        const update = () => setNavHeight(navRef.current?.getBoundingClientRect().height ?? 64);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // ── Load reels ──
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

    // ── Scroll handler ──
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const index = Math.round(container.scrollTop / container.clientHeight);
        const clamped = Math.max(0, Math.min(reels.length - 1, index));
        if (clamped !== activeIndexRef.current) setActiveIndex(clamped);
    }, [reels.length]);

    const scrollToIndex = useCallback((index: number) => {
        const container = containerRef.current;
        if (!container) return;
        container.scrollTo({ top: index * container.clientHeight, behavior: 'smooth' });
    }, []);

    // ── Search ──
    useEffect(() => {
        if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [isSearchOpen]);

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

    // ── Player controls passed down to active ReelVideo ──
    const handleInteraction = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!hasStarted) {
            unmute();
            try { sharedPlayerRef.current?.playVideo(); } catch (_) { }
            return;
        }
        try {
            if (isMuted) {
                unmute();
            } else {
                if (isPaused) sharedPlayerRef.current?.playVideo();
                else sharedPlayerRef.current?.pauseVideo();
            }
        } catch (_) { }
    }, [hasStarted, isMuted, isPaused, unmute]);

    const handleToggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!iosUnlocked) markIosUnlocked();
        try {
            if (isMuted) {
                unmute();
            } else {
                sharedPlayerRef.current?.mute();
                setIsMuted(true);
                globalMuted = true;
            }
        } catch (_) { }
    }, [isMuted, unmute]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        try {
            const dur = sharedPlayerRef.current?.getDuration?.() ?? 0;
            if (dur > 0) { sharedPlayerRef.current?.seekTo((val / 100) * dur, true); setProgress(val); }
        } catch (_) { }
    }, []);

    const handleSkip = useCallback((e: React.MouseEvent, s: number) => {
        e.stopPropagation();
        try {
            const cur = sharedPlayerRef.current?.getCurrentTime?.() ?? 0;
            const dur = sharedPlayerRef.current?.getDuration?.() ?? 0;
            sharedPlayerRef.current?.seekTo(Math.max(0, Math.min(dur, cur + s)), true);
        } catch (_) { }
    }, []);

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            {/*
             * THE single shared YouTube player mount point.
             * The YouTube SDK replaces this div with an <iframe>.
             * On each activeIndex change, we move it (via DOM appendChild)
             * into playerSlotRef inside the active reel — keeping the iframe
             * alive and trusted by the browser's autoplay policy.
             *
             * Starts hidden off-screen; moved into view by the useEffect above.
             */}
            <div
                id="yt-shared-player"
                style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
            />

            {/* Scroll container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto snap-y snap-mandatory"
                style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        ref={(el) => { itemRefs.current[index] = el; }}
                        className="w-full snap-start snap-always relative"
                        style={{ height: `calc(100vh - ${navHeight}px)`, minHeight: `calc(100vh - ${navHeight}px)` }}
                    >
                        {/* Player slot — the actual iframe gets appended here on activeIndex change */}
                        {index === activeIndex && (
                            <div
                                ref={playerSlotRef}
                                style={{
                                    position: 'absolute', inset: 0,
                                    transform: 'scale(1.35)', transformOrigin: 'center',
                                    overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
                                }}
                            />
                        )}

                        <ReelVideo
                            reel={reel}
                            isActive={index === activeIndex}
                            isMuted={isMuted}
                            isPaused={index === activeIndex ? isPaused : false}
                            isBuffering={index === activeIndex ? isBuffering : false}
                            hasStarted={index === activeIndex ? hasStarted : false}
                            progress={index === activeIndex ? progress : 0}
                            onInteraction={handleInteraction}
                            onToggleMute={handleToggleMute}
                            onSeek={handleSeek}
                            onSkip={handleSkip}
                            onFirstInteraction={() => {
                                if (containerRef.current) containerRef.current.style.overflow = 'auto';
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* BottomNav */}
            <div ref={navRef} className="flex-shrink-0 relative z-50" style={{ background: 'linear-gradient(to top, #000 70%, transparent)' }}>
                <BottomNav />
            </div>

            {/* Search overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 pt-safe-top">
                <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    {isSearchOpen ? (
                        <>
                            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/20">
                                <Search className="text-white/60 w-4 h-4" />
                                <input
                                    ref={searchInputRef} type="text" placeholder="ابحث..."
                                    className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none text-right"
                                    dir="rtl" value={searchQuery}
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
                            <button onClick={closeSearch} className="text-white text-sm px-2">إلغاء</button>
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
                        {suggestions.map((r) => (
                            <button key={r.id} className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/10 transition-colors border-b border-white/5 last:border-0" onClick={() => navigateToReel(r.id)}>
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                    {r.thumbnail_url
                                        ? <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><Search className="text-white/30 w-4 h-4" /></div>
                                    }
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
                /* Make sure YT iframe fills its parent slot */
                #yt-shared-player, #yt-shared-player iframe {
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default HomeReels;