import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

    // Normalize images array
    const images: string[] =
        backgroundImages && backgroundImages.length > 0
            ? backgroundImages
            : backgroundImage
                ? [backgroundImage]
                : [];

    const hasImages = images.length > 0;

    // Carousel State
    const [activeIdx, setActiveIdx] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

    // Touch / Swipe State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Auto-play interval
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Touch Handlers
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }
        if (isRightSwipe) {
            setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    // Image Load Handler
    const handleImageLoad = (idx: number) => {
        setLoadedImages((prev) => ({ ...prev, [idx]: true }));
    };

    const goTo = (idx: number) => setActiveIdx(idx);

    return (
        <section
            style={{
                position: 'relative',
                marginTop: '-72px', // Account for navbar
                minHeight: hasImages ? 'clamp(500px, 85vh, 800px)' : 'clamp(320px, 45vh, 420px)',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                background: hasImages ? '#050505' : gradient,
                isolation: 'isolate',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* ──────────────────────────────────────────────────────────────────────
          1. CAROUSEL TRACK (Hardware Accelerated Sliding)
      ─────────────────────────────────────────────────────────────────────── */}
            {hasImages && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        transform: `translateX(-${activeIdx * 100}%)`,
                        transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)', // Smooth iOS-like easing
                        willChange: 'transform',
                        zIndex: 0,
                    }}
                >
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            style={{
                                position: 'relative',
                                minWidth: '100%',
                                height: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Skeleton Loader */}
                            {!loadedImages[idx] && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'pulse 1.5s infinite',
                                    }}
                                />
                            )}

                            {/* Native IMG for better LCP & Performance */}
                            <img
                                src={img}
                                alt={`Hero visual ${idx + 1}`}
                                loading={idx === 0 ? 'eager' : 'lazy'} // Eager load first image!
                                onLoad={() => handleImageLoad(idx)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    opacity: loadedImages[idx] ? 1 : 0,
                                    transition: 'opacity 0.4s ease-in',
                                    transform: activeIdx === idx ? 'scale(1)' : 'scale(1.05)',
                                    transitionProperty: 'opacity, transform',
                                    transitionDuration: '0.4s, 6s',
                                    transitionTimingFunction: 'ease-out',
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ──────────────────────────────────────────────────────────────────────
          2. PREMIUM OVERLAYS & TEXTURES
      ─────────────────────────────────────────────────────────────────────── */}
            {hasImages && (
                <>
                    {/* Subtle Pattern Overlay (Requested) */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1,
                            backgroundImage: 'url(/yemen-pattern.jpg)', // Make sure this is in your public folder
                            backgroundSize: '300px',
                            opacity: 0.04, // Very subtle
                            mixBlendMode: 'overlay',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Smart Gradient: Darker at bottom for text, darker at top for navbar */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 2,
                            background: `linear-gradient(
                180deg,
                rgba(0,0,0,0.4) 0%,     
                rgba(0,0,0,0.1) 20%,    
                rgba(0,0,0,0.1) 50%,    
                rgba(0,0,0,0.65) 85%,   
                rgba(5,5,5,0.95) 100%   
              )`,
                            pointerEvents: 'none',
                        }}
                    />
                </>
            )}

            {/* ──────────────────────────────────────────────────────────────────────
          3. NO-PHOTO MODE DECORATIONS
      ─────────────────────────────────────────────────────────────────────── */}
            {!hasImages && (
                <>
                    <div aria-hidden="true" style={{
                        position: 'absolute', inset: 0, zIndex: 0,
                        backgroundImage: 'linear-gradient(rgba(200,168,75,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,168,75,0.04) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }} />
                    <div aria-hidden="true" style={{
                        position: 'absolute', top: '-60px', right: '10%', zIndex: 0,
                        width: '300px', height: '300px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,26,42,0.35) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }} />
                </>
            )}

            {/* ──────────────────────────────────────────────────────────────────────
          4. CONTENT CONTAINER (Mobile Optimized)
      ─────────────────────────────────────────────────────────────────────── */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 3,
                    width: '100%',
                    maxWidth: '1260px',
                    margin: '0 auto',
                    padding: 'clamp(120px, 18vw, 180px) clamp(24px, 5vw, 48px) clamp(60px, 8vw, 90px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    pointerEvents: 'none', // Lets swipes pass through to the section
                }}
            >
                {eyebrow && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
                        pointerEvents: 'auto'
                    }}>
                        <div style={{ height: 1, width: 40, background: '#c8a84b' }} />
                        <span style={{
                            color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.25em',
                        }}>
                            {eyebrow}
                        </span>
                        <div style={{ height: 1, width: 40, background: '#c8a84b' }} />
                    </div>
                )}

                <h1 style={{
                    color: '#ffffff',
                    fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: 24,
                    maxWidth: 800,
                    textShadow: '0 4px 24px rgba(0,0,0,0.6)',
                    letterSpacing: '-0.02em',
                    pointerEvents: 'auto'
                }}>
                    {title}
                </h1>

                {description && (
                    <p style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                        maxWidth: 600,
                        margin: '0 auto 40px',
                        lineHeight: 1.6,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        pointerEvents: 'auto'
                    }}>
                        {description}
                    </p>
                )}

                {ctaLabel && ctaPath && (
                    <button
                        onClick={() => navigate(ctaPath)}
                        style={{
                            padding: '14px 36px',
                            borderRadius: '50px', // More modern pill shape
                            background: '#7a1c1c',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(122, 28, 28, 0.4)',
                            transition: 'all 0.3s ease',
                            pointerEvents: 'auto'
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#8f2020';
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = '#7a1c1c';
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        }}
                    >
                        {ctaLabel}
                    </button>
                )}

                {/* ──────────────────────────────────────────────────────────────────────
            5. DESKTOP ARROWS & MOBILE DOTS
        ─────────────────────────────────────────────────────────────────────── */}
                {images.length > 1 && (
                    <div style={{ pointerEvents: 'auto', width: '100%', marginTop: 40, position: 'relative' }}>

                        {/* Desktop Arrows (Hidden on small screens via CSS/media query logic conceptually) */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goTo(idx)}
                                    aria-label={`Go to slide ${idx + 1}`}
                                    style={{
                                        width: idx === activeIdx ? '32px' : '8px',
                                        height: '8px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        background: idx === activeIdx ? '#c8a84b' : 'rgba(255,255,255,0.3)',
                                        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Injecting minimal keyframes for the skeleton loader */}
            <style>
                {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
            </style>
        </section>
    );
};