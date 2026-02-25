import { useState } from 'react';
import { Heart, MessageCircle, Send, User, Smile, BookOpen, Lightbulb, Coffee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Story {
  id: string;
  author: string;
  avatar: string;
  type: 'فضفضة' | 'قصة' | 'تجربة' | 'سؤال';
  content: string;
  time: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const initialStories: Story[] = [
  {
    id: '1',
    author: 'طالب مجتهد',
    avatar: '👨‍🎓',
    type: 'تجربة',
    content: 'اليوم قدمت عرضي التقديمي لأول مرة بالتركي... كان صعب لكن زملائي شجعوني كثير. الحمدلله مرت بخير! 💪',
    time: 'منذ ساعة',
    likes: 12,
    comments: 3,
    liked: false
  },
  {
    id: '2',
    author: 'طالبة طموحة',
    avatar: '👩‍💻',
    type: 'قصة',
    content: 'بعد سنة من التعلم الذاتي، حصلت على أول عمل حر في تصميم الجرافيك! النصيحة: لا تستسلموا أبداً 🌟',
    time: 'منذ 3 ساعات',
    likes: 24,
    comments: 8,
    liked: true
  },
  {
    id: '3',
    author: 'مغترب جديد',
    avatar: '🧑‍🎓',
    type: 'فضفضة',
    content: 'أحياناً الغربة صعبة، لكن لما أتذكر أهلي وأحلامي... أعرف إني لازم أكمل. شكراً لكل من يدعمنا هنا ❤️',
    time: 'منذ 5 ساعات',
    likes: 45,
    comments: 12,
    liked: false
  },
];

const typeIcons: Record<string, React.ElementType> = {
  'فضفضة': Coffee,
  'قصة': BookOpen,
  'تجربة': Lightbulb,
  'سؤال': MessageCircle,
};

const typeColors: Record<string, string> = {
  'فضفضة': 'bg-violet-100 text-violet-600',
  'قصة': 'bg-amber-100 text-amber-600',
  'تجربة': 'bg-emerald-100 text-emerald-600',
  'سؤال': 'bg-sky-100 text-sky-600',
};

export const StudentSpace = () => {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [newStory, setNewStory] = useState('');
  const [storyType, setStoryType] = useState<'فضفضة' | 'قصة' | 'تجربة' | 'سؤال'>('فضفضة');
  const [showForm, setShowForm] = useState(false);

  const handleLike = (storyId: string) => {
    setStories(prev => prev.map(story =>
      story.id === storyId
        ? { ...story, liked: !story.liked, likes: story.liked ? story.likes - 1 : story.likes + 1 }
        : story
    ));
  };

  const handlePost = () => {
    if (!newStory.trim()) return;

    const story: Story = {
      id: Date.now().toString(),
      author: 'أنا',
      avatar: '😊',
      type: storyType,
      content: newStory,
      time: 'الآن',
      likes: 0,
      comments: 0,
      liked: false
    };

    setStories(prev => [story, ...prev]);
    setNewStory('');
    setShowForm(false);
    toast.success('تم نشر مشاركتك بنجاح! 🎉');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">مساحة الطالب</h2>
            <p className="text-xs text-muted-foreground">شارك قصتك وتجربتك</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          <Smile className="w-4 h-4 ml-1" />
          شارك
        </Button>
      </div>

      {/* Post Form */}
      {showForm && (
        <Card className="border-0 shadow-soft bg-gradient-to-l from-rose-500/5 to-pink-500/5">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-3">
              {(['فضفضة', 'قصة', 'تجربة', 'سؤال'] as const).map((type) => {
                const Icon = typeIcons[type];
                return (
                  <button
                    key={type}
                    onClick={() => setStoryType(type)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${storyType === type
                        ? typeColors[type] + ' ring-2 ring-offset-1'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    {type}
                  </button>
                );
              })}
            </div>

            <Textarea
              value={newStory}
              onChange={(e) => setNewStory(e.target.value)}
              placeholder="شارك ما في قلبك... 💭"
              className="min-h-24 resize-none mb-3"
            />

            <div className="flex gap-2">
              <Button onClick={handlePost} className="flex-1" disabled={!newStory.trim()}>
                <Send className="w-4 h-4 ml-2" />
                نشر
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stories */}
      <div className="space-y-3">
        {stories.map((story) => {
          const TypeIcon = typeIcons[story.type];
          return (
            <Card key={story.id} className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                    {story.avatar}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{story.author}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[story.type]}`}>
                        <TypeIcon className="w-3 h-3 inline ml-1" />
                        {story.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{story.time}</span>
                    </div>

                    <p className="text-foreground leading-relaxed mb-3">{story.content}</p>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(story.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${story.liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                          }`}
                      >
                        <Heart className={`w-4 h-4 ${story.liked ? 'fill-current' : ''}`} />
                        <span>{story.likes}</span>
                      </button>

                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{story.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
