import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { storeText } from '@/i18n/pages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToStore: () => void;
}

export function OrderSuccessModal({ isOpen, onClose, onBackToStore }: OrderSuccessModalProps) {
  const { language } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <DialogTitle className="text-2xl text-center mb-2">
            {language === 'ar' ? 'تم استلام طلبك!' : language === 'tr' ? 'Siparişiniz alındı!' : 'Order Received!'}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {storeText.orderForm.success[language]}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={onBackToStore} className="w-full">
            {storeText.backToStore[language]}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
