import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  upsertProject,
  uploadProjectImage,
  generateSlug,
  fetchProjectByIdAdmin,
  fetchProjectImages,
  insertProjectImages,
  deleteAllProjectImages,
} from '@/services/studentProjectsService';
import { useAllProjectCategoriesAdmin } from '@/hooks/studentProjects/useStudentProjectCategories';

const IS = {  // input style
  width: '100%', padding: '10px 14px',
  border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px',
  background: '#fff', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const TS = { ...IS, resize: 'vertical' as const, minHeight: '80px' };

const STATUSES = [
  { value: 'approved', label: 'منشور' },
  { value: 'hidden', label: 'مخفي' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'rejected', label: 'مرفوض' },
];

export default function ProjectFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useAllProjectCategoriesAdmin();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const [form, setForm] = useState({
    slug: '',
    category_id: '',
    status: 'approved',
    featured: false,
    owner_name: '',
    university: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    whatsapp: '',
    location: '',
    name_ar: '',
    name_en: '',
    name_tr: '',
    description_ar: '',
    description_en: '',
    description_tr: '',
    services_ar: '',
    services_en: '',
    services_tr: '',
    cover_image_url: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const [{ data: proj }, { data: imgs }] = await Promise.all([
        fetchProjectByIdAdmin(id!),
        fetchProjectImages(id!),
      ]);
      if (proj) {
        setForm({
          slug: proj.slug ?? '',
          category_id: proj.category_id ?? '',
          status: proj.status ?? 'approved',
          featured: proj.featured ?? false,
          owner_name: proj.owner_name ?? '',
          university: proj.university ?? '',
          phone: proj.phone ?? '',
          email: proj.email ?? '',
          website: proj.website ?? '',
          instagram: proj.instagram ?? '',
          whatsapp: proj.whatsapp ?? '',
          location: proj.location ?? '',
          name_ar: proj.name_ar ?? '',
          name_en: proj.name_en ?? '',
          name_tr: proj.name_tr ?? '',
          description_ar: proj.description_ar ?? '',
          description_en: proj.description_en ?? '',
          description_tr: proj.description_tr ?? '',
          services_ar: proj.services_ar ?? '',
          services_en: proj.services_en ?? '',
          services_tr: proj.services_tr ?? '',
          cover_image_url: proj.cover_image_url ?? '',
        });
      }
      if (imgs) {
        setExistingImageIds(imgs.map((i: any) => i.id));
        setGalleryUrls(imgs.map((i: any) => i.image_url));
      }
      setLoading(false);
    })();
  }, [id]);

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try { set('cover_image_url', await uploadProjectImage(file)); }
    catch { toast.error('فشل رفع الصورة'); }
    finally { setUploadingImg(false); }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadingImg(true);
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 10).map(uploadProjectImage));
      setGalleryUrls((p) => [...p, ...urls]);
    } catch { toast.error('فشل رفع الصور'); }
    finally { setUploadingImg(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) { toast.error('اسم المشروع بالعربي مطلوب'); return; }
    setSaving(true);
    try {
      const slug = form.slug || generateSlug(form.name_en || '', form.name_ar);
      const payload = {
        ...form,
        slug,
        category_id: form.category_id || undefined,
        cover_image_url: form.cover_image_url || undefined,
        status: form.status as 'approved' | 'hidden' | 'pending' | 'rejected',   // 👈 explicit cast
      };
      const { data: savedProj, error } = isEdit
        ? await upsertProject({ ...payload, id })
        : await upsertProject(payload);
      if (error) throw error;

      const projId = (savedProj as any)?.id ?? id;

      // Replace gallery images
      if (projId) {
        await deleteAllProjectImages(projId);
        if (galleryUrls.length > 0) {
          await insertProjectImages(galleryUrls.map((url, i) => ({ project_id: projId, image_url: url, sort_order: i })));
        }
      }

      toast.success(isEdit ? 'تم التحديث' : 'تم الإنشاء');
      queryClient.invalidateQueries({ queryKey: ['student_projects_admin'] });
      queryClient.invalidateQueries({ queryKey: ['student_projects'] });
      navigate('/admin/student-projects/projects');
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">جارٍ التحميل...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowRight size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{isEdit ? 'تعديل المشروع' : 'إضافة مشروع'}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? 'تعديل بيانات المشروع المنشور' : 'إضافة مشروع جديد يدوياً'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Cover image */}
          <Card title="صورة الغلاف">
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="" className="w-full h-40 object-cover rounded-xl mb-3 border border-border" />
            )}
            <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors text-muted-foreground text-sm">
              {uploadingImg ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {form.cover_image_url ? 'استبدال الصورة' : 'رفع صورة الغلاف'}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </Card>

          {/* Gallery */}
          <Card title="معرض الصور">
            {galleryUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {galleryUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryUrls((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors text-muted-foreground text-sm">
              <Upload size={18} /> إضافة صور للمعرض
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            </label>
          </Card>

          {/* Names */}
          <Card title="اسم المشروع">
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">عربي *</label><input style={{ ...IS, direction: 'rtl' }} value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} required /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">English</label><input style={{ ...IS, direction: 'ltr' }} value={form.name_en} onChange={(e) => set('name_en', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label><input style={{ ...IS, direction: 'ltr' }} value={form.name_tr} onChange={(e) => set('name_tr', e.target.value)} /></div>
            </div>
          </Card>

          {/* Descriptions */}
          <Card title="وصف المشروع">
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">عربي *</label><textarea style={{ ...TS, direction: 'rtl' }} value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">English</label><textarea style={{ ...TS, direction: 'ltr' }} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label><textarea style={{ ...TS, direction: 'ltr' }} value={form.description_tr} onChange={(e) => set('description_tr', e.target.value)} /></div>
            </div>
          </Card>

          {/* Services */}
          <Card title="المنتجات والخدمات (مفصولة بفاصلة)">
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">عربي</label><input style={{ ...IS, direction: 'rtl' }} value={form.services_ar} onChange={(e) => set('services_ar', e.target.value)} placeholder="عطر ود، عطر صنعاء، بخور…" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">English</label><input style={{ ...IS, direction: 'ltr' }} value={form.services_en} onChange={(e) => set('services_en', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label><input style={{ ...IS, direction: 'ltr' }} value={form.services_tr} onChange={(e) => set('services_tr', e.target.value)} /></div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card title="الإعدادات">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الحالة</label>
                <select style={{ ...IS, cursor: 'pointer' }} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الفئة</label>
                <select style={{ ...IS, cursor: 'pointer' }} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                  <option value="">بدون فئة</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-medium">مشروع مميز ⭐</span>
              </label>
            </div>
          </Card>

          <Card title="معلومات صاحب المشروع">
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">الاسم</label><input style={IS} value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">الجامعة</label><input style={IS} value={form.university} onChange={(e) => set('university', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">الهاتف</label><input style={{ ...IS, direction: 'ltr' }} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">البريد</label><input style={{ ...IS, direction: 'ltr' }} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            </div>
          </Card>

          <Card title="التواصل">
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">إنستغرام</label><input style={{ ...IS, direction: 'ltr' }} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@handle" /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">واتساب</label><input style={{ ...IS, direction: 'ltr' }} value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">الموقع</label><input style={{ ...IS, direction: 'ltr' }} value={form.website} onChange={(e) => set('website', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground mb-1">الموقع الجغرافي</label><input style={IS} value={form.location} onChange={(e) => set('location', e.target.value)} /></div>
            </div>
          </Card>

          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
            {saving ? 'جارٍ الحفظ...' : (isEdit ? 'تحديث المشروع' : 'نشر المشروع')}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4 pb-3 border-b border-border">{title}</h3>
      {children}
    </div>
  );
}
