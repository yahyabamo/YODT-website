import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, GraduationCap, BookOpen, LogOut, Settings,
  ChevronLeft, Heart, CreditCard, Percent, QrCode, Edit3, Check, X,
  Shield, Activity, Camera, StickyNote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { CompleteProfileSection } from '@/components/features/profile/CompleteProfileSection';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchPointsHistory } from '@/service/supabaseData';
import { SmartTopBar } from '@/components/layout/SmartTopBar';



interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  university: string | null;
  faculty: string | null;
  student_id: string | null;
  avatar_url: string | null;
  membership_qr_token: string | null;
  membership_expires_at: string | null;
  role: string;
  status: string;
  total_points: number;
  created_at: string | null;
  updated_at: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [editForm, setEditForm] = useState({
    avatar_url: '',
  });
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    // Only act if authLoading is finished
    if (authLoading) return;

    if (!user) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [user, authLoading]); // Remove 'navigate' from here to prevent unnecessary re-runs

  const fetchProfile = async () => {
    console.log("USER ID:", user?.id);

    if (!user) return;
    // Update this specific block in fetchProfile:
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(); // Use single() to force a result or an error

      if (profileError) {
        console.error("Supabase Error:", profileError);
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData as any);
        setEditForm({
          avatar_url: profileData.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('CRITICAL: Error fetching profile:', error);
      toast.error('حدث خطأ في تحميل الملف الشخصي');
      // If it fails, we MUST stop the loading state or the page stays white
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'activity_unsigned');
      formData.append('folder', 'avatars');
      const res = await fetch('https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setEditForm(prev => ({ ...prev, avatar_url: data.secure_url }));
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error('فشل في رفع الصورة');
      }
    } catch {
      toast.error('خطأ في الاتصال أثناء رفع الصورة');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: editForm.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        avatar_url: editForm.avatar_url,
      } as any : null);

      setIsEditing(false);
      toast.success('تم حفظ التغييرات');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('حدث خطأ في حفظ التغييرات');
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('حدث خطأ في تسجيل الخروج');
    } else {
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/');
    }
  };

  const menuItems = [
    { icon: QrCode, label: 'بطاقة العضوية', path: '/membership-card', color: 'bg-green-500/10 text-green-600' },
    { icon: Percent, label: 'الخصومات والعروض', path: '/home/offers', color: 'bg-orange-500/10 text-orange-600' },
    // { icon: CreditCard, label: 'الاشتراكات', path: '/subscriptions', color: 'bg-primary/10 text-primary' },
    { icon: Heart, label: 'الداعمون والشركاء', path: '/partners', color: 'bg-red-500/10 text-red-600' },
    { icon: StickyNote, label: 'الملاحظات', path: '/notes', color: 'bg-blue-500/10 text-blue-600' },
    { icon: Activity, label: 'الاقتراحات والاستفسارات', path: '/suggestions', color: 'bg-indigo-500/10 text-indigo-600' },
    { icon: Activity, label: 'طلباتي ', path: '/profile/requests', color: 'bg-indigo-500/10 text-indigo-600' },
  ];

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

  const isStudent = profile.role !== 'admin';

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky-header">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>
      <div className="px-4 py-4 max-w-screen-xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="shadow-card animate-slide-up overflow-hidden">
          <div className="gradient-primary h-24" />
          <CardContent className="pt-0 pb-6 -mt-12">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-card border-4 border-card shadow-card flex items-center justify-center overflow-hidden">
                  {isEditing && editForm.avatar_url ? (
                    <img src={editForm.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : !isEditing && profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{isStudent ? '👨‍🎓' : '👩‍🎓'}</span>
                  )}
                </div>

                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                    {avatarUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarFileChange} disabled={avatarUploading} />
                  </label>
                )}
              </div>

              <h2 className="text-xl font-bold mt-4">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                {profile.university || 'لم يتم تحديد الجامعة'}
              </p>

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.total_points}</p>
                  <p className="text-xs text-muted-foreground">نقطة</p>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex gap-2 mt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      حفظ
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    تعديل الملف
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs - Academic, Activity, Behavioral */}
        <Card className="shadow-soft animate-slide-up">
          <CardContent className="p-4">
            <Tabs defaultValue="academic" dir="rtl">
              <TabsList className="w-full flex justify-center mb-4">
                {/* <TabsTrigger value="academic" className="gap-1 text-xs"> */}
                <GraduationCap className="h-4 w-4" />
                أكاديمي
                {/* </TabsTrigger> */}
              </TabsList>

              {/* <TabsTrigger value="activity" className="gap-1 text-xs">
                  <Activity className="h-4 w-4" />
                  نشاط
                </TabsTrigger> */}
              <TabsContent value="academic" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">الجامعة</p>
                    <p className="font-medium text-sm">{profile.university || 'غير محدد'}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">التخصص</p>
                    <p className="font-medium text-sm">{profile.faculty || 'غير محدد'}</p>
                  </div>

                </div>
              </TabsContent>

              {/* <TabsContent value="activity" className="text-center py-6">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  سجل النشاط غير متوفر حالياً
                </p>
              </TabsContent> */}
            </Tabs>
          </CardContent>
        </Card>




        {/* Contact Info */}
        <Card className="shadow-soft animate-slide-up">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4 border-b border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium" dir="ltr">{profile.email || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium" dir="ltr">{profile.phone || 'غير محدد'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Section */}
        <Card className="shadow-soft animate-slide-up">
          <CardContent className="p-0">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors active:bg-muted"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">{item.label}</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card className="shadow-soft animate-slide-up">
          <CardContent className="p-0">
            <button
              onClick={() => navigate('/policies')}
              className="w-full flex items-center gap-4 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors active:bg-muted"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium">السياسات والقوانين</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/guide')}
              className="w-full flex items-center gap-4 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors active:bg-muted"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium">الاسالة الشائعة</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 hover:bg-destructive/10 transition-colors active:bg-destructive/20"
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium text-destructive">تسجيل الخروج</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          • اتحاد الطلاب اليمنيين في تركيا
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
