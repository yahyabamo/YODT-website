import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, GraduationCap } from 'lucide-react';
import { fetchAllUniversities, deleteUniversity, upsertUniversity, type InfoUniversity } from '@/service/infoCMS';
import { Spinner, Badge, RowActions, AdminPageHeader, B } from './CMSShared';
import { ChevronRight } from 'lucide-react';

export default function UniversitiesAdmin() {
  const [rows, setRows] = useState<InfoUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUniversities();
      setRows(data);
    } catch (error) {
      console.error(error);
      toast.error('خطأ في تحميل الجامعات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('حذف الجامعة؟')) return;
    try {
      await deleteUniversity(id);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (r: InfoUniversity) => {
    try {
      await upsertUniversity({ ...r, is_published: !r.is_published });
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
        title="إدارة الجامعات"
        description={`دليل الجامعات التركية للطلاب اليمنيين (${rows.length} جامعة)`}
        icon={GraduationCap}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button
          onClick={() => navigate('/admin/info/universities/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: B, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> إضافة جامعة
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {r.image_url && <img src={r.image_url} alt='' style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>📍 {r.location} {r.established && `· تأسست ${r.established}`}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}><Badge published={r.is_published} /></div>
            </div>
            <RowActions
              item={r}
              onEdit={() => navigate(`/admin/info/universities/${r.id}`)}
              onDelete={() => handleDelete(r.id!)}
              onToggle={() => handleToggle(r)}
            />
          </div>
        ))}
        {rows.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>لا توجد جامعات بعد</p>}
      </div>
    </div>
  );
}
