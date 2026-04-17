import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUniversityById, upsertUniversity, type InfoUniversity } from '@/service/infoCMS';
import { toast } from 'sonner';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';

export default function UniversityFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<InfoUniversity>({
    name: '',
    description: '',
    image_url: '',
    website_url: '',
    location: 'إسطنبول، تركيا',
    specialties: '',
    established: '',
    student_count: '',
    is_published: true,
    order_index: 0
  });

  useEffect(() => {
    if (id) {
      fetchUniversityById(id)
        .then(data => { if (data) setForm(data); })
        .catch(() => toast.error('خطأ في تحميل البيانات'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleField = (f: keyof InfoUniversity, v: any) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('يرجى إدخال اسم الجامعة');
    setSaving(true);
    try {
      await upsertUniversity(form);
      toast.success('تم الحفظ بنجاح');
      navigate('/admin/info/universities');
    } catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ direction: 'rtl' }}>
      <button onClick={() => navigate('/admin/info/universities')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronRight size={16} /> العودة للقائمة
      </button>

      <AdminPageHeader 
        title={id ? 'تعديل بيانات جامعة' : 'إضافة جامعة جديدة'} 
        description="أدخل المعلومات التفصيلية والروابط الرسمية للجامعة"
        icon={GraduationCap}
        onBack={() => navigate('/admin/info/universities')}
      />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 800, margin: '0 auto' }}>
        <Field label="اسم الجامعة"><input style={inputStyle} value={form.name} onChange={e => handleField('name', e.target.value)} /></Field>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="الموقع"><input style={inputStyle} value={form.location} onChange={e => handleField('location', e.target.value)} /></Field>
          <Field label="سنة التأسيس"><input style={inputStyle} value={form.established ?? ''} onChange={e => handleField('established', e.target.value)} placeholder="1453" /></Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="عدد الطلاب"><input style={inputStyle} value={form.student_count ?? ''} onChange={e => handleField('student_count', e.target.value)} placeholder="50,000" /></Field>
          <Field label="الموقع الرسمي (URL)"><input style={inputStyle} value={form.website_url ?? ''} onChange={e => handleField('website_url', e.target.value)} placeholder="https://..." /></Field>
        </div>

        <Field label="الوصف التاريخي والأكاديمي"><textarea style={textareaStyle} value={form.description} onChange={e => handleField('description', e.target.value)} /></Field>
        <Field label="أبرز التخصصات (مفصولة بفواصل)"><input style={inputStyle} value={form.specialties ?? ''} onChange={e => handleField('specialties', e.target.value)} placeholder="الطب، الهندسة، الأعمال..." /></Field>
        <Field label="رابط صورة الحرم الجامعي (URL)"><input style={inputStyle} value={form.image_url ?? ''} onChange={e => handleField('image_url', e.target.value)} placeholder="https://..." /></Field>
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="الترتيب"><input style={{ ...inputStyle, width: 100 }} type="number" value={form.order_index} onChange={e => handleField('order_index', parseInt(e.target.value) || 0)} /></Field>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => handleField('is_published', e.target.checked)} style={{ width: 18, height: 18 }} /> تم النشر
          </label>
        </div>

        <ActionBar onSave={handleSave} onCancel={() => navigate('/admin/info/universities')} saving={saving} />
      </div>
    </div>
  );
}
