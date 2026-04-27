import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { storeText } from '@/i18n/pages';
import { submitOrder, OrderPayload, StoreProduct } from '@/services/storeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { getField } from '@/i18n/pages';

interface OrderFormProps {
  product: StoreProduct;
  onSuccess: () => void;
}

export function OrderForm({ product, onSuccess }: OrderFormProps) {
  const { language } = useLanguage();
  const { profile, user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    quantity: 1,
    note: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: OrderPayload = {
        product_id: product.id,
        quantity: formData.quantity,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || undefined,
        customer_note: formData.note || undefined,
        user_id: user?.id,
        product_name_ar: getField(product, 'name', 'ar'),
        product_name_en: getField(product, 'name', 'en'),
        product_name_tr: getField(product, 'name', 'tr'),
        product_price: product.price,
        product_currency: product.currency,
      };

      const { error: submitError } = await submitOrder(payload);
      
      if (submitError) throw submitError;
      
      onSuccess();
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(storeText.orderForm.error[language]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">{storeText.orderForm.name[language]} <span className="text-destructive">*</span></Label>
          <Input 
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={storeText.orderForm.namePlaceholder[language]}
            required
            disabled={loading}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">{storeText.orderForm.phone[language]} <span className="text-destructive">*</span></Label>
          <Input 
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder={storeText.orderForm.phonePlaceholder[language]}
            required
            disabled={loading}
            className="bg-background text-left"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">{storeText.orderForm.email[language]}</Label>
          <Input 
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={storeText.orderForm.emailPlaceholder[language]}
            disabled={loading}
            className="bg-background text-left"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-foreground">{storeText.orderForm.quantity[language]}</Label>
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => handleQuantityChange(-1)}
              disabled={formData.quantity <= 1 || loading}
            >
              -
            </Button>
            <span className="w-8 text-center font-bold text-lg">{formData.quantity}</span>
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => handleQuantityChange(1)}
              disabled={loading}
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-foreground">{storeText.orderForm.note[language]}</Label>
          <Textarea 
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder={storeText.orderForm.notePlaceholder[language]}
            disabled={loading}
            className="bg-background min-h-[100px] resize-none"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full py-6 text-base font-bold shadow-md"
        disabled={loading || !formData.name || !formData.phone}
      >
        {loading ? storeText.orderForm.submitting[language] : storeText.orderForm.submit[language]}
      </Button>
    </form>
  );
}
