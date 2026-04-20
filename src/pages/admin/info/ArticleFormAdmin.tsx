import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, ChevronRight, Languages, Loader2, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { fetchArticleById, upsertArticle, type InfoArticle } from '@/service/infoCMS';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import {
    translateFields,
    isTranslationAvailable,
    type SupportedLang,
} from '@/services/translationService';

// ── Tab styles ─────────────────────────────────────────────────────────────────
const TAB_LANGS: { key: SupportedLang; label: string; flag: string }[] = [
    { key: 'ar', label: 'عربي', flag: '🇾🇪' },
    { key: 'en', label: 'English', flag: '🇬🇧' },
    { key: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

type TranslateStatus = 'idle' | 'loading' | 'done' | 'error';

const CATEGORY_OPTIONS = [
    { value: 'istanbul', labelAr: 'إسطنبول' },
    { value: 'yemen', labelAr: 'اليمن' },
    { value: 'general', labelAr: 'عام' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Extract the primary language variant fields from the form */
function getPrimaryFields(form: InfoArticle, primaryLang: SupportedLang) {
    const suffix = `_${primaryLang}`;
    return {
        title: (form as any)[`title${suffix}`] || form.title || '',
        excerpt: (form as any)[`excerpt${suffix}`] || form.excerpt || '',
        content: (form as any)[`content${suffix}`] || form.content || '',
    };
}

/** Set translated fields into form — only fill missing / empty ones */
function applyTranslations(
    form: InfoArticle,
    translations: Record<string, string>,
    targetLang: SupportedLang
): InfoArticle {
    const updated = { ...form } as any;
    const suffix = `_${targetLang}`;
    for (const field of ['title', 'excerpt', 'content']) {
        const key = `${field}${suffix}`;
        // Never overwrite manually entered content
        if (!updated[key] || updated[key].trim() === '') {
            if (translations[field]) updated[key] = translations[field];
        }
    }
    return updated as InfoArticle;
}

// ── ContentImageAdder sub-component ────────────────────────────────────────────
function ContentImageAdder({ onAdd }: { onAdd: (url: string) => void }) {
    const [url, setUrl] = useState('');
    return (
        <div>
            <ImageUploader
                value={url}
                onChange={setUrl}
                folder="articles/content"
                label=""
                placeholder="ارفع صورة إضافية لمحتوى المقال"
            />
            {url && (
                <button
                    onClick={() => { onAdd(url); setUrl(''); }}
                    style={{
                        marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                        background: '#16a34a', color: '#fff', border: 'none',
                        borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                >
                    <Plus size={13} /> إضافة هذه الصورة للمقال
                </button>
            )}
        </div>
    );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ArticleFormAdmin() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<SupportedLang>('ar');
    const [autoTranslate, setAutoTranslate] = useState(false);
    const [translateStatus, setTranslateStatus] = useState<TranslateStatus>('idle');
    const [translationAvailable] = useState(isTranslationAvailable());

    const [form, setForm] = useState<InfoArticle>({
        title: '',
        title_ar: '',
        title_en: '',
        title_tr: '',
        excerpt: '',
        excerpt_ar: '',
        excerpt_en: '',
        excerpt_tr: '',
        content: '',
        content_ar: '',
        content_en: '',
        content_tr: '',
        image_url: '',
        content_images: [],
        category: 'istanbul',
        author: '',
        is_published: true,
        order_index: 0,
    });

    useEffect(() => {
        if (id) {
            fetchArticleById(id)
                .then(data => {
                    if (data) setForm(data);
                    else toast.error('المقال غير موجود');
                })
                .catch(err => {
                    console.error(err);
                    toast.error('خطأ في تحميل البيانات');
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleField = (f: keyof InfoArticle | string, v: any) => {
        setForm(prev => ({ ...prev, [f]: v }));
    };

    // ── Auto-translate ──────────────────────────────────────────────────────
    const handleAutoTranslate = useCallback(async () => {
        if (!translationAvailable) {
            toast.error('لم يتم تكوين مفتاح API للترجمة. راجع VITE_GOOGLE_TRANSLATE_KEY أو VITE_OPENAI_API_KEY');
            return;
        }

        // Determine primary language (prefer AR → EN → TR)
        const primaryLang: SupportedLang =
            (form.title_ar?.trim() ? 'ar' : form.title_en?.trim() ? 'en' : 'tr');

        const primary = getPrimaryFields(form, primaryLang);

        if (!primary.title.trim() && !primary.content.trim()) {
            toast.error('أدخل محتوى المقال باللغة الأساسية أولاً');
            return;
        }

        setTranslateStatus('loading');

        try {
            const targets: SupportedLang[] = (['ar', 'en', 'tr'] as SupportedLang[])
                .filter(l => l !== primaryLang);

            let updatedForm = { ...form };

            for (const targetLang of targets) {
                const fieldsToTranslate: Record<string, string> = {};
                const suf = `_${targetLang}` as const;
                if (!((updatedForm as any)[`title${suf}`]?.trim())) fieldsToTranslate.title = primary.title;
                if (!((updatedForm as any)[`excerpt${suf}`]?.trim())) fieldsToTranslate.excerpt = primary.excerpt;
                if (!((updatedForm as any)[`content${suf}`]?.trim())) fieldsToTranslate.content = primary.content;

                if (Object.keys(fieldsToTranslate).length === 0) continue;

                const translated = await translateFields(fieldsToTranslate, primaryLang, targetLang);
                updatedForm = applyTranslations(updatedForm, translated, targetLang);
            }

            setForm(updatedForm);
            setTranslateStatus('done');
            toast.success('تم توليد الترجمات بنجاح — راجعها قبل الحفظ');
            setTimeout(() => setTranslateStatus('idle'), 3000);
        } catch (err) {
            console.error('Translation error:', err);
            setTranslateStatus('error');
            toast.error('فشلت الترجمة التلقائية — يمكنك إدخال الترجمات يدوياً');
            setTimeout(() => setTranslateStatus('idle'), 4000);
        }
    }, [form, translationAvailable]);

    const handleSave = async () => {
        // Use _ar as primary if filled, else fall back to the generic title/content
        const effectiveTitle =
            form.title_ar?.trim() || form.title_en?.trim() || form.title?.trim() || '';
        if (!effectiveTitle) return toast.error('يرجى إدخال العنوان باللغة العربية على الأقل');

        // Sync the generic fields from Arabic (for getField fallback)
        const saveForm: InfoArticle = {
            ...form,
            title: form.title_ar || form.title_en || form.title || '',
            excerpt: form.excerpt_ar || form.excerpt_en || form.excerpt || '',
            content: form.content_ar || form.content_en || form.content || '',
        };

        setSaving(true);
        try {
            await upsertArticle(saveForm);
            toast.success(id ? 'تم تحديث المقال' : 'تم إضافة المقال بنجاح');
            navigate('/admin/info/articles');
        } catch (err) {
            console.error(err);
            toast.error('فشل حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    // ── UI helpers ────────────────────────────────────────────────────────────
    const tabField = (field: string) => `${field}_${activeTab}` as keyof InfoArticle;
    const tabValue = (field: string): string => ((form as any)[tabField(field)] as string) || '';

    const translateStatusIcon = {
        idle: null,
        loading: <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: '#6b7280' }} />,
        done: <CheckCircle2 size={14} style={{ color: '#16a34a' }} />,
        error: <AlertCircle size={14} style={{ color: '#dc2626' }} />,
    };

    return (
        <div style={{ direction: 'rtl' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <button
                onClick={() => navigate('/admin/info/articles')}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            >
                <ChevronRight size={16} /> العودة للقائمة
            </button>

            <AdminPageHeader
                title={id ? 'تعديل مقال' : 'إضافة مقال جديد'}
                description="أنشئ محتوى غنياً بالمعلومات بثلاث لغات    "
                icon={FileText}
                onBack={() => navigate('/admin/info/articles')}
            />

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 900, margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

                {/* ── Shared fields (language-independent) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Field label="التصنيف">
                        <select style={inputStyle} value={form.category} onChange={e => handleField('category', e.target.value)}>
                            {CATEGORY_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.labelAr}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="الكاتب">
                        <input style={inputStyle} value={form.author} onChange={e => handleField('author', e.target.value)} placeholder="اسم الكاتب..." />
                    </Field>
                </div>

                <ImageUploader
                    value={form.image_url ?? ''}
                    onChange={url => handleField('image_url', url)}
                    folder="articles"
                    label="الصورة البارزة للمقال"
                />

                {/* ── Auto-translate toolbar ── */}
                {/* <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: translationAvailable ? '#f0fdf4' : '#fefce8',
                    border: `1px solid ${translationAvailable ? '#bbf7d0' : '#fde68a'}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 24, marginTop: 8,
                }}>
                    <Languages size={18} style={{ color: translationAvailable ? '#16a34a' : '#ca8a04', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#111', marginBottom: 2 }}>
                            {translationAvailable ? 'الترجمة التلقائية متاحة' : 'الترجمة التلقائية غير مفعّلة'}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {translationAvailable
                                ? 'سيتم ترجمة الحقول الفارغة فقط — لن تُستبدل الترجمات اليدوية'
                                : 'أضف VITE_GOOGLE_TRANSLATE_KEY أو VITE_OPENAI_API_KEY في ملف .env لتفعيل الترجمة التلقائية'}
                        </div>
                    </div>
                    {translationAvailable && (
                        <button
                            onClick={handleAutoTranslate}
                            disabled={translateStatus === 'loading'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: '#16a34a', color: '#fff', border: 'none',
                                borderRadius: 8, padding: '8px 14px', fontSize: 12,
                                fontWeight: 700, cursor: translateStatus === 'loading' ? 'not-allowed' : 'pointer',
                                opacity: translateStatus === 'loading' ? 0.7 : 1, flexShrink: 0,
                            }}
                        >
                            {translateStatusIcon[translateStatus]}
                            {translateStatus === 'loading' ? 'جاري الترجمة...' : 'ترجم تلقائياً'}
                        </button>
                    )}
                </div> */}

                {/* ── Language tabs ── */}
                <div style={{ borderBottom: '2px solid #f3f4f6', marginBottom: 24, display: 'flex', gap: 4 }}>
                    {TAB_LANGS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '10px 18px', border: 'none', borderRadius: '10px 10px 0 0',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                background: activeTab === tab.key ? '#fff' : 'transparent',
                                color: activeTab === tab.key ? '#8B1A2A' : '#9ca3af',
                                borderBottom: activeTab === tab.key ? '2px solid #8B1A2A' : 'none',
                                marginBottom: -2,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            <span>{tab.flag}</span>
                            <span>{tab.label}</span>
                            {/* Indicator dot if field is filled */}
                            {((form as any)[`title_${tab.key}`]?.trim()) && (
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Per-language fields ── */}
                <div style={{ minHeight: 400 }}>
                    <Field label={`العنوان (${TAB_LANGS.find(t => t.key === activeTab)?.label})`}>
                        <input
                            style={{ ...inputStyle, fontSize: 16, padding: '12px 16px' }}
                            value={tabValue('title')}
                            onChange={e => handleField(tabField('title'), e.target.value)}
                            placeholder={activeTab === 'ar' ? 'أدخل عنواناً جذاباً...' : activeTab === 'en' ? 'Enter a compelling title...' : 'Çekici bir başlık girin...'}
                            dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                        />
                    </Field>

                    <Field label={`المقتطف (${TAB_LANGS.find(t => t.key === activeTab)?.label})`}>
                        <textarea
                            style={textareaStyle}
                            value={tabValue('excerpt')}
                            onChange={e => handleField(tabField('excerpt'), e.target.value)}
                            placeholder={activeTab === 'ar' ? 'اكتب خلاصة موجزة للمقال...' : activeTab === 'en' ? 'Write a brief summary...' : 'Kısa bir özet yazın...'}
                            dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                        />
                    </Field>

                    <Field label={`المحتوى الكامل (${TAB_LANGS.find(t => t.key === activeTab)?.label})`}>
                        <textarea
                            style={{ ...textareaStyle, minHeight: 250 }}
                            value={tabValue('content')}
                            onChange={e => handleField(tabField('content'), e.target.value)}
                            placeholder={activeTab === 'ar' ? 'ابدأ بكتابة تفاصيل المقال هنا...' : activeTab === 'en' ? 'Start writing the article details...' : 'Makale ayrıntılarını yazmaya başlayın...'}
                            dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                        />
                    </Field>
                </div>

                {/* ── Content images panel ── */}
                <div style={{ marginTop: 24, background: '#f9fafb', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#111', marginBottom: 4 }}>📸 صور المقال (اختياري)</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 14 }}>هذه الصور ستظهر في معرض الصور أسفل محتوى المقال للقراء</div>

                    {/* Existing images grid */}
                    {(form.content_images ?? []).length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
                            {(form.content_images ?? []).map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                                    <img src={url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                                    <button
                                        onClick={() => {
                                            const updated = [...(form.content_images ?? [])];
                                            updated.splice(idx, 1);
                                            handleField('content_images', updated);
                                        }}
                                        style={{
                                            position: 'absolute', top: 3, right: 3, width: 20, height: 20,
                                            borderRadius: '50%', background: 'rgba(220,38,38,0.9)', color: '#fff',
                                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add image */}
                    <ContentImageAdder
                        onAdd={(url) => handleField('content_images', [...(form.content_images ?? []), url])}
                    />
                </div>

                {/* ── Publish + order settings ── */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                        <Field label="ترتيب الظهور">
                            <input
                                style={{ ...inputStyle, width: 100 }}
                                type="number"
                                value={form.order_index}
                                onChange={e => handleField('order_index', parseInt(e.target.value) || 0)}
                            />
                        </Field>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            checked={form.is_published}
                            onChange={e => handleField('is_published', e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: '#8B1A2A' }}
                        />
                        نشر المقال فوراً
                    </label>
                </div>

                <ActionBar onSave={handleSave} onCancel={() => navigate('/admin/info/articles')} saving={saving} />
            </div>
        </div>
    );
}
