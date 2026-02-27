import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Music2, Send, Volume2, VolumeX, Play, Search, X } from 'lucide-react';
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
// Queue pattern so all ReelVideo instances init correctly
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
    // Tracks whether video has been started by a user gesture (needed for iOS)
    const [hasStarted, setHasStarted] = useState(false);

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
                    autoplay: 0,       // 0 so iOS doesn't block it; we call playVideo() on tap
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    loop: 1,
                    playlist: videoId,
                    playsinline: 1,    // required for iOS inline playback
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
                    onError: (e: any) => {
                        console.error('YT error:', e.data, reel.video_url);
                    }
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
        };
    }, [reel.id]);

    // ── Play/pause when active state changes ──
    useEffect(() => {
        if (!playerReady) return;
        if (isActive) {
            // Works on desktop + Android; silently fails on iOS (user must tap)
            playerRef.current?.playVideo();
            loadStats();
            incrementViewCount(reel.id);
        } else {
            playerRef.current?.pauseVideo();
            stopProgressTracking();
            setProgress(0);
            setHasStarted(false);
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
        }, 500);
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

    // Tap logic:
    // - If video hasn't started yet (iOS): first tap starts it + unmutes
    // - Double tap on running video: like
    // - Single tap on running video: pause / resume
    const handleTap = useCallback(() => {
        const now = Date.now();

        // Mark that user has interacted (hides the “tap to start” overlay)
        if (!hasStarted) {
            setHasStarted(true);
        }

        // Double‑tap detection
        if (now - lastTap.current < 300) {
            clearTimeout(tapTimeout.current);
            lastTap.current = 0;
            if (!stats.isLiked) handleToggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 900);
            return;
        }

        lastTap.current = now;
        clearTimeout(tapTimeout.current); // cancel any pending pause toggle

        if (isMuted) {
            // Immediate unmute + play if paused
            playerRef.current?.unMute();
            playerRef.current?.setVolume(100);
            setIsMuted(false);
            if (isPaused) {
                playerRef.current?.playVideo();
                // `isPaused` will be updated by the player's onStateChange event
            }
        } else {
            // Already unmuted – this tap toggles pause after a short delay
            tapTimeout.current = setTimeout(() => {
                if (isPaused) {
                    playerRef.current?.playVideo();
                } else {
                    playerRef.current?.pauseVideo();
                }
            }, 300); // you can reduce this to 200ms for a snappier feel
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

    return (
        <div className="relative h-screen w-full snap-start bg-black flex items-center justify-center overflow-hidden">

            {/* YouTube player target div */}
            <div
                id={divId}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scale(1.5)', transformOrigin: 'center center', pointerEvents: 'none' }}
            />

            {/* Thumbnail while player loads */}
            {!playerReady && reel.thumbnail_url && (
                <img
                    src={reel.thumbnail_url}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm z-10"
                    alt=""
                />
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none z-20" />

            {/* Full-screen tap layer */}
            <div className="absolute inset-0 z-30 cursor-pointer" onClick={handleTap} />

            {/* iOS: tap-to-start overlay */}
            {playerReady && !hasStarted && isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40 gap-3">
                    <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border-2 border-white/40">
                        <Play className="text-white w-10 h-10 fill-white ml-1" />
                    </div>
                    <span className="text-white/80 text-sm bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full">
                        اضغط للتشغيل
                    </span>
                </div>
            )}

            {/* Pause indicator */}
            {hasStarted && isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="text-white w-8 h-8 fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Heart animation */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <Heart className="text-white fill-white w-24 h-24 opacity-90 animate-ping" />
                </div>
            )}

            {/* Mute button */}
            <button
                className="absolute top-6 right-4 z-40 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                onClick={handleToggleMute}
            >
                {isMuted ? <VolumeX className="text-white w-5 h-5" /> : <Volume2 className="text-white w-5 h-5" />}
            </button>

            {/* "Tap for sound" hint shown while muted after starting */}
            {isMuted && hasStarted && isActive && (
                <div className="absolute top-6 right-16 z-40 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 pointer-events-none">
                    <span className="text-white text-xs">اضغط للصوت</span>
                </div>
            )}

            {/* Action Sidebar */}
            <div className="absolute right-4 bottom-[200px] flex flex-col gap-6 z-40">
                <div className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
                        <Heart className={cn('w-6 h-6 transition-colors', stats.isLiked ? 'fill-red-500 text-red-500' : 'text-white fill-transparent')} />
                    </div>
                    <span className="text-white text-xs font-bold">{stats.likes.toLocaleString()}</span>
                </div>

                <div className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); loadComments(); }}>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-bold">{stats.comments.toLocaleString()}</span>
                </div>

                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer">
                    <Share2 className="text-white w-5 h-5" />
                </div>
            </div>

            {/* Text info */}
            <div className="absolute left-4 right-20 bottom-[155px] pointer-events-none text-right z-40" dir="rtl">
                <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">@{reel.author || 'اتحاد الطلاب'}</h3>
                <p className="text-white/90 text-sm line-clamp-2 mb-3 leading-relaxed">{reel.title}</p>
                {/* <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
                        <Music2 className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-white text-[10px]">الصوت الأصلي - اتحاد الطلاب اليمنيين</span>
                    </div>
                </div> */}
            </div>

            {/* Progress bar + skip — only after video starts */}
            {/* bottom-[168px] = safe above BottomNav (~80px) + action sidebar gap */}
            {hasStarted && (
                <div className="absolute bottom-[140px] left-0 right-0 z-40 px-4">
                    <div className="flex items-center gap-3">
                        <button
                            className="text-white/80 text-xs font-bold bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                            onClick={(e) => handleSkip(e, 10)}
                        >+10</button>

                        <div className="relative flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                            <input
                                type="range" min={0} max={100} step={0.1} value={progress}
                                onChange={handleSeek}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                        </div>
                        <button
                            className="text-white/80 text-xs font-bold bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                            onClick={(e) => handleSkip(e, -10)}
                        >-10</button>

                    </div>
                </div>
            )}

            {/* Comments Drawer */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
                    <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[70vh] fixed bottom-0 left-0 right-0 z-[101] outline-none">
                        <div className="p-4 bg-white rounded-t-[20px] flex-1 flex flex-col">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />
                            <div className="flex items-center justify-between mb-4" dir="rtl">
                                <h2 className="text-lg font-bold text-gray-900">التعليقات ({stats.comments})</h2>
                                <button onClick={() => setIsCommentsOpen(false)} className="text-gray-400 text-xl">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4" dir="rtl">
                                {comments.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">لا توجد تعليقات بعد. كن أول من يعلق!</div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                {comment.profiles?.avatar_url
                                                    ? <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">{comment.profiles?.full_name?.charAt(0) || '؟'}</div>
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-gray-900">{comment.profiles?.full_name || 'مستخدم'}</div>
                                                <div className="text-sm text-gray-700 mt-0.5">{comment.content}</div>
                                                <div className="text-[10px] text-gray-400 mt-1">{new Date(comment.created_at).toLocaleDateString('ar')}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex items-center gap-2 border-t pt-4" dir="rtl">
                                <input
                                    type="text"
                                    placeholder="أضف تعليقاً..."
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="w-10 h-10 rounded-full bg-[#8B1A2A] text-white flex items-center justify-center disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
};

// ─────────────────────────────────────────────
// HomeReels — main page with TikTok-style search
// ─────────────────────────────────────────────
const HomeReels = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Search state
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

    // ── Live suggestions as user types ──
    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) { setSuggestions([]); setShowSuggestions(false); return; }

        // Deduplicate by title+author, limit to 6 suggestions
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

    const handleScroll = () => {
        if (!containerRef.current) return;
        const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
        if (index !== activeIndex) setActiveIndex(index);
    };

    // ── Navigate directly to a reel by scrolling to its index ──
    const navigateToReel = (reelId: string) => {
        const index = reels.findIndex(r => r.id === reelId);
        if (index === -1) return;
        setActiveIndex(index);
        containerRef.current?.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
        closeSearch();
    };

    // ── Handle pressing search / Enter ──
    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        // Navigate to first matching result
        const first = suggestions[0];
        if (first) navigateToReel(first.id);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Highlight matching part of text
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
        </div>
    );

    return (
        <div className="h-screen w-full bg-black overflow-hidden relative">

            {/* ── Search UI ── */}
            <div className="absolute top-0 left-0 right-0 z-50">

                {/* Search bar row */}
                <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                    {isSearchOpen ? (
                        <>
                            {/* Input */}
                            <div className="flex-1 flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2.5 border border-white/20">
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
                            {/* Cancel button */}
                            <button
                                onClick={closeSearch}
                                className="text-white/70 text-sm whitespace-nowrap flex-shrink-0"
                            >
                                إلغاء
                            </button>
                        </>
                    ) : (
                        /* Collapsed — just icon button in corner */
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20"
                            >
                                <Search className="text-white w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Suggestions dropdown ── */}
                {isSearchOpen && showSuggestions && suggestions.length > 0 && (
                    <div className="mx-4 rounded-2xl overflow-hidden bg-black/80 backdrop-blur-xl border border-white/10">
                        {suggestions.map((reel, i) => (
                            <button
                                key={reel.id}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-right active:bg-white/10 transition-colors",
                                    i < suggestions.length - 1 && "border-b border-white/10"
                                )}
                                onClick={() => navigateToReel(reel.id)}
                            >
                                {/* Thumbnail */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                    {reel.thumbnail_url
                                        ? <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center">
                                            <Search className="text-white/30 w-4 h-4" />
                                        </div>
                                    }
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0" dir="rtl">
                                    <div className="text-white/90 text-sm truncate">
                                        {highlightMatch(reel.title || '', searchQuery)}
                                    </div>
                                    <div className="text-white/40 text-xs mt-0.5">
                                        @{highlightMatch(reel.author || 'اتحاد الطلاب', searchQuery)}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <Search className="text-white/20 w-4 h-4 flex-shrink-0 rotate-0" />
                            </button>
                        ))}

                        {/* "Show all results" footer if more than shown */}
                        {reels.filter(r =>
                            r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.author?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length > 6 && (
                                <button
                                    className="w-full py-3 text-center text-white/50 text-xs border-t border-white/10 active:bg-white/5"
                                    onClick={handleSearchSubmit}
                                >
                                    عرض جميع النتائج
                                </button>
                            )}
                    </div>
                )}

                {/* No results message */}
                {isSearchOpen && searchQuery.trim() && suggestions.length === 0 && (
                    <div className="mx-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 py-6 text-center">
                        <p className="text-white/50 text-sm">لا توجد نتائج لـ "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* ── Scroll container (always shows all reels) ── */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
            >
                {reels.map((reel, index) => (
                    <ReelVideo key={reel.id} reel={reel} isActive={index === activeIndex} />
                ))}
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black to-transparent">
                <BottomNav />
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default HomeReels;