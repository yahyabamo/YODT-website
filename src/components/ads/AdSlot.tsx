import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAds } from '@/hooks/useAds';
import { SiteAd, AD_SLIDE_INTERVAL_MS } from '@/services/adsService';
import { useLanguage } from '@/context/LanguageContext';

// ─── Single Banner ────────────────────────────────────────────────────────────

interface AdBannerProps {
  ad: SiteAd;
  className?: string;
}

function AdBanner({ ad, className = '' }: AdBannerProps) {
  return (
    <a
      href={ad.redirect_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ad.alt_text || 'Advertisement'}
      className={`block w-full overflow-hidden rounded-xl select-none group ${className}`}
      style={{ outline: 'none' }}
    >
      <img
        src={ad.image_url}
        alt={ad.alt_text || ''}
        loading="lazy"
        draggable={false}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        style={{ display: 'block' }}
      />
    </a>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

function CarouselDots({ count, current, onSelect }: {
  count: number;
  current: number;
  onSelect: (i: number) => void;
}) {
  if (count < 2) return null;
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`h-1 rounded-full transition-all duration-300 ${i === current
              ? 'w-6 bg-white/90'
              : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
        />
      ))}
    </div>
  );
}

// ─── AdSlot (main export) ─────────────────────────────────────────────────────

interface AdSlotProps {
  page: string;
  position: string;
  className?: string;
  /** Override banner height. Defaults to 'h-[80px] sm:h-[100px]' */
  heightClass?: string;
  showLabel?: boolean;
}

export function AdSlot({
  page,
  position,
  className = '',
  heightClass = 'h-[80px] sm:h-[100px]',
  showLabel = true,
}: AdSlotProps) {
  const { data: ads, isLoading } = useAds(page, position);
  const { language: lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);

  const count = ads?.length ?? 0;

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + count) % count);
  }, [count]);

  // Auto-play
  useEffect(() => {
    if (count < 2) return;
    timerRef.current = setInterval(goNext, AD_SLIDE_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [count, goNext]);

  // Pause on hover
  const pauseTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeTimer = () => {
    if (count < 2) return;
    timerRef.current = setInterval(goNext, AD_SLIDE_INTERVAL_MS);
  };

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) { delta < 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  };

  // Don't render anything while loading or if no ads
  if (isLoading) {
    console.log(`[AdSlot Debug] Loading ads for page=${page}, position=${position}`);
    return null;
  }

  console.log(`[AdSlot Debug] Finished loading ads for page=${page}, position=${position}. Ads count:`, count, ads);

  if (!ads || count === 0) {
    return null;
  }

  // const adLabel = lang === 'ar' ? 'إعلان' : lang === 'tr' ? 'Reklam' : 'Ad';
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Subtle "Ad" label — top corner, non-intrusive */}
      {/* {showLabel && (
        <span
          className="absolute top-1.5 end-2 z-20 text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(0,0,0,0.35)',
            color: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(4px)',
            lineHeight: 1,
          }}
        >
          {adLabel}
        </span>
      )} */}

      {/* Banner container */}
      <div
        className={`relative w-full ${heightClass} overflow-hidden rounded-xl border`}
        style={{ borderColor: 'var(--border)' }}
      >
        {ads.map((ad, i) => (
          <div
            key={ad.id}
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'translateX(0)' : i < current ? 'translateX(-2%)' : 'translateX(2%)',
              pointerEvents: i === current ? 'auto' : 'none',
              zIndex: i === current ? 1 : 0,
            }}
          >
            <AdBanner ad={ad} className="h-full" />
          </div>
        ))}
      </div>

      {/* Dots */}
      <CarouselDots count={count} current={current} onSelect={setCurrent} />
    </div>
  );
}
