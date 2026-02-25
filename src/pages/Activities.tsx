import { useState } from 'react';
import { Calendar, MapPin, Users, Star, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { activities } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterType = 'all' | 'upcoming' | 'completed';

const Activities = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [registeredActivities, setRegisteredActivities] = useState<string[]>(
    activities.filter(a => a.isRegistered).map(a => a.id)
  );

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.status === filter;
  });

  const handleRegister = (activityId: string, activityTitle: string) => {
    if (registeredActivities.includes(activityId)) {
      setRegisteredActivities(prev => prev.filter(id => id !== activityId));
      toast.info('تم إلغاء التسجيل');
    } else {
      setRegisteredActivities(prev => [...prev, activityId]);
      toast.success(`تم تسجيل حضورك في "${activityTitle}"`);
    }
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'القادمة', value: 'upcoming' },
    { label: 'المكتملة', value: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الأنشطة والفعاليات" />

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                filter === f.value
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
            const isRegistered = registeredActivities.includes(activity.id);
            const isCompleted = activity.status === 'completed';
            const isFull = activity.attendees >= activity.maxAttendees;

            return (
              <Card 
                key={activity.id} 
                className={cn(
                  "shadow-soft animate-slide-up overflow-hidden",
                  isCompleted && "opacity-75"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-0">
                  {/* Activity Status Badge */}
                  <div className={cn(
                    "px-4 py-2 text-xs font-medium",
                    activity.status === 'upcoming' ? "gradient-primary text-primary-foreground" :
                    activity.status === 'ongoing' ? "bg-accent text-accent-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {activity.status === 'upcoming' ? 'قادم' :
                     activity.status === 'ongoing' ? 'جاري الآن' : 'مكتمل'}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-base">{activity.title}</h3>
                      <div className="flex items-center gap-1 gradient-gold text-secondary-foreground px-2 py-1 rounded-full text-sm font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        +{activity.points}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{activity.date} • {activity.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{activity.attendees} / {activity.maxAttendees} مشارك</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="gradient-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(activity.attendees / activity.maxAttendees) * 100}%` }}
                      />
                    </div>

                    {!isCompleted && (
                      <Button
                        variant={isRegistered ? "outline" : "gradient"}
                        size="lg"
                        className="w-full"
                        onClick={() => handleRegister(activity.id, activity.title)}
                        disabled={isFull && !isRegistered}
                      >
                        {isRegistered ? (
                          <>
                            <Check className="h-4 w-4" />
                            تم التسجيل
                          </>
                        ) : isFull ? (
                          'اكتمل العدد'
                        ) : (
                          'تسجيل الحضور'
                        )}
                      </Button>
                    )}

                    {isCompleted && isRegistered && (
                      <div className="flex items-center justify-center gap-2 text-accent font-medium">
                        <Check className="h-5 w-5" />
                        تم حضور هذا النشاط
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد أنشطة في هذا القسم</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Activities;
