import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';
import { fetchAllArticles, deleteArticle, upsertArticle, type InfoArticle } from '@/service/infoCMS';
import { Spinner, Badge, RowActions, AdminPageHeader, B } from './CMSShared';
import { ChevronRight } from 'lucide-react';

export default function ArticlesAdmin() {
  const [rows, setRows] = useState<InfoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllArticles();
      setRows(data);
    } catch (error) {
      console.error(error);
      toast.error('خطأ في تحميل المقالات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المقال نهائياً؟')) return;
    try {
      await deleteArticle(id);
      toast.success('تم الحذف بنجاح');
      load();
    } catch (error) {
      console.error(error);
      toast.error('فشل الحذف');
    }
  };

  const handleToggle = async (article: InfoArticle) => {
    try {
      await upsertArticle({ ...article, is_published: !article.is_published });
      load();
    } catch (error) {
      console.error(error);
      toast.error('فشل تحديث الحالة');
    }
  };

  const CATEGORY_LABELS: Record<string, string> = {
    istanbul: 'إسطنبول',
    yemen: 'اليمن',
    general: 'عام'
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
        title="إدارة المقالات"
        description={`لديك الآن ${rows.length} مقالاً في النظام`}
        icon={FileText}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button
          onClick={() => navigate('/admin/info/articles/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: B, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 26, 42, 0.2)'
          }}
        >
          <Plus size={16} /> إضافة مقال جديد
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s ease' }}>
            {r.image_url && (
              <img
                src={r.image_url}
                alt=''
                style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#f3f4f6' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111', marginBottom: 4 }}>{r.title || 'بدون عنوان'}</div>
              <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{CATEGORY_LABELS[r.category] || r.category}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db' }} />
                <span>{r.author || 'كاتب غير معروف'}</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge published={r.is_published} />
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>ترتيب: {r.order_index}</span>
              </div>
            </div>
            <RowActions
              item={r}
              onEdit={() => navigate(`/admin/info/articles/${r.id}`)}
              onDelete={() => handleDelete(r.id!)}
              onToggle={() => handleToggle(r)}
            />
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: 20, border: '2px dashed #e5e7eb' }}>
            <p style={{ color: '#9ca3af', fontWeight: 600 }}>لا توجد مقالات مضافة بعد. ابدأ بإضافة أول مقال!</p>
          </div>
        )}
      </div>
    </div>
  );
}
