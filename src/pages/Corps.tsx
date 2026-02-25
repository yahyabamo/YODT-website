import { useState, useEffect } from 'react';
import {
  Stethoscope, GraduationCap, Code, Wrench, Mic, Users,
  ChevronLeft, Search, Filter, MapPin, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Corps {
  id: string;
  name_ar: string;
  name_en: string | null;
  corps_type: string;
  description: string | null;
  logo_url: string | null;
}

const corpsIcons: Record<string, any> = {
  health: Stethoscope,
  education: GraduationCap,
  tech: Code,
  engineering: Wrench,
  media: Mic,
  other: Users
};

const corpsColors: Record<string, string> = {
  health: 'bg-red-500/10 text-red-600',
  education: 'bg-blue-500/10 text-blue-600',
  tech: 'bg-purple-500/10 text-purple-600',
  engineering: 'bg-orange-500/10 text-orange-600',
  media: 'bg-pink-500/10 text-pink-600',
  other: 'bg-gray-500/10 text-gray-600'
};

const Corps = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [corps, setCorps] = useState<Corps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userCorps, setUserCorps] = useState<string[]>([]);

  useEffect(() => {
    fetchCorps();
    if (user) {
      fetchUserCorps();
    }
  }, [user]);

  const fetchCorps = async () => {
    try {
      const { data, error } = await supabase
        .from('corps')
        .select('*')
        .order('name_ar');

      if (error) throw error;
      setCorps(data || []);
    } catch (error) {
      console.error('Error fetching corps:', error);
      toast.error('حدث خطأ في تحميل الكوادر');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCorps = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('corps_members')
        .select('corps_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserCorps(data?.map(m => m.corps_id) || []);
    } catch (error) {
      console.error('Error fetching user corps:', error);
    }
  };

  const handleJoinRequest = async (corpsId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    try {
      // Check if already requested
      const { data: existing } = await supabase
        .from('corps_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('corps_id', corpsId)
        .maybeSingle();

      if (existing) {
        toast.info('لقد أرسلت طلباً مسبقاً');
        return;
      }

      const { error } = await supabase
        .from('corps_requests')
        .insert({
          user_id: user.id,
          corps_id: corpsId,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('تم إرسال طلب الانضمام بنجاح');
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('حدث خطأ في إرسال الطلب');
    }
  };

  const filteredCorps = corps.filter(c =>
    c.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الكوادر اليمنية" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Hero Section */}
        <Card className="shadow-card overflow-hidden">
          <div className="gradient-primary p-6 text-white">
            <h2 className="text-xl font-bold mb-2">انضم إلى كادرك المهني</h2>
            <p className="text-sm opacity-90">
              تجمعات مهنية للكفاءات اليمنية حول العالم
            </p>
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن كادر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12 bg-card"
          />
        </div>

        {/* Corps List */}
        <div className="space-y-3">
          {filteredCorps.map((c) => {
            const Icon = corpsIcons[c.corps_type] || Users;
            const colorClass = corpsColors[c.corps_type] || corpsColors.other;
            const isMember = userCorps.includes(c.id);

            return (
              <Card key={c.id} className="shadow-soft overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{c.name_ar}</h3>
                        {isMember && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {c.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {isMember ? (
                          <Button variant="outline" size="sm" className="gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            عضو
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => handleJoinRequest(c.id)}
                          >
                            طلب انضمام
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/corps/${c.id}`)}
                        >
                          التفاصيل
                          <ChevronLeft className="h-4 w-4 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Banner */}
        <Card className="shadow-soft bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">كيف تنضم إلى كادر؟</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>اختر الكادر المناسب لتخصصك</li>
              <li>أرسل طلب انضمام</li>
              <li>انتظر موافقة الإدارة والتوثيق</li>
              <li>استمتع بمزايا العضوية</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Corps;
