import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';
import {
  fetchAllActivities, fetchActivityItems, upsertActivity, upsertActivityItem, deleteActivity, deleteActivityItem,
  type HomepageActivity, type HomepageActivityItem
} from '@/service/homepageCMS';
import { B, Spinner, Badge, FieldRow, inputStyle, TriLangInput, Modal, ActionBar, RowActions } from './HomepageShared';

// Cloudinary Upload Function
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "activity_unsigned");
  formData.append("folder", "partners");
  const res = await fetch("https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
}

export default function ActivitiesTab() {
  const [programs, setPrograms] = useState<HomepageActivity[]>([]);
  const [allItems, setAllItems] = useState<HomepageActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [progModal, setProgModal] = useState<HomepageActivity | null>(null);
  const [itemModal, setItemModal] = useState<HomepageActivityItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const BLANK_PROG: HomepageActivity = {
    icon: '🎯', image_url: '', gallery: [], name_ar: '', name_en: '', name_tr: '',
    tag_ar: '', tag_en: '', tag_tr: '', desc_ar: '', desc_en: '', desc_tr: '',
    is_published: true, order_index: programs.length,
  };

  const blankItem = (actId: string): HomepageActivityItem => ({
    activity_id: actId, icon: '📌', title_ar: '', title_en: '', title_tr: '',
    desc_ar: '', desc_en: '', desc_tr: '', freq_ar: '', freq_en: '', freq_tr: '',
    order_index: allItems.filter(i => i.activity_id === actId).length,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [progs, items] = await Promise.all([fetchAllActivities(), fetchActivityItems()]);
      setPrograms(progs);
      setAllItems(items);
    } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleProgField = (f: string, v: any) => setProgModal(m => m ? { ...m, [f]: v } : m);
  const handleItemField = (f: string, v: any) => setItemModal(m => m ? { ...m, [f]: v } : m);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file || !progModal) return;

    setUploadingImg(true);
    try {
      const url = await uploadImage(file);
      if (isGallery) {
        const currentGallery = progModal.gallery || [];
        handleProgField('gallery', [...currentGallery, url]);
      } else {
        handleProgField('image_url', url);
      }
      toast.success('تم رفع الصورة بنجاح');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingImg(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    if (!progModal) return;
    const newGallery = [...(progModal.gallery || [])];
    newGallery.splice(index, 1);
    handleProgField('gallery', newGallery);
  };

  const saveProg = async () => {
    if (!progModal) return;
    setSaving(true);
    try { await upsertActivity(progModal); toast.success('تم حفظ البرنامج'); setProgModal(null); load(); }
    catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  const saveItem = async () => {
    if (!itemModal) return;
    setSaving(true);
    try { await upsertActivityItem(itemModal); toast.success('تم حفظ النشاط'); setItemModal(null); load(); }
    catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  const deleteProg = async (id: string) => {
    if (!confirm('ستُحذف جميع الأنشطة الفرعية أيضاً. هل تريد المتابعة؟')) return;
    try { await deleteActivity(id); toast.success('تم الحذف'); load(); } catch { toast.error('فشل الحذف'); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل تريد الحذف؟')) return;
    try { await deleteActivityItem(id); toast.success('تم الحذف'); load(); } catch { toast.error('فشل الحذف'); }
  };

  const toggleProg = async (p: HomepageActivity) => {
    try { await upsertActivity({ ...p, is_published: !p.is_published }); load(); } catch { toast.error('فشل التحديث'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>برامج الأنشطة ({programs.length})</h3>
        <button onClick={() => setProgModal({ ...BLANK_PROG })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: B, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> إضافة برنامج
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {programs.map(p => {
          const items = allItems.filter(i => i.activity_id === p.id);
          const expanded = expandedId === p.id;
          return (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {p.image_url ? <img src={p.image_url} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{p.name_ar} / {p.name_en}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{p.tag_ar} — {items.length} نشاط فرعي</div>
                  <div style={{ marginTop: 5 }}><Badge published={p.is_published} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : p.id!)}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {items.length} نشاط
                  </button>
                  <RowActions item={p} onEdit={() => setProgModal({ ...p })} onDelete={() => deleteProg(p.id!)} onToggle={() => toggleProg(p)} />
                </div>
              </div>

              {expanded && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 18px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>الأنشطة الفرعية</span>
                    <button
                      onClick={() => setItemModal(blankItem(p.id!))}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Plus size={12} /> إضافة نشاط
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(it => (
                      <div key={it.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{it.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{it.title_ar} / {it.title_en}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{it.freq_ar}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setItemModal({ ...it })} style={{ background: '#eff6ff', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center' }}><Pencil size={13} /></button>
                          <button onClick={() => deleteItem(it.id!)} style={{ background: '#fef2f2', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, margin: 0 }}>لا توجد أنشطة فرعية بعد</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {programs.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>لا توجد برامج بعد. أضف واحداً!</p>}
      </div>

      {progModal && (
        <Modal title={progModal.id ? 'تعديل البرنامج' : 'إضافة برنامج جديد'} onClose={() => setProgModal(null)}>

          <FieldRow label="الصورة الرئيسية للبرنامج">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {progModal.image_url ? (
                <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <img src={progModal.image_url} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleProgField('image_url', '')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px dashed #d1d5db' }}>
                  <ImageIcon size={24} />
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {uploadingImg ? <Spinner /> : <Upload size={14} />}
                رفع صورة
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, false)} disabled={uploadingImg} />
              </label>
            </div>
          </FieldRow>

          <TriLangInput label="اسم البرنامج" fieldAr="name_ar" fieldEn="name_en" fieldTr="name_tr" valueAr={progModal.name_ar} valueEn={progModal.name_en} valueTr={progModal.name_tr} onChange={handleProgField} />
          <TriLangInput label="التصنيف (tag)" fieldAr="tag_ar" fieldEn="tag_en" fieldTr="tag_tr" valueAr={progModal.tag_ar} valueEn={progModal.tag_en} valueTr={progModal.tag_tr} onChange={handleProgField} />
          <TriLangInput label="الوصف" fieldAr="desc_ar" fieldEn="desc_en" fieldTr="desc_tr" valueAr={progModal.desc_ar} valueEn={progModal.desc_en} valueTr={progModal.desc_tr} onChange={handleProgField} multiline />

          <FieldRow label="معرض الصور (Gallery)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(progModal.gallery || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220, 38, 38, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                  </div>
                ))}
                <label style={{ width: 80, height: 80, borderRadius: 8, background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', border: '1px dashed #d1d5db', cursor: 'pointer', fontSize: 11, gap: 4 }}>
                  {uploadingImg ? <Spinner /> : <Plus size={20} />}
                  إضافة
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, true)} disabled={uploadingImg} />
                </label>
              </div>
            </div>
          </FieldRow>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <FieldRow label="الترتيب">
              <input style={{ ...inputStyle, width: 80 }} type="number" value={progModal.order_index} onChange={e => handleProgField('order_index', +e.target.value)} />
            </FieldRow>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={progModal.is_published} onChange={e => handleProgField('is_published', e.target.checked)} />
              منشور
            </label>
          </div>
          <ActionBar onSave={saveProg} onCancel={() => setProgModal(null)} saving={saving} />
        </Modal>
      )}

      {/* Item Modal remains unchanged */}
      {itemModal && (
        <Modal title={itemModal.id ? 'تعديل النشاط الفرعي' : 'إضافة نشاط فرعي'} onClose={() => setItemModal(null)}>
          <FieldRow label="الأيقونة (emoji)">
            <input style={{ ...inputStyle, width: 80 }} value={itemModal.icon} onChange={e => handleItemField('icon', e.target.value)} />
          </FieldRow>
          <TriLangInput label="عنوان النشاط" fieldAr="title_ar" fieldEn="title_en" fieldTr="title_tr" valueAr={itemModal.title_ar} valueEn={itemModal.title_en} valueTr={itemModal.title_tr} onChange={handleItemField} />
          <TriLangInput label="الوصف" fieldAr="desc_ar" fieldEn="desc_en" fieldTr="desc_tr" valueAr={itemModal.desc_ar} valueEn={itemModal.desc_en} valueTr={itemModal.desc_tr} onChange={handleItemField} multiline />
          <TriLangInput label="التكرار (مثل: أسبوعياً)" fieldAr="freq_ar" fieldEn="freq_en" fieldTr="freq_tr" valueAr={itemModal.freq_ar} valueEn={itemModal.freq_en} valueTr={itemModal.freq_tr} onChange={handleItemField} />
          <FieldRow label="رابط الصورة (اختياري)">
            <input style={inputStyle} value={itemModal.image_url ?? ''} onChange={e => handleItemField('image_url', e.target.value)} placeholder="https://..." />
          </FieldRow>
          <FieldRow label="الترتيب">
            <input style={{ ...inputStyle, width: 80 }} type="number" value={itemModal.order_index} onChange={e => handleItemField('order_index', +e.target.value)} />
          </FieldRow>
          <ActionBar onSave={saveItem} onCancel={() => setItemModal(null)} saving={saving} />
        </Modal>
      )}
    </div>
  );
}