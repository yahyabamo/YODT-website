import { useState } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Clock, Eye, Heart } from 'lucide-react';

const videosData = [
  {
    id: '1',
    title: 'كيف تستفيد من عضوية الاتحاد؟',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    duration: '3:45',
    views: 1250,
    category: 'تعليمي',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '2',
    title: 'قصة نجاح: من طالب لرائد أعمال',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    duration: '5:20',
    views: 890,
    category: 'تحفيزي',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '3',
    title: 'نصائح للدراسة في تركيا',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
    duration: '4:15',
    views: 2100,
    category: 'تعليمي',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '4',
    title: 'لحظات من فعالياتنا',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    duration: '2:30',
    views: 650,
    category: 'فعاليات',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '5',
    title: 'مهارات المقابلة الوظيفية',
    thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
    duration: '6:10',
    views: 1800,
    category: 'تعليمي',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '6',
    title: 'رسالة من رئيس الاتحاد',
    thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    duration: '2:00',
    views: 3200,
    category: 'تحفيزي',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
];

const categories = ['الكل', 'تعليمي', 'تحفيزي', 'فعاليات'];

const Videos = () => {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredVideos = selectedCategory === 'الكل' 
    ? videosData 
    : videosData.filter(v => v.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="الفيديوهات والريلز" showBack />
      
      <div className="px-4 py-4">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Video Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="border-0 shadow-soft overflow-hidden">
              <div className="relative">
                {playingVideo === video.id ? (
                  <div className="aspect-video">
                    <iframe
                      src={video.videoUrl + '?autoplay=1'}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div 
                    className="relative aspect-video cursor-pointer group"
                    onClick={() => setPlayingVideo(video.id)}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-primary fill-primary mr-[-2px]" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 rounded-full text-primary-foreground text-xs">
                      {video.category}
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-foreground mb-2">{video.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views.toLocaleString('ar-EG')}
                  </span>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    أعجبني
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Videos;
