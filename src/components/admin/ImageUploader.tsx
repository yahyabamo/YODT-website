import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';

interface ImageUploaderProps {
  value: string;              // current image URL
  onChange: (url: string) => void;
  folder: string;             // Cloudinary folder
  label?: string;
  placeholder?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder,
  label = 'الصورة',
  placeholder = 'اسحب صورة هنا أو انقر للتحميل',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة فقط');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, folder);
      onChange(url);
    } catch (e: any) {
      setError(e?.message ?? 'فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${dragOver ? '#8B1A2A' : value ? '#10b981' : '#d1d5db'}`,
    borderRadius: 12,
    padding: '16px',
    cursor: uploading ? 'not-allowed' : 'pointer',
    background: dragOver ? 'rgba(139,26,42,0.04)' : value ? 'rgba(16,185,129,0.04)' : '#fafafa',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
          {label}
        </label>
      )}

      {/* Drop zone / preview */}
      <div
        style={dropZoneStyle}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {/* Preview thumbnail */}
        {value && !uploading && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={value}
              alt="preview"
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, display: 'block' }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 20, height: 20, borderRadius: '50%',
                background: '#dc2626', color: '#fff', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900,
              }}
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Uploading spinner */}
        {uploading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <Loader2 size={22} style={{ color: '#8B1A2A', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>جاري الرفع إلى Cloudinary…</span>
          </div>
        )}

        {/* Empty state */}
        {!uploading && !value && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(139,26,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload size={20} style={{ color: '#8B1A2A' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{placeholder}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>PNG، JPG، WebP — حتى 10 MB</div>
            </div>
          </div>
        )}

        {/* Uploaded — show change hint */}
        {!uploading && value && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 2 }}>✓ تم رفع الصورة</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>انقر أو اسحب صورة جديدة للاستبدال</div>
            <div style={{
              marginTop: 6, fontSize: 10, color: '#9ca3af',
              wordBreak: 'break-all', direction: 'ltr', textAlign: 'left',
            }}>
              {value.substring(0, 60)}{value.length > 60 ? '…' : ''}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>

      {/* URL fallback input */}
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ImageIcon size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="أو الصق رابط URL مباشرة…"
          style={{
            flex: 1, padding: '5px 10px', borderRadius: 7, border: '1px solid #e5e7eb',
            fontSize: 11, color: '#374151', outline: 'none', background: '#fff',
            fontFamily: 'inherit', direction: 'ltr',
          }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 5, fontSize: 11, color: '#dc2626', fontWeight: 600 }}>⚠ {error}</div>
      )}
    </div>
  );
}
