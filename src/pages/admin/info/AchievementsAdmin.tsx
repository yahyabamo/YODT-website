import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trophy } from 'lucide-react';
import { fetchAllAchievements, deleteAchievement, upsertAchievement, type InfoAchievement } from '@/service/infoCMS';
import { Spinner, Badge, RowActions, AdminPageHeader, B } from './CMSShared';
import { ChevronRight } from 'lucide-react';

export default function AchievementsAdmin() {
  const [rows, setRows] = useState<InfoAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllAchievements();
      setRows(data);
    } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الإنجاز؟')) return;
    try {
      await deleteAchievement(id);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (r: InfoAchievement) => {
    try {
      await upsertAchievement({ ...r, is_published: !r.is_published });
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
        title="إدارة الإنجازات"
        description="توثيق النجاحات والجوائز التي حققها أبناء الجالية"
        icon={Trophy}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button
          onClick={() => navigate('/admin/info/achievements/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: B, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> إضافة إنجاز جديد
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>{r.icon || '🏆'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{r.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>📅 {r.achievement_date} {r.category && `· ${r.category}`}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}><Badge published={r.is_published} /></div>
            </div>
            <RowActions
              item={r}
              onEdit={() => navigate(`/admin/info/achievements/${r.id}`)}
              onDelete={() => handleDelete(r.id!)}
              onToggle={() => handleToggle(r)}
            />
          </div>
        ))}
        {rows.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>لا توجد إنجازات بعد</p>}
      </div>
    </div>
  );
}
