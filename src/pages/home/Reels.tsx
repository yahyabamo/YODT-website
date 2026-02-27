import { useState, useEffect, useRef, useCallback } from 'react';
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

// iOS blocks autoplay until the first user gesture.
// After the first tap, iosUnlocked = true and all
// subsequent scrolls auto-play without needing another tap.
let iosUnlocked = false;
const pendingPlayers: (() => void)[] = [];

const markIosUnlocked = () => {
    if (iosUnlocked) return;
    iosUnlocked = true;
    pendingPlayers.forEach(fn => fn());
    pendingPlayers.length = 0;
};

const playWhenUnlocked = (playFn: () => void) => {
    if (iosUnlocked) { playFn(); return; }
    pendingPlayers.push(playFn);
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
    const [hasStarted, setHasStarted] = useState(false);

    const playerRef = useRef<any>(null);
    const progressInterval = useRef<any>(null);
    const lastTap = useRef(0);
    const tapTimeout = useRef<any>(null);
    const divId = `yt-${reel.id}`;
    const videoId = getVideoId(reel.video_url);

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
                },
                events: {
                    onReady: () => { if (!destroyed) setPlayerReady(true); },
                    onStateChange: (e: any) => {
                        if (destroyed) return;
                        const S = (window as any).YT?.PlayerState;
                        if (!S) return;
                        if (e.data === S.PLAYING) {
                            setIsPaused(false);
                            setHasStarted(true);
                            startProgress();
                        } else if (e.data === S.PAUSED) {
                            setIsPaused(true);
                            stopProgress();
                        } else if (e.data === S.ENDED) {
                            playerRef.current?.seekTo(0);
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
            try { playerRef.current?.destroy(); } catch (_) { }
            playerRef.current = null;
            setPlayerReady(false);
            setHasStarted(false);
        };
    }, [reel.id]);

    // ── Activate / deactivate ──
    useEffect(() => {
        if (!playerReady) return;
        if (isActive) {
            loadStats();
            incrementViewCount(reel.id);
            // Works immediately on desktop + Android.
            // On iOS silently fails until user taps once (see playWhenUnlocked below).
            playerRef.current?.playVideo();
            // Queue for iOS unlock
            playWhenUnlocked(() => { if (playerRef.current) playerRef.current.playVideo(); });
        } else {
            playerRef.current?.pauseVideo();
            stopProgress();
            setProgress(0);
            setHasStarted(false);
            setIsMuted(true);
        }
    }, [isActive, playerReady]);

    const startProgress = () => {
        stopProgress();
        progressInterval.current = setInterval(() => {
            const cur = playerRef.current?.getCurrentTime?.() ?? 0;
            const dur = playerRef.current?.getDuration?.() ?? 1;
            if (dur > 0) setProgress((cur / dur) * 100);
        }, 250);
    };
    const stopProgress = () => { clearInterval(progressInterval.current); progressInterval.current = null; };

    const loadStats = async () => {
        try { setStats(await fetchReelStats(reel.id, user?.id)); } catch (_) { }
    };
    const loadComments = async () => {
        try { setComments(await fetchComments(reel.id)); } catch (_) { }
    };

    const handleToggleLike = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للإعجاب'); return; }
        try {
            const { liked } = await toggleLike(reel.id, user.id);
            setStats(p => ({ ...p, likes: liked ? p.likes + 1 : p.likes - 1, isLiked: liked }));
        } catch { toast.error('فشل تحديث الإعجاب'); }
    };

    const handleTap = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const now = Date.now();

        // iOS first tap: unlock globally + start this video
        if (!hasStarted) {
            markIosUnlocked();
            playerRef.current?.playVideo();
            setHasStarted(true);
            return;
        }

        // Double tap → like
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

        if (isMuted) {
            playerRef.current?.unMute();
            playerRef.current?.setVolume(100);
            setIsMuted(false);
            if (isPaused) playerRef.current?.playVideo();
        } else {
            tapTimeout.current = setTimeout(() => {
                isPaused ? playerRef.current?.playVideo() : playerRef.current?.pauseVideo();
            }, 300);
        }
    }, [hasStarted, isMuted, isPaused, stats.isLiked, handleToggleLike]);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMuted) { playerRef.current?.unMute(); playerRef.current?.setVolume(100); setIsMuted(false); }
        else { playerRef.current?.mute(); setIsMuted(true); }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        const dur = playerRef.current?.getDuration?.() ?? 0;
        if (dur > 0) playerRef.current?.seekTo((val / 100) * dur, true);
        setProgress(val);
    };

    const skip = (e: React.MouseEvent, s: number) => {
        e.stopPropagation();
        playerRef.current?.seekTo((playerRef.current?.getCurrentTime?.() ?? 0) + s, true);
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
        <div className="relative w-full h-full bg-black overflow-hidden">

            {/* YouTube iframe — scale removes YT letterbox bars */}
            <div
                id={divId}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: 'scale(1.5)', transformOrigin: 'center' }}
            />

            {/* Thumbnail while player loads */}
            {!playerReady && reel.thumbnail_url && (
                <img src={reel.thumbnail_url} className="absolute inset-0 w-full h-full object-cover z-10" alt="" />
            )}

            {/* Gradient: dark top + heavy dark bottom */}
            <div className="absolute inset-0 pointer-events-none z-20"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.85) 100%)' }} />

            {/* Full-area tap layer */}
            <div className="absolute inset-0 z-30" onClick={handleTap} />

            {/* Tap-to-start (iOS) */}
            {playerReady && isActive && !hasStarted && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 65%)' }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.35)' }}>
                        <Play className="text-white w-10 h-10 fill-white ml-1" />
                    </div>
                    <span className="text-white text-sm font-medium"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', borderRadius: 999, padding: '7px 18px' }}>
                        اضغط للتشغيل
                    </span>
                </div>
            )}

            {/* Pause indicator */}
            {hasStarted && isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                        <Play className="text-white w-8 h-8 fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Heart pop */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <Heart className="text-white fill-white" style={{ width: 88, height: 88, animation: 'heartPop 0.8s ease-out forwards' }} />
                </div>
            )}

            {/* Mute button (top-right) */}
            <button
                className="absolute z-40 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ top: 14, right: 14, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}
                onClick={toggleMute}
            >
                {isMuted ? <VolumeX className="text-white w-5 h-5" /> : <Volume2 className="text-white w-5 h-5" />}
            </button>

            {/* Action sidebar */}
            <div className="absolute right-3 z-40 flex flex-col items-center gap-5" style={{ bottom: 155 }}>
                <button className="flex flex-col items-center gap-1"
                    onClick={e => { e.stopPropagation(); handleToggleLike(); }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)' }}>
                        <Heart className={cn('w-6 h-6 transition-all', stats.isLiked ? 'fill-red-500 text-red-500' : 'text-white fill-transparent')} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow">{stats.likes.toLocaleString()}</span>
                </button>

                <button className="flex flex-col items-center gap-1"
                    onClick={e => { e.stopPropagation(); setIsCommentsOpen(true); loadComments(); }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)' }}>
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow">{stats.comments.toLocaleString()}</span>
                </button>

                {/* <button className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)' }}>
                        <Share2 className="text-white w-5 h-5" />
                    </div>
                </button> */}
            </div>

            {/* ── Bottom info block: progress bar + author + title ── */}
            {/* Sits at bottom: 14px from cell bottom edge (above BottomNav since cell = screen - nav) */}
            <div
                className="absolute left-0 right-0 z-40 px-4"
                style={{ bottom: 14 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Progress bar — shown only once playing */}
                {hasStarted && (
                    <div className="flex items-center gap-2 mb-3">


                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}
                            onClick={e => skip(e, 10)}
                        >+10</button>

                        <div className="relative flex-1 flex items-center" style={{ height: 28 }}>
                            <div className="absolute left-0 right-0 rounded-full overflow-hidden"
                                style={{ height: 3, background: 'rgba(255,255,255,0.3)' }}>
                                <div className="h-full rounded-full bg-white"
                                    style={{ width: `${progress}%`, transition: 'width 0.25s linear' }} />
                            </div>
                            <input type="range" min={0} max={100} step={0.1} value={progress}
                                onChange={handleSeek}
                                onClick={e => e.stopPropagation()}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>

                        <button
                            className="text-white text-xs font-semibold flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}
                            onClick={e => skip(e, -10)}
                        >−10</button>
                    </div>
                )}

                {/* Author + title */}
                <div dir="rtl" className="pointer-events-none" style={{ paddingLeft: 110 }}>
                    <p className="text-white font-bold text-sm mb-0.5 drop-shadow">
                        @{reel.author || 'اتحاد الطلاب'}
                    </p>
                    <p className="text-white/80 text-xs line-clamp-2 leading-relaxed drop-shadow">
                        {reel.title}
                    </p>
                </div>
            </div>

            {/* Comments Drawer */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
                    <Drawer.Content className="flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none"
                        style={{ borderRadius: '20px 20px 0 0', background: '#111', height: '70vh' }}>
                        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>
                        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0 border-b border-white/10" dir="rtl">
                            <h2 className="text-white font-bold text-base">التعليقات ({stats.comments})</h2>
                            <button onClick={() => setIsCommentsOpen(false)}><X className="text-white/50 w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" dir="rtl">
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-white/40 text-sm gap-2">
                                    <MessageCircle className="w-8 h-8 opacity-30" />
                                    <span>كن أول من يعلق!</span>
                                </div>
                            ) : comments.map(c => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                                        {c.profiles?.avatar_url
                                            ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-xs text-white/60 font-bold">{c.profiles?.full_name?.charAt(0) || '؟'}</div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white/80">{c.profiles?.full_name || 'مستخدم'}</div>
                                        <div className="text-sm text-white/90 mt-0.5 leading-relaxed">{c.content}</div>
                                        <div className="text-[10px] text-white/30 mt-1">{new Date(c.created_at).toLocaleDateString('ar')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 flex-shrink-0"
                            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }} dir="rtl">
                            <input type="text" placeholder="أضف تعليقاً..."
                                className="flex-1 text-sm text-white placeholder-white/30 outline-none"
                                style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)' }}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                            <button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-90 transition-all"
                                style={{ background: '#8B1A2A' }}>
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            <style>{`@keyframes heartPop{0%{transform:scale(.5);opacity:1}50%{transform:scale(1.4);opacity:1}100%{transform:scale(1);opacity:0}}`}</style>
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
    const [navHeight, setNavHeight] = useState(64);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Measure the actual rendered BottomNav height
    useEffect(() => {
        if (!navRef.current) return;
        const h = navRef.current.getBoundingClientRect().height;
        if (h > 0) setNavHeight(h);
    }, [loading]);

    useEffect(() => { loadReels(); }, []);

    useEffect(() => {
        if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [isSearchOpen]);

    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) { setSuggestions([]); return; }
        const seen = new Set<string>();
        setSuggestions(reels.filter(r => {
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
        } catch { toast.error('حدث خطأ في تحميل الريلز'); }
        finally { setLoading(false); }
    };

    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const idx = Math.round(el.scrollTop / el.clientHeight);
        if (idx !== activeIndex) setActiveIndex(idx);
    }, [activeIndex]);

    const navigateToReel = (id: string) => {
        const idx = reels.findIndex(r => r.id === id);
        if (idx === -1) return;
        setActiveIndex(idx);
        const el = containerRef.current;
        if (el) el.scrollTo({ top: idx * el.clientHeight, behavior: 'smooth' });
        closeSearch();
    };

    const closeSearch = () => { setIsSearchOpen(false); setSearchQuery(''); setSuggestions([]); };

    const highlight = (text: string, q: string) => {
        if (!q || !text) return <span>{text}</span>;
        const i = text.toLowerCase().indexOf(q.toLowerCase());
        if (i === -1) return <span>{text}</span>;
        return <span>{text.slice(0, i)}<span className="text-white font-bold">{text.slice(i, i + q.length)}</span>{text.slice(i + q.length)}</span>;
    };

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 10 }}>

            {/* Scroll container */}
            {/* Each cell = full screen minus nav — so progress bar at bottom: 14px always clears */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-scroll"
                style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as any}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        style={{
                            height: `calc(100dvh - ${navHeight}px)`,
                            scrollSnapAlign: 'start',
                            scrollSnapStop: 'always',
                        }}
                    >
                        <ReelVideo reel={reel} isActive={index === activeIndex} />
                    </div>
                ))}
            </div>

            {/* BottomNav — sits below the scroll area, measured for offset */}
            <div ref={navRef} className="flex-shrink-0 relative z-50"
                style={{ background: 'linear-gradient(to top, #000 60%, transparent)' }}>
                <BottomNav />
            </div>

            {/* Floating search bar */}
            <div className="absolute left-0 right-0 z-50"
                style={{ top: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    {isSearchOpen ? (
                        <>
                            <div className="flex-1 flex items-center gap-2"
                                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', borderRadius: 999, padding: '9px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                                <Search className="text-white/50 w-4 h-4 flex-shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="ابحث عن فيديو أو مستخدم..."
                                    className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none text-right"
                                    dir="rtl"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') navigateToReel(suggestions[0]?.id); if (e.key === 'Escape') closeSearch(); }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
                                        <X className="text-white/40 w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button onClick={closeSearch} className="text-white/70 text-sm whitespace-nowrap flex-shrink-0">إلغاء</button>
                        </>
                    ) : (
                        <div className="flex-1 flex justify-end">
                            <button onClick={() => setIsSearchOpen(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <Search className="text-white w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isSearchOpen && suggestions.length > 0 && (
                    <div className="mx-4 overflow-hidden"
                        style={{ borderRadius: 16, background: 'rgba(18,18,18,0.93)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {suggestions.map((r, i) => (
                            <button key={r.id}
                                className="w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/5"
                                style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
                                onClick={() => navigateToReel(r.id)}>
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                                    {r.thumbnail_url
                                        ? <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><Search className="text-white/30 w-4 h-4" /></div>}
                                </div>
                                <div className="flex-1 min-w-0" dir="rtl">
                                    <div className="text-white/90 text-sm truncate">{highlight(r.title || '', searchQuery)}</div>
                                    <div className="text-white/40 text-xs mt-0.5">@{highlight(r.author || '', searchQuery)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {isSearchOpen && searchQuery.trim() && suggestions.length === 0 && (
                    <div className="mx-4 py-5 text-center"
                        style={{ borderRadius: 16, background: 'rgba(18,18,18,0.93)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-white/40 text-sm">لا توجد نتائج لـ "{searchQuery}"</p>
                    </div>
                )}
            </div>

            <style>{`*{-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}`}</style>
        </div>
    );
};

export default HomeReels;