import { useState } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  content: string;
  time: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
}

const initialPosts: Post[] = [
  {
    id: '1',
    author: { name: 'أحمد محمد', avatar: '', badge: 'متطوع نشط' },
    content: 'مرحباً جميعاً! 👋 أبحث عن زملاء للدراسة معاً لامتحان الـ YÖS. هل هناك من يود الانضمام لمجموعة دراسية؟',
    time: 'منذ ساعتين',
    likes: 12,
    comments: [
      { id: 'c1', author: 'سارة', content: 'أنا مهتمة! كيف نتواصل؟', time: 'منذ ساعة' },
      { id: 'c2', author: 'علي', content: 'فكرة رائعة، أنا معكم', time: 'منذ 30 دقيقة' },
    ],
    isLiked: false
  },
  {
    id: '2',
    author: { name: 'فاطمة علي', avatar: '', badge: 'عضو مميز' },
    content: 'حصلت اليوم على قبول في جامعة إسطنبول! 🎉 شكراً للاتحاد على الدعم المستمر والدورات التحضيرية التي ساعدتني كثيراً.',
    time: 'منذ 4 ساعات',
    likes: 45,
    comments: [
      { id: 'c3', author: 'محمد', content: 'مبروك! تستاهلين 🎊', time: 'منذ 3 ساعات' },
    ],
    isLiked: true
  },
  {
    id: '3',
    author: { name: 'خالد أحمد', avatar: '' },
    content: 'سؤال: هل يعرف أحد مكتبة جيدة للدراسة في منطقة الفاتح؟ أحتاج مكان هادئ.',
    time: 'منذ 5 ساعات',
    likes: 8,
    comments: [],
    isLiked: false
  },
];

const Community = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const handlePost = () => {
    if (!newPost.trim()) {
      toast.error('اكتب شيئاً للمشاركة');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      author: { name: 'أنت', avatar: '' },
      content: newPost,
      time: 'الآن',
      likes: 0,
      comments: [],
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('تم نشر مشاركتك');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const addComment = (postId: string) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now().toString(),
            author: 'أنت',
            content: comment,
            time: 'الآن'
          }]
        };
      }
      return post;
    }));

    setNewComment({ ...newComment, [postId]: '' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="مجتمع الطلاب" showBack />
      
      <div className="px-4 py-4 space-y-4">
        {/* New Post */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary">أ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="شارك تجربتك أو اطرح سؤالاً..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 text-base"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handlePost} size="sm" className="rounded-full gap-2">
                    <Send className="w-4 h-4" />
                    نشر
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => (
          <Card key={post.id} className="border-0 shadow-soft">
            <CardContent className="p-4">
              {/* Author */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{post.author.name}</span>
                      {post.author.badge && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {post.author.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.time}
                    </span>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    post.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes > 0 && post.likes}
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {post.comments.length > 0 && post.comments.length}
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments.includes(post.id) && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 bg-muted/50 rounded-xl p-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {comment.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أضف تعليقاً..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      className="flex-1 px-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                    />
                    <Button 
                      size="icon" 
                      onClick={() => addComment(post.id)}
                      className="rounded-full h-9 w-9"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Community;
