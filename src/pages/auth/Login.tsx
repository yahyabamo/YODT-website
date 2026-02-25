import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Onboarding } from '@/components/features/onboarding/Onboarding';
import { useAuth } from '@/hooks/useAuth';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import logo from '@/assets/logo.png';
import { z } from 'zod';
import { User, Check, ArrowRight } from 'lucide-react';

type Gender = 'male' | 'female' | null;

const emailSchema = z.string().email('البريد الإلكتروني غير صالح');
const passwordSchema = z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');

// ── Replace ONLY the top of your Login component ─────────────
// (just the state + useEffects, keep everything else the same)

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Track whether the user just logged in (vs already was logged in)
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { user, profile, loading, signUp, signIn } = useAuth();

  // ── Case 1: user was already logged in (page refresh / revisit) ──
  // Wait for loading to finish, then redirect
  useEffect(() => {
    if (loading) return;
    if (!user || justLoggedIn) return;
    if (!profile) return; // مهم جداً// justLoggedIn case handled below
    // Already authenticated — send them where they belong
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  }, [loading, user]);

  // ── Case 2: user JUST logged in — wait for profile to populate ───
  // profile starts as null right after signIn(), then AuthContext
  // loads it async. This effect watches for when it arrives.
  useEffect(() => {
    if (!justLoggedIn) return;
    if (loading) return;
    if (!user) return;
    if (!profile) return; // ← هذا هو الفرق المهم

    if (profile.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  }, [justLoggedIn, loading, profile, user]);

  // ── Login handler ─────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(
          error.message.includes('Invalid login credentials')
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            : error.message
        );
        return;
      }
      toast.success('تم تسجيل الدخول بنجاح');
      // Signal that we're waiting for profile to load before redirecting
      setJustLoggedIn(true);
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register handler ─────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('يرجى إدخال الاسم الأول والأخير'); return;
    }
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }
    if (!gender) { toast.error('يرجى اختيار النوع'); return; }

    setIsLoading(true);
    try {
      localStorage.setItem('registrationData', JSON.stringify({
        phone, userType: 'student', firstName, lastName,
      }));
      const { error } = await signUp(email, password, `${firstName} ${lastName}`, gender);
      if (error) {
        toast.error(
          error.message.includes('User already registered')
            ? 'هذا البريد الإلكتروني مسجل بالفعل'
            : error.message
        );
        return;
      }
      localStorage.setItem('userGender', gender);
      toast.success('تم إنشاء الحساب بنجاح');
      // useEffect will redirect once profile loads
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Spinners ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const handleOnboardingComplete = () => {
    // This tells the login page to stop showing onboarding 
    // and proceed to the dashboard/home
    setShowOnboarding(false);
    navigate("/home");
  };
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // ── LOGIN FORM ───────────────────────────────────────────────
  if (isLogin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 animate-fade-in">
            <img src={logo} alt="اتحاد الطلاب اليمنيين" className="w-36 h-auto mx-auto mb-4" />
          </div>

          <Card className="shadow-card animate-slide-up border-0">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-center mb-6">تسجيل الدخول</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 bg-secondary border-0 rounded-xl text-base"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 bg-secondary border-0 rounded-xl text-base"
                  />
                </div>

                <button
                  type="button"
                  className="text-sm text-primary hover:underline block w-full text-left"
                  onClick={() => setShowForgotPassword(true)}
                >
                  نسيت كلمة المرور؟
                </button>

                <Button type="submit" className="w-full h-14 mt-4 text-lg font-semibold rounded-xl" disabled={isLoading}>
                  {isLoading ? 'جاري التحميل...' : 'دخول'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  ليس لديك حساب؟{' '}
                  <button onClick={() => setIsLogin(false)} className="text-primary font-medium hover:underline">
                    سجل الآن
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-muted-foreground text-xs mt-8">
            © 2025 اتحاد الطلاب اليمنيين في تركيا
          </p>
        </div>

        <ForgotPasswordDialog open={showForgotPassword} onOpenChange={setShowForgotPassword} />
      </div>
    );
  }

  // ── REGISTRATION FORM ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 animate-fade-in">
          <img src={logo} alt="اتحاد الطلاب اليمنيين" className="w-24 h-auto mx-auto mb-4" />
        </div>

        <Card className="shadow-card animate-slide-up border-0">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">إنشاء حساب جديد</h2>
              <p className="text-sm text-muted-foreground mt-1">أدخل معلوماتك للانضمام إلى الاتحاد</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الأول</label>
                  <Input placeholder="محمد" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 bg-secondary border-0 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الأخير</label>
                  <Input placeholder="أحمد" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12 bg-secondary border-0 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-secondary border-0 rounded-xl" dir="ltr" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-secondary border-0 rounded-xl" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الجوال</label>
                <Input type="tel" placeholder="05XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 bg-secondary border-0 rounded-xl" dir="ltr" />
                <p className="text-xs text-muted-foreground">سيتم التحقق لاحقاً</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">النوع</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setGender('male')}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${gender === 'male' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <span className="text-2xl">👨‍🎓</span><span className="font-medium">ذكر</span>
                  </button>
                  <button type="button" onClick={() => setGender('female')}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${gender === 'female' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <span className="text-2xl">👩‍🎓</span><span className="font-medium">أنثى</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsLogin(true)} className="flex-1 h-12 rounded-xl gap-2">
                  <ArrowRight className="h-4 w-4" />رجوع
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl gap-2" disabled={isLoading}>
                  {isLoading ? 'جاري التسجيل...' : 'إنشاء حساب'}<Check className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <button onClick={() => setIsLogin(true)} className="text-primary font-medium hover:underline">
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-xs mt-8">
          © 2025 اتحاد الطلاب اليمنيين في تركيا
        </p>
      </div>
    </div>
  );
};

export default Login;