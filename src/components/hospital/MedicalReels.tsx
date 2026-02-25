import { useState, useRef } from 'react';
import { 
  Heart, MessageCircle, Bookmark, Share2, 
  CheckCircle, Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MedicalReelProps {
  post: {
    id: string;
    content: string;
    post_type?: string;
    image_url?: string | null;
    video_url?: string | null;
    likes_count: number;
    comments_count: number;
    saves_count?: number;
    doctor?: {
      id: string;
      full_name: string;
      specialty: string;
      profile_image_url?: string | null;
      is_verified?: boolean;
    } | null;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onSave?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  awareness: { label: 'توعية', emoji: '💡' },
  dental: { label: 'أسنان', emoji: '🦷' },
  mental: { label: 'صحة نفسية', emoji: '🧠' },
  nutrition: { label: 'تغذية', emoji: '🥗' },
  emergency: { label: 'إسعافات', emoji: '🚑' },
  general: { label: 'طب عام', emoji: '⚕️' },
  tip: { label: 'نصيحة', emoji: '✨' },
  education: { label: 'تعليم', emoji: '📚' },
  discussion: { label: 'نقاش', emoji: '💬' }
};

const MedicalReel = ({ 
  post, 
  isLiked = false, 
  isSaved = false, 
  onLike, 
  onSave, 
  onComment, 
  onShare 
}: MedicalReelProps) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const categoryInfo = categoryLabels[post.post_type || 'general'] || categoryLabels.general;

  return (
    <div className="relative w-full h-[calc(100vh-180px)] min-h-[500px] bg-black rounded-2xl overflow-hidden">
      {/* Background */}
      {post.video_url ? (
        <video
          ref={videoRef}
          src={post.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />
      ) : post.image_url ? (
        <img 
          src={post.image_url} 
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Video controls */}
      {post.video_url && (
        <>
          <button 
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
          
          {!isPlaying && (
            <button 
              className="absolute inset-0 flex items-center justify-center"
              onClick={togglePlay}
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </button>
          )}
        </>
      )}

      {/* Category badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
          {categoryInfo.emoji} {categoryInfo.label}
        </Badge>
      </div>

      {/* Side actions */}
      <div className="absolute left-3 bottom-32 flex flex-col items-center gap-5">
        <button 
          className="flex flex-col items-center gap-1"
          onClick={onLike}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
          }`}>
            <Heart className={`h-6 w-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-medium">{post.likes_count}</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1"
          onClick={onComment}
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{post.comments_count}</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1"
          onClick={onSave}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isSaved ? 'bg-primary' : 'bg-white/20 backdrop-blur-sm'
          }`}>
            <Bookmark className={`h-6 w-6 ${isSaved ? 'text-white fill-white' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-medium">حفظ</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1"
          onClick={onShare}
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">مشاركة</span>
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 right-0 left-16 p-4 space-y-3">
        {/* Doctor info */}
        {post.doctor && (
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/doctor/${post.doctor?.id}`)}
          >
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={post.doctor.profile_image_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {post.doctor.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm">د. {post.doctor.full_name}</span>
                {post.doctor.is_verified && (
                  <CheckCircle className="h-4 w-4 text-blue-400 fill-blue-400" />
                )}
              </div>
              <p className="text-white/70 text-xs">{post.doctor.specialty}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mr-auto border-white/30 text-white hover:bg-white/20"
            >
              متابعة
            </Button>
          </div>
        )}

        {/* Content */}
        <p className="text-white text-sm leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>
    </div>
  );
};

// Reels container for swipe navigation
interface MedicalReelsContainerProps {
  posts: MedicalReelProps['post'][];
  likedPosts?: Set<string>;
  savedPosts?: Set<string>;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

export const MedicalReelsContainer = ({ 
  posts, 
  likedPosts = new Set(),
  savedPosts = new Set(),
  onLike,
  onSave
}: MedicalReelsContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>لا يوجد محتوى</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <MedicalReel 
        post={posts[currentIndex]}
        isLiked={likedPosts.has(posts[currentIndex].id)}
        isSaved={savedPosts.has(posts[currentIndex].id)}
        onLike={() => onLike?.(posts[currentIndex].id)}
        onSave={() => onSave?.(posts[currentIndex].id)}
      />
      
      {/* Navigation dots */}
      {posts.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {posts.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalReel;
