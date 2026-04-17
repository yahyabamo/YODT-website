import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchIconById, upsertIcon, type InfoIcon } from '@/service/infoCMS';
import { toast } from 'sonner';
import { Medal, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';

export default function IconFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<InfoIcon>({
    name: '',
    bio: '',
    image_url: '',
    field: '',
    notable_work: '',
    birth_year: '',
    nationality: 'يمني',
    is_published: true,
    order_index: 0
  });

  useEffect(() => {
    if (id) {
      fetchIconById(id)
        .then(data => { if (data) setForm(data); })
        .catch(() => toast.error('خطأ في تحميل البيانات'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleField = (f: keyof InfoIcon, v: any) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('يرجى إدخال الاسم');
    setSaving(true);
    try {
      await upsertIcon(form);
      toast.success('تم الحفظ بنجاح');
      navigate('/admin/info/icons');
    } catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ direction: 'rtl' }}>
      <button onClick={() => navigate('/admin/info/icons')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronRight size={16} /> العودة للقائمة
      </button>

      <AdminPageHeader 
        title={id ? 'تعديل بيانات الرمز' : 'إضافة رمز وطني جديد'} 
        description="خلّد ذكرى العظماء وسيرتهم العطرة للأجيال القادمة"
        icon={Medal}
        onBack={() => navigate('/admin/info/icons')}
      />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 700, margin: '0 auto' }}>
        <Field label="الاسم الكامل"><input style={inputStyle} value={form.name} onChange={e => handleField('name', e.target.value)} /></Field>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="المجال (الطب، الأدب، السياسة...)"><input style={inputStyle} value={form.field} onChange={e => handleField('field', e.target.value)} /></Field>
          <Field label="سنة الميلاد"><input style={inputStyle} value={form.birth_year ?? ''} onChange={e => handleField('birth_year', e.target.value)} placeholder="1930" /></Field>
        </div>

        <Field label="الجنسية"><input style={inputStyle} value={form.nationality} onChange={e => handleField('nationality', e.target.value)} /></Field>
        <Field label="السيرة الذاتية المفصلة"><textarea style={{ ...textareaStyle, minHeight: 120 }} value={form.bio} onChange={e => handleField('bio', e.target.value)} /></Field>
        <Field label="أبرز الأعمال والمساهمات"><textarea style={{ ...textareaStyle, minHeight: 100 }} value={form.notable_work} onChange={e => handleField('notable_work', e.target.value)} /></Field>
        <Field label="رابط الصورة الشخصية (URL)"><input style={inputStyle} value={form.image_url ?? ''} onChange={e => handleField('image_url', e.target.value)} placeholder="https://..." /></Field>
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="الترتيب"><input style={{ ...inputStyle, width: 100 }} type="number" value={form.order_index} onChange={e => handleField('order_index', parseInt(e.target.value) || 0)} /></Field>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => handleField('is_published', e.target.checked)} style={{ width: 18, height: 18 }} /> تم النشر
          </label>
        </div>

        <ActionBar onSave={handleSave} onCancel={() => navigate('/admin/info/icons')} saving={saving} />
      </div>
    </div>
  );
}
