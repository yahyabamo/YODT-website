import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStudentById, upsertStudent, type InfoStudent } from '@/service/infoCMS';
import { toast } from 'sonner';
import { Users, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle } from './CMSShared';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function TeamFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<InfoStudent>({
    name: '',
    major: '', // Storing "Position" here
    academic_year: new Date().getFullYear().toString(), // Storing "Year" here, defaulting to current year
    image_url: '',
    is_published: true,
    order_index: 0,
    // Nullifying the unused fields
    bio: '',
    university: '',
    achievement: '',
    gpa: ''
  });

  useEffect(() => {
    if (id) {
      fetchStudentById(id)
        .then(data => { if (data) setForm(data); })
        .catch(() => toast.error('خطأ في تحميل البيانات'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleField = (f: keyof InfoStudent, v: any) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('يرجى إدخال اسم العضو');
    if (!form.academic_year.trim()) return toast.error('يرجى إدخال سنة الفريق');
    setSaving(true);
    try {
      await upsertStudent(form);
      toast.success('تم الحفظ بنجاح');
      navigate('/admin/info/students');
    } catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ direction: 'rtl' }}>
      <button onClick={() => navigate('/admin/info/students')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronRight size={16} /> العودة للقائمة
      </button>

      <AdminPageHeader
        title={id ? 'تعديل بيانات العضو' : 'إضافة عضو جديد للفريق'}
        description="أضف أعضاء الهيئة الإدارية وتوزيعهم على حسب السنة"
        icon={Users}
        onBack={() => navigate('/admin/info/students')}
      />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 700, margin: '0 auto' }}>
        <Field label="الاسم الرباعي">
          <input style={inputStyle} value={form.name} onChange={e => handleField('name', e.target.value)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="المنصب (مثال: رئيس الاتحاد)">
            <input style={inputStyle} value={form.major} onChange={e => handleField('major', e.target.value)} />
          </Field>
          <Field label="سنة التشكيل (مثال: 2023-2024)">
            <input style={inputStyle} value={form.academic_year} onChange={e => handleField('academic_year', e.target.value)} placeholder="2023-2024" />
          </Field>
        </div>

        <ImageUploader
          value={form.image_url ?? ''}
          onChange={url => handleField('image_url', url)}
          folder="team"
          label="الصورة الشخصية"
        />

        <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12, marginTop: '24px' }}>
          <div style={{ flex: 1 }}>
            <Field label="الترتيب (لترتيب العرض)">
              <input style={{ ...inputStyle, width: 100 }} type="number" value={form.order_index} onChange={e => handleField('order_index', parseInt(e.target.value) || 0)} />
            </Field>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => handleField('is_published', e.target.checked)} style={{ width: 18, height: 18 }} /> تم النشر
          </label>
        </div>

        <ActionBar onSave={handleSave} onCancel={() => navigate('/admin/info/students')} saving={saving} />
      </div>
    </div>
  );
}