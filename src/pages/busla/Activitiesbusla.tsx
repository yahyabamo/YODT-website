'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Users, Star, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getActivities, registerActivity, unregisterActivity } from '@/lib/queries';
import type { Activity2 } from '@/integrations/supabase/types';
import { SmartTopBar } from '@/components/layout/SmartTopBar';

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'completed';

const filters: { label: string; value: FilterType }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'القادمة', value: 'upcoming' },
  { label: 'جارية', value: 'ongoing' },
  { label: 'المكتملة', value: 'completed' },
];

export default function ActivitiesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [activities, setActivities] = useState<Activity2[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getActivities(userId);
    setActivities(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const handleRegister = async (activity: Activity2) => {
    if (!userId) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const isRegistered = activity.is_registered;

    // Optimistic update
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activity.id) return a;
        return {
          ...a,
          is_registered: !isRegistered,
          attendees_count: (a.attendees_count ?? 0) + (isRegistered ? -1 : 1),
        };
      })
    );

    if (isRegistered) {
      const { error } = await unregisterActivity(activity.id, userId);
      if (error) {
        toast.error('حدث خطأ، حاول مجدداً');
        fetchActivities(); // revert
      } else {
        toast.info('تم إلغاء التسجيل');
      }
    } else {
      const { error } = await registerActivity(activity.id, userId);
      if (error) {
        toast.error('حدث خطأ، حاول مجدداً');
        fetchActivities(); // revert
      } else {
        toast.success(`تم تسجيل حضورك في "${activity.title}"`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <header className="sticky-header">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>
      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                filter === f.value
                  ? 'gradient-primary text-primary-foreground shadow-soft'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Activities List */}
        {!loading && (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const isRegistered = activity.is_registered ?? false;
              const isCompleted = activity.status === 'completed';
              const attendees = activity.attendees_count ?? 0;
              const isFull = attendees >= activity.max_attendees;

              return (
                <Card
                  key={activity.id}
                  className={cn(
                    'shadow-soft animate-slide-up overflow-hidden',
                    isCompleted && 'opacity-75'
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-0">
                    {/* Status Badge */}
                    <div
                      className={cn(
                        'px-4 py-2 text-xs font-medium',
                        activity.status === 'upcoming'
                          ? 'gradient-primary text-primary-foreground'
                          : activity.status === 'ongoing'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {activity.status === 'upcoming'
                        ? 'قادم'
                        : activity.status === 'ongoing'
                          ? 'جاري الآن'
                          : 'مكتمل'}
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-base">{activity.title}</h3>
                        <div className="flex items-center gap-1 gradient-gold text-secondary-foreground px-2 py-1 rounded-full text-sm font-bold shrink-0">
                          <Star className="h-3 w-3 fill-current" />+{activity.points}
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {(activity.date || activity.time) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary shrink-0" />
                            <span>
                              {activity.date ?? ''}
                              {activity.date && activity.time ? ' • ' : ''}
                              {activity.time ?? ''}
                            </span>
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary shrink-0" />
                          <span>
                            {attendees} / {activity.max_attendees} مشارك
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="gradient-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (attendees / activity.max_attendees) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      {!isCompleted && (
                        <Button
                          variant={isRegistered ? 'outline' : 'default'}
                          size="lg"
                          className="w-full"
                          onClick={() => handleRegister(activity)}
                          disabled={isFull && !isRegistered}
                        >
                          {isRegistered ? (
                            <>
                              <Check className="h-4 w-4 ml-2" />
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

            {filteredActivities.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد أنشطة في هذا القسم</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}