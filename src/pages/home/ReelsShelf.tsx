import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronLeft } from 'lucide-react';
import { fetchReels } from '@/service/supabaseData';

const ReelsShelf = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Add this helper at the top of the file, above the component
    const getYouTubeThumbnail = (videoUrl: string): string => {
        const getVideoId = (url: string): string => {
            if (!url) return '';
            if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0] ?? '';
            if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] ?? '';
            if (url.includes('shorts/')) return url.split('shorts/')[1]?.split('?')[0] ?? '';
            return url.split('/').pop()?.split('?')[0] ?? '';
        };
        const id = getVideoId(videoUrl);
        // hqdefault = high quality, mqdefault = medium, sddefault = standard
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    };

    useEffect(() => {
        fetchReels({ pageSize: 4 })
            .then(({ data }) => {
                setReels((data || []).filter((r: any) => r.status === 'active').slice(0, 4));
            })
            .finally(() => setLoading(false));
    }, []);

    const goToReel = (index: number) => {
        navigate('/home/reels', { state: { startIndex: index } });
    };

    const goToAllReels = () => {
        navigate('/home/reels');
    };

    if (loading) return (
        <section className="px-4">
            <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[9/16] rounded-2xl bg-muted animate-pulse" />
                ))}
            </div>
        </section>
    );

    if (reels.length === 0) return null;

    return (
        <section className="px-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3" dir="rtl">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-primary" />
                    <h2 className="text-base font-bold text-foreground">المحتوى المرئي</h2>
                </div>
                <button
                    onClick={goToAllReels}
                    className="flex items-center gap-1 text-primary text-sm font-medium active:opacity-70 transition-opacity"
                >
                    <span>عرض الكل</span>
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-2" dir="rtl">
                {reels.map((reel, index) => (
                    <button
                        key={reel.id}
                        onClick={() => goToReel(index)}
                        className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black active:scale-95 transition-transform duration-150 shadow-md"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {/* Thumbnail */}
                        {reel.thumbnail_url ? (
                            <img
                                src={reel.thumbnail_url || getYouTubeThumbnail(reel.video_url)}
                                alt={reel.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    // If hqdefault fails, fall back to mqdefault
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('hqdefault')) {
                                        target.src = target.src.replace('hqdefault', 'mqdefault');
                                    }
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                        )}

                        {/* Gradient overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)'
                            }}
                        />

                        {/* Play icon */}
                        <div className="absolute top-2 right-2">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
                            >
                                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                            <p
                                dir="rtl"
                                className="text-white text-xs font-medium line-clamp-2 leading-relaxed drop-shadow-lg"
                            >
                                {reel.title}
                            </p>
                            {reel.author && (
                                <p className="text-white/50 text-[10px] mt-0.5">
                                    @{reel.author}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default ReelsShelf;