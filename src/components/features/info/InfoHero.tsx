import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface InfoHeroProps {
    eyebrow?: string;
    title: string;
    description?: string;
    backgroundImages?: string[];
    backgroundImage?: string;
    ctaLabel?: string;
    ctaPath?: string;
}

const optimizeImageUrl = (url: string) => {
    if (url.includes('cloudinary.com') && !url.includes('q_auto')) {
        return url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    return url;
};

export const InfoHero: React.FC<InfoHeroProps> = ({
    eyebrow,
    title,
    description,
    backgroundImages,
    backgroundImage,
    ctaLabel,
    ctaPath,
}) => {
    const navigate = useNavigate();
    const images = (backgroundImages?.length
        ? backgroundImages
        : backgroundImage
            ? [backgroundImage]
            : []
    ).map(optimizeImageUrl);

    const [active, setActive] = useState(0);
    const [loaded, setLoaded] = useState<boolean[]>([]);

    const isCarousel = images.length > 1;

    // preload all images
    useEffect(() => {
        if (!images.length) return;

        setLoaded(new Array(images.length).fill(false));

        images.forEach((src, i) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setLoaded(prev => {
                    const copy = [...prev];
                    copy[i] = true;
                    return copy;
                });
            };
        });
    }, [images]);

    // auto slider
    useEffect(() => {
        if (!isCarousel) return;

        const interval = setInterval(() => {
            setActive(prev => (prev + 1) % images.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [images.length, isCarousel]);

    const goNext = () => setActive(prev => (prev + 1) % images.length);
    const goPrev = () => setActive(prev => (prev - 1 + images.length) % images.length);

    return (
        <section
            style={{
                position: 'relative',
                minHeight: 'clamp(500px, 70vh, 800px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            {/* Background stack */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                {images.map((src, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: i === active ? 1 : 0,
                            transition: 'opacity 1.8s ease',
                        }}
                    >
                        <img
                            src={src}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',

                                // 🔥 Cinematic slow zoom
                                transform: i === active ? 'scale(1.05)' : 'scale(1.1)',
                                transition: 'transform 10s ease',

                                filter: 'brightness(0.65)',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Professional overlay layers */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    background: `
            radial-gradient(circle at center, rgba(0,0,0,0.2), rgba(0,0,0,0.8)),
            linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9))
          `,
                }}
            />

            {/* Content */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 5,
                    maxWidth: '900px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#00ff00',
                }}
            >
                {eyebrow && (
                    <div
                        style={{
                            color: '#c8a84b',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            marginBottom: '16px',
                        }}
                    >
                        {eyebrow}
                    </div>
                )}

                <h1
                    style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '20px',
                        color: '#d3c7b6ff'
                    }}
                >
                    {title}
                </h1>

                {description && (
                    <p
                        style={{
                            fontSize: '1.2rem',
                            opacity: 0.9,
                            marginBottom: '30px',
                        }}
                    >
                        {description}
                    </p>
                )}

                {ctaLabel && ctaPath && (
                    <button
                        onClick={() => navigate(ctaPath)}
                        style={{
                            padding: '16px 44px',
                            borderRadius: '999px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, #c8a84b, #a88b35)',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {ctaLabel}
                    </button>
                )}
            </div>

            {/* Navigation */}
            {isCarousel && (
                <>
                    <button
                        onClick={goPrev}
                        style={navBtn('left')}
                    >›</button>

                    <button
                        onClick={goNext}
                        style={navBtn('right')}
                    >‹</button>
                </>
            )}

            {/* Dots */}
            {isCarousel && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '25px',
                        display: 'flex',
                        gap: '8px',
                        zIndex: 10,
                    }}
                >
                    {images.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                                width: i === active ? '30px' : '8px',
                                height: '8px',
                                borderRadius: '10px',
                                background: i === active ? '#c8a84b' : 'rgba(149, 31, 31, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

const navBtn = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    [side]: '20px',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'rgba(170, 37, 37, 0.15)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(89, 129, 49, 0.2)',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
});