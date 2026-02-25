import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Heart, MessageCircle, Share2, Bookmark, 
  Volume2, VolumeX, ChevronUp, ChevronDown, ArrowRight,
  MapPin, Music, Eye, MoreHorizontal, X, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Reel {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnail: string;
  videoUrl?: string;
  youtubeId: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  location?: string;
  music?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

const reelsData: Reel[] = [
  {
    id: '1',
    title: 'غروب الشمس في صنعاء القديمة',
    description: 'من أجمل المناظر في اليمن 🇾🇪✨ صنعاء القديمة عند الغروب',
    category: 'مناظر',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    youtubeId: 'dQw4w9WgXcQ',
    author: { name: 'اليمن الجميل', verified: true },
    location: 'صنعاء',
    music: '🎵 موسيقى يمنية تراثية',
    views: 154200,
    likes: 12400,
    comments: 342,
    shares: 89
  },
  {
    id: '2',
    title: 'جزيرة سقطرى الساحرة',
    description: 'أشجار دم الأخوين الفريدة من نوعها في العالم 🌳',
    category: 'سياحة',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    youtubeId: 'dQw4w9WgXcQ',
    author: { name: 'مغامرات اليمن', verified: true },
    location: 'سقطرى',
    views: 312000,
    likes: 28700,
    comments: 567,
    shares: 234
  },
  {
    id: '3',
    title: 'رقصة البرع الحضرمية',
    description: 'من التراث اليمني الأصيل في حضرموت 💚',
    category: 'تراث',
    thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800',
    youtubeId: 'dQw4w9WgXcQ',
    author: { name: 'تراثنا اليمني' },
    location: 'حضرموت',
    music: '🎵 إيقاعات حضرمية',
    views: 187500,
    likes: 16800,
    comments: 423,
    shares: 156
  },
  {
    id: '4',
    title: 'أنشودة يمنية جميلة',
    description: 'أنشودة من الفن اليمني الراقي 🎤',
    category: 'أغاني',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    youtubeId: 'dQw4w9WgXcQ',
    author: { name: 'ألحان اليمن' },
    music: '🎵 صوت الفن اليمني',
    views: 231000,
    likes: 21500,
    comments: 678,
    shares: 312
  },
  {
    id: '5',
    title: 'شروق الشمس على جبال حراز',
    description: 'مناظر خلابة من جبال اليمن الشامخة ⛰️',
    category: 'مناظر',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    youtubeId: 'dQw4w9WgXcQ',
    author: { name: 'عدسة اليمن', verified: true },
    location: 'حراز',
    views: 276000,
    likes: 24300,
    comments: 512,
    shares: 198
  },
  {
    id: '6',
    title: 'العسل اليمني الدواني',
    description: 'من أجود أنواع العسل في العالم 🍯',
    category: 'تراث',
    thumbnail: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
    youtubeId: 'dQw4w9WgXcQ',
    author: { name: 'منتجات يمنية' },
    location: 'وادي دوعن',
    views: 95000,
    likes: 8200,
    comments: 234,
    shares: 67
  },
];

const YemenReels = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<string[]>([]);
  const [savedReels, setSavedReels] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const currentReel = reelsData[currentIndex];

  // Handle swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;

    if (isSwipeUp && currentIndex < reelsData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isSwipeDown && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
      if (e.key === 'ArrowDown' && currentIndex < reelsData.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const toggleLike = useCallback((id: string) => {
    setLikedReels(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedReels(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const goToNext = () => {
    if (currentIndex < reelsData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent safe-area-top">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">🇾🇪 ريلز اليمن</span>
        </div>

        <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Reels Container */}
      <div 
        ref={containerRef}
        className="h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Reel */}
        <div className="relative h-full w-full">
          {/* Background Image/Video */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
            style={{ backgroundImage: `url(${currentReel.thumbnail})` }}
          >
            {/* Blur overlay for letterboxing */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          </div>

          {/* Main Content */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <img 
              src={currentReel.thumbnail}
              alt={currentReel.title}
              className="max-h-full max-w-full object-contain"
            />

            {/* Play/Pause indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-scale-in">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Right Side Actions */}
          <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
            {/* Like */}
            <button 
              onClick={() => toggleLike(currentReel.id)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                likedReels.includes(currentReel.id) 
                  ? "bg-red-500 scale-110" 
                  : "bg-white/10 backdrop-blur-md"
              )}>
                <Heart className={cn(
                  "w-6 h-6 transition-all",
                  likedReels.includes(currentReel.id) 
                    ? "text-white fill-white" 
                    : "text-white"
                )} />
              </div>
              <span className="text-white text-xs font-medium">
                {formatNumber(currentReel.likes + (likedReels.includes(currentReel.id) ? 1 : 0))}
              </span>
            </button>

            {/* Comment */}
            <button 
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium">
                {formatNumber(currentReel.comments)}
              </span>
            </button>

            {/* Save */}
            <button 
              onClick={() => toggleSave(currentReel.id)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                savedReels.includes(currentReel.id) 
                  ? "bg-yellow-500 scale-110" 
                  : "bg-white/10 backdrop-blur-md"
              )}>
                <Bookmark className={cn(
                  "w-6 h-6 transition-all",
                  savedReels.includes(currentReel.id) 
                    ? "text-white fill-white" 
                    : "text-white"
                )} />
              </div>
            </button>

            {/* Share */}
            <button 
              onClick={() => setShowShareSheet(true)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium">
                {formatNumber(currentReel.shares)}
              </span>
            </button>

            {/* Mute Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-20 left-0 right-16 p-4 z-20">
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={currentReel.author.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {currentReel.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold text-sm">
                    {currentReel.author.name}
                  </span>
                  {currentReel.author.verified && (
                    <span className="text-blue-400 text-xs">✓</span>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-4 text-xs bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                متابعة
              </Button>
            </div>

            {/* Title & Description */}
            <div className="mb-3">
              <p className="text-white text-sm leading-relaxed line-clamp-2">
                {currentReel.description || currentReel.title}
              </p>
            </div>

            {/* Location & Music */}
            <div className="flex flex-wrap gap-3 text-white/80 text-xs">
              {currentReel.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentReel.location}</span>
                </div>
              )}
              {currentReel.music && (
                <div className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{currentReel.music}</span>
                </div>
              )}
            </div>

            {/* Views */}
            <div className="flex items-center gap-1 text-white/60 text-xs mt-2">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatNumber(currentReel.views)} مشاهدة</span>
            </div>
          </div>

          {/* Navigation Indicators */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex gap-1.5 z-20">
            {reelsData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "h-1 rounded-full transition-all",
                  idx === currentIndex 
                    ? "w-6 bg-white" 
                    : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>

          {/* Navigation Arrows (Desktop) */}
          <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
            <button 
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={cn(
                "w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all",
                currentIndex === 0 ? "opacity-30" : "hover:bg-white/20"
              )}
            >
              <ChevronUp className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={goToNext}
              disabled={currentIndex === reelsData.length - 1}
              className={cn(
                "w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all",
                currentIndex === reelsData.length - 1 ? "opacity-30" : "hover:bg-white/20"
              )}
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Swipe hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs animate-pulse z-10">
            اسحب للأعلى للمزيد
          </div>
        </div>
      </div>

      {/* Comments Sheet */}
      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-center">التعليقات ({currentReel.comments})</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Sample comments */}
            {[
              { name: 'أحمد محمد', text: 'ما شاء الله، اليمن جميلة جداً ❤️', time: 'منذ ساعة' },
              { name: 'فاطمة علي', text: 'اشتقنا لها كثيراً 😢💚', time: 'منذ 3 ساعات' },
              { name: 'محمد صالح', text: 'ربي يحفظ اليمن وأهلها', time: 'منذ يوم' },
            ].map((comment, idx) => (
              <div key={idx} className="flex gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-secondary text-foreground text-xs">
                    {comment.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.name}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{comment.text}</p>
                </div>
                <button>
                  <Heart className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="أضف تعليقاً..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" disabled={!commentText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center">مشاركة</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-4 gap-4 pb-6">
            {[
              { icon: '📋', label: 'نسخ الرابط' },
              { icon: '💬', label: 'واتساب' },
              { icon: '📱', label: 'تيليجرام' },
              { icon: '🐦', label: 'تويتر' },
            ].map((item) => (
              <button key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default YemenReels;
