import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ImageIcon, Trash2, Plus, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/admin/ImageUploader';
import {
  fetchHeroImagesAdmin,
  upsertHeroImage,
  deleteHeroImage,
  type PageHeroImage,
} from '@/service/heroImages';
import { AdminPageHeader } from './CMSShared';

const B = '#8B1A2A';

const PAGE_OPTIONS: { key: string; label: string; icon: string; folder: string }[] = [
  { key: 'istanbul', label: 'عن إسطنبول', icon: '🕌', folder: 'hero/istanbul' },
  { key: 'yemen', label: 'عن اليمن', icon: '🇾🇪', folder: 'hero/yemen' },
  { key: 'universities', label: 'الجامعات', icon: '🎓', folder: 'hero/universities' },
  { key: 'icons', label: 'رموزنا', icon: '🏅', folder: 'hero/icons' },
  { key: 'achievements', label: 'الإنجازات', icon: '🏆', folder: 'hero/achievements' },
];

export default function HeroImagesAdmin() {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('istanbul');
  const [images, setImages] = useState<PageHeroImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const currentPage = PAGE_OPTIONS.find(p => p.key === selectedKey)!;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHeroImagesAdmin(selectedKey);
      setImages(data);
    } catch {
      toast.error('فشل تحميل الصور');
    } finally {
      setLoading(false);
    }
  }, [selectedKey]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!newImageUrl.trim()) return toast.error('يرجى رفع أو إدخال رابط صورة أولاً');
    setAdding(true);
    try {
      const nextOrder = images.length > 0 ? Math.max(...images.map(i => i.order_index)) + 1 : 0;
      await upsertHeroImage({
        page_key: selectedKey,
        image_url: newImageUrl.trim(),
        order_index: nextOrder,
        is_active: true,
      });
      toast.success('تمت إضافة الصورة');
      setNewImageUrl('');
      setShowUploader(false);
      await load();
    } catch {
      toast.error('فشل الإضافة');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الصورة؟')) return;
    try {
      await deleteHeroImage(id);
      toast.success('تم الحذف');
      await load();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const handleToggle = async (img: PageHeroImage) => {
    try {
      await upsertHeroImage({ ...img, is_active: !img.is_active });
      await load();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const newArr = [...images];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newArr.length) return;
    [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
    // Reassign order_index
    const updates = newArr.map((img, i) => upsertHeroImage({ ...img, order_index: i }));
    try {
      await Promise.all(updates);
      await load();
    } catch {
      toast.error('فشل إعادة الترتيب');
    }
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <button
        onClick={() => navigate('/admin/info-cms')}
        style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <ChevronRight size={16} /> العودة لإدارة المحتوى
      </button>

      <AdminPageHeader
        title="خلفيات صفحات Hero"
        description="أضف صوراً متعددة لخلفية قسم البطل في كل صفحة — ستظهر كعرض شرائح متحرك"
        icon={ImageIcon}
        onBack={() => navigate('/admin/info-cms')}
      />

      {/* Page selector tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {PAGE_OPTIONS.map(p => (
          <button
            key={p.key}
            onClick={() => { setSelectedKey(p.key); setNewImageUrl(''); setShowUploader(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 12, border: '1.5px solid',
              borderColor: selectedKey === p.key ? B : '#e5e7eb',
              background: selectedKey === p.key ? `${B}10` : '#fff',
              color: selectedKey === p.key ? B : '#374151',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left — image list */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#111' }}>
              {currentPage.icon} صور {currentPage.label}
              <span style={{ marginRight: 10, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                ({images.length} صورة)
              </span>
            </h3>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ height: 140, borderRadius: 12, background: '#f3f4f6', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🖼</div>
              <p style={{ fontSize: 14, margin: 0 }}>لا توجد صور بعد — أضف أول صورة من القسم الجانبي</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#f9fafb', borderRadius: 12, padding: '10px 12px',
                    border: `1px solid ${img.is_active ? '#e5e7eb' : '#fee2e2'}`,
                    opacity: img.is_active ? 1 : 0.6,
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={img.image_url}
                    alt=""
                    style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/72x52?text=!'; }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, color: '#6b7280', wordBreak: 'break-all', direction: 'ltr', textAlign: 'left',
                    }}>
                      {img.image_url.substring(0, 55)}{img.image_url.length > 55 ? '…' : ''}
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                        background: img.is_active ? '#d1fae5' : '#fee2e2',
                        color: img.is_active ? '#065f46' : '#991b1b',
                      }}>
                        {img.is_active ? '✓ مفعّلة' : '● مخفية'}
                      </span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>ترتيب: {img.order_index + 1}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      title="تقديم"
                      style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === images.length - 1}
                      title="تأخير"
                      style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: idx === images.length - 1 ? 'default' : 'pointer', opacity: idx === images.length - 1 ? 0.3 : 1 }}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => handleToggle(img)}
                      title={img.is_active ? 'إخفاء' : 'إظهار'}
                      style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}
                    >
                      {img.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id!)}
                      title="حذف"
                      style={{ background: '#fef2f2', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Add image panel */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24, position: 'sticky', top: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 900, color: '#111' }}>
            + إضافة صورة جديدة
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            ارفع صورة للخلفية أو أدخل رابطاً مباشراً. الصور المضافة ستظهر كعرض شرائح متحرك في خلفية قسم البطل بصفحة <strong>{currentPage.label}</strong>.
          </p>

          <ImageUploader
            value={newImageUrl}
            onChange={setNewImageUrl}
            folder={currentPage.folder}
            label=""
            placeholder="اسحب الصورة هنا أو انقر للتحميل"
          />

          {/* Preview */}
          {newImageUrl && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>معاينة الخلفية:</div>
              <div style={{
                height: 100, borderRadius: 10, overflow: 'hidden', position: 'relative',
                background: 'linear-gradient(135deg, #07080b, #1a0505)',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${newImageUrl})`,
                  backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.22,
                }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f0ece4', fontSize: 12, fontWeight: 700,
                }}>
                  معاينة الخلفية
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={adding || !newImageUrl.trim()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: (adding || !newImageUrl.trim()) ? '#d1d5db' : B,
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 20px', fontSize: 13, fontWeight: 700,
              cursor: (adding || !newImageUrl.trim()) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Plus size={15} />
            {adding ? 'جاري الإضافة…' : 'إضافة الصورة للصفحة'}
          </button>

          {/* Tips */}
          <div style={{ marginTop: 20, background: '#f9fafb', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>💡 نصائح</div>
            <ul style={{ margin: 0, paddingRight: 16, fontSize: 11, color: '#6b7280', lineHeight: 1.8 }}>
              <li>يُفضَّل استخدام صور عرضية بنسبة 16:9 أو أشمل</li>
              <li>الصور ستظهر بشفافية 22% فوق التدرج اللوني</li>
              <li>يمكنك إعادة الترتيب بالأسهم في القائمة</li>
              <li>يمكنك إخفاء صورة مؤقتاً دون حذفها</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
