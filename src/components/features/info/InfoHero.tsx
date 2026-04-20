import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KEYFRAMES = `
  @keyframes heroZoomIn {
    from { transform: scale(1.07); }
    to   { transform: scale(1.0); }
  }
`;

interface InfoHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  backgroundImages?: string[];
  ctaLabel?: string;
  ctaPath?: string;
  gradient?: string;
}

export const InfoHero: React.FC<InfoHeroProps> = ({
  eyebrow,
  title,
  description,
  backgroundImage,
  backgroundImages,
  ctaLabel,
  ctaPath,
  gradient = 'linear-gradient(135deg, #1a0a0a 0%, #3b0007 50%, #1a0a0a 100%)',
}) => {
  const navigate = useNavigate();

  const images: string[] =
    backgroundImages && backgroundImages.length > 0
      ? backgroundImages
      : backgroundImage
      ? [backgroundImage]
      : [];

  const hasImages = images.length > 0;

  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [zoomKey, setZoomKey] = useState(0); // incremented to restart zoom animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay so animation plays after first paint
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % images.length);
        setZoomKey(k => k + 1);
        setFading(false);
      }, 750);
    }, 6500);
    return () => clearInterval(interval);
  }, [images.length]);

  const goTo = (idx: number) => {
    setFading(false);
    setActiveIdx(idx);
    setZoomKey(k => k + 1);
  };

  return (
    <section
      style={{
        position: 'relative',
        marginTop: '-72px',
        minHeight: hasImages ? 'clamp(520px, 78vh, 740px)' : 'clamp(320px, 45vh, 420px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        // Dark base so there's no flash before images load
        background: hasImages ? '#070a0e' : gradient,
        isolation: 'isolate',
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ──────────────────────────────────────────────────────────────────────
          1. PHOTO LAYERS
          Full opacity + CSS filter for brightness/contrast control.
          This preserves image detail far better than opacity-over-dark-bg.
      ─────────────────────────────────────────────────────────────────────── */}
      {images.map((img, idx) => {
        const isActive = idx === activeIdx;
        return (
          <div
            key={img + idx}
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              overflow: 'hidden',
              opacity: isActive ? (fading ? 0 : 1) : 0,
              transition: 'opacity 0.85s ease-in-out',
              zIndex: 0,
            }}
          >
            {/* The actual image element — zoom animates independently */}
            <div
              // Changing key restarts the CSS animation each slide change
              key={isActive ? zoomKey : 'idle'}
              style={{
                width: '100%', height: '100%',
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // Brightness controls exposure; contrast + saturate add pop
                filter: 'brightness(0.80) contrast(1.08) saturate(1.06)',
                // Gentle Ken-Burns zoom on each slide
                animation: (isActive && mounted) ? 'heroZoomIn 9s ease forwards' : 'none',
                transformOrigin: 'center center',
                // GPU-composited — no layout thrash
                willChange: 'transform',
              }}
            />
          </div>
        );
      })}

      {/* ──────────────────────────────────────────────────────────────────────
          2. OVERLAY STACK (photo mode)
          Three purposeful layers — not one big black blanket.
      ─────────────────────────────────────────────────────────────────────── */}
      {hasImages && (
        <>
          {/* Layer A: Adaptive gradient — lighter in the image zone, darker at edges */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background: `linear-gradient(
                to bottom,
                rgba(0,0,0,0.38) 0%,     /* behind navbar */
                rgba(0,0,0,0.08) 28%,    /* image visibility zone */
                rgba(0,0,0,0.06) 50%,    /* image visibility zone */
                rgba(0,0,0,0.42) 80%,    /* transition to text */
                rgba(0,0,0,0.68) 100%    /* text area */
              )`,
            }}
          />

          {/* Layer B: Brand colour tint — identity without killing image */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background: 'rgba(122, 28, 28, 0.10)',
              mixBlendMode: 'multiply',
            }}
          />

          {/* Layer C: Bottom edge bleed — melts into page background */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
              height: '96px',
              background: 'linear-gradient(to bottom, transparent 0%, var(--bg, #07080b) 100%)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
          3. NO-PHOTO MODE DECORATIONS (unchanged design)
      ─────────────────────────────────────────────────────────────────────── */}
      {!hasImages && (
        <>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage:
              'linear-gradient(rgba(200,168,75,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,168,75,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', top: '-60px', right: '10%', zIndex: 0,
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,26,42,0.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: '-40px', left: '15%', zIndex: 0,
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,168,75,0.2) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }} />
        </>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
          4. CONTENT
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: '1260px', margin: '0 auto', width: '100%',
          padding: 'clamp(116px, 16vw, 156px) clamp(20px, 4vw, 40px) clamp(56px, 7vw, 88px)',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
      >
        {/* Radial spotlight — softens text area without a hard box */}
        {hasImages && (
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '65%', height: '55%', minWidth: 320,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, transparent 72%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, marginBottom: 18,
            animation: mounted ? 'heroCrossfadeIn 0.6s ease' : 'none',
          }}>
            <div style={{ height: 1, width: 36, background: '#c8a84b', opacity: 0.85 }} />
            <span style={{
              color: '#c8a84b', fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.2em',
              fontFamily: 'var(--f-ui, Outfit, sans-serif)',
              textShadow: hasImages ? '0 1px 6px rgba(0,0,0,0.9)' : 'none',
            }}>
              {eyebrow}
            </span>
            <div style={{ height: 1, width: 36, background: '#c8a84b', opacity: 0.85 }} />
          </div>
        )}

        {/* Title */}
        <h1 style={{
          position: 'relative', zIndex: 1,
          color: '#ffffff',
          fontSize: 'clamp(1.95rem, 5.5vw, 3.5rem)',
          fontWeight: 900, lineHeight: 1.18,
          marginBottom: 22,
          maxWidth: 700,
          // Layered shadow: sharp close shadow + wide soft halo
          textShadow: hasImages
            ? '0 1px 3px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.55)'
            : '0 2px 12px rgba(0,0,0,0.4)',
          letterSpacing: '-0.015em',
        }}>
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p style={{
            position: 'relative', zIndex: 1,
            color: hasImages ? 'rgba(255,255,255,0.93)' : 'rgba(240,236,228,0.72)',
            fontSize: 'clamp(0.92rem, 2vw, 1.1rem)',
            maxWidth: 600, margin: '0 auto 34px',
            lineHeight: 1.82,
            textShadow: hasImages ? '0 1px 10px rgba(0,0,0,0.75)' : 'none',
            fontWeight: 400,
          }}>
            {description}
          </p>
        )}

        {/* CTA */}
        {ctaLabel && ctaPath && (
          <button
            onClick={() => navigate(ctaPath)}
            style={{
              position: 'relative', zIndex: 1,
              padding: '13px 32px', borderRadius: 14,
              background: 'rgba(122,28,28,0.88)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.18)',
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(143,32,32,1)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.45)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(122,28,28,0.88)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.35)';
            }}
          >
            {ctaLabel}
          </button>
        )}

        {/* Slideshow dots */}
        {images.length > 1 && (
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 7, marginTop: 32,
          }}>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Slide ${idx + 1}`}
                style={{
                  width: idx === activeIdx ? 28 : 7,
                  height: 7, borderRadius: 4,
                  border: 'none', cursor: 'pointer', padding: 0,
                  background: idx === activeIdx ? '#c8a84b' : 'rgba(255,255,255,0.42)',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.45)',
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
