import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, TrendingUp, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { ArrowRight } from 'lucide-react';
import { SuggestionBoxes } from '@/components/SuggestionBoxes';


interface Profile {
  id: string;
  total_points: number;
  full_name: string;
}

interface PointsHistory {
  id: string;
  change_amount: number;
  reason: string;
  reason_type: string;
  created_at: string;
  activity_id: string | null;
}

const Points = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile (for total_points)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, total_points, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch points history for this user
      const { data: historyData, error: historyError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      setProfile(profileData);
      setPointsHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching points data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Format date as DD-MM-YYYY
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper to get a human-readable description based on reason_type and reason
  const getDescription = (entry: PointsHistory) => {
    // If reason_type is 'activity' and there's an activity_id, we could fetch activity name,
    // but for simplicity we'll just use the reason field.
    // You can customize this mapping as needed.
    return entry.reason || 'نشاط عام';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">لم يتم العثور على الملف الشخصي</p>
      </div>
    );
  }

  // Last earned points (most recent history entry)
  const lastPoints = pointsHistory.length > 0 ? pointsHistory[0].change_amount : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
              {'النقاط'}
            </h1>

          </div>
        </div>
      </header>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Points Summary Card */}
        <Card className="gradient-primary text-primary-foreground shadow-glow animate-slide-up overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/20 mb-3">
                <Star className="h-8 w-8 fill-secondary text-secondary" />
              </div>
              <p className="text-primary-foreground/70 text-sm mb-1">مجموع النقاط</p>
              <p className="text-5xl font-bold">{profile.total_points}</p>
              <p className="text-primary-foreground/70 text-sm mt-2">
                نقطة مكتسبة
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-secondary" />
                  {/* Placeholder rank – you can compute rank later */}
                  <span className="text-2xl font-bold">#--</span>
                </div>
                <p className="text-xs text-primary-foreground/70">ترتيبك الحالي</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold">{lastPoints > 0 ? `+${lastPoints}` : 0}</span>
                </div>
                <p className="text-xs text-primary-foreground/70">آخر نقاط مكتسبة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points History */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            سجل النقاط
          </h2>
          <div className="space-y-2">
            {pointsHistory.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="p-4 text-center text-muted-foreground">
                  لا يوجد سجل نقاط حتى الآن
                </CardContent>
              </Card>
            ) : (
              pointsHistory.map((entry, index) => (
                <Card
                  key={entry.id}
                  className="shadow-soft animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          entry.change_amount > 0
                            ? "bg-accent/20 text-accent"
                            : "bg-destructive/20 text-destructive"
                        )}>
                          {entry.change_amount > 0 ? <Gift className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{getDescription(entry)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "font-bold",
                        entry.change_amount > 0 ? "text-accent" : "text-destructive"
                      )}>
                        {entry.change_amount > 0 ? `+${entry.change_amount}` : entry.change_amount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <SuggestionBoxes page="points" className="mb-6" />
      <BottomNav />
    </div>
  );
};

export default Points;