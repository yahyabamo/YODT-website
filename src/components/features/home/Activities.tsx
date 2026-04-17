import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchActivitiesWithItems, type HomepageActivity, type HomepageActivityItem } from '@/service/homepageCMS';

/* ─── Yemeni palette (red · gold · charcoal · cream) ─── */
const Y = {
    red: '#8B1A1A',
    gold: '#C9974A',
    goldLight: '#E8B86D',
    cream: '#F5F0E8',
    charcoal: '#1A1714',
    charcoal2: '#252119',
    charcoal3: '#2E2922',
    border: 'rgba(201,151,74,0.18)',
    borderHov: 'rgba(201,151,74,0.45)',
};

const SLIDE_DURATION = 7000;

// ── Skeleton shimmer ─────────────────────────────────────────────────────────
function SkeletonActivities() {
    return (
        <section id="activities" style={{ background: Y.charcoal, padding: '72px 0 88px' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 36 }}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} style={{ width: 74, height: 74, borderRadius: '50%', background: Y.charcoal3, opacity: 0.5, animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ background: Y.charcoal2, border: `1px solid ${Y.border}`, borderRadius: 16, overflow: 'hidden', animation: 'skeletonPulse 1.4s ease-in-out infinite' }}>
                            <div style={{ height: 130, background: Y.charcoal3 }} />
                            <div style={{ padding: '16px 18px' }}>
                                <div style={{ height: 13, width: '60%', background: Y.charcoal3, borderRadius: 6, marginBottom: 8 }} />
                                <div style={{ height: 11, width: '80%', background: Y.charcoal3, borderRadius: 6 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export const Activities = () => {
    const [programs, setPrograms] = useState<HomepageActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [progress, setProgress] = useState(0);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const lockedRef = useRef(false);

    // Detect current language from <html lang="...">
    const lang = document.documentElement.getAttribute('lang') ?? 'ar';

    useEffect(() => {
        fetchActivitiesWithItems()
            .then(data => setPrograms(data))
            .catch(err => console.error('Activities fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

    const goTo = useCallback((idx: number) => {
        if (lockedRef.current || programs.length === 0) return;
        lockedRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        setAnimating(true);
        setTimeout(() => {
            setCurrent(idx);
            setAnimating(false);
            setProgress(0);
            startRef.current = null;
            lockedRef.current = false;

            const tick = (now: number) => {
                if (!startRef.current) startRef.current = now;
                const pct = Math.min(((now - startRef.current) / SLIDE_DURATION) * 100, 100);
                setProgress(pct);
                if (pct < 100) rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
            timerRef.current = setTimeout(() => goTo((idx + 1) % programs.length), SLIDE_DURATION);
        }, 280);
    }, [programs.length]);

    useEffect(() => {
        if (programs.length === 0) return;
        startRef.current = null;
        const tick = (now: number) => {
            if (!startRef.current) startRef.current = now;
            const pct = Math.min(((now - startRef.current) / SLIDE_DURATION) * 100, 100);
            setProgress(pct);
            if (pct < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        timerRef.current = setTimeout(() => goTo(1 % programs.length), SLIDE_DURATION);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [goTo, programs.length]);

    if (loading) return <SkeletonActivities />;

    // Graceful empty state
    if (programs.length === 0) {
        return (
            <section id="activities" style={{ background: Y.charcoal, padding: '72px 0 88px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ color: Y.gold, fontSize: '1rem' }}>لا توجد أنشطة حالياً</p>
                </div>
            </section>
        );
    }

    const prog = programs[current];
    const items: HomepageActivityItem[] = prog.items ?? [];

    // Pick the right language fields
    const progName = lang === 'en' ? (prog.name_en || prog.name_ar)
        : lang === 'tr' ? (prog.name_tr || prog.name_ar)
        : prog.name_ar;
    const progTag = lang === 'en' ? (prog.tag_en || prog.tag_ar)
        : lang === 'tr' ? (prog.tag_tr || prog.tag_ar)
        : prog.tag_ar;
    const progDesc = lang === 'en' ? (prog.desc_en || prog.desc_ar)
        : lang === 'tr' ? (prog.desc_tr || prog.desc_ar)
        : prog.desc_ar;

    return (
        <>
            <style>{`@keyframes skeletonPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            <section id="activities" style={{ background: Y.charcoal, padding: '72px 0 88px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                    backgroundImage: 'repeating-linear-gradient(45deg,#C9974A 0,#C9974A 1px,transparent 0,transparent 50%)',
                    backgroundSize: '28px 28px',
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
                            <div style={{ height: '1px', width: '40px', background: `linear-gradient(to right, transparent, ${Y.gold})` }} />
                            <span style={{ color: Y.gold, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                                <span className="ar-only">الأنشطة والفعاليات</span>
                                <span className="en-only">Activities & Events</span>
                                <span className="tr-only">Etkinlikler & Faaliyetler</span>
                            </span>
                            <div style={{ height: '1px', width: '40px', background: `linear-gradient(to left, transparent, ${Y.gold})` }} />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.1rem)', fontWeight: 800, color: Y.cream, letterSpacing: '-0.02em', marginBottom: '10px' }}>
                            <span className="ar-only">برامجنا ومبادراتنا</span>
                            <span className="en-only">Our Programs & Initiatives</span>
                            <span className="tr-only">Programlarımız & Girişimlerimiz</span>
                        </h2>
                        <p style={{ color: '#7a7262', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            <span className="ar-only">تُمثّل هذه البرامج نبض اتحادنا وروح مجتمعنا اليمني في إسطنبول</span>
                            <span className="en-only">These programs represent the pulse of our union and the spirit of our Yemeni community in Istanbul.</span>
                            <span className="tr-only">Bu programlar, birliğimizin nabzını ve İstanbul'daki Yemenli topluluğumuzun ruhunu temsil etmektedir.</span>
                        </p>
                    </div>

                    {/* Circles */}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
                        {programs.map((p, i) => {
                            const isActive = i === current;
                            const pName = lang === 'en' ? (p.name_en || p.name_ar) : lang === 'tr' ? (p.name_tr || p.name_ar) : p.name_ar;
                            return (
                                <div key={p.id} onClick={() => goTo(i)}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        width: '74px', height: '74px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                                        background: isActive ? 'rgba(139,26,26,0.18)' : Y.charcoal3,
                                        border: `2px solid ${isActive ? Y.gold : 'rgba(255,255,255,0.07)'}`,
                                        boxShadow: isActive ? `0 0 0 4px rgba(201,151,74,0.12), 0 8px 28px rgba(139,26,26,0.3)` : 'none',
                                        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                                    }}>
                                        {p.icon}
                                    </div>
                                    <span style={{
                                        fontSize: '11px', fontWeight: isActive ? 700 : 600, textAlign: 'center',
                                        color: isActive ? Y.gold : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap',
                                        transition: 'color 0.35s',
                                    }}>
                                        {pName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '2px',
                            background: `linear-gradient(to right, ${Y.red}, ${Y.gold})`,
                            width: `${progress}%`, transition: 'width 0.1s linear',
                        }} />
                    </div>

                    {/* Hero */}
                    <div style={{
                        borderRadius: '20px', padding: 'clamp(24px,4vw,40px)',
                        display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '22px',
                        background: 'linear-gradient(135deg, rgba(139,26,26,0.12), rgba(201,151,74,0.05))',
                        border: `1px solid ${Y.border}`,
                        opacity: animating ? 0 : 1, transform: animating ? 'translateY(10px)' : 'translateY(0)',
                        transition: 'opacity 0.28s ease, transform 0.28s ease',
                    }}>
                        <div style={{
                            width: '84px', height: '84px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem',
                            background: 'radial-gradient(circle at 35% 35%, rgba(139,26,26,0.5), rgba(201,151,74,0.15))',
                            border: '2px solid rgba(201,151,74,0.4)',
                            boxShadow: '0 8px 32px rgba(139,26,26,0.3)',
                        }}>
                            {prog.icon}
                        </div>
                        <div>
                            <span style={{
                                display: 'inline-block', padding: '3px 12px', borderRadius: '999px', marginBottom: '12px',
                                background: 'rgba(201,151,74,0.15)', color: Y.goldLight,
                                border: '1px solid rgba(201,151,74,0.3)',
                                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                            }}>
                                {progTag}
                            </span>
                            <h3 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: 800, color: Y.cream, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                                {progName}
                            </h3>
                            <p style={{ color: '#7a7262', fontSize: '0.88rem', lineHeight: 1.8 }}>{progDesc}</p>
                        </div>
                    </div>

                    {/* Activity cards */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))', gap: '14px',
                        opacity: animating ? 0 : 1, transform: animating ? 'translateY(14px)' : 'translateY(0)',
                        transition: 'opacity 0.28s ease, transform 0.28s ease',
                    }}>
                        {items.map((act, i) => {
                            const actTitle = lang === 'en' ? (act.title_en || act.title_ar) : lang === 'tr' ? (act.title_tr || act.title_ar) : act.title_ar;
                            const actDesc = lang === 'en' ? (act.desc_en || act.desc_ar) : lang === 'tr' ? (act.desc_tr || act.desc_ar) : act.desc_ar;
                            const actFreq = lang === 'en' ? (act.freq_en || act.freq_ar) : lang === 'tr' ? (act.freq_tr || act.freq_ar) : act.freq_ar;
                            return (
                                <div key={act.id ?? i}
                                    style={{
                                        background: Y.charcoal2, border: `1px solid ${Y.border}`, borderRadius: '16px', overflow: 'hidden',
                                        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s, border-color 0.35s'
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.transform = 'translateY(-5px)';
                                        el.style.boxShadow = '0 16px 40px rgba(139,26,26,0.2)';
                                        el.style.borderColor = Y.borderHov;
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.transform = 'translateY(0)';
                                        el.style.boxShadow = 'none';
                                        el.style.borderColor = Y.border;
                                    }}
                                >
                                    {/* Image slot */}
                                    <div style={{
                                        width: '100%', height: '130px', position: 'relative', overflow: 'hidden',
                                        background: 'linear-gradient(135deg, rgba(139,26,26,0.15), rgba(201,151,74,0.07))',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    }}>
                                        {act.image_url
                                            ? <img src={act.image_url} alt={actTitle}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                            : <>
                                                <span style={{ fontSize: '32px', opacity: 0.65 }}>{act.icon}</span>
                                            </>
                                        }
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '3px 8px',
                                            fontSize: '10px', color: Y.goldLight, fontWeight: 600,
                                            border: '1px solid rgba(201,151,74,0.25)',
                                        }}>
                                            {actFreq}
                                        </div>
                                    </div>

                                    <div style={{ padding: '16px 18px' }}>
                                        <h4 style={{ fontWeight: 700, fontSize: '13px', color: Y.cream, lineHeight: 1.4, marginBottom: '7px' }}>
                                            {actTitle}
                                        </h4>
                                        <p style={{ fontSize: '12px', color: '#6a6258', lineHeight: 1.7, marginBottom: '12px' }}>
                                            {actDesc}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: Y.gold, boxShadow: '0 0 6px rgba(201,151,74,0.6)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: Y.gold, letterSpacing: '0.04em' }}>{actFreq}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Dot nav */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', marginTop: '36px' }}>
                        {programs.map((_, i) => (
                            <button key={i} onClick={() => goTo(i)} style={{
                                height: '7px', width: i === current ? '22px' : '7px', borderRadius: '4px', border: 'none',
                                cursor: 'pointer', padding: 0,
                                background: i === current ? Y.gold : 'rgba(255,255,255,0.12)',
                                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                            }} />
                        ))}
                    </div>

                </div>
            </section>
        </>
    );
};