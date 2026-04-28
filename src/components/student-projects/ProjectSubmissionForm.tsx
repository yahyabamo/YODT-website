import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getField, studentProjectsText } from '@/i18n/pages';
import { useProjectCategories } from '@/hooks/studentProjects/useStudentProjectCategories';
import { submitProjectForm, uploadProjectImage } from '@/services/studentProjectsService';
import { toast } from 'sonner';

interface ProjectSubmissionFormProps {
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--border, rgba(255,255,255,0.1))',
  borderRadius: '10px', fontSize: '14px',
  background: 'var(--bg-2, rgba(255,255,255,0.05))',
  color: 'var(--text-1, #fff)',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 700,
  color: 'var(--text-2, rgba(255,255,255,0.65))', marginBottom: '5px',
};

export function ProjectSubmissionForm({ onClose }: ProjectSubmissionFormProps) {
  const { language } = useLanguage();
  const t = studentProjectsText.form;
  const { data: categories } = useProjectCategories();
  const isRtl = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    university: '',
    phone: '',
    email: '',
    category_id: '',
    name_ar: '',
    name_en: '',
    name_tr: '',
    description_ar: '',
    description_en: '',
    description_tr: '',
    services_ar: '',
    services_en: '',
    services_tr: '',
    instagram: '',
    whatsapp: '',
    website: '',
    location: '',
    agreed_to_terms: false,
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = t.requiredField[language];
    if (!form.phone.trim()) e.phone = t.requiredField[language];
    if (!form.name_ar.trim()) e.name_ar = t.requiredField[language];
    if (!form.description_ar.trim()) e.description_ar = t.requiredField[language];
    if (!form.agreed_to_terms) e.agreed = t.mustAgree[language];
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImages = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - imageUrls.length;
    if (remaining <= 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploadingImages(true);
    try {
      const urls = await Promise.all(toUpload.map((f) => uploadProjectImage(f)));
      setImageUrls((prev) => [...prev, ...urls]);
    } catch {
      toast.error(language === 'ar' ? 'فشل رفع الصورة' : 'Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { error } = await submitProjectForm({
        full_name: form.full_name,
        university: form.university || undefined,
        phone: form.phone,
        email: form.email || undefined,
        category_id: form.category_id || undefined,
        name_ar: form.name_ar,
        name_en: form.name_en || undefined,
        name_tr: form.name_tr || undefined,
        description_ar: form.description_ar,
        description_en: form.description_en || undefined,
        description_tr: form.description_tr || undefined,
        services_ar: form.services_ar || undefined,
        services_en: form.services_en || undefined,
        services_tr: form.services_tr || undefined,
        instagram: form.instagram || undefined,
        whatsapp: form.whatsapp || undefined,
        website: form.website || undefined,
        location: form.location || undefined,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        agreed_to_terms: form.agreed_to_terms,
      });
      if (error) throw error;
      setDone(true);
      toast.success(t.success[language]);
    } catch {
      toast.error(t.error[language]);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(37,211,102,0.15)', border: '2px solid rgba(37,211,102,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: '#25d366',
        }}>
          <Check size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1, #fff)', marginBottom: '12px' }}>
          {language === 'ar' ? 'تم إرسال طلبك!' : language === 'tr' ? 'Başvurunuz gönderildi!' : 'Request Submitted!'}
        </h3>
        <p style={{ color: 'var(--text-2, rgba(255,255,255,0.65))', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 28px' }}>
          {t.success[language]}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '12px 28px', borderRadius: '12px',
            background: '#7a1c1c', color: '#fff',
            fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          {language === 'ar' ? 'إغلاق' : language === 'tr' ? 'Kapat' : 'Close'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: 'var(--bg-1, #0d0f14)', zIndex: 2,
      }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1, #fff)', margin: 0 }}>
            {t.title[language]}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3, rgba(255,255,255,0.4))', margin: '4px 0 0' }}>
            {t.subtitle[language]}
          </p>
        </div>
        <button
          type="button" onClick={onClose}
          style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'var(--bg-2, rgba(255,255,255,0.06))',
            border: '1px solid var(--border)', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(85vh - 80px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Section: Personal Info */}
        <SectionTitle label={language === 'ar' ? 'معلومات شخصية' : language === 'tr' ? 'Kişisel Bilgiler' : 'Personal Info'} />

        <Field label={t.fullName[language]} error={errors.full_name}>
          <input style={inputStyle} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label={t.phone[language]} error={errors.phone}>
            <input style={inputStyle} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t.email[language]}>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} dir="ltr" />
          </Field>
        </div>

        <Field label={t.university[language]}>
          <input style={inputStyle} value={form.university} onChange={(e) => set('university', e.target.value)} />
        </Field>

        {/* Section: Project Info */}
        <SectionTitle label={language === 'ar' ? 'معلومات المشروع' : language === 'tr' ? 'Proje Bilgileri' : 'Project Info'} />

        <Field label={t.category[language]}>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
          >
            <option value="">{language === 'ar' ? 'اختر فئة…' : language === 'tr' ? 'Kategori seç…' : 'Select category…'}</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {getField(cat, 'name', language)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.nameAr[language]} error={errors.name_ar}>
          <input style={{ ...inputStyle, direction: 'rtl' }} value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} placeholder="اسم المشروع بالعربية" />
        </Field>
        <Field label={t.nameEn[language]}>
          <input style={{ ...inputStyle, direction: 'ltr' }} value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="Project name in English" />
        </Field>
        <Field label={t.nameTr[language]}>
          <input style={{ ...inputStyle, direction: 'ltr' }} value={form.name_tr} onChange={(e) => set('name_tr', e.target.value)} placeholder="Projenin Türkçe adı" />
        </Field>

        <Field label={t.descAr[language]} error={errors.description_ar}>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', direction: 'rtl' }} value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} />
        </Field>
        <Field label={t.descEn[language]}>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', direction: 'ltr' }} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} />
        </Field>
        <Field label={t.descTr[language]}>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', direction: 'ltr' }} value={form.description_tr} onChange={(e) => set('description_tr', e.target.value)} />
        </Field>

        <SectionTitle label={language === 'ar' ? 'المنتجات والخدمات (مفصولة بفاصلة)' : language === 'tr' ? 'Ürünler ve Hizmetler (virgülle ayrılmış)' : 'Products & Services (comma separated)'} />
        <Field label={language === 'ar' ? 'عربي' : language === 'tr' ? 'Arapça' : 'Arabic'}>
          <input style={{ ...inputStyle, direction: 'rtl' }} value={form.services_ar} onChange={(e) => set('services_ar', e.target.value)} placeholder="عطر عود، عطر صنعاء، بخور…" />
        </Field>
        <Field label="English">
          <input style={{ ...inputStyle, direction: 'ltr' }} value={form.services_en} onChange={(e) => set('services_en', e.target.value)} />
        </Field>
        <Field label="Türkçe">
          <input style={{ ...inputStyle, direction: 'ltr' }} value={form.services_tr} onChange={(e) => set('services_tr', e.target.value)} />
        </Field>

        {/* Section: Social & Contact */}
        <SectionTitle label={language === 'ar' ? 'التواصل والروابط' : language === 'tr' ? 'İletişim ve Bağlantılar' : 'Contact & Links'} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label={t.instagram[language]}>
            <input style={{ ...inputStyle, direction: 'ltr' }} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@handle" />
          </Field>
          <Field label={t.whatsapp[language]}>
            <input style={{ ...inputStyle, direction: 'ltr' }} type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+9627xxxxxxxx" />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label={t.website[language]}>
            <input style={{ ...inputStyle, direction: 'ltr' }} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
          </Field>
          <Field label={t.location[language]}>
            <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} />
          </Field>
        </div>

        {/* Section: Images */}
        <SectionTitle label={t.images[language]} />

        {/* Image upload zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border, rgba(255,255,255,0.1))',
            borderRadius: '14px', padding: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '8px', cursor: 'pointer', transition: 'all 0.2s ease',
            background: 'var(--bg-2, rgba(255,255,255,0.03))',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.4)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, rgba(255,255,255,0.1))'; }}
        >
          {uploadingImages ? (
            <Loader2 size={24} style={{ color: '#c8a84b', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Upload size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-3, rgba(255,255,255,0.4))' }}>
            {language === 'ar' ? `اضغط لرفع الصور (${imageUrls.length}/5)` : language === 'tr' ? `Görselleri yüklemek için tıklayın (${imageUrls.length}/5)` : `Click to upload images (${imageUrls.length}/5)`}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleImages(e.target.files)}
          />
        </div>

        {/* Image previews */}
        {imageUrls.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {imageUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Terms */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.agreed_to_terms}
            onChange={(e) => set('agreed_to_terms', e.target.checked)}
            style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#7a1c1c' }}
          />
          <span style={{ fontSize: '0.82rem', color: errors.agreed ? '#f87171' : 'var(--text-2, rgba(255,255,255,0.65))', lineHeight: 1.5 }}>
            {t.agreeTerms[language]}
          </span>
        </label>
        {errors.agreed && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.agreed}</span>}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '14px',
            borderRadius: '12px',
            background: submitting ? 'rgba(122,28,28,0.5)' : '#7a1c1c',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: submitting ? 'none' : '0 6px 20px rgba(122,28,28,0.4)',
          }}
        >
          {submitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {submitting ? t.submitting[language] : t.submit[language]}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 4px' }}>
      <div style={{ height: '1px', flex: 1, background: 'var(--border, rgba(255,255,255,0.08))' }} />
      <span style={{ color: '#c8a84b', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ height: '1px', flex: 1, background: 'var(--border, rgba(255,255,255,0.08))' }} />
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={{ color: '#f87171', fontSize: '0.72rem' }}>{error}</span>}
    </div>
  );
}
