import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Users } from 'lucide-react';
import { fetchAllStudents, deleteStudent, upsertStudent, type InfoStudent } from '@/service/infoCMS';
import { Spinner, Badge, RowActions, AdminPageHeader, B } from './CMSShared';
import { ChevronRight } from 'lucide-react';

export default function StudentsAdmin() {
  const [rows, setRows] = useState<InfoStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllStudents();
      setRows(data);
    } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الطالب؟')) return;
    try {
      await deleteStudent(id);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (r: InfoStudent) => {
    try {
      await upsertStudent({ ...r, is_published: !r.is_published });
      load();
    } catch { toast.error('فشل التحديث'); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ direction: 'rtl' }}>
      <button
        onClick={() => navigate('/admin/info-cms')}
        style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronRight size={16} /> العودة للقائمة
      </button>
      <AdminPageHeader
        title="إدارة الطلاب المتميزين"
        description="تسليط الضوء على إنجازات الطلاب اليمنيين في تركيا"
        icon={Users}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button
          onClick={() => navigate('/admin/info/students/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: B, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> إضافة طالب متميز
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{r.major} · {r.university}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{r.academic_year} {r.gpa && `· GPA: ${r.gpa}`}</div>
                <div style={{ marginTop: 10 }}><Badge published={r.is_published} /></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <RowActions
                  item={r}
                  onEdit={() => navigate(`/admin/info/students/${r.id}`)}
                  onDelete={() => handleDelete(r.id!)}
                  onToggle={() => handleToggle(r)}
                />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 40, gridColumn: '1/-1' }}>لا توجد بيانات بعد</p>}
      </div>
    </div>
  );
}
