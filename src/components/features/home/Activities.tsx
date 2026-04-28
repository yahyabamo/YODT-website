import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchActivitiesWithItems, type HomepageActivity, type HomepageActivityItem } from '@/service/homepageCMS';
import { useLanguage } from '@/context/LanguageContext';
import { getField } from '@/i18n/pages';


const SLIDE_DURATION = 7000;

function SkeletonActivities() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex justify-center gap-5 mb-10">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="w-[74px] h-[74px] rounded-full bg-secondary animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl border border-border bg-card animate-pulse">
                            <div className="h-[130px] bg-secondary w-full" />
                            <div className="p-5">
                                <div className="h-3 w-[60%] bg-border rounded-md mb-3" />
                                <div className="h-2.5 w-[80%] bg-border rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const activitiesText = {
    eyebrow: { ar: 'الأنشطة والمشاريع', en: 'Activities & Projects', tr: 'Etkinlikler & Projeler' },
    title: { ar: 'برامجنا ومبادراتنا', en: 'Our Programs & Initiatives', tr: 'Programlarımız & Girişimlerimiz' },
    desc: {
        ar: 'تُمثّل هذه البرامج نبض اتحادنا وروح مجتمعنا اليمني في إسطنبول',
        en: 'These programs represent the pulse of our union and the spirit of our Yemeni community in Istanbul.',
        tr: "Bu programlar, birliğimizin nabzını ve İstanbul'daki Yemenli topluluğumuzun ruhunu temsil etmektedir.",
    },
    empty: { ar: 'لا توجد أنشطة حالياً', en: 'No activities at the moment', tr: 'Şu an etkinlik bulunmuyor' },
} as const;

export const Activities = () => {
    const { language: lang } = useLanguage();
    const [programs, setPrograms] = useState<HomepageActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [progress, setProgress] = useState(0);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const lockedRef = useRef(false);

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
        }, 300); // Wait for fade out
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

    if (programs.length === 0) {
        return (
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-muted-foreground font-sans">{activitiesText.empty[lang]}</p>
                </div>
            </section>
        );
    }

    const prog = programs[current];
    const items: HomepageActivityItem[] = prog.items ?? [];
    const progName = getField(prog, 'name', lang);
    const progTag = getField(prog, 'tag', lang);
    const progDesc = getField(prog, 'desc', lang);
    const galleryItems = prog.gallery || [];

    return (
        <section id="activities" className="relative py-24 bg-background overflow-hidden">

            {/* Subtle background pattern (optional) */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundSize: '160px 160px',
                }}
            />

            <div className="container relative z-10 mx-auto px-6 lg:px-12">

                {/* ── Section Header ── */}
                <div className="flex flex-col items-center text-center mb-14">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-px bg-gradient-to-r from-primary to-transparent"></span>
                        <span className="text-sm font-bold tracking-wider uppercase text-primary font-sans">
                            {activitiesText.eyebrow[lang]}
                        </span>
                        <span className="w-8 h-px bg-gradient-to-l from-primary to-transparent"></span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-display font-black text-foreground mb-4">
                        {activitiesText.title[lang]}
                    </h2>
                    <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
                        {activitiesText.desc[lang]}
                    </p>
                </div>

                {/* ── Program Selector Circles ── */}
                <div className="flex justify-center flex-wrap gap-5 mb-8">
                    {programs.map((p, i) => {
                        const isActive = i === current;
                        const pName = getField(p, 'name', lang);
                        return (
                            <button
                                key={p.id}
                                className="flex flex-col items-center gap-3 group"
                                onClick={() => goTo(i)}
                                aria-pressed={isActive}
                                aria-label={pName}
                            >
                                <div className={`w-[72px] h-[72px] rounded-full overflow-hidden flex items-center justify-center text-3xl transition-all duration-300 ease-out border-2 ${isActive ? 'bg-primary/10 border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)] scale-110' : 'bg-card border-border group-hover:border-primary/50 group-hover:-translate-y-1'}`}>
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={pName} className="w-full h-full object-cover" />
                                    ) : (
                                        p.icon
                                    )}
                                </div>
                                <span className={`font-sans text-[11px] font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                    {pName}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Progress Bar ── */}
                <div className="h-1 bg-secondary rounded-full mb-10 overflow-hidden max-w-4xl mx-auto">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all ease-linear"
                        style={{ width: `${progress}%`, transitionDuration: '100ms' }}
                    />
                </div>

                {/* ── Selected Program Hero Card ── */}
                <div
                    className={`rounded-[24px] p-6 lg:p-10 mb-8 flex flex-col items-start gap-8 border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5 transition-all duration-300 ease-out ${animating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
                        <div className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center overflow-hidden text-4xl bg-gradient-to-br from-primary/80 to-primary text-white shadow-xl shadow-primary/20">
                            {prog.image_url ? (
                                <img src={prog.image_url} alt={progName} className="w-full h-full object-cover" />
                            ) : (
                                prog.icon
                            )}
                        </div>
                        <div className="text-center sm:text-start flex-1 w-full">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-sans text-xs font-bold uppercase tracking-wider mb-3">
                                {progTag}
                            </span>
                            <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
                                {progName}
                            </h3>
                            <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-3xl">
                                {progDesc}
                            </p>

                            {/* ── Dynamic Gallery Section ── */}
                            {galleryItems.length > 0 && (
                                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                                    {galleryItems.map((imgUrl, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative aspect-video sm:aspect-square overflow-hidden rounded-xl border border-border shadow-sm bg-card hover:shadow-md transition-all duration-300"
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`${progName} gallery image ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                            />
                                            {/* Optional dark overlay on hover for premium feel */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Activity Item Cards ── */}
                <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-300 delay-100 ease-out ${animating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
                >
                    {items.map((act, i) => {
                        const actTitle = getField(act, 'title', lang);
                        const actDesc = getField(act, 'desc', lang);
                        const actFreq = getField(act, 'freq', lang);
                        return (
                            <div
                                key={act.id ?? i}
                                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 ease-out"
                            >
                                <div className="w-full h-[140px] relative bg-secondary/50 flex items-center justify-center overflow-hidden">
                                    {act.image_url ? (
                                        <img
                                            src={act.image_url}
                                            alt={actTitle}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                    ) : (
                                        <span className="text-5xl opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out">
                                            {act.icon}
                                        </span>
                                    )}
                                    <div className="absolute top-3 inset-inline-end-3 bg-background/80 backdrop-blur-md border border-border px-2 py-1 rounded-md font-sans text-[10px] font-bold text-primary shadow-sm">
                                        {actFreq}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h4 className="font-sans font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">
                                        {actTitle}
                                    </h4>
                                    <p className="font-sans text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                                        {actDesc}
                                    </p>
                                    <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.6)]" />
                                        <span className="font-sans text-[11px] font-bold text-primary tracking-wide">
                                            {actFreq}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Dot Navigation ── */}
                <div className="flex justify-center gap-2 mt-12">
                    {programs.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`h-2 rounded-full transition-all duration-300 ease-out ${i === current ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-primary/50'}`}
                            aria-label={`Go to program ${i + 1}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
};