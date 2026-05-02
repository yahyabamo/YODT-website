import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDepartmentById, upsertDepartment, type InfoDepartment } from '@/service/infoCMS';
import { toast } from 'sonner';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Spinner, Field, ActionBar, AdminPageHeader, inputStyle, textareaStyle } from './CMSShared';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function DepartmentAdmin() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<InfoDepartment>({
        name: '',
        description: '',
        image_url: '',
        duration: '',
        career_paths: '',
        is_published: true,
        order_index: 0
    });

    useEffect(() => {
        if (id) {
            fetchDepartmentById(id)
                .then(data => { if (data) setForm(data); })
                .catch(() => toast.error('خطأ في تحميل البيانات'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleField = (f: keyof InfoDepartment, v: any) => setForm(prev => ({ ...prev, [f]: v }));

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('يرجى إدخال اسم التخصص');
        setSaving(true);
        try {
            await upsertDepartment(form);
            toast.success('تم الحفظ بنجاح');
            navigate('/admin/info/departments'); // Adjust this route to match your dashboard
        } catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
    };

    if (loading) return <Spinner />;

    return (
        <div style={{ direction: 'rtl' }}>
            <button onClick={() => navigate('/admin/info/departments')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronRight size={16} /> العودة للقائمة
            </button>

            <AdminPageHeader
                title={id ? 'تعديل بيانات تخصص' : 'إضافة تخصص جديد'}
                description="أدخل المعلومات التفصيلية للتخصص الأكاديمي"
                icon={BookOpen}
                onBack={() => navigate('/admin/info/departments')}
            />

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 800, margin: '0 auto' }}>
                <Field label="اسم التخصص"><input style={inputStyle} value={form.name} onChange={e => handleField('name', e.target.value)} placeholder="مثال: هندسة البرمجيات" /></Field>

                <Field label="مدة الدراسة"><input style={inputStyle} value={form.duration ?? ''} onChange={e => handleField('duration', e.target.value)} placeholder="مثال: 4 سنوات" /></Field>

                <Field label="المجالات المهنية (مفصولة بفواصل)"><input style={inputStyle} value={form.career_paths ?? ''} onChange={e => handleField('career_paths', e.target.value)} placeholder="مطور ويب، مهندس بيانات..." /></Field>

                <Field label="وصف التخصص"><textarea style={textareaStyle} value={form.description} onChange={e => handleField('description', e.target.value)} /></Field>

                <ImageUploader value={form.image_url ?? ''} onChange={url => handleField('image_url', url)} folder="departments" label="صورة تعبيرية للتخصص" />

                <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: '#f9fafb', padding: '16px 20px', borderRadius: 12 }}>
                    <div style={{ flex: 1 }}>
                        <Field label="الترتيب"><input style={{ ...inputStyle, width: 100 }} type="number" value={form.order_index} onChange={e => handleField('order_index', parseInt(e.target.value) || 0)} /></Field>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                        <input type="checkbox" checked={form.is_published} onChange={e => handleField('is_published', e.target.checked)} style={{ width: 18, height: 18 }} /> تم النشر
                    </label>
                </div>

                <ActionBar onSave={handleSave} onCancel={() => navigate('/admin/info/departments')} saving={saving} />
            </div>
        </div>
    );
}