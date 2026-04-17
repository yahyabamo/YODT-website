import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InfoHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  ctaLabel?: string;
  ctaPath?: string;
  gradient?: string;
}

export const InfoHero: React.FC<InfoHeroProps> = ({
  eyebrow,
  title,
  description,
  backgroundImage,
  ctaLabel,
  ctaPath,
  gradient = 'linear-gradient(135deg, #1a0a0a 0%, #3b0007 50%, #1a0a0a 100%)',
}) => {
  const navigate = useNavigate();

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '340px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: gradient,
      }}
    >
      {/* Background image overlay */}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
          }}
        />
      )}

      {/* Grid texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(200,168,75,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,168,75,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,26,42,0.35) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', left: '15%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,168,75,0.2) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1260px', margin: '0 auto',
        padding: 'clamp(48px, 8vw, 80px) clamp(20px, 4vw, 40px)',
        textAlign: 'center', width: '100%',
      }}>
        {eyebrow && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ height: '1px', width: '32px', background: '#c8a84b' }} />
            <span style={{
              color: '#c8a84b', fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              fontFamily: 'var(--f-ui, Outfit, sans-serif)',
            }}>
              {eyebrow}
            </span>
            <div style={{ height: '1px', width: '32px', background: '#c8a84b' }} />
          </div>
        )}

        <h1 style={{
          color: '#f0ece4', fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 800, lineHeight: 1.25, marginBottom: '20px',
          textShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          {title}
        </h1>

        {description && (
          <p style={{
            color: 'rgba(240,236,228,0.65)', fontSize: 'clamp(0.875rem, 2vw, 1.05rem)',
            maxWidth: '640px', margin: '0 auto 28px',
            lineHeight: 1.75,
          }}>
            {description}
          </p>
        )}

        {ctaLabel && ctaPath && (
          <button
            onClick={() => navigate(ctaPath)}
            style={{
              padding: '12px 28px', borderRadius: '12px',
              background: '#7a1c1c', color: '#fff',
              fontSize: '0.9rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(122,28,28,0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#8f2020'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#7a1c1c'; }}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  );
};
