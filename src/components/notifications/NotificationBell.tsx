import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { fetchLatestUpdates } from '@/service/supabaseData';

interface UpdateItem {
  id: string;
  title: string;
  created_at: string;
  type: 'activity' | 'offer' | 'reel';
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'الآن';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return 'منذ ساعة';
    if (diffInHours === 2) return 'منذ ساعتين';
    if (diffInHours <= 10) return `منذ ${diffInHours} ساعات`;
    return `منذ ${diffInHours} ساعة`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'أمس';
  if (diffInDays === 2) return 'أول أمس';
  if (diffInDays <= 10) return `منذ ${diffInDays} أيام`;
  if (diffInDays < 30) return `منذ ${diffInDays} يوم`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return 'منذ شهر';
  if (diffInMonths === 2) return 'منذ شهرين';
  if (diffInMonths <= 10) return `منذ ${diffInMonths} أشهر`;
  if (diffInMonths < 12) return `منذ ${diffInMonths} شهر`;

  return `منذ ${Math.floor(diffInMonths / 12)} سنة`;
}

export const NotificationBell = () => {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const navigate = useNavigate();

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const data = await fetchLatestUpdates();
      setUpdates(data as UpdateItem[]);
    } catch (error) {
      console.error('Error fetching latest updates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setUnread(false);
      loadUpdates();
    }
  }, [open]);

  const handleItemClick = (type: string) => {
    setOpen(false);
    if (type === 'activity') navigate('/home/activities');
    else if (type === 'offer') navigate('/home/offers');
    else if (type === 'reel') navigate('/home/reels');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🎯';
      case 'offer': return '🏷️';
      case 'reel': return '🎥';
      default: return '🔔';
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'activity': return 'فعالية جديدة';
      case 'offer': return 'عرض جديد';
      case 'reel': return 'فيديو جديد';
      default: return 'تحديث';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-secondary">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unread && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-border/50 backdrop-blur-xl bg-background/80" align="end">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">آخر التحديثات</h3>
          </div>
        </div>

        <ScrollArea className="max-h-[320px]">
          {loading ? (
            <div className="divide-y divide-border/50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">لا توجد تحديثات حالياً</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {updates.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleItemClick(item.type)}
                  className="w-full p-4 text-right transition-colors hover:bg-muted/50 group"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-border/50 bg-background group-hover:bg-muted/80 transition-colors">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold truncate text-foreground">
                          {getLabel(item.type)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5" dir="auto">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {formatRelativeTime(item.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
