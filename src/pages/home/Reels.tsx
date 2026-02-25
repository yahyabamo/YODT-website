import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Music2, Send, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Drawer } from 'vaul';
import {
    fetchReels, toggleLike, addComment,
    fetchComments, incrementViewCount, fetchReelStats
} from '@/service/supabaseData';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Load YouTube IFrame API once
let ytApiLoaded = false;
const loadYouTubeAPI = () => {
    if (ytApiLoaded || (window as any).YT?.Player) return;
    ytApiLoaded = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
};

const getVideoId = (url: string) => {
    if (!url) return '';
    if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
    return url.split('/').pop()?.split('?')[0] || '';
};

const ReelVideo = ({ reel, isActive }: { reel: any; isActive: boolean }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ likes: 0, comments: 0, isLiked: false });
    const [showHeart, setShowHeart] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0); // 0–100
    const [duration, setDuration] = useState(0);
    const [playerReady, setPlayerReady] = useState(false);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<any>(null);
    const lastTap = useRef<number>(0);
    const divId = `yt-player-${reel.id}`;
    const tapTimeout = useRef<any>(null);



    // Load API on mount
    useEffect(() => { loadYouTubeAPI(); }, []);

    // Init player once YT API is ready
    useEffect(() => {
        const initPlayer = () => {
            if (!(window as any).YT?.Player) return;
            if (playerRef.current) return; // already initialized

            playerRef.current = new (window as any).YT.Player(divId, {
                videoId: getVideoId(reel.video_url),
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    loop: 1,
                    playlist: getVideoId(reel.video_url),
                    playsinline: 1,
                },
                events: {
                    onReady: (e: any) => {
                        e.target.unMute();       // ✅ unmute on ready
                        e.target.setVolume(100);
                        setDuration(e.target.getDuration());
                        setPlayerReady(true);
                    },
                    onStateChange: (e: any) => {
                        const YT = (window as any).YT.PlayerState;
                        if (e.data === YT.PLAYING) {
                            setIsPaused(false);
                            startProgressTracking();
                        } else if (e.data === YT.PAUSED) {
                            setIsPaused(true);
                            stopProgressTracking();
                        } else if (e.data === YT.ENDED) {
                            playerRef.current?.playVideo();
                        }
                    }
                }
            });
        };

        // YT API might already be ready, or we wait for callback
        if ((window as any).YT?.Player) {
            initPlayer();
        } else {
            (window as any).onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            stopProgressTracking();
            playerRef.current?.destroy();
            playerRef.current = null;
        };
    }, [reel.id]);

    // Play/pause based on isActive
    useEffect(() => {
        if (!playerReady) return;
        if (isActive) {
            playerRef.current?.playVideo();
            loadStats();
            incrementViewCount(reel.id);
        } else {
            playerRef.current?.pauseVideo();
            stopProgressTracking();
        }
    }, [isActive, playerReady]);

    const startProgressTracking = () => {
        stopProgressTracking();
        progressInterval.current = setInterval(() => {
            if (!playerRef.current) return;
            const current = playerRef.current.getCurrentTime?.() || 0;
            const dur = playerRef.current.getDuration?.() || 1;
            setProgress((current / dur) * 100);
        }, 500);
    };

    const stopProgressTracking = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
    };

    const loadStats = async () => {
        const data = await fetchReelStats(reel.id, user?.id);
        setStats(data);
    };

    const loadComments = async () => {
        const data = await fetchComments(reel.id);
        setComments(data);
    };

    const handleToggleLike = async () => {
        if (!user) { toast.error('يرجى تسجيل الدخول للإعجاب بالفيديو'); return; }
        try {
            const { liked } = await toggleLike(reel.id, user.id);
            setStats(prev => ({ ...prev, likes: liked ? prev.likes + 1 : prev.likes - 1, isLiked: liked }));
        } catch { toast.error('فشل في تحديث الإعجاب'); }
    };

    const handleTap = () => {
        const now = Date.now();

        if (now - lastTap.current < 300) {
            // Double tap detected — cancel the single tap action
            clearTimeout(tapTimeout.current);
            lastTap.current = 0;
            if (!stats.isLiked) handleToggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 1000);
        } else {
            // Wait to see if a second tap comes
            lastTap.current = now;
            tapTimeout.current = setTimeout(() => {
                // Only fires if no second tap within 300ms
                if (isPaused) {
                    playerRef.current?.playVideo();
                } else {
                    playerRef.current?.pauseVideo();
                }
            }, 300);
        }
    };

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
        const val = parseFloat(e.target.value); // 0–100
        const dur = playerRef.current?.getDuration?.() || 0;
        playerRef.current?.seekTo((val / 100) * dur, true);
        setProgress(val);
    };

    const handleSkip = (e: React.MouseEvent, seconds: number) => {
        e.stopPropagation();
        const current = playerRef.current?.getCurrentTime?.() || 0;
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

            {/* ✅ YouTube IFrame API target div */}
            <div
                id={divId}
                ref={containerRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}
            />

            {/* Thumbnail while loading */}
            {!playerReady && (
                <img
                    src={reel.thumbnail_url}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm z-10"
                    alt=""
                />
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none z-20" />

            {/* Tap Layer */}
            <div className="absolute inset-0 z-30 cursor-pointer" onClick={handleTap} />

            {/* Heart Animation */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <Heart className="text-white fill-white w-24 h-24 opacity-80 animate-ping" />
                </div>
            )}

            {/* Pause Indicator */}
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
                        <Play className="text-white w-8 h-8 fill-white" />
                    </div>
                </div>
            )}

            {/* Mute Button — top right */}
            <button
                className="absolute top-6 right-4 z-40 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                onClick={handleToggleMute}
            >
                {isMuted ? <VolumeX className="text-white w-5 h-5" /> : <Volume2 className="text-white w-5 h-5" />}
            </button>

            {/* Action Sidebar */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-40">
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

            {/* Text Info */}
            <div className="absolute left-4 right-16 bottom-24 pointer-events-none text-right z-40" dir="rtl">
                <h3 className="text-white font-bold text-lg mb-2 drop-shadow-lg">@{reel.author || 'اتحاد الطلاب'}</h3>
                <p className="text-white/90 text-sm line-clamp-2 mb-4 leading-relaxed">{reel.title}</p>
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
                        <Music2 className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-white text-[10px]">الصوت الأصلي - اتحاد الطلاب اليمنيين</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar + Skip buttons */}
            {/* Progress Bar + Skip buttons */}
            <div className="absolute bottom-[130px] left-0 right-0 z-40 px-4">
                <div className="flex items-center gap-3">
                    <button
                        className="text-white/80 text-xs font-bold bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                        onClick={(e) => handleSkip(e, -10)}
                    >-10</button>

                    <div className="relative flex-1 h-2 bg-white/30 rounded-full">
                        <div
                            className="absolute left-0 top-0 h-full bg-white rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={0.1}
                            value={progress}
                            onChange={handleSeek}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            style={{ height: '100%' }}
                        />
                    </div>

                    <button
                        className="text-white/80 text-xs font-bold bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                        onClick={(e) => handleSkip(e, 10)}
                    >+10</button>
                </div>
            </div>

            {/* Comments Drawer */}
            <Drawer.Root open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
                    <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[70vh] fixed bottom-0 left-0 right-0 z-[101] outline-none">
                        <div className="p-4 bg-white rounded-t-[20px] flex-1 flex flex-col">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                            <div className="flex items-center justify-between mb-4" dir="rtl">
                                <h2 className="text-lg font-bold text-gray-900">التعليقات ({stats.comments})</h2>
                                <button onClick={() => setIsCommentsOpen(false)} className="text-gray-400">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4" dir="rtl">
                                {comments.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">لا توجد تعليقات بعد. كن أول من يعلق!</div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                {comment.profiles?.avatar_url ? (
                                                    <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                                                        {comment.profiles?.full_name?.charAt(0) || '؟'}
                                                    </div>
                                                )}
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

// --- Main Page (unchanged) ---
const HomeReels = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadReels(); }, []);

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

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
        </div>
    );

    return (
        <div className="h-screen w-full bg-black overflow-hidden relative">
            <div ref={containerRef} onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
                {reels.map((reel, index) => (
                    <ReelVideo key={reel.id} reel={reel} isActive={index === activeIndex} />
                ))}
            </div>
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