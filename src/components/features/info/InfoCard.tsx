import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InfoCardProps {
  id: string;
  name: string;
  bio: string;
  image_url?: string;
  badge?: string;
  badgeColor?: string;
  detailPath: string;
  extraInfo?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  id,
  name,
  bio,
  image_url,
  badge,
  badgeColor = '#7a1c1c',
  detailPath,
  extraInfo,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(detailPath)}
      style={{
        background: 'var(--bg-1, #0d0f14)',
        border: '1px solid var(--border, rgba(255,255,255,0.07))',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-6px)';
        el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)';
        el.style.borderColor = 'rgba(200,168,75,0.25)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
        el.style.borderColor = 'var(--border, rgba(255,255,255,0.07))';
      }}
    >
      {/* Image */}
      <div style={{
        width: '100%', aspectRatio: '4/3', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1c2030, #252a3a)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', opacity: 0.3,
          }}>
            👤
          </div>
        )}
        {badge && (
          <span style={{
            position: 'absolute', top: '12px', right: '12px',
            background: badgeColor, color: '#fff',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '0.7rem', fontWeight: 700,
            backdropFilter: 'blur(8px)',
          }}>
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{
          color: 'var(--text, #f0ece4)', fontSize: '1rem',
          fontWeight: 700, lineHeight: 1.3, margin: 0,
        }}>
          {name}
        </h3>

        {extraInfo && (
          <span style={{
            color: '#c8a84b', fontSize: '0.75rem',
            fontWeight: 600, display: 'block',
          }}>
            {extraInfo}
          </span>
        )}

        <p style={{
          color: 'var(--text-2, #b8b4ac)', fontSize: '0.82rem',
          lineHeight: 1.65, margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {bio}
        </p>

        <div style={{
          marginTop: 'auto', paddingTop: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* <span style={{
            color: '#c8a84b', fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            عرض التفاصيل
            <span style={{ fontSize: '1rem' }}>←</span>
          </span> */}
        </div>
      </div>
    </div>
  );
};
