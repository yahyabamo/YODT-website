import { useState, useEffect } from 'react';
import { Play, MapPin, Heart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface YemenContent {
  video: { id: string; title: string; thumbnail: string };
  phrase: string;
  occasion?: { title: string; date: string };
}

const yemenContents: YemenContent[] = [
  {
    video: { id: 'dQw4w9WgXcQ', title: 'صنعاء القديمة', thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
    phrase: 'اليمن السعيد... أرض الحضارات والتاريخ 🇾🇪',
    occasion: { title: 'يوم الوحدة اليمنية', date: '22 مايو' }
  },
  {
    video: { id: 'dQw4w9WgXcQ', title: 'جزيرة سقطرى', thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400' },
    phrase: 'من اليمن خرج أعظم التجار والبحارة',
  },
  {
    video: { id: 'dQw4w9WgXcQ', title: 'باب اليمن', thumbnail: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400' },
    phrase: 'الإيمان يمان والحكمة يمانية',
  },
  {
    video: { id: 'dQw4w9WgXcQ', title: 'شبام حضرموت', thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400' },
    phrase: 'اليمنيون أصحاب همة وعزيمة لا تُقهر',
  },
  {
    video: { id: 'dQw4w9WgXcQ', title: 'تعز الحالمة', thumbnail: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400' },
    phrase: 'في الغربة نكبر، وللوطن نعود',
  },
];

export const YemenIdentity = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<YemenContent>(yemenContents[0]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const contentIndex = dayOfYear % yemenContents.length;
    setContent(yemenContents[contentIndex]);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 via-white/5 to-green-500/10 p-4 border border-border/50">
      {/* Yemen Flag Colors Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-white to-green-600 opacity-50" />

      <div className="flex items-start gap-4">
        {/* Video Thumbnail */}
        <div
          onClick={() => navigate('/yemen-reels')}
          className="relative w-20 h-28 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0"
        >
          <img
            src={content.video.thumbnail}
            alt={content.video.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
              <Play className="w-3 h-3 text-white fill-white mr-[-1px]" />
            </div>
          </div>
          <div className="absolute bottom-1 left-1 right-1">
            <p className="text-white text-[10px] font-medium truncate">{content.video.title}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🇾🇪</span>
            <span className="text-sm font-bold text-foreground">من اليمن</span>
          </div>

          <p className="text-foreground font-medium text-sm leading-relaxed mb-3">
            {content.phrase}
          </p>

          {content.occasion && (
            <div className="flex items-center gap-2 text-xs bg-amber-100/50 text-amber-700 px-2 py-1 rounded-full w-fit">
              <Heart className="w-3 h-3" />
              <span>{content.occasion.title} • {content.occasion.date}</span>
            </div>
          )}

          <button
            onClick={() => navigate('/yemen-reels')}
            className="mt-2 flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            استكشف المزيد
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
