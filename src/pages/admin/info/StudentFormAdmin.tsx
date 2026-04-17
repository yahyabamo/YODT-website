import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStudentById, upsertStudent, type InfoStudent } from '@/service/infoCMS';
import { toast } from 'sonner';
import { Users, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';

export default function StudentFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<InfoStudent>({
    name: '',
    bio: '',
    image_url: '',
    major: '',
    university: '',
    academic_year: '',
    achievement: '',
    gpa: '',
    is_published: true,
    order_index: 0
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
    if (!form.name.trim()) return toast.error('يرجى إدخال اسم الطالب');
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
        title={id ? 'تعديل بيانات طالب' : 'إضافة طالب متميز جديد'} 
        description="شارك قصة نجاح ملهمة لأبطالنا في الجامعات التركية"
        icon={Users}
        onBack={() => navigate('/admin/info/students')}
      />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 700, margin: '0 auto' }}>
        <Field label="الاسم الرباعي"><input style={inputStyle} value={form.name} onChange={e => handleField('name', e.target.value)} /></Field>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="التخصص الدراسي"><input style={inputStyle} value={form.major} onChange={e => handleField('major', e.target.value)} /></Field>
          <Field label="المرحلة الدراسية"><input style={inputStyle} value={form.academic_year} onChange={e => handleField('academic_year', e.target.value)} placeholder="سنة رابعة، ماجستير..." /></Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="الجامعة"><input style={inputStyle} value={form.university} onChange={e => handleField('university', e.target.value)} /></Field>
          <Field label="المعدل التراكمي (اختياري)"><input style={inputStyle} value={form.gpa ?? ''} onChange={e => handleField('gpa', e.target.value)} placeholder="3.9 / 4.0" /></Field>
        </div>

        <Field label="نبذة عن الطالب"><textarea style={textareaStyle} value={form.bio} onChange={e => handleField('bio', e.target.value)} /></Field>
        <Field label="أبرز الإنجازات والجوائز"><textarea style={textareaStyle} value={form.achievement} onChange={e => handleField('achievement', e.target.value)} /></Field>
        <Field label="رابط الصورة الشخصية (URL)"><input style={inputStyle} value={form.image_url ?? ''} onChange={e => handleField('image_url', e.target.value)} placeholder="https://..." /></Field>
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="الترتيب"><input style={{ ...inputStyle, width: 100 }} type="number" value={form.order_index} onChange={e => handleField('order_index', parseInt(e.target.value) || 0)} /></Field>
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
