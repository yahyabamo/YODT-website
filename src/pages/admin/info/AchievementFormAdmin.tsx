import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAllAchievements, upsertAchievement, type InfoAchievement } from '@/service/infoCMS';
import { toast } from 'sonner';
import { Trophy, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function AchievementFormAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<InfoAchievement>({
    title: '',
    description: '',
    image_url: '',
    achievement_date: '',
    category: 'عام',
    icon: '🏆',
    is_published: true,
    order_index: 0
  });

  useEffect(() => {
    if (id) {
      // AchievementById is not exported in service, so we find it in all
      fetchAllAchievements()
        .then(all => {
          const found = all.find(a => a.id === id);
          if (found) setForm(found);
        })
        .catch(() => toast.error('خطأ في تحميل البيانات'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleField = (f: keyof InfoAchievement, v: any) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('يرجى إدخال العنوان');
    setSaving(true);
    try {
      await upsertAchievement(form);
      toast.success('تم الحفظ بنجاح');
      navigate('/admin/info/achievements');
    } catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ direction: 'rtl' }}>
      <button onClick={() => navigate('/admin/info/achievements')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronRight size={16} /> العودة للقائمة
      </button>

      <AdminPageHeader 
        title={id ? 'تعديل الإنجاز' : 'إضافة إنجاز مشرف جديد'} 
        description="سجّل لحظات الفخر والاعتزاز بنجاحات طلابنا"
        icon={Trophy}
        onBack={() => navigate('/admin/info/achievements')}
      />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 16 }}>
          <Field label="الأيقونة"><input style={{ ...inputStyle, textAlign: 'center', fontSize: 24 }} value={form.icon} onChange={e => handleField('icon', e.target.value)} placeholder="🏆" /></Field>
          <Field label="عنوان الإنجاز"><input style={inputStyle} value={form.title} onChange={e => handleField('title', e.target.value)} /></Field>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="تاريخ الإنجاز"><input style={inputStyle} value={form.achievement_date} onChange={e => handleField('achievement_date', e.target.value)} placeholder="2024" /></Field>
          <Field label="التصنيف"><input style={inputStyle} value={form.category} onChange={e => handleField('category', e.target.value)} placeholder="ثقافي، رياضي..." /></Field>
        </div>

        <Field label="وصف الإنجاز"><textarea style={{ ...textareaStyle, minHeight: 120 }} value={form.description} onChange={e => handleField('description', e.target.value)} /></Field>
        <ImageUploader
          value={form.image_url ?? ''}
          onChange={url => handleField('image_url', url)}
          folder="achievements"
          label="صورة الإنجاز (اختياري)"
        />
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="الترتيب"><input style={{ ...inputStyle, width: 100 }} type="number" value={form.order_index} onChange={e => handleField('order_index', parseInt(e.target.value) || 0)} /></Field>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => handleField('is_published', e.target.checked)} style={{ width: 18, height: 18 }} /> تم النشر
          </label>
        </div>

        <ActionBar onSave={handleSave} onCancel={() => navigate('/admin/info/achievements')} saving={saving} />
      </div>
    </div>
  );
}
