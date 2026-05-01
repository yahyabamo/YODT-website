import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Lightbulb, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, submitSuggestion } from '@/service/supabaseData';

type SuggestionType = 'suggestion' | 'problem' | 'idea';

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
    type: 'idea' as SuggestionType,
    label: 'فكرة',
    icon: Lightbulb,
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
  const [selectedType, setSelectedType] = useState<SuggestionType>('suggestion');
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(u => setUser(u)).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('يرجى كتابة رسالتك');
      return;
    }

    // Guest users must provide contact info so admin can follow up
    if (!user && !contactInfo.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني أو رقم الهاتف للتواصل');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = generateTrackingCode();

      /**
       * Build the payload to match the `suggestions` table schema exactly:
       *
       *   type          TEXT  NOT NULL   -- 'suggestion' | 'problem' | 'idea'
       *   message       TEXT  NOT NULL
       *   status        TEXT  DEFAULT 'NEW'
       *   user_id       UUID  (authenticated users)
       *   tracking_code TEXT  (guest users)
       *   contact_email TEXT  (guest users)
       *   contact_phone TEXT  (guest users)
       *
       * Do NOT send undefined keys — Supabase/PostgREST may reject or mishandle them.
       */
      const payload: {
        type: string;
        message: string;
        status: string;
        user_id?: string;
        tracking_code?: string;
        contact_email?: string;
        contact_phone?: string;
      } = {
        type: selectedType,
        message: message.trim(),
        status: 'NEW',
      };

      if (user) {
        payload.user_id = user.id;
      } else {
        payload.tracking_code = code;
        if (contactInfo.includes('@')) {
          payload.contact_email = contactInfo.trim();
        } else {
          payload.contact_phone = contactInfo.trim();
        }
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
    setMessage('');
    setContactInfo('');
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
                إذا قمت بإنشاء حساب بنفس البريد الإلكتروني أو رقم الهاتف، سيتم ربط الطلب بحسابك تلقائياً.
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
      <PageHeader title="ماذا تريد من الاتحاد؟" showBack />

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
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${selectedType === item.type
                ? item.color + ' border-current shadow-sm'
                : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
            >
              <item.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Message + optional contact */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="min-h-[150px] resize-none border-border focus-visible:ring-primary/20 text-base rounded-xl"
            />

            {/* Contact field — only for guests */}
            {!user && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground block">
                  البريد الإلكتروني أو رقم الهاتف للتواصل
                </label>
                <Input
                  placeholder="example@domain.com أو 05xx..."
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  className="rounded-xl h-12"
                  dir="ltr"
                  inputMode="email"
                />
              </div>
            )}
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