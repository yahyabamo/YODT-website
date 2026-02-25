import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('البريد الإلكتروني غير صالح');

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSent(true);
      toast.success('تم إرسال رابط استعادة كلمة المرور');
    } catch (err) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">استعادة كلمة المرور</DialogTitle>
          <DialogDescription className="text-center">
            {!isSent 
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط لاستعادة كلمة المرور'
              : 'تم إرسال الرابط بنجاح'
            }
          </DialogDescription>
        </DialogHeader>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-10 bg-secondary border-0 rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </Button>

            <Button 
              type="button"
              variant="ghost" 
              className="w-full gap-2"
              onClick={handleClose}
            >
              <ArrowLeft className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              تفقد بريدك الإلكتروني <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              إذا لم تجد الرسالة، تفقد مجلد الرسائل غير المرغوب فيها
            </p>
            <Button onClick={handleClose} className="mt-4">
              حسناً
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
