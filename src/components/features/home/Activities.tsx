import React, { useState, useRef, useEffect, useCallback } from 'react';

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

interface Activity {
    icon: string;
    titleAr: string;
    descAr: string;
    freq: string;
    /** Swap undefined with a real imported image or URL */
    image?: string;
}
interface Program {
    id: string; icon: string; nameAr: string; tagAr: string; descAr: string;
    activities: Activity[];
}

const programs: Program[] = [
    {
        id: 'bousala', icon: '🧭', nameAr: 'بوصلة', tagAr: 'توجيهي · Guidance',
        descAr: 'برنامج التوجيه المهني والأكاديمي للطلاب اليمنيين، يرسم مساراتهم نحو المستقبل.',
        activities: [
            { icon: '🗺️', titleAr: 'جلسات التوجيه المهني', descAr: 'لقاءات فردية مع مختصين لتحديد المسار المناسب', freq: 'أسبوعياً' },
            { icon: '📊', titleAr: 'ورش اختبارات الشخصية', descAr: 'تحليل نقاط القوة والميول المهنية لكل فرد', freq: 'شهرياً' },
            { icon: '🎯', titleAr: 'خطط التطوير الشخصي', descAr: 'خرائط طريق مخصصة لتحقيق أهداف الطالب', freq: 'مستمر' },
            { icon: '🤝', titleAr: 'شبكة الخريجين', descAr: 'ربط الطلاب بخريجين ناجحين في مجالات متنوعة', freq: 'ربع سنوي' },
        ],
    },
    {
        id: 'bait', icon: '🏛️', nameAr: 'بيت الاتحاد', tagAr: 'مجتمعي · Community',
        descAr: 'بيت الجالية اليمنية في إسطنبول، مساحة الوحدة والتلاقي والعمل المشترك.',
        activities: [
            { icon: '☕', titleAr: 'مجالس التعارف الأسبوعية', descAr: 'لقاءات دورية في أجواء دافئة وودية', freq: 'أسبوعياً' },
            { icon: '🍽️', titleAr: 'مآدب المناسبات', descAr: 'موائد تحتفي بالمناسبات الوطنية والدينية', freq: 'موسمي' },
            { icon: '📢', titleAr: 'المنابر الحوارية', descAr: 'منصة لتبادل الأفكار والنقاش البنّاء', freq: 'نصف شهري' },
            { icon: '🤲', titleAr: 'استقبال الوافدين الجدد', descAr: 'مساعدة الطلاب الجدد على الاندماج والتكيّف', freq: 'مستمر' },
        ],
    },
    {
        id: 'sports', icon: '⚽', nameAr: 'الرياضة الشبابية', tagAr: 'رياضي · Sports',
        descAr: 'منصة رياضية شاملة تبني اللياقة البدنية والروح الجماعية والمنافسة الشريفة.',
        activities: [
            { icon: '🏆', titleAr: 'دوري كرة القدم', descAr: 'بطولة داخلية تجمع فرق الجالية في منافسة حماسية', freq: 'شهرياً' },
            { icon: '🏋️', titleAr: 'برامج اللياقة البدنية', descAr: 'تدريبات جماعية لتعزيز الصحة والحيوية', freq: 'أسبوعياً' },
            { icon: '🏃', titleAr: 'سباقات الجري الخارجية', descAr: 'فعاليات جري في الهواء الطلق بإسطنبول', freq: 'موسمي' },
            { icon: '🎽', titleAr: 'تدريب فئة الناشئين', descAr: 'برنامج تطوير المهارات الرياضية للشباب', freq: 'أسبوعياً' },
        ],
    },
    {
        id: 'aoun', icon: '🤲', nameAr: 'عون', tagAr: 'إنساني · Humanitarian',
        descAr: 'مبادرة التكافل الاجتماعي، تمد يد المساعدة للطلاب في أوقات الحاجة.',
        activities: [
            { icon: '💊', titleAr: 'الدعم الصحي الطارئ', descAr: 'مساعدات طبية عاجلة للطلاب المحتاجين', freq: 'عند الحاجة' },
            { icon: '📚', titleAr: 'دعم الكتب والمستلزمات', descAr: 'توفير الكتب والأدوات الدراسية للطلاب', freq: 'كل فصل' },
            { icon: '🏠', titleAr: 'مساعدة في إيجاد السكن', descAr: 'ربط الطلاب بخيارات سكن مناسبة وميسورة', freq: 'مستمر' },
            { icon: '💰', titleAr: 'صندوق الطوارئ المالي', descAr: 'دعم مالي عاجل في حالات الضرورة القصوى', freq: 'عند الحاجة' },
        ],
    },
    {
        id: 'mafhoum', icon: '💡', nameAr: 'مفهوم', tagAr: 'فكري · Intellectual',
        descAr: 'منصة الفكر والإبداع والنقاش العلمي، تشحذ العقول وتصقل المواهب الأكاديمية.',
        activities: [
            { icon: '🎙️', titleAr: 'محاضرات فكرية أكاديمية', descAr: 'محاضرات متخصصة لتوسيع الآفاق المعرفية', freq: 'نصف شهري' },
            { icon: '✍️', titleAr: 'ورش الكتابة الإبداعية', descAr: 'صقل مهارات الكتابة والتعبير الأدبي', freq: 'شهرياً' },
            { icon: '⚖️', titleAr: 'مناظرات فكرية', descAr: 'حوارات تدرّب على الحجة والتفكير النقدي', freq: 'شهرياً' },
            { icon: '📰', titleAr: 'النشرة الفكرية الدورية', descAr: 'إصدار يوثّق الأفكار والإنتاج الفكري للأعضاء', freq: 'شهرياً' },
        ],
    },
    {
        id: 'cultural', icon: '🎭', nameAr: 'الفعاليات الثقافية', tagAr: 'ثقافي · Cultural',
        descAr: 'أمسيات شعرية ومعارض فنون وندوات فكرية تعزز الهوية الثقافية اليمنية.',
        activities: [
            { icon: '🖼️', titleAr: 'معارض الفنون البصرية', descAr: 'معارض تجمع أعمال الطلاب الموهوبين', freq: 'ربع سنوي' },
            { icon: '🎤', titleAr: 'أمسيات الشعر والأدب', descAr: 'ليالٍ أدبية تُحيي التراث الشعري العربي', freq: 'شهرياً' },
            { icon: '🎵', titleAr: 'الموسيقى والتراث', descAr: 'عروض فنية تحتفي بالتراث اليمني الأصيل', freq: 'موسمي' },
            { icon: '🎬', titleAr: 'مهرجان الأفلام', descAr: 'أفلام وثائقية عن الثقافة واليمن والهوية', freq: 'سنوي' },
        ],
    },
    {
        id: 'national', icon: '🇾🇪', nameAr: 'المناسبات الوطنية', tagAr: 'وطني · National',
        descAr: 'إحياء الذكريات الوطنية وتعزيز روح الانتماء بين أبناء الجالية اليمنية.',
        activities: [
            { icon: '🎆', titleAr: 'الاحتفال بيوم الوحدة', descAr: 'احتفالية سنوية كبرى بذكرى الوحدة اليمنية', freq: 'سنوي' },
            { icon: '🕊️', titleAr: 'إحياء ذكرى الثورة', descAr: 'تخليد ذكرى ثورة الشعب اليمني العظيم', freq: 'سنوي' },
            { icon: '🏅', titleAr: 'تكريم الرموز الوطنية', descAr: 'تكريم الشخصيات الوطنية البارزة في تاريخ اليمن', freq: 'سنوي' },
            { icon: '📸', titleAr: 'معرض الصور الوطنية', descAr: 'معرض يوثّق تاريخ اليمن وإرثه الحضاري العريق', freq: 'سنوي' },
        ],
    },
    {
        id: 'religious', icon: '🌙', nameAr: 'البرامج الدينية', tagAr: 'ديني · Religious',
        descAr: 'لقاءات إيمانية وإفطارات جماعية تقوي الروابط الأخوية في المناسبات المباركة.',
        activities: [
            { icon: '🌅', titleAr: 'إفطارات شهر رمضان', descAr: 'موائد إفطار جماعية طوال الشهر الكريم', freq: 'يومياً (رمضان)' },
            { icon: '📖', titleAr: 'حلقات تلاوة القرآن', descAr: 'حلقات دورية للتلاوة والتدبّر والحفظ', freq: 'أسبوعياً' },
            { icon: '🕌', titleAr: 'تجمعات العيد', descAr: 'احتفالات عيدية تُحيي روح الفرح والوحدة', freq: 'مرتان سنوياً' },
            { icon: '✨', titleAr: 'الأمسيات الروحية', descAr: 'لقاءات إيمانية تُعمّق الارتباط الروحي', freq: 'شهرياً' },
        ],
    },
];

export const Activities = () => {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [progress, setProgress] = useState(0);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const lockedRef = useRef(false);

    const goTo = useCallback((idx: number) => {
        if (lockedRef.current) return;
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
    }, []);

    useEffect(() => {
        startRef.current = null;
        const tick = (now: number) => {
            if (!startRef.current) startRef.current = now;
            const pct = Math.min(((now - startRef.current) / SLIDE_DURATION) * 100, 100);
            setProgress(pct);
            if (pct < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        timerRef.current = setTimeout(() => goTo(1), SLIDE_DURATION);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [goTo]);

    const prog = programs[current];

    return (
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
                        <span style={{ color: Y.gold, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>الأنشطة والفعاليات</span>
                        <div style={{ height: '1px', width: '40px', background: `linear-gradient(to left, transparent, ${Y.gold})` }} />
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.1rem)', fontWeight: 800, color: Y.cream, letterSpacing: '-0.02em', marginBottom: '10px' }}>
                        برامجنا ومبادراتنا
                    </h2>
                    <p style={{ color: '#7a7262', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        تُمثّل هذه البرامج نبض اتحادنا وروح مجتمعنا اليمني في إسطنبول
                    </p>
                </div>

                {/* Circles */}
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
                    {programs.map((p, i) => {
                        const isActive = i === current;
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
                                    {p.nameAr}
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
                            {prog.tagAr}
                        </span>
                        <h3 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: 800, color: Y.cream, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                            {prog.nameAr}
                        </h3>
                        <p style={{ color: '#7a7262', fontSize: '0.88rem', lineHeight: 1.8 }}>{prog.descAr}</p>
                    </div>
                </div>

                {/* Activity cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))', gap: '14px',
                    opacity: animating ? 0 : 1, transform: animating ? 'translateY(14px)' : 'translateY(0)',
                    transition: 'opacity 0.28s ease, transform 0.28s ease',
                }}>
                    {prog.activities.map((act, i) => (
                        <div key={i}
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
                            {/* ── Image slot ── swap act.image with your import or URL */}
                            <div style={{
                                width: '100%', height: '130px', position: 'relative', overflow: 'hidden',
                                background: 'linear-gradient(135deg, rgba(139,26,26,0.15), rgba(201,151,74,0.07))',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}>
                                {act.image
                                    ? <img src={act.image} alt={act.titleAr}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                    : <>
                                        <span style={{ fontSize: '32px', opacity: 0.65 }}>{act.icon}</span>
                                        <span style={{ fontSize: '10px', color: 'rgba(201,151,74,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                                            أضف صورة هنا
                                        </span>
                                    </>
                                }
                                <div style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '3px 8px',
                                    fontSize: '10px', color: Y.goldLight, fontWeight: 600,
                                    border: '1px solid rgba(201,151,74,0.25)',
                                }}>
                                    {act.freq}
                                </div>
                            </div>

                            <div style={{ padding: '16px 18px' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '13px', color: Y.cream, lineHeight: 1.4, marginBottom: '7px' }}>
                                    {act.titleAr}
                                </h4>
                                <p style={{ fontSize: '12px', color: '#6a6258', lineHeight: 1.7, marginBottom: '12px' }}>
                                    {act.descAr}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: Y.gold, boxShadow: '0 0 6px rgba(201,151,74,0.6)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: Y.gold, letterSpacing: '0.04em' }}>{act.freq}</span>
                                </div>
                            </div>
                        </div>
                    ))}
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
    );
};