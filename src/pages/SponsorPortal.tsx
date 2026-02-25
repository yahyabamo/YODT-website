import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Check, X, QrCode, History, Settings, 
  User, Clock, ArrowRight, Scan, Tag, Store, 
  MapPin, Phone, Globe, ChevronLeft, BarChart3,
  Download, Camera, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { sponsors, DiscountTransaction } from '@/data/sponsorsData';
import { verifySecureToken } from '@/lib/qrToken';
import logo from '@/assets/logo.png';

type PortalStep = 'pin' | 'dashboard' | 'scanner' | 'result' | 'history' | 'offers' | 'profile';

interface VerificationResult {
  isValid: boolean;
  memberId: string;
  memberName: string;
  memberPhoto?: string;
  status: 'active' | 'expired' | 'suspended';
  eligibleForDiscount: boolean;
  discountPercentage: string;
}

const SponsorPortal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PortalStep>('pin');
  const [pin, setPin] = useState('');
  const [currentSponsor, setCurrentSponsor] = useState<typeof sponsors[0] | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [transactions, setTransactions] = useState<DiscountTransaction[]>([]);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sponsorTransactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  const handlePinSubmit = () => {
    const sponsor = sponsors.find(s => s.pin === pin);
    if (sponsor) {
      setCurrentSponsor(sponsor);
      setStep('dashboard');
      toast.success(`مرحباً ${sponsor.name}`);
    } else {
      toast.error('رمز PIN غير صحيح');
      setPin('');
    }
  };

  const handleScan = (code: string) => {
    const result = verifySecureToken(code);
    
    if (result.isValid && result.memberId) {
      setVerificationResult({
        isValid: true,
        memberId: result.memberId,
        memberName: 'أحمد محمد',
        status: 'active',
        eligibleForDiscount: true,
        discountPercentage: currentSponsor?.offers[0]?.discount || '15%',
      });
      setStep('result');
    } else {
      toast.error(result.error || 'رمز غير صالح');
    }
  };

  const handleManualVerify = () => {
    if (manualCode.length > 10) {
      handleScan(manualCode);
    } else {
      toast.error('الرجاء إدخال رمز صحيح');
    }
  };

  const handleRegisterDiscount = () => {
    if (!verificationResult || !currentSponsor) return;

    const newTransaction: DiscountTransaction = {
      id: Date.now().toString(),
      memberId: verificationResult.memberId,
      memberName: verificationResult.memberName,
      sponsorId: currentSponsor.id,
      timestamp: new Date(),
      offerId: currentSponsor.offers[0]?.id || '',
    };

    const updated = [newTransaction, ...transactions].slice(0, 50);
    setTransactions(updated);
    localStorage.setItem('sponsorTransactions', JSON.stringify(updated));

    toast.success('تم تسجيل الخصم بنجاح! ✅');
    setVerificationResult(null);
    setStep('dashboard');
  };

  const handleLogout = () => {
    setCurrentSponsor(null);
    setPin('');
    setStep('pin');
  };

  const sponsorTransactions = transactions.filter(t => t.sponsorId === currentSponsor?.id);
  const todayTransactions = sponsorTransactions.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.timestamp).toDateString() === today;
  });

  // PIN Entry Screen
  if (step === 'pin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-sm">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
              <Store className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">بوابة الداعم</h1>
            <p className="text-muted-foreground text-sm">أدخل رمز PIN للدخول إلى لوحة التحكم</p>
          </div>

          {/* PIN Input Card */}
          <Card className="border-0 shadow-elevated">
            <CardContent className="p-6">
              {/* PIN Display */}
              <div className="flex gap-3 justify-center mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      pin.length > i 
                        ? 'border-primary bg-primary/10 text-primary shadow-lg' 
                        : 'border-border bg-muted'
                    }`}
                  >
                    {pin[i] ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (num === 'del') {
                        setPin(p => p.slice(0, -1));
                      } else if (num !== null && pin.length < 4) {
                        const newPin = pin + num;
                        setPin(newPin);
                        if (newPin.length === 4) {
                          setTimeout(() => {
                            const sponsor = sponsors.find(s => s.pin === newPin);
                            if (sponsor) {
                              setCurrentSponsor(sponsor);
                              setStep('dashboard');
                              toast.success(`مرحباً ${sponsor.name}`);
                            } else {
                              toast.error('رمز PIN غير صحيح');
                              setPin('');
                            }
                          }, 200);
                        }
                      }
                    }}
                    disabled={num === null}
                    className={`h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 ${
                      num === null 
                        ? 'invisible' 
                        : num === 'del'
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        : 'bg-muted hover:bg-muted/80 text-foreground shadow-sm'
                    }`}
                  >
                    {num === 'del' ? <X className="w-6 h-6 mx-auto" /> : num}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <button 
            onClick={() => navigate('/home')}
            className="w-full mt-6 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Screen (New)
  if (step === 'dashboard') {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Header with Sponsor Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl shadow-soft">
                {currentSponsor?.logo}
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">{currentSponsor?.name}</h1>
                <p className="text-xs text-muted-foreground">بوابة الداعم</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
              خروج
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-soft bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-bold">{todayTransactions.length}</p>
                <p className="text-xs text-emerald-100">عمليات اليوم</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-bold">{sponsorTransactions.length}</p>
                <p className="text-xs text-blue-100">إجمالي العمليات</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                الإجراءات السريعة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => setStep('scanner')}
                  className="h-auto flex-col gap-3 py-6 bg-gradient-to-br from-primary to-primary/80"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="font-medium">مسح QR</span>
                </Button>
                <Button 
                  onClick={() => setStep('history')}
                  variant="outline"
                  className="h-auto flex-col gap-3 py-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                    <History className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <span className="font-medium">السجل</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Offers */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  عروضي النشطة
                </h3>
                <Badge variant="secondary">{currentSponsor?.offers.filter(o => o.isActive).length}</Badge>
              </div>
              <div className="space-y-3">
                {currentSponsor?.offers.filter(o => o.isActive).map((offer) => (
                  <div key={offer.id} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{offer.discount}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{offer.title}</p>
                      <p className="text-xs text-muted-foreground">{offer.description}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">نشط</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Profile Preview */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  ملف النشاط
                </h3>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setStep('profile')}>
                  تعديل
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{currentSponsor?.location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{currentSponsor?.contact.phone}</span>
                </div>
                {currentSponsor?.branches && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Store className="w-4 h-4" />
                    <span>{currentSponsor.branches.length} فروع</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Scanner Screen
  if (step === 'scanner') {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => setStep('dashboard')} className="gap-1">
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="font-bold">مسح QR</h1>
            <div className="w-16" />
          </div>

          {/* Scanner Area */}
          <Card className="border-0 shadow-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-secondary via-muted to-secondary flex flex-col items-center justify-center p-8 relative">
                {/* Scanner Frame */}
                <div className="absolute inset-8 border-2 border-primary rounded-3xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                </div>
                
                <QrCode className="w-24 h-24 text-primary/30 mb-4" />
                <p className="text-muted-foreground text-center mb-2 font-medium">
                  وجّه الكاميرا نحو رمز QR للطالب
                </p>
                <p className="text-xs text-muted-foreground">
                  سيتم التحقق تلقائياً
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card className="border-0 shadow-soft mt-4">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">أو</span>
                إدخال يدوي
              </p>
              <div className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="أدخل رمز العضوية..."
                  className="text-left h-12"
                  dir="ltr"
                />
                <Button onClick={handleManualVerify} size="icon" className="h-12 w-12">
                  <Check className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Button */}
          <Button 
            variant="outline" 
            className="w-full mt-4 h-12"
            onClick={() => {
              setVerificationResult({
                isValid: true,
                memberId: 'DEMO-001',
                memberName: 'أحمد محمد علي',
                status: 'active',
                eligibleForDiscount: true,
                discountPercentage: currentSponsor?.offers[0]?.discount || '15%',
              });
              setStep('result');
            }}
          >
            <Scan className="w-5 h-5 ml-2" />
            تجربة المسح (Demo)
          </Button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (step === 'result' && verificationResult) {
    const isValid = verificationResult.status === 'active';
    
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          {/* Success/Error Card */}
          <Card className={`border-0 shadow-elevated overflow-hidden`}>
            <CardContent className="p-0">
              <div className={`p-8 text-white text-center ${
                isValid 
                  ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600' 
                  : 'bg-gradient-to-br from-destructive via-destructive/90 to-destructive/80'
              }`}>
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isValid ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {isValid ? (
                    <Check className="w-12 h-12" />
                  ) : (
                    <X className="w-12 h-12" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {isValid ? 'عضوية فعّالة ✓' : 'عضوية غير فعّالة'}
                </h2>
                <p className="text-white/80">
                  {isValid 
                    ? 'الطالب مؤهل للحصول على الخصم'
                    : 'الطالب غير مؤهل للخصم حالياً'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Member Info Card */}
          <Card className="border-0 shadow-soft mt-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {verificationResult.memberName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    رقم العضوية: {verificationResult.memberId}
                  </p>
                  <Badge variant={isValid ? 'default' : 'secondary'} className="mt-2">
                    {isValid ? 'عضو فعّال' : 'غير فعّال'}
                  </Badge>
                </div>
              </div>

              {/* Discount Display */}
              {isValid && verificationResult.eligibleForDiscount && (
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">الخصم المستحق</p>
                      <p className="text-xs text-muted-foreground">{currentSponsor?.offers[0]?.title}</p>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {verificationResult.discountPercentage}
                    </div>
                  </div>
                </div>
              )}

              {/* Register Button */}
              {isValid && (
                <Button 
                  onClick={handleRegisterDiscount}
                  className="w-full h-14 text-lg font-bold shadow-lg"
                  size="lg"
                >
                  <Check className="w-6 h-6 ml-2" />
                  تسجيل الخصم
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Back Button */}
          <Button 
            variant="outline" 
            className="w-full mt-4 h-12"
            onClick={() => {
              setVerificationResult(null);
              setStep('scanner');
            }}
          >
            <Scan className="w-5 h-5 ml-2" />
            مسح عضوية أخرى
          </Button>
        </div>
      </div>
    );
  }

  // History Screen
  if (step === 'history') {
    return (
      <div className="min-h-screen bg-background p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => setStep('dashboard')} className="gap-1">
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="font-bold">سجل العمليات</h1>
            <Button variant="ghost" size="icon">
              <Download className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <Card className="border-0 shadow-soft mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{todayTransactions.length}</p>
                  <p className="text-xs text-muted-foreground">اليوم</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-500">{sponsorTransactions.length}</p>
                  <p className="text-xs text-muted-foreground">الإجمالي</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-500">
                    {currentSponsor?.offers[0]?.discount}
                  </p>
                  <p className="text-xs text-muted-foreground">نسبة الخصم</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-3">
            {sponsorTransactions.length === 0 ? (
              <Card className="border-0 shadow-soft">
                <CardContent className="p-8 text-center">
                  <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">لا توجد عمليات بعد</p>
                  <p className="text-xs text-muted-foreground mt-1">ابدأ بمسح بطاقات العضوية</p>
                </CardContent>
              </Card>
            ) : (
              sponsorTransactions.slice(0, 20).map((tx) => (
                <Card key={tx.id} className="border-0 shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{tx.memberName}</p>
                        <p className="text-xs text-muted-foreground">{tx.memberId}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString('ar-SA')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default SponsorPortal;
