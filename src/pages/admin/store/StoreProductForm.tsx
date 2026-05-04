import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { fetchProductById, upsertProduct, StoreProduct } from '@/services/storeService';
import { useAllStoreCategories } from '@/hooks/store/useStoreCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Save, Loader2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useQueryClient } from '@tanstack/react-query';

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "activity_unsigned");
  formData.append("folder", "partners");
  const res = await fetch("https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
}

export default function StoreProductForm() {
  useRoleGuard(['store']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id && id !== 'new');

  const { data: categories } = useAllStoreCategories();
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<StoreProduct>>({
    category_id: '',
    name_ar: '',
    name_en: '',
    name_tr: '',
    description_ar: '',
    description_en: '',
    description_tr: '',
    price: 0,
    currency: 'TRY',
    images: [],
    thumbnail: null,
    sku: '',
    is_active: true,
    is_featured: false,
    stock_note_ar: '',
    stock_note_en: '',
    stock_note_tr: '',
    order_index: 0,
  });

  useEffect(() => {
    if (isEdit) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const { data, error } = await fetchProductById(id!);
      if (error) throw error;
      if (data) setFormData(data);
    } catch (err: any) {
      toast.error('فشل في تحميل بيانات المنتج');
      navigate('/admin/store/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleToggle = (field: 'is_active' | 'is_featured') => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadImage(file);

      setFormData(prev => {
        const newImages = [...(prev.images || []), publicUrl];
        return {
          ...prev,
          images: newImages,
          thumbnail: prev.thumbnail || publicUrl // Set as thumbnail if first image
        };
      });

      toast.success('تم رفع الصورة');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('فشل رفع الصورة: ' + error.message);
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    setFormData(prev => {
      const newImages = (prev.images || []).filter(url => url !== urlToRemove);
      return {
        ...prev,
        images: newImages,
        thumbnail: prev.thumbnail === urlToRemove ? (newImages[0] || null) : prev.thumbnail
      };
    });
  };

  const setAsThumbnail = (url: string) => {
    setFormData(prev => ({ ...prev, thumbnail: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.error('الرجاء اختيار فئة المنتج');
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await upsertProduct(formData);
      if (error) throw error;
      
      toast.success('تم الحفظ بنجاح');
      queryClient.invalidateQueries({ queryKey: ['store_products_admin'] });
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
      navigate('/admin/store/products');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/store/products')}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-bold text-lg border-b pb-2">المعلومات الأساسية</h2>
              
              <div className="space-y-2">
                <Label>الاسم (العربية) <span className="text-destructive">*</span></Label>
                <Input name="name_ar" value={formData.name_ar} onChange={handleChange} required />
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
                <Label>الوصف (العربية)</Label>
                <Textarea name="description_ar" value={formData.description_ar || ''} onChange={handleChange} className="min-h-[100px]" />
              </div>
              
              <div className="space-y-2">
                <Label>الوصف (English)</Label>
                <Textarea name="description_en" value={formData.description_en || ''} onChange={handleChange} dir="ltr" className="min-h-[100px]" />
              </div>
              
              <div className="space-y-2">
                <Label>الوصف (Türkçe)</Label>
                <Textarea name="description_tr" value={formData.description_tr || ''} onChange={handleChange} dir="ltr" className="min-h-[100px]" />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-bold text-lg border-b pb-2">الصور</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(formData.images || []).map((img, i) => (
                  <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${formData.thumbnail === img ? 'border-primary' : 'border-border'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => removeImage(img)}
                        className="w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded flex items-center justify-center backdrop-blur-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    {formData.thumbnail !== img && (
                      <button 
                        type="button"
                        onClick={() => setAsThumbnail(img)}
                        className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm text-[10px] font-bold py-1 text-center hover:bg-primary hover:text-primary-foreground"
                      >
                        تعيين كغلاف
                      </button>
                    )}
                    {formData.thumbnail === img && (
                      <div className="absolute bottom-0 inset-x-0 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold py-1 text-center">
                        الغلاف
                      </div>
                    )}
                  </div>
                ))}
                
                <Label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center text-muted-foreground gap-2 transition-colors">
                  {uploading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <ImagePlus size={24} />
                      <span className="text-xs font-medium">إضافة صورة</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">أول صورة يتم رفعها ستصبح الغلاف التلقائي.</p>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div className="space-y-2">
                <Label>الفئة <span className="text-destructive">*</span></Label>
                <select 
                  name="category_id" 
                  value={formData.category_id} 
                  onChange={handleChange}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">اختر فئة...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السعر <span className="text-destructive">*</span></Label>
                  <Input type="number" name="price" value={formData.price} onChange={handleChange} min={0} step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <select 
                    name="currency" 
                    value={formData.currency} 
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="YER">YER</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>رمز SKU (اختياري)</Label>
                <Input name="sku" value={formData.sku || ''} onChange={handleChange} dir="ltr" />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label className="text-muted-foreground mb-2 block">حالة التوفر (اختياري)</Label>
                <Input name="stock_note_ar" value={formData.stock_note_ar || ''} onChange={handleChange} placeholder="عربي (مثال: متوفر، نفدت الكمية)" className="mb-2" />
                <Input name="stock_note_en" value={formData.stock_note_en || ''} onChange={handleChange} placeholder="English (e.g. In Stock)" className="mb-2" dir="ltr" />
                <Input name="stock_note_tr" value={formData.stock_note_tr || ''} onChange={handleChange} placeholder="Türkçe (ör. Stokta)" dir="ltr" />
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>الترتيب</Label>
                <Input type="number" name="order_index" value={formData.order_index} onChange={handleChange} min={0} />
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="is_active">تفعيل المنتج في المتجر</Label>
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleToggle('is_active')} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer" htmlFor="is_featured">منتج مميز (علامة مميزة)</Label>
                  <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={handleToggle('is_featured')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 inset-x-0 md:inset-x-auto md:w-[calc(100%-80px)] z-40 bg-background/95 backdrop-blur border-t p-4 flex justify-end gap-3 shadow-lg" style={{ right: document.documentElement.dir === 'rtl' ? 'auto' : 0, left: document.documentElement.dir === 'rtl' ? 0 : 'auto' }}>
          <div className="max-w-4xl mx-auto w-full flex justify-end gap-3 px-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/store/products')}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              حفظ المنتج
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
