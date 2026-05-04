import React, { useState } from 'react';
import { Phone, MessageCircle, Check, X, Eye, Inbox, Loader2, Upload } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAllSubmissions } from '@/hooks/studentProjects/useStudentProjectSubmissions';
import { useAllProjectCategoriesAdmin } from '@/hooks/studentProjects/useStudentProjectCategories'; // Added category hook
import {
  updateSubmissionStatus,
  generateSlug,
  upsertProject,
  updateSubmission,
  uploadProjectImage // Added image upload service
} from '@/services/studentProjectsService';
import type { ProjectSubmission } from '@/services/studentProjectsService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

type EditableSubmission = Partial<ProjectSubmission> & {
  cover_image_url?: string;
  featured?: boolean;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'قيد المراجعة' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'تم القبول' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
};

export default function SubmissionsAdmin() {
  useRoleGuard(['student-projects']);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selected, setSelected] = useState<ProjectSubmission | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Replace your current editedSub state with this:
  const [editedSub, setEditedSub] = useState<EditableSubmission | null>(null);
  // Added States for Image Uploads
  const [uploadingImg, setUploadingImg] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Fetch submissions and categories
  const { data: submissions, isLoading } = useAllSubmissions(
    statusFilter === 'all' ? undefined : statusFilter
  );
  const { data: categories } = useAllProjectCategoriesAdmin(); // Fetch categories for the dropdown

  // Image Upload Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadProjectImage(file);
      setEditedSub((p) => p ? { ...p, cover_image_url: url } : null);
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadingImg(true);
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 10).map(uploadProjectImage));
      setGalleryUrls((p) => [...p, ...urls]);
    } catch {
      toast.error('فشل رفع الصور');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleApprove = async (sub: ProjectSubmission) => {
    setProcessing(true);
    try {
      // 1. Create the project from submission
      const slug = generateSlug(sub.name_en ?? '', sub.name_ar);
      const { error: projErr } = await upsertProject({
        slug,
        category_id: sub.category_id ?? undefined,
        status: 'approved',
        featured: false,
        owner_name: sub.full_name,
        university: sub.university ?? undefined,
        phone: sub.phone,
        email: sub.email ?? undefined,
        website: sub.website ?? undefined,
        instagram: sub.instagram ?? undefined,
        whatsapp: sub.whatsapp ?? undefined,
        location: sub.location ?? undefined,
        name_ar: sub.name_ar,
        name_en: sub.name_en ?? '',
        name_tr: sub.name_tr ?? '',
        description_ar: sub.description_ar,
        description_en: sub.description_en ?? '',
        description_tr: sub.description_tr ?? '',
        services_ar: sub.services_ar ?? undefined,
        services_en: sub.services_en ?? undefined,
        services_tr: sub.services_tr ?? undefined,
        cover_image_url: (sub as any).cover_image_url ?? sub.image_urls?.[0] ?? undefined,
      });
      if (projErr) throw projErr;

      // 2. Mark submission as approved
      const { error: subErr } = await updateSubmissionStatus(sub.id, 'approved', adminNote || undefined);
      if (subErr) throw subErr;

      toast.success('تم قبول الطلب ونشر المشروع');
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['project_submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student_projects'] });
      queryClient.invalidateQueries({ queryKey: ['student_projects_admin'] });
      queryClient.invalidateQueries({ queryKey: ['student_project_stats'] });
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (sub: ProjectSubmission) => {
    setProcessing(true);
    try {
      const { error } = await updateSubmissionStatus(sub.id, 'rejected', adminNote || undefined);
      if (error) throw error;
      toast.success('تم رفض الطلب');
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['project_submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student_project_stats'] });
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveEdit = async (newStatus: 'pending' | 'approved') => {
    if (!editedSub || !selected) return;
    setProcessing(true);

    try {
      // 1. Safely extract the extra fields so they don't break the Supabase submissions table
      const {
        cover_image_url,
        featured,
        project_categories,
        ...submissionData
      } = editedSub as any;

      // 2. Prepare the clean data for the project_submissions table
      const dataToSave = {
        ...submissionData,
        status: newStatus,
        image_urls: galleryUrls
      };

      // 3. Update the submission table
      const { error: subError } = await updateSubmission(selected.id, dataToSave);
      if (subError) throw subError;

      // 4. IF APPROVED: We must also push this to the main 'projects' table!
      if (newStatus === 'approved') {
        const slug = generateSlug(editedSub.name_en ?? '', editedSub.name_ar ?? '');
        const { error: projError } = await upsertProject({
          slug,
          category_id: editedSub.category_id ?? undefined,
          status: 'approved',
          featured: editedSub.featured ?? false,
          owner_name: editedSub.full_name ?? '',
          university: editedSub.university ?? undefined,
          phone: editedSub.phone ?? '',
          email: editedSub.email ?? undefined,
          website: editedSub.website ?? undefined,
          instagram: editedSub.instagram ?? undefined,
          whatsapp: editedSub.whatsapp ?? undefined,
          location: editedSub.location ?? undefined,
          name_ar: editedSub.name_ar ?? '',
          name_en: editedSub.name_en ?? '',
          name_tr: editedSub.name_tr ?? '',
          description_ar: editedSub.description_ar ?? '',
          description_en: editedSub.description_en ?? '',
          description_tr: editedSub.description_tr ?? '',
          services_ar: editedSub.services_ar ?? undefined,
          services_en: editedSub.services_en ?? undefined,
          services_tr: editedSub.services_tr ?? undefined,
          // Use the specific cover image, or fallback to the first gallery image
          cover_image_url: editedSub.cover_image_url ?? galleryUrls?.[0] ?? undefined,
        });

        if (projError) throw projError;
      }

      toast.success(newStatus === 'approved' ? 'تم نشر المشروع بنجاح' : 'تم حفظ التعديلات كقيد المراجعة');

      setSelected({ ...selected, ...dataToSave } as ProjectSubmission);
      setEditMode(false);

      // Refresh all relevant tables
      queryClient.invalidateQueries({ queryKey: ['project_submissions'] });
      if (newStatus === 'approved') {
        queryClient.invalidateQueries({ queryKey: ['student_projects'] });
        queryClient.invalidateQueries({ queryKey: ['student_projects_admin'] });
        queryClient.invalidateQueries({ queryKey: ['student_project_stats'] });
      }

    } catch (err: any) {
      toast.error('خطأ في الحفظ: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Inbox size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">الطلبات الواردة</h1>
            <p className="text-sm text-muted-foreground">مراجعة وإدارة طلبات تسجيل المشاريع</p>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
            >
              {s === 'pending' ? 'قيد المراجعة' : s === 'approved' ? 'مقبولة' : s === 'rejected' ? 'مرفوضة' : 'الكل'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">مقدم الطلب</th>
                <th className="px-4 py-3 font-medium">المشروع</th>
                <th className="px-4 py-3 font-medium">الهاتف</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">التاريخ</th>
                <th className="px-4 py-3 font-medium text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="animate-pulse">جارٍ التحميل...</div>
                  </td>
                </tr>
              ) : submissions && submissions.length > 0 ? (
                submissions.map((sub) => {
                  const statusInfo = STATUS_COLORS[sub.status] ?? STATUS_COLORS.pending;
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{sub.full_name}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate">{sub.name_ar}</td>
                      <td className="px-4 py-3" dir="ltr">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{sub.phone}</span>
                          <a
                            href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="فتح واتساب"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          >
                            <MessageCircle size={12} />
                          </a>
                          <a
                            href={`tel:${sub.phone}`}
                            title="اتصال"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          >
                            <Phone size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(sub.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelected(sub);
                            setEditedSub(sub);
                            setGalleryUrls(sub.image_urls || []); // Load existing images
                            setEditMode(false);
                            setAdminNote(sub.admin_note ?? '');
                          }}
                        >
                          <Eye size={15} />
                        </Button>
                        {sub.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => { setSelected(sub); setAdminNote(''); }}
                              title="قبول"
                            >
                              <Check size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleReject(sub)}
                              title="رفض"
                            >
                              <X size={15} />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    لا توجد طلبات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-xl" dir="rtl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selected.name_ar}</h2>
                <div className="flex items-center gap-2">
                  {!editMode && selected.status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                      تعديل الطلب
                    </Button>
                  )}
                  <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Images Preview (when not in edit mode) */}
              {!editMode && selected.image_urls && selected.image_urls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selected.image_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-28 w-40 object-cover rounded-xl shrink-0 border border-border" />
                  ))}
                </div>
              )}

              {/* Info grid */}
              {!editMode && (
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="مقدم الطلب" value={selected.full_name} />
                  <InfoItem label="الهاتف" value={selected.phone} />
                  {selected.email && <InfoItem label="البريد" value={selected.email} />}
                  {selected.university && <InfoItem label="الجامعة" value={selected.university} />}
                  {selected.location && <InfoItem label="الموقع" value={selected.location} />}
                  {selected.instagram && <InfoItem label="إنستغرام" value={selected.instagram} />}
                  {selected.whatsapp && <InfoItem label="واتساب" value={selected.whatsapp} />}
                  {selected.website && <InfoItem label="الموقع الإلكتروني" value={selected.website} />}
                </div>
              )}

              {editMode && editedSub ? (
                <div className="space-y-6 bg-background rounded-xl" dir="rtl">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <h3 className="font-bold text-lg text-primary">تعديل بيانات المشروع الشاملة</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content (lg:col-span-2) */}
                    <div className="lg:col-span-2 space-y-5">

                      {/* Cover image */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">صورة الغلاف</h4>
                        {editedSub.cover_image_url && (
                          <img src={editedSub.cover_image_url} alt="" className="w-full h-40 object-cover rounded-xl mb-3 border border-border" />
                        )}
                        <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors text-muted-foreground text-sm">
                          {uploadingImg ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                          {editedSub.cover_image_url ? 'استبدال الصورة' : 'رفع صورة الغلاف'}
                          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        </label>
                      </div>

                      {/* Gallery */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">معرض الصور</h4>
                        {galleryUrls && galleryUrls.length > 0 && (
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
                      </div>

                      {/* Names */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">اسم المشروع</h4>
                        <div className="space-y-3">
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">عربي *</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" dir="rtl" value={editedSub.name_ar ?? ''} onChange={e => setEditedSub({ ...editedSub, name_ar: e.target.value })} required /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">English</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.name_en ?? ''} onChange={e => setEditedSub({ ...editedSub, name_en: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.name_tr ?? ''} onChange={e => setEditedSub({ ...editedSub, name_tr: e.target.value })} /></div>
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">وصف المشروع</h4>
                        <div className="space-y-3">
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">عربي *</label><textarea className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background resize-y" dir="rtl" rows={3} value={editedSub.description_ar ?? ''} onChange={e => setEditedSub({ ...editedSub, description_ar: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">English</label><textarea className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left resize-y" dir="ltr" rows={2} value={editedSub.description_en ?? ''} onChange={e => setEditedSub({ ...editedSub, description_en: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label><textarea className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left resize-y" dir="ltr" rows={2} value={editedSub.description_tr ?? ''} onChange={e => setEditedSub({ ...editedSub, description_tr: e.target.value })} /></div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">المنتجات والخدمات (مفصولة بفاصلة)</h4>
                        <div className="space-y-3">
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">عربي</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" dir="rtl" value={editedSub.services_ar ?? ''} onChange={e => setEditedSub({ ...editedSub, services_ar: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">English</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.services_en ?? ''} onChange={e => setEditedSub({ ...editedSub, services_en: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.services_tr ?? ''} onChange={e => setEditedSub({ ...editedSub, services_tr: e.target.value })} /></div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar (lg:col-span-1) */}
                    <div className="space-y-5">

                      {/* Settings */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">الإعدادات</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-muted-foreground mb-1">الفئة</label>
                            <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background cursor-pointer" value={editedSub.category_id ?? ''} onChange={(e) => setEditedSub({ ...editedSub, category_id: e.target.value })}>
                              <option value="">بدون فئة</option>
                              {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>)}
                            </select>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editedSub.featured ?? false} onChange={(e) => setEditedSub({ ...editedSub, featured: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                            <span className="text-sm font-medium">مشروع مميز ⭐</span>
                          </label>
                        </div>
                      </div>

                      {/* Owner Information */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">معلومات صاحب المشروع</h4>
                        <div className="space-y-3">
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">الاسم</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" value={editedSub.full_name ?? ''} onChange={e => setEditedSub({ ...editedSub, full_name: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">الجامعة</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" value={editedSub.university ?? ''} onChange={e => setEditedSub({ ...editedSub, university: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">الهاتف</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.phone ?? ''} onChange={e => setEditedSub({ ...editedSub, phone: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">البريد</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" type="email" value={editedSub.email ?? ''} onChange={e => setEditedSub({ ...editedSub, email: e.target.value })} /></div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="p-4 border border-border rounded-xl bg-card">
                        <h4 className="font-bold text-sm mb-4">التواصل</h4>
                        <div className="space-y-3">
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">إنستغرام</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.instagram ?? ''} onChange={e => setEditedSub({ ...editedSub, instagram: e.target.value })} placeholder="@handle" /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">واتساب</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.whatsapp ?? ''} onChange={e => setEditedSub({ ...editedSub, whatsapp: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">الموقع</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-left" dir="ltr" value={editedSub.website ?? ''} onChange={e => setEditedSub({ ...editedSub, website: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-muted-foreground mb-1">الموقع الجغرافي</label><input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" value={editedSub.location ?? ''} onChange={e => setEditedSub({ ...editedSub, location: e.target.value })} /></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
                    <Button variant="outline" onClick={() => { setEditMode(false); setEditedSub(selected); setGalleryUrls(selected?.image_urls || []); }}>
                      إلغاء التعديل
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleSaveEdit('pending')}
                      disabled={processing}
                    >
                      {processing ? 'جارٍ الحفظ...' : 'حفظ كقيد المراجعة'}
                    </Button>

                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleSaveEdit('approved')}
                      disabled={processing}
                    >
                      {processing ? 'جارٍ النشر...' : 'حفظ ونشر مباشر'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2">وصف المشروع</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <p className="text-sm text-foreground bg-secondary/30 rounded-xl p-3 leading-relaxed border border-border/50">{selected.description_ar}</p>
                      {selected.description_en && <p className="text-sm text-foreground bg-secondary/30 rounded-xl p-3 leading-relaxed border border-border/50 text-left" dir="ltr">{selected.description_en}</p>}
                      {selected.description_tr && <p className="text-sm text-foreground bg-secondary/30 rounded-xl p-3 leading-relaxed border border-border/50 text-left" dir="ltr">{selected.description_tr}</p>}
                    </div>
                  </div>
                  {(selected.services_ar || selected.services_en || selected.services_tr) && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-2">المنتجات والخدمات</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selected.services_ar && <p className="text-sm text-foreground bg-secondary/30 rounded-xl p-2 px-3 border border-border/50">{selected.services_ar}</p>}
                        {selected.services_en && <p className="text-sm text-foreground bg-secondary/30 rounded-xl p-2 px-3 border border-border/50 text-left" dir="ltr">{selected.services_en}</p>}
                        {selected.services_tr && <p className="text-sm text-foreground bg-secondary/30 rounded-xl p-2 px-3 border border-border/50 text-left" dir="ltr">{selected.services_tr}</p>}
                      </div>
                    </div>
                  )}

                  {/* Contact buttons */}
                  <div className="flex gap-2 pt-2">
                    <a
                      href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 font-bold text-sm hover:bg-emerald-500/25 transition-colors"
                    >
                      <MessageCircle size={16} /> واتساب
                    </a>
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/15 text-blue-600 font-bold text-sm hover:bg-blue-500/25 transition-colors"
                    >
                      <Phone size={16} /> اتصال
                    </a>
                  </div>
                </div>
              )}

              {/* Approval Actions (only show when NOT in edit mode and status is pending) */}
              {!editMode && selected.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleApprove(selected)}
                    disabled={processing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {processing ? 'جارٍ المعالجة...' : 'قبول ونشر'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selected)}
                    disabled={processing}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold text-muted-foreground block mb-0.5">{label}</span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  );
}