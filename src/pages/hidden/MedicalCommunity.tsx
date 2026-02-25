import { useState, useEffect } from 'react';
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Search, Filter, Sparkles, CheckCircle, TrendingUp,
  ChevronLeft, Image as ImageIcon, Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface MedicalPost {
  id: string;
  content: string;
  post_type: string;
  image_url: string | null;
  video_url: string | null;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  is_verified: boolean;
  created_at: string;
  doctor: {
    id: string;
    full_name: string;
    specialty: string;
    profile_image_url: string | null;
    is_verified: boolean;
  } | null;
}

const postTypeLabels: Record<string, { label: string; color: string }> = {
  awareness: { label: 'توعية', color: 'bg-blue-500' },
  education: { label: 'تعليم', color: 'bg-green-500' },
  discussion: { label: 'نقاش', color: 'bg-purple-500' },
  tip: { label: 'نصيحة', color: 'bg-amber-500' },
  general: { label: 'عام', color: 'bg-gray-500' }
};

const MedicalCommunity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<MedicalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserInteractions();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_posts')
        .select(`
          *,
          doctor:doctors(id, full_name, specialty, profile_image_url, is_verified)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Show demo posts if no data
      setPosts(getDemoPosts());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    if (!user) return;

    try {
      const [likesRes, savesRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', user.id),
        supabase.from('post_saves').select('post_id').eq('user_id', user.id)
      ]);

      if (likesRes.data) {
        setLikedPosts(new Set(likesRes.data.map(l => l.post_id)));
      }
      if (savesRes.data) {
        setSavedPosts(new Set(savesRes.data.map(s => s.post_id)));
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const getDemoPosts = (): MedicalPost[] => [
    {
      id: '1',
      content: 'نصيحة طبية: شرب الماء بكميات كافية يساعد على تحسين وظائف الجسم والحفاظ على صحة الكلى. ينصح بشرب 8 أكواب يومياً على الأقل.',
      post_type: 'tip',
      image_url: null,
      video_url: null,
      likes_count: 45,
      comments_count: 12,
      saves_count: 23,
      is_verified: true,
      created_at: new Date().toISOString(),
      doctor: {
        id: '1',
        full_name: 'أحمد الشرعبي',
        specialty: 'طب عام',
        profile_image_url: null,
        is_verified: true
      }
    },
    {
      id: '2',
      content: 'ما هي أفضل الطرق للوقاية من نزلات البرد في فصل الشتاء؟ شاركونا تجاربكم وأسئلتكم.',
      post_type: 'discussion',
      image_url: null,
      video_url: null,
      likes_count: 32,
      comments_count: 28,
      saves_count: 8,
      is_verified: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      doctor: {
        id: '2',
        full_name: 'سارة المقطري',
        specialty: 'أطفال',
        profile_image_url: null,
        is_verified: true
      }
    },
    {
      id: '3',
      content: 'توعية: السكري من النوع الثاني يمكن الوقاية منه بنسبة كبيرة من خلال نمط حياة صحي. النظام الغذائي المتوازن والرياضة المنتظمة هما أساس الوقاية.',
      post_type: 'awareness',
      image_url: null,
      video_url: null,
      likes_count: 89,
      comments_count: 15,
      saves_count: 56,
      is_verified: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      doctor: {
        id: '3',
        full_name: 'محمد الحيمي',
        specialty: 'باطنة',
        profile_image_url: null,
        is_verified: true
      }
    }
  ];

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const isLiked = likedPosts.has(postId);

    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
        setLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p
        ));
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
        setLikedPosts(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const isSaved = savedPosts.has(postId);

    try {
      if (isSaved) {
        await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', user.id);
        setSavedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        toast.success('تم إزالة الحفظ');
      } else {
        await supabase.from('post_saves').insert({ post_id: postId, user_id: user.id });
        setSavedPosts(prev => new Set(prev).add(postId));
        toast.success('تم الحفظ');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.includes(searchQuery) ||
      post.doctor?.full_name.includes(searchQuery);
    const matchesType = selectedType === 'all' || post.post_type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="مجتمع الأطباء" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Hero Banner */}
        <Card className="shadow-soft border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">مجتمع طبي تفاعلي</h3>
                <p className="text-sm text-muted-foreground">
                  تعلم، ناقش، وشارك المعرفة الصحية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث في المنشورات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12 bg-card"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
            className="shrink-0"
          >
            الكل
          </Button>
          {Object.entries(postTypeLabels).map(([key, value]) => (
            <Button
              key={key}
              variant={selectedType === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(key)}
              className="shrink-0"
            >
              {value.label}
            </Button>
          ))}
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا توجد منشورات</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="shadow-soft border-0 overflow-hidden">
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => post.doctor && navigate(`/doctor/${post.doctor.id}`)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.doctor?.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {post.doctor?.full_name.charAt(0) || '؟'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">د. {post.doctor?.full_name}</span>
                          {post.doctor?.is_verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{post.doctor?.specialty}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Type Badge */}
                  {post.post_type && post.post_type !== 'general' && (
                    <Badge
                      className={`${postTypeLabels[post.post_type]?.color || 'bg-gray-500'} text-white mb-3`}
                    >
                      {postTypeLabels[post.post_type]?.label || post.post_type}
                    </Badge>
                  )}

                  {/* Post Content */}
                  <p className="text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Media */}
                  {post.image_url && (
                    <div className="rounded-xl overflow-hidden mb-3">
                      <img
                        src={post.image_url}
                        alt="Post media"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Interactions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <button
                        className={`flex items-center gap-1 ${likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likes_count}</span>
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{post.comments_count}</span>
                      </button>
                      <button
                        className={`flex items-center gap-1 ${savedPosts.has(post.id) ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => handleSave(post.id)}
                      >
                        <Bookmark className={`h-5 w-5 ${savedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <button className="text-muted-foreground">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MedicalCommunity;
