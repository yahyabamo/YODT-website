import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Users, Video, Clock, Globe, ExternalLink,
  Search, Filter, Play, CheckCircle, CalendarCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Conference {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  location: string | null;
  organizer: string | null;
  registration_link: string | null;
  conference_type: string;
  speakers: string[];
  target_audience: string | null;
  is_online: boolean;
  recording_url: string | null;
  image_url: string | null;
  attendees_count: number;
}

const conferenceTypeLabels: Record<string, { label: string; color: string; icon: any }> = {
  conference: { label: 'مؤتمر', color: 'bg-blue-500', icon: Users },
  webinar: { label: 'ندوة أونلاين', color: 'bg-green-500', icon: Video },
  workshop: { label: 'ورشة عمل', color: 'bg-purple-500', icon: Calendar },
  recorded: { label: 'تسجيل', color: 'bg-amber-500', icon: Play }
};

const MedicalCongress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [registeredConferences, setRegisteredConferences] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConferences();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchConferences = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_conferences')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const mappedConferences = (data || []).map(c => ({
        ...c,
        conference_type: c.conference_type || 'conference',
        speakers: c.speakers || [],
        is_online: c.is_online ?? false,
        attendees_count: c.attendees_count ?? 0
      }));

      setConferences(mappedConferences.length > 0 ? mappedConferences : getDemoConferences());
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setConferences(getDemoConferences());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conference_registrations')
        .select('conference_id')
        .eq('user_id', user.id);

      if (error) throw error;
      if (data) {
        setRegisteredConferences(new Set(data.map(r => r.conference_id)));
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const getDemoConferences = (): Conference[] => [
    {
      id: '1',
      title: 'المؤتمر الطبي اليمني الدولي 2026',
      description: 'مؤتمر طبي دولي يجمع الأطباء اليمنيين من مختلف أنحاء العالم لتبادل الخبرات والمعارف الطبية',
      date: new Date(Date.now() + 30 * 86400000).toISOString(),
      location: 'إسطنبول، تركيا',
      organizer: 'اتحاد الأطباء اليمنيين',
      registration_link: 'https://example.com/register',
      conference_type: 'conference',
      speakers: ['د. أحمد الشرعبي', 'د. سارة المقطري', 'د. محمد الحيمي'],
      target_audience: 'جميع التخصصات الطبية',
      is_online: false,
      recording_url: null,
      image_url: null,
      attendees_count: 150
    },
    {
      id: '2',
      title: 'ندوة: التطورات الحديثة في طب الأطفال',
      description: 'ندوة علمية تتناول أحدث التطورات في مجال طب الأطفال وحديثي الولادة',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: 'أونلاين',
      organizer: 'قسم طب الأطفال',
      registration_link: 'https://example.com/register',
      conference_type: 'webinar',
      speakers: ['د. سارة المقطري'],
      target_audience: 'أطباء الأطفال',
      is_online: true,
      recording_url: null,
      image_url: null,
      attendees_count: 89
    },
    {
      id: '3',
      title: 'ورشة عمل: الإسعافات الأولية المتقدمة',
      description: 'ورشة عمل تفاعلية لتعلم مهارات الإسعافات الأولية المتقدمة',
      date: new Date(Date.now() + 14 * 86400000).toISOString(),
      location: 'أنقرة، تركيا',
      organizer: 'جمعية الطوارئ الطبية',
      registration_link: 'https://example.com/register',
      conference_type: 'workshop',
      speakers: ['د. علي السعيدي', 'د. فاطمة الوصابي'],
      target_audience: 'الأطباء والممرضين',
      is_online: false,
      recording_url: null,
      image_url: null,
      attendees_count: 45
    },
    {
      id: '4',
      title: 'تسجيل: مؤتمر الأمراض المعدية 2025',
      description: 'تسجيل كامل لمؤتمر الأمراض المعدية الذي أقيم في ديسمبر 2025',
      date: new Date(Date.now() - 30 * 86400000).toISOString(),
      location: 'تسجيل',
      organizer: 'قسم الأمراض المعدية',
      registration_link: null,
      conference_type: 'recorded',
      speakers: ['د. محمد الحيمي', 'د. نور الدين'],
      target_audience: 'أطباء الباطنة والأمراض المعدية',
      is_online: true,
      recording_url: 'https://example.com/recording',
      image_url: null,
      attendees_count: 234
    }
  ];

  const handleRegister = async (conferenceId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    const isRegistered = registeredConferences.has(conferenceId);

    try {
      if (isRegistered) {
        await supabase
          .from('conference_registrations')
          .delete()
          .eq('conference_id', conferenceId)
          .eq('user_id', user.id);

        setRegisteredConferences(prev => {
          const next = new Set(prev);
          next.delete(conferenceId);
          return next;
        });
        toast.success('تم إلغاء التسجيل');
      } else {
        await supabase
          .from('conference_registrations')
          .insert({ conference_id: conferenceId, user_id: user.id });

        setRegisteredConferences(prev => new Set(prev).add(conferenceId));
        toast.success('تم التسجيل بنجاح');
      }
    } catch (error) {
      console.error('Error toggling registration:', error);
      toast.error('حدث خطأ');
    }
  };

  const now = new Date();
  const upcomingConferences = conferences.filter(c =>
    c.date && new Date(c.date) > now && c.conference_type !== 'recorded'
  );
  const pastConferences = conferences.filter(c =>
    c.conference_type === 'recorded' || (c.date && new Date(c.date) <= now)
  );

  const filteredConferences = (list: Conference[]) => list.filter(c => {
    const matchesSearch = c.title.includes(searchQuery) ||
      c.description?.includes(searchQuery) ||
      c.speakers?.some(s => s.includes(searchQuery));
    const matchesType = selectedType === 'all' || c.conference_type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <PageHeader title="مؤتمر الأطباء" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Hero Banner */}
        <Card className="shadow-soft border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">المؤتمرات والندوات الطبية</h3>
                <p className="text-sm text-muted-foreground">
                  سجل وشارك في الفعاليات الطبية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مؤتمر أو متحدث..."
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
          {Object.entries(conferenceTypeLabels).map(([key, value]) => (
            <Button
              key={key}
              variant={selectedType === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(key)}
              className="shrink-0 gap-1"
            >
              <value.icon className="h-4 w-4" />
              {value.label}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" dir="rtl">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming" className="gap-1">
              <Calendar className="h-4 w-4" />
              القادمة ({upcomingConferences.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1">
              <Play className="h-4 w-4" />
              التسجيلات ({pastConferences.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {filteredConferences(upcomingConferences).length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">لا توجد مؤتمرات قادمة</p>
                </CardContent>
              </Card>
            ) : (
              filteredConferences(upcomingConferences).map((conf) => (
                <ConferenceCard
                  key={conf.id}
                  conference={conf}
                  isRegistered={registeredConferences.has(conf.id)}
                  onRegister={() => handleRegister(conf.id)}
                  formatDate={formatDate}
                />
              ))
            )}
          </TabsContent>

          {/* Past Tab */}
          <TabsContent value="past" className="space-y-4 mt-4">
            {filteredConferences(pastConferences).length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="p-8 text-center">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">لا توجد تسجيلات</p>
                </CardContent>
              </Card>
            ) : (
              filteredConferences(pastConferences).map((conf) => (
                <ConferenceCard
                  key={conf.id}
                  conference={conf}
                  isRegistered={registeredConferences.has(conf.id)}
                  onRegister={() => handleRegister(conf.id)}
                  formatDate={formatDate}
                  isPast
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

interface ConferenceCardProps {
  conference: Conference;
  isRegistered: boolean;
  onRegister: () => void;
  formatDate: (date: string) => string;
  isPast?: boolean;
}

const ConferenceCard = ({ conference, isRegistered, onRegister, formatDate, isPast }: ConferenceCardProps) => {
  const typeInfo = conferenceTypeLabels[conference.conference_type] || conferenceTypeLabels.conference;
  const TypeIcon = typeInfo.icon;

  return (
    <Card className="shadow-soft border-0 overflow-hidden">
      {conference.image_url && (
        <img
          src={conference.image_url}
          alt={conference.title}
          className="w-full h-40 object-cover"
        />
      )}
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`${typeInfo.color} text-white gap-1`}>
              <TypeIcon className="h-3 w-3" />
              {typeInfo.label}
            </Badge>
            {conference.is_online && (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                أونلاين
              </Badge>
            )}
          </div>
          {isRegistered && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              مسجل
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-lg mb-2">{conference.title}</h3>
        {conference.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {conference.description}
          </p>
        )}

        {/* Info */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          {conference.date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatDate(conference.date)}</span>
            </div>
          )}
          {conference.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{conference.location}</span>
            </div>
          )}
          {conference.speakers && conference.speakers.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span>المتحدثون: {conference.speakers.slice(0, 3).join('، ')}</span>
            </div>
          )}
          {conference.target_audience && (
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 shrink-0" />
              <span>الفئة المستهدفة: {conference.target_audience}</span>
            </div>
          )}
        </div>

        {/* Attendees */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Users className="h-4 w-4" />
          <span>{conference.attendees_count} مشارك</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isPast && conference.recording_url ? (
            <Button
              className="flex-1 gap-2"
              onClick={() => window.open(conference.recording_url!, '_blank')}
            >
              <Play className="h-4 w-4" />
              مشاهدة التسجيل
            </Button>
          ) : (
            <>
              <Button
                className="flex-1"
                variant={isRegistered ? 'outline' : 'default'}
                onClick={onRegister}
              >
                {isRegistered ? 'إلغاء التسجيل' : 'التسجيل'}
              </Button>
              {conference.registration_link && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(conference.registration_link!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalCongress;
