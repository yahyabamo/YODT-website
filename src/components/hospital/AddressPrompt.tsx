import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, AlertCircle } from 'lucide-react';
import { countries } from '@/data/countriesData';
import { toast } from 'sonner';

interface AddressPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const AddressPrompt = ({ open, onOpenChange, onComplete }: AddressPromptProps) => {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Try to prefill from registration data
    const regData = localStorage.getItem('registrationData');
    if (regData) {
      const parsed = JSON.parse(regData);
      setCountry(parsed.country || '');
      setCity(parsed.city || '');
    }
  }, [open]);

  const getAvailableCities = () => {
    const countryData = countries.find(c => c.code === country);
    return countryData?.cities || [];
  };

  const handleSubmit = () => {
    if (!district.trim()) {
      toast.error('يرجى إدخال الحي أو المنطقة على الأقل');
      return;
    }

    const addressData = {
      country,
      city,
      district,
      address,
      isComplete: true
    };
    
    localStorage.setItem('userAddress', JSON.stringify(addressData));
    toast.success('تم حفظ العنوان');
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            أكمل بيانات العنوان
          </DialogTitle>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            العنوان مطلوب لاستخدام خدمات المستشفى
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">الدولة</label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setCity(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المدينة</label>
              <Select value={city} onValueChange={setCity} disabled={!country}>
                <SelectTrigger>
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCities().map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الحي/المنطقة *</label>
            <Input
              placeholder="مثال: الفاتح"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">العنوان المختصر (اختياري)</label>
            <Input
              placeholder="رقم المبنى أو أقرب معلم"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            لاحقاً
          </Button>
          <Button onClick={handleSubmit}>
            حفظ ومتابعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const useAddressCheck = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [addressComplete, setAddressComplete] = useState(false);

  useEffect(() => {
    checkAddress();
  }, []);

  const checkAddress = () => {
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      const parsed = JSON.parse(savedAddress);
      setAddressComplete(parsed.isComplete);
      return parsed.isComplete;
    }
    return false;
  };

  const requireAddress = (): boolean => {
    const complete = checkAddress();
    if (!complete) {
      setShowPrompt(true);
      return false;
    }
    return true;
  };

  const onComplete = () => {
    setAddressComplete(true);
  };

  return {
    showPrompt,
    setShowPrompt,
    addressComplete,
    requireAddress,
    onComplete
  };
};
