import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Heart, Share2, Bookmark, Search, X, Eye, Clock,
  BookOpen, Landmark, GraduationCap, Camera, Users, Plane,
  MessageCircle, TrendingUp, Filter, Grid, List
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnail: string;
  youtubeId: string;
  duration?: string;
  location?: string;
  views: number;
  likes: number;
  comments: number;
  isNew?: boolean;
  isTrending?: boolean;
}

const contentData: ContentItem[] = [
  {
    id: '1',
    title: 'تلاوة خاشعة من سورة الرحمن',
    description: 'تلاوة مؤثرة للقارئ عبدالباسط عبدالصمد',
    category: 'إيماني',
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '8:45',
    views: 452000,
    likes: 32000,
    comments: 1560,
    isTrending: true
  },
  {
    id: '2',
    title: 'دعاء الصباح بصوت جميل',
    description: 'أذكار وأدعية الصباح للبركة في يومك',
    category: 'إيماني',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '5:30',
    views: 321000,
    likes: 28000,
    comments: 980,
    isNew: true
  },
  {
    id: '3',
    title: 'الحضارة الإسلامية في الأندلس',
    description: 'رحلة في تاريخ العمارة الإسلامية العريقة',
    category: 'ثقافي',
    thumbnail: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '15:20',
    location: 'غرناطة',
    views: 284000,
    likes: 19000,
    comments: 670
  },
  {
    id: '4',
    title: 'فن الخط العربي',
    description: 'تعلم أساسيات الخط العربي مع الفنان أحمد',
    category: 'ثقافي',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '12:00',
    views: 193000,
    likes: 14000,
    comments: 450,
    isNew: true
  },
  {
    id: '5',
    title: 'رقصة البرع اليمنية',
    description: 'من التراث اليمني الأصيل في حضرموت',
    category: 'تراثي',
    thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '6:15',
    location: 'حضرموت',
    views: 187500,
    likes: 16800,
    comments: 423,
    isTrending: true
  },
  {
    id: '6',
    title: 'صناعة العسل الدواني',
    description: 'أجود أنواع العسل اليمني من وادي دوعن',
    category: 'تراثي',
    thumbnail: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '10:30',
    location: 'وادي دوعن',
    views: 152000,
    likes: 11000,
    comments: 340
  },
  {
    id: '7',
    title: 'تعلم أحكام التجويد',
    description: 'الدرس الأول: المدود وأنواعها',
    category: 'تعليمي',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '20:00',
    views: 678000,
    likes: 45000,
    comments: 2340,
    isTrending: true
  },
  {
    id: '8',
    title: 'اللغة التركية للمبتدئين',
    description: 'المحادثات اليومية الأساسية',
    category: 'تعليمي',
    thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '18:45',
    views: 423000,
    likes: 31000,
    comments: 1780,
    isNew: true
  },
  {
    id: '9',
    title: 'جزيرة سقطرى الساحرة',
    description: 'جوهرة المحيط الهندي وأشجار دم الأخوين',
    category: 'سياحي',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '14:20',
    location: 'سقطرى',
    views: 312000,
    likes: 27000,
    comments: 1230,
    isTrending: true
  },
  {
    id: '10',
    title: 'مساجد إسطنبول التاريخية',
    description: 'جولة في أشهر المساجد العثمانية',
    category: 'سياحي',
    thumbnail: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '16:00',
    location: 'إسطنبول',
    views: 289000,
    likes: 21000,
    comments: 870
  },
  {
    id: '11',
    title: 'قصص نجاح الطلاب اليمنيين',
    description: 'إنجازات ملهمة من طلابنا المتميزين',
    category: 'اجتماعي',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '11:30',
    views: 224000,
    likes: 18000,
    comments: 1560,
    isNew: true
  },
  {
    id: '12',
    title: 'فعاليات الجالية اليمنية',
    description: 'تغطية الاحتفالات والمناسبات الوطنية',
    category: 'اجتماعي',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '9:45',
    views: 197000,
    likes: 15000,
    comments: 980
  }
];

const categories = [
  { id: 'all', label: 'الكل', icon: Play },
  { id: 'إيماني', label: 'إيماني', icon: BookOpen },
  { id: 'ثقافي', label: 'ثقافي', icon: Landmark },
  { id: 'تراثي', label: 'تراثي', icon: Camera },
  { id: 'تعليمي', label: 'تعليمي', icon: GraduationCap },
  { id: 'سياحي', label: 'سياحي', icon: Plane },
  { id: 'اجتماعي', label: 'اجتماعي', icon: Users },
];

const VisualContent = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const videoRef = useRef<HTMLIFrameElement>(null);

  const filteredContent = contentData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.includes(searchQuery) || 
      item.description?.includes(searchQuery) ||
      item.category.includes(searchQuery);
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'trending' && item.isTrending) ||
      (activeTab === 'new' && item.isNew);
    return matchesCategory && matchesSearch && matchesTab;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handlePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-24" dir="rtl">
      <PageHeader title="المحتوى البصري" showBack />
      
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        {showSearch ? (
          <div className="flex gap-2 animate-fade-in">
            <Input
              placeholder="ابحث في المحتوى..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-11"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-11 w-11"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 justify-start gap-2 text-muted-foreground h-11"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
              ابحث في المحتوى...
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Quick Filters Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-10 bg-secondary/50 p-1">
            <TabsTrigger value="all" className="flex-1 text-xs">الكل</TabsTrigger>
            <TabsTrigger value="trending" className="flex-1 text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              الأكثر مشاهدة
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1 text-xs">جديد</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredContent.length} محتوى
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-primary"
            >
              مسح البحث
            </button>
          )}
        </div>

        {/* Content Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-2 gap-3" 
            : "space-y-3"
        )}>
          {filteredContent.map((item) => (
            <Card 
              key={item.id} 
              className={cn(
                "border-0 shadow-soft overflow-hidden group cursor-pointer",
                viewMode === 'list' && "flex"
              )}
              onClick={() => handlePlay(item.id)}
            >
              {/* Thumbnail */}
              <div className={cn(
                "relative",
                viewMode === 'grid' ? "aspect-[9/14]" : "w-32 h-24 flex-shrink-0"
              )}>
                {playingId === item.id ? (
                  <div className="absolute inset-0 bg-black">
                    <iframe
                      ref={videoRef}
                      src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=0`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingId(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center z-10"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0",
                      viewMode === 'grid' 
                        ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" 
                        : "bg-gradient-to-l from-black/60 to-transparent"
                    )} />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={cn(
                        "rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform border border-white/30",
                        viewMode === 'grid' ? "w-12 h-12" : "w-10 h-10"
                      )}>
                        <Play className={cn(
                          "text-white fill-white ml-0.5",
                          viewMode === 'grid' ? "w-5 h-5" : "w-4 h-4"
                        )} />
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.isNew && (
                        <Badge className="text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5">
                          جديد
                        </Badge>
                      )}
                      {item.isTrending && (
                        <Badge className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5">
                          رائج
                        </Badge>
                      )}
                    </div>

                    {/* Duration */}
                    {item.duration && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
                        <Clock className="w-2.5 h-2.5" />
                        {item.duration}
                      </div>
                    )}

                    {viewMode === 'grid' && (
                      <>
                        {/* Category */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 rounded-full text-[9px] text-primary-foreground font-medium">
                          {item.category}
                        </div>
                        
                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white text-xs font-medium mb-1.5 line-clamp-2 leading-relaxed">
                            {item.title}
                          </h3>
                          
                          {/* Stats Row */}
                          <div className="flex items-center gap-3 text-white/70 text-[10px]">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(item.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(item.likes)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Side Actions */}
                        <div className="absolute right-2 bottom-14 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => toggleLike(item.id, e)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              likedItems.includes(item.id) 
                                ? "bg-red-500" 
                                : "bg-black/40 backdrop-blur-sm"
                            )}
                          >
                            <Heart className={cn(
                              "w-4 h-4 text-white",
                              likedItems.includes(item.id) && "fill-white"
                            )} />
                          </button>
                          <button 
                            onClick={(e) => toggleSave(item.id, e)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              savedItems.includes(item.id) 
                                ? "bg-yellow-500" 
                                : "bg-black/40 backdrop-blur-sm"
                            )}
                          >
                            <Bookmark className={cn(
                              "w-4 h-4 text-white",
                              savedItems.includes(item.id) && "fill-white"
                            )} />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* List View Info */}
              {viewMode === 'list' && (
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {item.category}
                      </Badge>
                      {item.isTrending && (
                        <TrendingUp className="w-3 h-3 text-orange-500" />
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(item.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(item.likes)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => toggleLike(item.id, e)}
                        className="p-1.5"
                      >
                        <Heart className={cn(
                          "w-4 h-4",
                          likedItems.includes(item.id) 
                            ? "text-red-500 fill-red-500" 
                            : "text-muted-foreground"
                        )} />
                      </button>
                      <button 
                        onClick={(e) => toggleSave(item.id, e)}
                        className="p-1.5"
                      >
                        <Bookmark className={cn(
                          "w-4 h-4",
                          savedItems.includes(item.id) 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <div className="empty-state py-16">
            <div className="empty-state-icon">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="empty-state-title">لا يوجد محتوى</p>
            <p className="empty-state-text">جرب تغيير الفلتر أو البحث بكلمات مختلفة</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setActiveTab('all');
              }}
            >
              عرض الكل
            </Button>
          </div>
        )}

        {/* Reels CTA */}
        <Card 
          className="card-featured border-0 mt-6 cursor-pointer"
          onClick={() => navigate('/yemen-reels')}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Play className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-primary-foreground font-semibold mb-1">
                🇾🇪 ريلز اليمن
              </h3>
              <p className="text-primary-foreground/80 text-xs">
                استمتع بمحتوى قصير من اليمن بأسلوب تيك توك
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default VisualContent;
