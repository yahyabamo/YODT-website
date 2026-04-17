import React from 'react';
import { Save, Eye, EyeOff, Pencil, Trash2, X } from 'lucide-react';

export const B = '#8B1A2A';

export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
  fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

export const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 70 };

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

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

interface TriLangInputProps {
  label: string;
  fieldAr: string; fieldEn: string; fieldTr: string;
  valueAr: string; valueEn: string; valueTr: string;
  onChange: (field: string, val: string) => void;
  multiline?: boolean;
}

export function TriLangInput({
  label,
  fieldAr, fieldEn, fieldTr,
  valueAr, valueEn, valueTr,
  onChange,
  multiline = false,
}: TriLangInputProps) {
  const Tag = multiline ? 'textarea' : 'input';
  const st = multiline ? textareaStyle : inputStyle;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { key: fieldAr, val: valueAr, placeholder: 'عربي', dir: 'rtl' },
          { key: fieldEn, val: valueEn, placeholder: 'English', dir: 'ltr' },
          { key: fieldTr, val: valueTr, placeholder: 'Türkçe', dir: 'ltr' },
        ].map(({ key, val, placeholder, dir }) => (
          <div key={key}>
            <Tag
              style={{ ...st, direction: dir as 'rtl' | 'ltr', width: '100%' }}
              placeholder={placeholder}
              value={val || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px', overflowY: 'auto',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '28px 28px 24px',
        width: '100%', maxWidth: 720, boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        animation: 'fadeUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#111' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280', fontSize: 18 }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ActionBar({ onSave, onCancel, saving }: { onSave: () => void; onCancel: () => void; saving: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', marginTop: 20, paddingTop: 18, borderTop: '1px solid #f0f0f0' }}>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: B, color: '#fff', border: 'none', borderRadius: 10,
          padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        <Save size={14} /> {saving ? 'جاري الحفظ…' : 'حفظ التغييرات'}
      </button>
      <button
        onClick={onCancel}
        style={{
          background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10,
          padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        إلغاء
      </button>
    </div>
  );
}

export function RowActions({
  item, onEdit, onDelete, onToggle, toggleKey = 'is_published',
}: {
  item: any; onEdit: () => void; onDelete: () => void; onToggle: () => void; toggleKey?: string;
}) {
  const published = item[toggleKey] ?? true;
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <button
        onClick={onToggle}
        title={published ? 'إخفاء' : 'نشر'}
        style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}
      >
        {published ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button
        onClick={onEdit}
        style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center' }}
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
