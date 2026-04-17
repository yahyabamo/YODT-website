import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { fetchAllPartners, upsertPartner, deletePartner, type HomepagePartner } from '@/service/homepageCMS';
import { B, Spinner, Badge, FieldRow, inputStyle, TriLangInput, Modal, ActionBar, RowActions } from './HomepageShared';

export default function PartnersTab() {
  const [rows, setRows] = useState<HomepagePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<HomepagePartner | null>(null);
  const [saving, setSaving] = useState(false);

  const BLANK: HomepagePartner = {
    abbr: '', name_ar: '', name_en: '', name_tr: '',
    logo_url: '', link: '', is_published: true, order_index: 0,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchAllPartners()); } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleField = (f: string, v: any) => setModal(m => m ? { ...m, [f]: v } : m);

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    try { await upsertPartner(modal); toast.success('تم الحفظ'); setModal(null); load(); }
    catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد الحذف؟')) return;
    try { await deletePartner(id); toast.success('تم الحذف'); load(); } catch { toast.error('فشل الحذف'); }
  };

  const handleToggle = async (r: HomepagePartner) => {
    try { await upsertPartner({ ...r, is_published: !r.is_published }); load(); } catch { toast.error('فشل التحديث'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>الشركاء ({rows.length})</h3>
        <button onClick={() => setModal({ ...BLANK, order_index: rows.length })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: B, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> إضافة شريك
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {rows.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {r.logo_url
                    ? <img src={r.logo_url} alt={r.abbr} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
                    : <div style={{ width: 32, height: 32, background: '#f3f4f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#374151' }}>{r.abbr}</div>
                  }
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>{r.abbr}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{r.name_ar}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{r.name_en} / {r.name_tr}</div>
                {r.link && <div style={{ fontSize: 11, color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.link}</div>}
                <div style={{ marginTop: 6 }}><Badge published={r.is_published} /></div>
              </div>
              <RowActions item={r} onEdit={() => setModal({ ...r })} onDelete={() => handleDelete(r.id!)} onToggle={() => handleToggle(r)} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 32, gridColumn: '1/-1' }}>لا يوجد شركاء بعد. أضف واحداً!</p>}
      </div>

      {modal && (
        <Modal title={modal.id ? 'تعديل الشريك' : 'إضافة شريك جديد'} onClose={() => setModal(null)}>
          <FieldRow label="الاختصار (ABBR)">
            <input style={{ ...inputStyle, width: 100, textTransform: 'uppercase' }} value={modal.abbr} onChange={e => handleField('abbr', e.target.value.toUpperCase())} placeholder="UNI" />
          </FieldRow>
          <TriLangInput label="اسم الشريك" fieldAr="name_ar" fieldEn="name_en" fieldTr="name_tr" valueAr={modal.name_ar} valueEn={modal.name_en} valueTr={modal.name_tr} onChange={handleField} />
          <FieldRow label="رابط الشعار (اختياري)">
            <input style={inputStyle} value={modal.logo_url ?? ''} onChange={e => handleField('logo_url', e.target.value)} placeholder="https://..." />
          </FieldRow>
          <FieldRow label="الرابط (اختياري)">
            <input style={inputStyle} value={modal.link ?? ''} onChange={e => handleField('link', e.target.value)} placeholder="https://..." />
          </FieldRow>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
