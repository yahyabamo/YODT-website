import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, HelpCircle, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, submitSuggestion } from '@/service/supabaseData';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type SuggestionType = 'suggestion' | 'problem' | 'question';

const suggestionTypes = [
  {
    type: 'suggestion' as SuggestionType,
    label: 'اقتراح',
    icon: MessageSquare,
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    type: 'problem' as SuggestionType,
    label: 'مشكلة',
    icon: AlertCircle,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  {
    type: 'question' as SuggestionType,
    label: 'استفسار',
    icon: HelpCircle,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
];

/**
 * Generates a short random tracking code for guest submissions.
 * Keep this client-side — it's just for user reference.
 * The real uniqueness guarantee is the UNIQUE constraint in Supabase.
 */
const generateTrackingCode = (): string =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

const Suggestions = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pre-select type from URL param (?type=suggestion|question|problem)
  const typeParam = searchParams.get('type') as SuggestionType | null;
  const sourceParam = searchParams.get('from') ?? undefined;

  const [selectedType, setSelectedType] = useState<SuggestionType>(
    suggestionTypes.find(t => t.type === typeParam) ? typeParam! : 'suggestion'
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('يرجى إدخال اسمك');
      return;
    }

    if (!phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    if (!message.trim()) {
      toast.error('يرجى كتابة رسالتك');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = generateTrackingCode();

      /**
       * Payload schema:
       *   type          TEXT  NOT NULL   -- 'suggestion' | 'problem' | 'question'
       *   message       TEXT  NOT NULL
       *   status        TEXT  DEFAULT 'NEW'
       *   source_page   TEXT  (which page the box was clicked from)
       *   contact_name  TEXT  (name provided by submitter)
       *   contact_phone TEXT  (phone for follow-up + account linking)
       *   user_id       UUID  (authenticated users)
       *   tracking_code TEXT  (guest users only)
       */
      const payload: {
        type: string;
        message: string;
        status: string;
        source_page?: string;
        contact_name?: string;
        contact_phone?: string;
        user_id?: string;
        tracking_code?: string;
      } = {
        type: selectedType,
        message: message.trim(),
        status: 'NEW',
        contact_name: name.trim(),
        contact_phone: phone.trim(),
      };

      if (sourceParam) {
        payload.source_page = sourceParam;
      }

      if (user) {
        payload.user_id = user.id;
      } else {
        payload.tracking_code = code;
      }

      await submitSuggestion(payload);

      // Show tracking code only for guests (logged-in users don't have one)
      setTrackingCode(user ? '' : code);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[Suggestions] submitSuggestion error:', err);
      toast.error(err?.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setMessage('');
    setTrackingCode('');
    setSelectedType('suggestion');
  };

  // ── Success screen ──────────────────────────────────────────────────────────

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="ماذا تريد من الاتحاد؟" showBack />

        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">شكراً لك!</h2>
          <p className="text-muted-foreground max-w-xs mb-6">
            تم استلام رسالتك بنجاح. سنقوم بمراجعتها والرد عليك في أقرب وقت.
          </p>

          {/* Only shown to guest users who got a tracking code */}
          {trackingCode && (
            <div className="bg-muted/50 rounded-xl p-5 mb-8 w-full max-w-sm border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">كود التتبع الخاص بك</p>
              <div className="text-2xl font-mono tracking-widest text-foreground select-all bg-background py-3 rounded-lg border border-border/50">
                {trackingCode}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                إذا قمت بإنشاء حساب بنفس رقم الهاتف، سيتم ربط الطلب بحسابك تلقائياً.
              </p>
            </div>
          )}

          <Button onClick={handleReset} variant="outline" className="rounded-xl">
            إرسال رسالة أخرى
          </Button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Form screen ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
              {selectedType === 'question' ? 'أرسل استفسارك' : 'اقتراحاتك للاتحاد'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <p className="text-muted-foreground text-center">
          صوتك مهم لنا! شاركنا أفكارك ومقترحاتك لتطوير خدماتنا.
        </p>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-3">
          {suggestionTypes.map(item => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedType === item.type
                  ? item.color + ' border-current shadow-sm'
                  : 'bg-card border-border hover:border-muted-foreground/30'
              }`}
            >
              <item.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">
                الاسم <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="الاسم الكامل..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">
                رقم الهاتف <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="مثال: 05xxxxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="rounded-xl h-12 text-left"
                dir="ltr"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">
                سيُستخدم للتواصل معك وربط طلبك بحسابك إن أنشأت حساباً لاحقاً
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2 pt-1">
              <label className="text-sm font-medium text-muted-foreground block">
                رسالتك <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={
                  selectedType === 'question'
                    ? 'اكتب استفسارك هنا...'
                    : 'اكتب اقتراحك أو رسالتك هنا...'
                }
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="min-h-[150px] resize-none border-border focus-visible:ring-primary/20 text-base rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-14 text-lg rounded-2xl gap-2 shadow-sm"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Suggestions;