import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { fetchFooter, upsertFooter, type HomepageFooter } from '@/service/homepageCMS';
import { B, Spinner, inputStyle } from './HomepageShared';

export default function FooterTab() {
  const [form, setForm] = useState<HomepageFooter>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try { const d = await fetchFooter(); if (d) setForm(d); } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
    })();
  }, []);

  const handleField = (f: string, v: string) => setForm(m => ({ ...m, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await upsertFooter(form); toast.success('تم حفظ معلومات التذييل'); }
    catch { toast.error('فشل الحفظ'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800 }}>إعدادات التذييل والتواصل</h3>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#374151', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>🔗 روابط التواصل الاجتماعي</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { field: 'instagram_url', label: '📸 Instagram', placeholder: 'https://instagram.com/...' },
            { field: 'facebook_url', label: '👥 Facebook', placeholder: 'https://facebook.com/...' },
            { field: 'twitter_url', label: '🐦 Twitter / X', placeholder: 'https://twitter.com/...' },
            { field: 'telegram_url', label: '✈️ Telegram', placeholder: 'https://t.me/...' },
            { field: 'youtube_url', label: '▶️ YouTube', placeholder: 'https://youtube.com/...' },
            { field: 'whatsapp_url', label: '💬 WhatsApp', placeholder: 'https://wa.me/...' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{label}</label>
              <input style={inputStyle} value={(form as any)[field] ?? ''} onChange={e => handleField(field, e.target.value)} placeholder={placeholder} />
            </div>
          ))}
        </div>

        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#374151', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>📞 بيانات التواصل</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>رقم الهاتف</label>
            <input style={{ ...inputStyle, direction: 'ltr' }} value={form.phone ?? ''} onChange={e => handleField('phone', e.target.value)} placeholder="+90 5XX XXX XXXX" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>البريد الإلكتروني</label>
            <input style={{ ...inputStyle, direction: 'ltr' }} value={form.email ?? ''} onChange={e => handleField('email', e.target.value)} placeholder="info@ysu-istanbul.org" />
          </div>
        </div>

        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#374151', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>📍 العنوان</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
          {[
            { field: 'address_ar', placeholder: 'إسطنبول، تركيا', dir: 'rtl', label: 'العنوان (عربي)' },
            { field: 'address_en', placeholder: 'Istanbul, Turkey', dir: 'ltr', label: 'العنوان (English)' },
            { field: 'address_tr', placeholder: 'İstanbul, Türkiye', dir: 'ltr', label: 'العنوان (Türkçe)' },
          ].map(({ field, placeholder, dir, label }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{label}</label>
              <input style={{ ...inputStyle, direction: dir as 'rtl' | 'ltr' }} value={(form as any)[field] ?? ''} onChange={e => handleField(field, e.target.value)} placeholder={placeholder} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: B, color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={14} /> {saving ? 'جاري الحفظ…' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  );
}
