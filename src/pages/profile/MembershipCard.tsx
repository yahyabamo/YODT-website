import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Shield, Calendar, Award, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateSecureToken, getTokenExpirySeconds } from '@/lib/qrToken';
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

const MembershipCard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState('');
  const [expirySeconds, setExpirySeconds] = useState(60);
  const [showSearch, setShowSearch] = useState(false);
  const verifyUrl = `${window.location.origin}/verify/${qrToken}`;

  // Fetch profile when user is available
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        // Generate initial QR token
        refreshToken(data.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Generate new token
  const refreshToken = (userId?: string) => {
    const id = userId || profile?.id;
    if (!id) return;

    const token = generateSecureToken(id);
    setQrToken(token);
    setExpirySeconds(getTokenExpirySeconds());
  };

  // Set up token refresh and countdown
  useEffect(() => {
    if (!profile) return;

    // Refresh token every minute
    const interval = setInterval(() => refreshToken(), 600000);

    // Countdown timer
    const countdown = setInterval(() => {
      setExpirySeconds(prev => {
        if (prev <= 1) {
          refreshToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [profile]);

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

  const joinDate = profile.created_at
    ? (() => {
      const d = new Date(profile.created_at);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    })()
    : 'غير محدد';

  // Membership validity (example: 1 year from now, or use membership_expires_at if available)
  const validUntil = profile.membership_expires_at
    ? (() => {
      const d = new Date(profile.membership_expires_at);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    })()
    : (() => {
      const created = new Date(profile.created_at);
      const expiry = new Date(created);
      expiry.setFullYear(created.getFullYear() + 1);
      const day = String(expiry.getDate()).padStart(2, '0');
      const month = String(expiry.getMonth() + 1).padStart(2, '0');
      const year = expiry.getFullYear();
      return `${day}-${month}-${year}`;
    })();

  // Generate verification code
  const verificationCode = `🇾🇪-${profile.id.slice(0, 8)}-2026`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky-header">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>
      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Membership Card */}
        <Card className="overflow-hidden shadow-card animate-slide-up">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="font-bold">اتحاد الطلاب اليمنيين</span>
              </div>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                عضو فعال
              </Badge>
            </div>
            <p className="text-xs opacity-80 mt-1">فرع إسطنبول - تركيا</p>
          </div>

          {/* Card Body */}
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Member Photo */}
              <div className="w-20 h-20 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center mb-4">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>

              {/* Member Name */}
              <h2 className="text-xl font-bold text-center">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground">{profile.university || 'الجامعة غير محددة'}</p>

              {/* Dynamic QR Code */}
              <div className="mt-6 p-4 bg-white rounded-xl shadow-inner relative">
                <QRCodeSVG
                  value={verifyUrl} // Now the camera sees a clickable link
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />

                {/* Timer Badge */}
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {expirySeconds}s
                </div>
              </div>

              {/* Security Note */}
              <p className="mt-3 text-xs text-muted-foreground text-center">
                🔒 رمز QR يتجدد تلقائياً كل دقيقة للأمان
              </p>

              {/* Verification Code */}
              <p className="mt-2 text-sm font-mono bg-muted px-4 py-2 rounded-lg">
                {verificationCode}
              </p>

              {/* Member Details */}
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">تاريخ الانضمام</span>
                  </div>
                  <span className="text-sm font-medium">{joinDate}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">صالحة حتى</span>
                  </div>
                  <span className="text-sm font-medium">{validUntil}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">رصيد النقاط</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{profile.total_points} نقطة</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-0 shadow-soft bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-2">كيفية استخدام البطاقة</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">1</span>
                أظهر هذه البطاقة عند زيارة الشركاء والداعمين
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2</span>
                سيقوم الداعم بمسح رمز QR للتحقق من عضويتك
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3</span>
                ستحصل على الخصم المخصص لأعضاء الاتحاد فوراً!
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default MembershipCard;