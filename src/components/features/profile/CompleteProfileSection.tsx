import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import { countries } from '@/data/countriesData';
import { toast } from 'sonner';

interface AddressData {
  country: string;
  city: string;
  district: string;
  address: string;
  isComplete: boolean;
}

interface CompleteProfileSectionProps {
  onAddressUpdate?: (address: AddressData) => void;
}

export const CompleteProfileSection = ({ onAddressUpdate }: CompleteProfileSectionProps) => {
  const [addressData, setAddressData] = useState<AddressData>({
    country: '',
    city: '',
    district: '',
    address: '',
    isComplete: false
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      setAddressData(JSON.parse(savedAddress));
    } else {
      // Try to get from registration data
      const regData = localStorage.getItem('registrationData');
      if (regData) {
        const parsed = JSON.parse(regData);
        setAddressData({
          country: parsed.country || '',
          city: parsed.city || '',
          district: '',
          address: '',
          isComplete: false
        });
      }
    }
  }, []);

  const handleSave = () => {
    const newData = {
      ...addressData,
      isComplete: !!(addressData.district && addressData.address)
    };
    setAddressData(newData);
    localStorage.setItem('userAddress', JSON.stringify(newData));
    setIsEditing(false);
    toast.success('تم حفظ العنوان');
    onAddressUpdate?.(newData);
  };

  const getAvailableCities = () => {
    const country = countries.find(c => c.code === addressData.country);
    return country?.cities || [];
  };

  const getCountryName = () => {
    const country = countries.find(c => c.code === addressData.country);
    return country?.name || addressData.country;
  };

  return (
    <>
      <Card className="shadow-soft border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-bold">العنوان</h3>
            </div>
            {addressData.isComplete ? (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                مكتمل
              </span>
            ) : (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                غير مكتمل
              </span>
            )}
          </div>

          {addressData.country ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الدولة:</span>
                <span>{getCountryName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المدينة:</span>
                <span>{addressData.city || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحي/المنطقة:</span>
                <span>{addressData.district || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">العنوان:</span>
                <span className="text-left max-w-[60%] truncate">{addressData.address || '-'}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لم يتم إضافة عنوان بعد</p>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setIsEditing(true)}
          >
            {addressData.isComplete ? 'تعديل العنوان' : 'إكمال العنوان'}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            سيُطلب العنوان عند استخدام المستشفى لأول مرة
          </p>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إكمال بيانات العنوان</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الدولة</label>
              <Select 
                value={addressData.country} 
                onValueChange={(value) => setAddressData({ ...addressData, country: value, city: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المدينة</label>
              <Select 
                value={addressData.city} 
                onValueChange={(value) => setAddressData({ ...addressData, city: value })}
                disabled={!addressData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCities().map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الحي/المنطقة (اختياري)</label>
              <Input
                placeholder="مثال: الفاتح، بيليك دوزو"
                value={addressData.district}
                onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان التفصيلي (اختياري)</label>
              <Input
                placeholder="رقم المبنى، الشارع..."
                value={addressData.address}
                onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
