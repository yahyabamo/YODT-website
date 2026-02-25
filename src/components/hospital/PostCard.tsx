import { useState } from 'react';
import { 
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  CheckCircle, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    post_type?: string;
    image_url?: string | null;
    video_url?: string | null;
    likes_count: number;
    comments_count: number;
    saves_count?: number;
    created_at: string;
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
  onShare?: () => void;
}

const postTypeStyles: Record<string, { label: string; bgColor: string }> = {
  awareness: { label: 'توعية', bgColor: 'bg-blue-500' },
  education: { label: 'تعليم', bgColor: 'bg-emerald-500' },
  discussion: { label: 'نقاش', bgColor: 'bg-purple-500' },
  tip: { label: 'نصيحة', bgColor: 'bg-amber-500' },
  general: { label: 'عام', bgColor: 'bg-muted-foreground' }
};

const PostCard = ({ 
  post, 
  isLiked = false, 
  isSaved = false, 
  onLike, 
  onSave, 
  onShare 
}: PostCardProps) => {
  const navigate = useNavigate();
  const [showFullContent, setShowFullContent] = useState(false);

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const typeStyle = postTypeStyles[post.post_type || 'general'] || postTypeStyles.general;
  const shouldTruncate = post.content.length > 200 && !showFullContent;

  return (
    <Card className="shadow-soft border-0 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => post.doctor && navigate(`/doctor/${post.doctor.id}`)}
          >
            <Avatar className="h-11 w-11">
              <AvatarImage src={post.doctor?.profile_image_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {post.doctor?.full_name.charAt(0) || '؟'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">د. {post.doctor?.full_name}</span>
                {post.doctor?.is_verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{post.doctor?.specialty}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          {post.post_type && post.post_type !== 'general' && (
            <Badge className={`${typeStyle.bgColor} text-white mb-2`}>
              {typeStyle.label}
            </Badge>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {shouldTruncate ? `${post.content.slice(0, 200)}...` : post.content}
          </p>
          {post.content.length > 200 && (
            <button 
              className="text-primary text-sm font-medium mt-1"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'عرض أقل' : 'المزيد'}
            </button>
          )}
        </div>

        {/* Media */}
        {(post.image_url || post.video_url) && (
          <div className="relative">
            {post.video_url ? (
              <div className="relative bg-black aspect-video">
                <video
                  src={post.video_url}
                  className="w-full h-full object-cover"
                  poster={post.image_url || undefined}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
            ) : post.image_url && (
              <img 
                src={post.image_url} 
                alt=""
                className="w-full aspect-video object-cover"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-4 pt-3">
          <div className="flex items-center gap-5">
            <button 
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={onLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes_count}</span>
            </button>
            
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>
            
            <button 
              className={`transition-colors ${
                isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={onSave}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <button 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={onShare}
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
