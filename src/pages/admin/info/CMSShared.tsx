import React from 'react';
import { Save, Eye, EyeOff, Pencil, Trash2, X } from 'lucide-react';

export const B = '#8B1A2A';

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
  fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit',
};

export const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 80 };

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${B}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

export function Badge({ published }: { published: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: published ? '#d1fae5' : '#fee2e2',
      color: published ? '#065f46' : '#991b1b',
    }}>
      {published ? '✓ منشور' : '● مخفي'}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

export function ActionBar({ onSave, onCancel, saving, isDirty = true }: { onSave: () => void; onCancel: () => void; saving: boolean; isDirty?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '1px solid #f0f0f0' }}>
      <button 
        onClick={onSave} 
        disabled={saving || !isDirty} 
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: B, color: '#fff', border: 'none', borderRadius: 10,
          padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: (saving || !isDirty) ? 'not-allowed' : 'pointer',
          opacity: (saving || !isDirty) ? 0.7 : 1,
        }}
      >
        <Save size={14} /> {saving ? 'جاري الحفظ…' : 'حفظ التغييرات'}
      </button>
      <button onClick={onCancel} style={{
        background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10,
        padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}>
        إلغاء
      </button>
    </div>
  );
}

export function RowActions({ item, onEdit, onDelete, onToggle }: { item: any; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  const published = item.is_published ?? true;
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={onToggle} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={published ? 'إخفاء' : 'نشر'}>
        {published ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button onClick={onEdit} style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center' }}>
        <Pencil size={15} />
      </button>
      <button onClick={onDelete} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function AdminPageHeader({ title, description, icon: Icon, backPath, onBack }: { title: string; description: string; icon: any; backPath?: string; onBack?: () => void }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${B},#600f1c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Icon size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111' }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{description}</p>
        </div>
        {(backPath || onBack) && (
          <button 
            onClick={onBack} 
            style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <X size={14} /> إغلاق
          </button>
        )}
      </div>
    </div>
  );
}
