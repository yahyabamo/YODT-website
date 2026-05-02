import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpsertAd } from '@/hooks/useAds';
import { fetchAllAdsAdmin, AD_PAGE_OPTIONS, AD_POSITION_OPTIONS, SiteAd } from '@/services/adsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Save, Loader2, ImagePlus, Star, Type } from 'lucide-react';
import { toast } from 'sonner';

// ─── Cloudinary upload ────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'activity_unsigned');
  formData.append('folder', 'ads');

  const res = await fetch('https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

// ─── Page multi-select component ─────────────────────────────────────────────

function PageMultiSelect({ value = [], onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const isAll = value.includes('all');

  const togglePage = (pageValue: string) => {
    if (pageValue === 'all') {
      onChange(['all']);
    } else {
      const withoutAll = value.filter(v => v !== 'all');

      if (withoutAll.includes(pageValue)) {
        onChange(withoutAll.filter(v => v !== pageValue));
      } else {
        onChange([...withoutAll, pageValue]);
      }
    }
  };

  return (
    <div className="space-y-2 border border-input rounded-md p-3 bg-background max-h-[240px] overflow-y-auto">
      {AD_PAGE_OPTIONS.map(o => {
        const checked = o.value === 'all' ? isAll : (!isAll && value.includes(o.value));

        return (
          <label key={o.value} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded transition-colors">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => togglePage(o.value)}
              className="rounded border-input text-primary focus:ring-primary"
            />
            <span>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

const BLANK: Partial<SiteAd> = {
  image_url: '',
  text_content: '',
  redirect_url: '',
  alt_text: '',
  page_names: ['home'],
  position: 'top',
  is_active: true,
  priority: 0,
};

type AdMode = 'image' | 'text';

export default function AdForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const upsert = useUpsertAd();
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState<Partial<SiteAd>>(BLANK);
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [adMode, setAdMode] = useState<AdMode>('image');

  useEffect(() => {
    if (!isEdit) return;

    fetchAllAdsAdmin()
      .then(all => {
        const found = all.find(a => a.id === id);

        if (found) {
          const cleanFound = {
            ...found,
            page_names: found.page_names || ((found as any).page_name ? [(found as any).page_name] : ['home']),
          };

          setForm(cleanFound);
          setAdMode(cleanFound.text_content && cleanFound.text_content.trim() ? 'text' : 'image');
        } else {
          toast.error('الإعلان غير موجود');
          navigate('/admin/ads');
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, image_url: url }));
      setAdMode('image');
      toast.success('تم رفع الصورة');
    } catch (err: any) {
      toast.error('فشل رفع الصورة: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrl = (form.image_url ?? '').trim();
    const textContent = (form.text_content ?? '').trim();
    const redirectUrl = (form.redirect_url ?? '').trim();

    if (!redirectUrl) {
      toast.error('الرجاء إدخال رابط الوجهة');
      return;
    }

    if (!form.page_names || form.page_names.length === 0) {
      toast.error('الرجاء تحديد صفحة واحدة على الأقل');
      return;
    }

    if (adMode === 'image' && !imageUrl) {
      toast.error('الرجاء رفع صورة الإعلان');
      return;
    }

    if (adMode === 'text' && !textContent) {
      toast.error('الرجاء كتابة نص الإعلان');
      return;
    }

    try {
      const payload: Partial<SiteAd> = {
        ...form,
        id: isEdit ? id : undefined,
        image_url: adMode === 'image' ? imageUrl : '',
        text_content: adMode === 'text' ? textContent : '',
        redirect_url: redirectUrl,
      };

      await upsert.mutateAsync(payload);
      toast.success('تم الحفظ بنجاح');
      navigate('/admin/ads');
    } catch (err: any) {
      toast.error('حدث خطأ: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/ads')}>
          <ArrowRight size={18} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            الإعلانات ذات الأولوية الأعلى تظهر قبل غيرها في نفس الموضع
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Main settings */}
          <div className="md:col-span-3 space-y-6">
            {/* Ad type */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-base border-b pb-2">نوع الإعلان</h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdMode('image')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${adMode === 'image'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background hover:bg-muted/40'
                    }`}
                >
                  <ImagePlus size={16} />
                  صورة
                </button>

                <button
                  type="button"
                  onClick={() => setAdMode('text')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${adMode === 'text'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background hover:bg-muted/40'
                    }`}
                >
                  <Type size={16} />
                  نص
                </button>
              </div>
            </div>

            {/* Image upload */}
            {adMode === 'image' ? (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-bold text-base border-b pb-2">صورة الإعلان</h2>

                {form.image_url ? (
                  <div className="space-y-3">
                    <div className="w-full h-24 rounded-xl overflow-hidden border border-border">
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                    >
                      تغيير الصورة
                    </Button>
                  </div>
                ) : (
                  <Label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors text-muted-foreground gap-2">
                    {uploading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <ImagePlus size={24} />
                        <span className="text-xs font-medium">
                          انقر لرفع صورة البانر
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </Label>
                )}

                <div className="space-y-2">
                  <Label>النص البديل (alt text) — لإمكانية الوصول</Label>
                  <Input
                    value={form.alt_text ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="وصف مختصر للإعلان"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-bold text-base border-b pb-2">نص الإعلان</h2>

                <div className="space-y-2">
                  <Label>عنوان قصير</Label>
                  <Input
                    value={form.alt_text ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="مثال: خصم خاص لفترة محدودة"
                  />
                  <p className="text-xs text-muted-foreground">
                    هذا يظهر كعنوان بسيط فوق النص.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    نص الإعلان <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    value={form.text_content ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, text_content: e.target.value }))}
                    placeholder="اكتب النص الذي تريد إظهاره داخل الإعلان..."
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    هذا الإعلان سيظهر كنص فقط بدل الصورة.
                  </p>
                </div>
              </div>
            )}

            {/* Redirect URL */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-base border-b pb-2">رابط الوجهة</h2>
              <div className="space-y-2">
                <Label>
                  عنوان URL عند النقر <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.redirect_url ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, redirect_url: e.target.value }))}
                  placeholder="https://example.com"
                  dir="ltr"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  يُفتح في تبويب جديد عند النقر على الإعلان
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              {/* Page */}
              <div className="space-y-2">
                <Label>
                  الصفحات المستهدفة <span className="text-destructive">*</span>
                </Label>
                <PageMultiSelect
                  value={form.page_names ?? []}
                  onChange={v => setForm(prev => ({ ...prev, page_names: v }))}
                />
                <p className="text-xs text-muted-foreground">
                  اختر "جميع الصفحات" لعرض الإعلان في كل مكان
                </p>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  الموضع <span className="text-destructive">*</span>
                </Label>
                <select
                  value={form.position ?? 'top'}
                  onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {AD_POSITION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star size={14} className="text-amber-500" />
                  الأولوية (Priority)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.priority ?? 0}
                  onChange={e => setForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">
                  الأرقام الأعلى تُعرض أولاً. استخدم هذا للإعلانات المدفوعة أو المميزة.
                </p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <Label htmlFor="ad_active" className="cursor-pointer font-medium text-sm">
                  تفعيل الإعلان
                </Label>
                <Switch
                  id="ad_active"
                  checked={form.is_active ?? true}
                  onCheckedChange={v => setForm(prev => ({ ...prev, is_active: v }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save bar */}
        <div className="fixed bottom-0 inset-x-0 md:w-[calc(100%-80px)] z-40 bg-background/95 backdrop-blur border-t p-4 shadow-lg">
          <div className="max-w-3xl mx-auto flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/ads')}>
              إلغاء
            </Button>
            <Button type="submit" disabled={upsert.isPending} className="gap-2">
              {upsert.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              حفظ الإعلان
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}