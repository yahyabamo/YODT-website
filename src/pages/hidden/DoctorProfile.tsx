import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, MapPin, Star, CheckCircle, Award, Languages,
  Phone, Video, MessageCircle, Calendar, GraduationCap, Heart,
  Share2, Clock, Mail, Globe, Building, ChevronLeft, FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  sub_specialty: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  languages: string[] | null;
  experience_years: number | null;
  working_hours: string | null;
  is_verified: boolean;
  is_available: boolean;
  profile_image_url: string | null;
  rating: number;
  consultation_count: number;
  consultation_types: string[];
  badges: string[];
  education: string[];
  certifications: string[];
  social_links: Record<string, string>;
  clinic_name: string | null;
  city: { name_ar: string } | null;
  country: { name_ar: string } | null;
}

interface DoctorPost {
  id: string;
  content: string;
  post_type: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [posts, setPosts] = useState<DoctorPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
      fetchDoctorPosts();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          city:cities(name_ar),
          country:countries(name_ar)
        `)
        .eq('id', doctorId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setDoctor({
          ...data,
          is_available: data.is_available ?? true,
          rating: data.rating ?? 0,
          consultation_count: data.consultation_count ?? 0,
          consultation_types: data.consultation_types || ['text'],
          badges: data.badges || [],
          education: data.education || [],
          certifications: data.certifications || [],
          social_links: (data.social_links as Record<string, string>) || {}
        });
      } else {
        // Demo doctor
        setDoctor(getDemoDoctor());
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setDoctor(getDemoDoctor());
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_posts')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPosts(data || getDemoPosts());
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts(getDemoPosts());
    }
  };

  const getDemoDoctor = (): Doctor => ({
    id: doctorId || '1',
    full_name: 'أحمد الشرعبي',
    specialty: 'طب عام',
    sub_specialty: 'طب الأسرة',
    bio: 'طبيب عام بخبرة 15 عاماً في مجال الرعاية الصحية الأولية وطب الأسرة. أسعى لتقديم رعاية صحية شاملة ومتميزة للمرضى مع التركيز على الوقاية والتثقيف الصحي.',
    phone: '+90 555 111 2233',
    email: 'dr.ahmed@example.com',
    languages: ['العربية', 'التركية', 'الإنجليزية'],
    experience_years: 15,
    working_hours: '09:00 - 17:00',
    is_verified: true,
    is_available: true,
    profile_image_url: null,
    rating: 4.8,
    consultation_count: 234,
    consultation_types: ['text', 'voice', 'video'],
    badges: ['طبيب موثق', 'طبيب نشط', 'أكثر من 200 استشارة'],
    education: ['بكالوريوس الطب والجراحة - جامعة صنعاء', 'ماجستير طب الأسرة - جامعة إسطنبول'],
    certifications: ['البورد العربي في طب الأسرة', 'شهادة الإنعاش القلبي المتقدم'],
    social_links: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' },
    clinic_name: 'مستشفى ميديكال بارك',
    city: { name_ar: 'إسطنبول' },
    country: { name_ar: 'تركيا' }
  });

  const getDemoPosts = (): DoctorPost[] => [
    {
      id: '1',
      content: 'نصيحة اليوم: الحفاظ على نظام غذائي متوازن يساعد في تقوية المناعة والوقاية من الأمراض.',
      post_type: 'tip',
      image_url: null,
      likes_count: 45,
      comments_count: 12,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      content: 'شرب الماء بكميات كافية من أهم العادات الصحية. ينصح بـ 8 أكواب يومياً.',
      post_type: 'awareness',
      image_url: null,
      likes_count: 32,
      comments_count: 8,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="الملف الشخصي" showBack />
        <div className="px-4 py-8 text-center">
          <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لم يتم العثور على الطبيب</p>
          <Button variant="link" onClick={() => navigate('/doctors-directory')}>
            العودة للدليل
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الملف الشخصي" showBack />

      <div className="max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={doctor.profile_image_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {doctor.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {doctor.is_available && (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">د. {doctor.full_name}</h1>
                {doctor.is_verified && (
                  <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500" />
                )}
              </div>
              <p className="text-primary font-medium">
                {doctor.specialty}
                {doctor.sub_specialty && ` • ${doctor.sub_specialty}`}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                {doctor.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {doctor.city.name_ar}، {doctor.country?.name_ar}
                  </span>
                )}
                <Badge variant={doctor.is_available ? 'default' : 'secondary'}>
                  {doctor.is_available ? 'متاح للاستشارة' : 'غير متاح'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-foreground">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                {doctor.rating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">التقييم</p>
            </div>
            <div className="text-center border-x border-border/50">
              <div className="text-xl font-bold text-foreground">{doctor.consultation_count}</div>
              <p className="text-xs text-muted-foreground">استشارة</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{doctor.experience_years}</div>
              <p className="text-xs text-muted-foreground">سنة خبرة</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button 
              className="flex-1 gap-2"
              disabled={!doctor.is_available}
              onClick={() => navigate(`/consultation/${doctor.id}`)}
            >
              <MessageCircle className="h-4 w-4" />
              استشارة الآن
            </Button>
            {doctor.phone && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(`tel:${doctor.phone}`)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-4 py-4">
          <Tabs defaultValue="about" dir="rtl">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="about">نبذة</TabsTrigger>
              <TabsTrigger value="qualifications">المؤهلات</TabsTrigger>
              <TabsTrigger value="posts">المنشورات</TabsTrigger>
              <TabsTrigger value="consultation">الاستشارة</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-4 mt-4">
              {doctor.bio && (
                <Card className="shadow-soft border-0">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">نبذة عني</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{doctor.bio}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-soft border-0">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold">معلومات التواصل</h3>
                  
                  {doctor.working_hours && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>أوقات العمل: {doctor.working_hours}</span>
                    </div>
                  )}
                  
                  {doctor.clinic_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.clinic_name}</span>
                    </div>
                  )}
                  
                  {doctor.languages && doctor.languages.length > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span>اللغات: {doctor.languages.join('، ')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Badges */}
              {doctor.badges && doctor.badges.length > 0 && (
                <Card className="shadow-soft border-0">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-3">الشارات</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.badges.map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <Award className="h-3 w-3" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Qualifications Tab */}
            <TabsContent value="qualifications" className="space-y-4 mt-4">
              {doctor.education && doctor.education.length > 0 && (
                <Card className="shadow-soft border-0">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      التعليم
                    </h3>
                    <ul className="space-y-2">
                      {doctor.education.map((edu, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {doctor.certifications && doctor.certifications.length > 0 && (
                <Card className="shadow-soft border-0">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      الشهادات والتخصصات
                    </h3>
                    <ul className="space-y-2">
                      {doctor.certifications.map((cert, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(!doctor.education || doctor.education.length === 0) && 
               (!doctor.certifications || doctor.certifications.length === 0) && (
                <Card className="shadow-soft border-0">
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">لم يتم إضافة المؤهلات بعد</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-4 mt-4">
              {posts.length === 0 ? (
                <Card className="shadow-soft border-0">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">لا توجد منشورات</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="shadow-soft border-0">
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      {post.image_url && (
                        <img 
                          src={post.image_url} 
                          alt="" 
                          className="w-full h-40 object-cover rounded-lg mt-3"
                        />
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments_count}
                        </span>
                        <span className="mr-auto">
                          {new Date(post.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Consultation Tab */}
            <TabsContent value="consultation" className="space-y-4 mt-4">
              <Card className="shadow-soft border-0">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3">أنواع الاستشارة المتاحة</h3>
                  <div className="space-y-3">
                    {doctor.consultation_types?.includes('text') && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">استشارة نصية</p>
                          <p className="text-xs text-muted-foreground">تواصل عبر الرسائل</p>
                        </div>
                      </div>
                    )}
                    {doctor.consultation_types?.includes('voice') && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Phone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">استشارة صوتية</p>
                          <p className="text-xs text-muted-foreground">مكالمة صوتية مباشرة</p>
                        </div>
                      </div>
                    )}
                    {doctor.consultation_types?.includes('video') && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Video className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">استشارة فيديو</p>
                          <p className="text-xs text-muted-foreground">مكالمة فيديو مباشرة</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button 
                className="w-full gap-2"
                size="lg"
                disabled={!doctor.is_available}
                onClick={() => navigate(`/consultation/${doctor.id}`)}
              >
                <Calendar className="h-5 w-5" />
                طلب استشارة
              </Button>

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center leading-relaxed">
                  ⚠️ الاستشارات المقدمة إرشادية وليست بديلاً عن الفحص الطبي المباشر.
                  أي وصفة إرشادية غير ملزمة قانونياً.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DoctorProfile;
