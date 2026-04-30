import React, { useEffect, useState, useRef } from 'react';
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
    isLoading?: boolean;
}

const optimizeImageUrl = (url: string) => {
    if (url.includes('cloudinary.com') && !url.includes('q_auto')) {
        return url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    return url;
};

type RevealPhase = 'loading' | 'revealing' | 'complete';

export const InfoHero: React.FC<InfoHeroProps> = ({
    eyebrow,
    title,
    description,
    backgroundImages,
    backgroundImage,
    ctaLabel,
    ctaPath,
    gradient = 'linear-gradient(135deg, #07080b 0%, #1a0505 40%, #07080b 100%)',
    isLoading = false,
}) => {
    const navigate = useNavigate();
    const [activeIdx, setActiveIdx] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [revealPhase, setRevealPhase] = useState<RevealPhase>('loading');
    const [textVisible, setTextVisible] = useState(false);
    const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
    const sectionRef = useRef<HTMLElement>(null);

    const rawImages = backgroundImages?.length ? backgroundImages : backgroundImage ? [backgroundImage] : [];
    const images = rawImages.map(optimizeImageUrl);
    const hasImages = images.length > 0;
    const isCarousel = images.length > 1;

    useEffect(() => {
        if (hasImages) {
            setLoadedImages(new Array(images.length).fill(false));
        }
    }, [hasImages, images.length]);

    useEffect(() => {
        if (!hasImages || !images[0]) return;
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = images[0];
        preloadLink.fetchPriority = 'high';
        document.head.appendChild(preloadLink);
        return () => {
            if (document.head.contains(preloadLink)) document.head.removeChild(preloadLink);
        };
    }, [hasImages, images]);

    useEffect(() => {
        if (isLoading || !hasImages) {
            setRevealPhase(!isLoading ? 'complete' : 'loading');
            return;
        }
        const firstImg = new window.Image();
        firstImg.src = images[0];
        if (firstImg.complete) {
            setRevealPhase('revealing');
            setTimeout(() => setRevealPhase('complete'), 1200);
        } else {
            firstImg.onload = () => {
                setRevealPhase('revealing');
                setTimeout(() => setRevealPhase('complete'), 1200);
            };
        }
    }, [isLoading, hasImages, images]);

    useEffect(() => {
        if (isLoading) return;
        if (!hasImages) {
            const timer = setTimeout(() => setTextVisible(true), 120);
            return () => clearTimeout(timer);
        }
        if (loadedImages[0] && revealPhase !== 'loading') {
            const timer = setTimeout(() => setTextVisible(true), 80);
            return () => clearTimeout(timer);
        }
    }, [loadedImages[0], revealPhase, hasImages, isLoading]);

    useEffect(() => {
        if (!isCarousel || revealPhase !== 'complete') return;
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % images.length);
        }, 6800);
        return () => clearInterval(interval);
    }, [isCarousel, revealPhase, images.length]);

    useEffect(() => {
        if (images.length <= 1) return;
        images.slice(1).forEach(src => { new window.Image().src = src; });
    }, [images]);

    useEffect(() => {
        if (!isCarousel || revealPhase !== 'complete') return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
            } else if (e.key === 'ArrowRight') {
                setActiveIdx((prev) => (prev + 1) % images.length);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCarousel, revealPhase, images.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (diff > 50) goNext();
        else if (diff < -50) goPrev();

        setTouchStart(null);
    };

    const handleImageLoad = (idx: number) => {
        setLoadedImages(prev => {
            if (prev[idx]) return prev;
            const newState = [...prev];
            newState[idx] = true;
            return newState;
        });
    };

    const goPrev = () => setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    const goNext = () => setActiveIdx((prev) => (prev + 1) % images.length);

    const isComplete = revealPhase === 'complete';

    return (
        <section
            ref={sectionRef}
            style={{
                position: 'relative',
                marginTop: '-72px',
                minHeight: hasImages ? 'clamp(450px, 65vh, 700px)' : 'clamp(320px, 45vh, 450px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: gradient,
                touchAction: 'pan-y',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Images */}
            {hasImages && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                    {images.map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            alt=""
                            // FIX: Removed lazy loading. Let the browser fetch them so they are ready for swipe!
                            // @ts-ignore
                            fetchpriority={idx === 0 ? "high" : "auto"}
                            onLoad={() => handleImageLoad(idx)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                // FIX: Simply check if it's the active index. Removes the blank swipe bug.
                                opacity: idx === activeIdx ? 1 : 0,
                                transform: idx === activeIdx ? 'translateZ(0) scale(1.04)' : 'translateZ(0) scale(1.08)',
                                transition: isComplete
                                    ? 'opacity 1.5s ease-in-out, transform 12s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                    : 'opacity 0.3s ease-out',
                                filter: revealPhase === 'revealing' && idx === activeIdx ? 'brightness(0.4)' : 'none',
                                willChange: 'transform, opacity',
                                WebkitBackfaceVisibility: 'hidden',
                            }}
                        />
                    ))}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.95) 100%)',
                    }} />
                </div>
            )}

            {/* Arrow Buttons (FIX: Removed invalid media query, now visible on all devices) */}
            {isCarousel && isComplete && (
                <>
                    <button
                        onClick={goPrev}
                        aria-label="Previous image"
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20,
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '24px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ‹
                    </button>
                    <button
                        onClick={goNext}
                        aria-label="Next image"
                        style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20,
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '24px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ›
                    </button>
                </>
            )}

            {/* Content */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '860px',
                    padding: 'clamp(24px, 5vw, 48px)',
                    textAlign: 'center',
                    opacity: textVisible ? 1 : 0,
                    transform: textVisible ? 'translateY(0px)' : 'translateY(30px)',
                    transition: 'opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1), transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                    marginTop: '40px',
                }}
            >
                {eyebrow && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        marginBottom: '16px',
                    }}>
                        <div style={{ height: '2px', width: '40px', background: '#c8a84b' }} />
                        <span style={{ color: '#c8a84b', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            {eyebrow}
                        </span>
                        <div style={{ height: '2px', width: '40px', background: '#c8a84b' }} />
                    </div>
                )}

                <h1 style={{
                    fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: '#fff',
                    marginBottom: '20px',
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 24px rgba(0,0,0,0.8)',
                }}>
                    {title}
                </h1>

                {description && (
                    <p style={{
                        fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: '680px',
                        margin: '0 auto 32px',
                        lineHeight: 1.6,
                    }}>
                        {description}
                    </p>
                )}

                {ctaLabel && ctaPath && (
                    <button
                        onClick={() => navigate(ctaPath)}
                        style={{
                            padding: '14px 40px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, #8f2020, #7a1c1c)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(122,28,28,0.4)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(122,28,28,0.6)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(122,28,28,0.4)';
                        }}
                    >
                        {ctaLabel}
                    </button>
                )}
            </div>

            {/* Dots */}
            {isCarousel && isComplete && (
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 20,
                }}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIdx(i)}
                            style={{
                                width: i === activeIdx ? '32px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: i === activeIdx ? '#c8a84b' : 'rgba(255,255,255,0.3)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};