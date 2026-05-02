import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUniversityById, upsertUniversity, fetchDepartments, type InfoUniversity, type InfoDepartment } from '@/service/infoCMS';
import { toast } from 'sonner';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';
import { ImageUploader } from '@/components/admin/ImageUploader';


export default function UniversityFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [availableDepts, setAvailableDepts] = useState<InfoDepartment[]>([]);

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
    fetchDepartments().then(setAvailableDepts).catch(console.error);
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
        <Field label="أبرز التخصصات (مفصولة بفواصل)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input style={inputStyle} value={form.specialties ?? ''} onChange={e => handleField('specialties', e.target.value)} placeholder="الطب، الهندسة، الأعمال..." />

            {availableDepts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', margin: 'auto 0' }}>إضافة سريعة:</span>
                {availableDepts.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      const current = form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [];
                      if (!current.includes(d.name)) {
                        handleField('specialties', [...current, d.name].join('، '));
                      }
                    }}
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer' }}
                  >
                    + {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>        <ImageUploader
          value={form.image_url ?? ''}
          onChange={url => handleField('image_url', url)}
          folder="universities"
          label="صورة الحرم الجامعي"
        />

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
