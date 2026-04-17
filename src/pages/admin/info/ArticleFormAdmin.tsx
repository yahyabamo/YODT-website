import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, ChevronRight } from 'lucide-react';
import { fetchArticleById, upsertArticle, type InfoArticle } from '@/service/infoCMS';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';

export default function ArticleFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<InfoArticle>({
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    category: 'istanbul',
    author: '',
    is_published: true,
    order_index: 0
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

  const handleField = (f: keyof InfoArticle, v: any) => {
    setForm(prev => ({ ...prev, [f]: v }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('يرجى إدخال العنوان');
    setSaving(true);
    try {
      await upsertArticle(form);
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

  return (
    <div style={{ direction: 'rtl' }}>
      <button 
        onClick={() => navigate('/admin/info/articles')}
        style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronRight size={16} /> العودة للقائمة
      </button>

      <AdminPageHeader 
        title={id ? 'تعديل مقال' : 'إضافة مقال جديد'} 
        description="أنشئ محتوى غني بالصور والمعلومات لمشاركته مع الأعضاء"
        icon={FileText}
        onBack={() => navigate('/admin/info/articles')}
      />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 800, margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Field label="عنوان المقال">
          <input 
            style={{ ...inputStyle, fontSize: 16, padding: '12px 16px' }} 
            value={form.title} 
            onChange={e => handleField('title', e.target.value)} 
            placeholder="أدخل عنواناً جذاباً..." 
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="التصنيف">
            <select style={inputStyle} value={form.category} onChange={e => handleField('category', e.target.value)}>
              <option value="istanbul">إسطنبول</option>
              <option value="yemen">اليمن</option>
              <option value="general">عام</option>
            </select>
          </Field>
          <Field label="الكاتب">
            <input style={inputStyle} value={form.author} onChange={e => handleField('author', e.target.value)} placeholder="اسم الكاتب..." />
          </Field>
        </div>

        <Field label="المقتطف (وصف قصير يظهر في القوائم)">
          <textarea 
            style={textareaStyle} 
            value={form.excerpt} 
            onChange={e => handleField('excerpt', e.target.value)} 
            placeholder="اكتب خلاصة موجزة للمقال..." 
          />
        </Field>

        <Field label="المحتوى الكامل للمقال">
          <textarea 
            style={{ ...textareaStyle, minHeight: 250 }} 
            value={form.content} 
            onChange={e => handleField('content', e.target.value)} 
            placeholder="ابدأ بكتابة تفاصيل المقال هنا..." 
          />
        </Field>

        <Field label="رابط الصورة البارزة (URL)">
          <input style={inputStyle} value={form.image_url ?? ''} onChange={e => handleField('image_url', e.target.value)} placeholder="https://example.com/image.jpg" />
        </Field>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12 }}>
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
