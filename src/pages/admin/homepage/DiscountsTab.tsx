import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { fetchAllDiscounts, upsertDiscount, deleteDiscount, type HomepageDiscount } from '@/service/homepageCMS';
import { B, Spinner, Badge, FieldRow, inputStyle, TriLangInput, Modal, ActionBar, RowActions } from './HomepageShared';

export default function DiscountsTab() {
  const [rows, setRows] = useState<HomepageDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<HomepageDiscount | null>(null);
  const [saving, setSaving] = useState(false);

  const BLANK: HomepageDiscount = {
    title_ar: '', title_en: '', title_tr: '',
    desc_ar: '', desc_en: '', desc_tr: '',
    label_ar: '', label_en: '', label_tr: '',
    icon: '🏷️', is_published: true, order_index: rows.length,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchAllDiscounts()); } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => setModal({ ...BLANK, order_index: rows.length });
  const openEdit = (r: HomepageDiscount) => setModal({ ...r });

  const handleField = (field: string, val: string | boolean | number) =>
    setModal(m => m ? { ...m, [field]: val } : m);

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      await upsertDiscount(modal);
      toast.success('تم الحفظ بنجاح');
      setModal(null);
      load();
    } catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد الحذف؟')) return;
    try { await deleteDiscount(id); toast.success('تم الحذف'); load(); } catch { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (r: HomepageDiscount) => {
    try { await upsertDiscount({ ...r, is_published: !r.is_published }); load(); } catch { toast.error('فشل التحديث'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>بطاقات الخصومات ({rows.length})</h3>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, background: B, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> إضافة بطاقة
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 26, flexShrink: 0 }}>{r.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 2 }}>{r.title_ar} / {r.title_en}</div>
              <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.desc_ar}</div>
              <div style={{ marginTop: 5 }}><Badge published={r.is_published} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>#{r.order_index}</span>
              <RowActions item={r} onEdit={() => openEdit(r)} onDelete={() => handleDelete(r.id!)} onToggle={() => handleToggle(r)} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>لا توجد بطاقات بعد. أضف واحدة!</p>}
      </div>

      {modal && (
        <Modal title={modal.id ? 'تعديل البطاقة' : 'إضافة بطاقة جديدة'} onClose={() => setModal(null)}>
          <FieldRow label="الأيقونة (emoji)">
            <input style={{ ...inputStyle, width: 80 }} value={modal.icon} onChange={e => handleField('icon', e.target.value)} placeholder="🏷️" />
          </FieldRow>
          <TriLangInput label="العنوان" fieldAr="title_ar" fieldEn="title_en" fieldTr="title_tr" valueAr={modal.title_ar} valueEn={modal.title_en} valueTr={modal.title_tr} onChange={handleField} />
          <TriLangInput label="الوصف" fieldAr="desc_ar" fieldEn="desc_en" fieldTr="desc_tr" valueAr={modal.desc_ar} valueEn={modal.desc_en} valueTr={modal.desc_tr} onChange={handleField} multiline />
          <TriLangInput label="التسمية (label pill)" fieldAr="label_ar" fieldEn="label_en" fieldTr="label_tr" valueAr={modal.label_ar} valueEn={modal.label_en} valueTr={modal.label_tr} onChange={handleField} />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
            <FieldRow label="الترتيب">
              <input style={{ ...inputStyle, width: 80 }} type="number" value={modal.order_index} onChange={e => handleField('order_index', +e.target.value)} />
            </FieldRow>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={modal.is_published} onChange={e => handleField('is_published', e.target.checked)} />
              منشور
            </label>
          </div>
          <ActionBar onSave={handleSave} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}
    </div>
  );
}
