import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { fetchCategoryById, upsertCategory, StoreCategory } from '@/services/storeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useQueryClient } from '@tanstack/react-query';

export default function StoreCategoryForm() {
  useRoleGuard(['store']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<StoreCategory>>({
    slug: '',
    name_ar: '',
    name_en: '',
    name_tr: '',
    icon: '',
    is_active: true,
    order_index: 0,
  });

  useEffect(() => {
    if (isEdit) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const { data, error } = await fetchCategoryById(id!);
      if (error) throw error;
      if (data) setFormData(data);
    } catch (err: any) {
      toast.error('فشل في تحميل بيانات الفئة');
      navigate('/admin/store/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await upsertCategory(formData);
      if (error) throw error;
      
      toast.success('تم الحفظ بنجاح');
      queryClient.invalidateQueries({ queryKey: ['store_categories_admin'] });
      queryClient.invalidateQueries({ queryKey: ['store_categories'] });
      navigate('/admin/store/categories');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/store/categories')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label>المعرف البرمجي (Slug) <span className="text-destructive">*</span></Label>
            <Input 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              placeholder="e.g. clothing, books" 
              required 
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">يجب أن يكون فريداً وباللغة الإنجليزية بدون مسافات.</p>
          </div>

          <div className="space-y-2">
            <Label>الاسم (العربية) <span className="text-destructive">*</span></Label>
            <Input name="name_ar" value={formData.name_ar} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label>الرمز (Icon)</Label>
            <Input name="icon" value={formData.icon || ''} onChange={handleChange} placeholder="رمز تعبيري (Emoji)" />
          </div>

          <div className="space-y-2">
            <Label>الاسم (English) <span className="text-destructive">*</span></Label>
            <Input name="name_en" value={formData.name_en} onChange={handleChange} required dir="ltr" />
          </div>

          <div className="space-y-2">
            <Label>الاسم (Türkçe) <span className="text-destructive">*</span></Label>
            <Input name="name_tr" value={formData.name_tr} onChange={handleChange} required dir="ltr" />
          </div>

          <div className="space-y-2">
            <Label>الترتيب (Order Index)</Label>
            <Input type="number" name="order_index" value={formData.order_index} onChange={handleChange} min={0} />
            <p className="text-xs text-muted-foreground">رقم لتحديد ترتيب الظهور (0 يظهر أولاً)</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border md:col-span-2">
            <div className="space-y-0.5">
              <Label>تفعيل الفئة</Label>
              <p className="text-sm text-muted-foreground">
                الفئات غير المفعلة لن تظهر في المتجر للزوار.
              </p>
            </div>
            <Switch 
              checked={formData.is_active}
              onCheckedChange={handleCheckedChange}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/store/categories')}>
            إلغاء
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ الفئة
          </Button>
        </div>
      </form>
    </div>
  );
}
