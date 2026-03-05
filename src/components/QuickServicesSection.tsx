import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// ─── Edit your real projects here ───────────────────────────
const unionProjects = [
    { icon: '✦', label: 'عون', description: 'عون للشباب ', path: '/3wn', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'rgba(245,158,11,0.22)' },
    { icon: '◈', label: 'مفهوم', description: 'المحتوى المرئي ', path: '/home/reels', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'rgba(16,185,129,0.22)' },
];

// Angle spreads per project count — fan opens downward
const SPREAD: Record<number, number[]> = {
    1: [0],
    2: [-30, 30],
    3: [-48, 0, 48],
    4: [-54, -18, 18, 54],
};
const RADIUS = 108; // px radius of the arc

// ─── Main exported section ───────────────────────────────────
export function QuickServicesSection() {
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const [fanOpen, setFanOpen] = useState(false);

    const count = unionProjects.length;
    const angles = SPREAD[Math.min(count, 4)] ?? SPREAD[4];

    // Height the fan cards need when expanded
    // = vertical reach of outermost card + card height
    const maxY = Math.max(...angles.map(a => Math.cos((a * Math.PI) / 180) * RADIUS));
    const fanHeight = maxY + 88 + 12; // 88 = card height, 12 = margin

    const quickServices = [
        {
            label: language === 'ar' ? 'الوظائف' : 'Jobs',
            path: '/jobs',
            icon: Briefcase,
            color: 'text-violet-400',
            bg: 'from-violet-500/15 to-violet-600/5',
            border: 'border-violet-500/15',
            shadow: 'rgba(139,92,246,0.12)',
        },
        {
            label: language === 'ar' ? 'الخصومات' : 'Discounts',
            path: '/home/offers',
            icon: Gift,
            color: 'text-rose-400',
            bg: 'from-rose-500/15 to-rose-600/5',
            border: 'border-rose-500/15',
            shadow: 'rgba(244,63,94,0.12)',
        },
    ];

    return (
        <section className="animate-slide-up px-4" style={{ animationDelay: '0.3s' }}>
            {/* Title */}
            {/* <div className="mb-4">
                <h2 className="text-h3 font-bold text-foreground tracking-tight">
                    {t('home.services.title')}
                </h2>
            </div> */}

            {/* 3-col grid */}
            <div className="grid grid-cols-3 gap-3 items-start">

                {/* الوظائف */}
                <ServiceCard
                    label={quickServices[0].label}
                    icon={quickServices[0].icon}
                    color={quickServices[0].color}
                    bg={quickServices[0].bg}
                    border={quickServices[0].border}
                    shadow={quickServices[0].shadow}
                    onClick={() => navigate(quickServices[0].path)}
                />

                {/* ── CENTER: مشاريع الاتحاد ── */}
                <div className="flex flex-col items-center">

                    {/* Trigger */}
                    <button
                        onClick={() => setFanOpen(v => !v)}
                        className={cn(
                            'relative w-full h-[96px] rounded-2xl border',
                            'flex flex-col items-center justify-center gap-2',
                            'transition-all duration-300',
                            fanOpen
                                ? 'bg-primary/20 border-primary/40 scale-95 shadow-[0_0_28px_rgba(220,38,38,0.28)]'
                                : 'bg-primary/10 border-primary/20 hover:scale-[1.03] hover:border-primary/35',
                        )}
                    >
                        {fanOpen && (
                            <span className="absolute inset-0 rounded-2xl ring-2 ring-primary/30 animate-ping opacity-25 pointer-events-none" />
                        )}
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-black text-white shadow">
                            {count}
                        </span>
                        <span
                            className="text-xl text-primary"
                            style={{
                                display: 'inline-block',
                                transform: fanOpen ? 'rotate(135deg)' : 'rotate(0deg)',
                                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                        >
                            ✦
                        </span>
                        <span className="text-[10px] font-bold text-primary leading-tight text-center">
                            مشاريع<br />الاتحاد
                        </span>
                    </button>

                    {/* Fan expand area — pushes content below downward */}
                    <div
                        style={{
                            width: '100%',
                            // grid trick: animates from 0 → fanHeight smoothly
                            height: fanOpen ? fanHeight : 0,
                            transition: 'height 0.42s cubic-bezier(0.16,1,0.3,1)',
                            position: 'relative',
                            overflow: 'visible',
                        }}
                    >
                        {unionProjects.map((project, i) => {
                            const angle = angles[i] ?? 0;
                            const rad = (angle * Math.PI) / 180;
                            const x = Math.sin(rad) * RADIUS; // horizontal spread
                            const y = Math.cos(rad) * RADIUS; // vertical (downward)

                            return (
                                <button
                                    key={project.path}
                                    onClick={() => { setFanOpen(false); navigate(project.path); }}
                                    className={cn(
                                        'absolute flex flex-col items-center justify-center gap-1.5',
                                        'w-[74px] h-[80px] rounded-2xl border',
                                        project.bg, project.border,
                                        'hover:scale-110 active:scale-95',
                                        'transition-[transform,opacity,box-shadow]',
                                    )}
                                    style={{
                                        left: '50%',
                                        top: 8,
                                        marginLeft: -37,
                                        transform: fanOpen
                                            ? `translate(${x}px, ${y}px) scale(1)`
                                            : `translate(0px, 0px) scale(0.3)`,
                                        opacity: fanOpen ? 1 : 0,
                                        pointerEvents: fanOpen ? 'auto' : 'none',
                                        transitionDuration: '380ms',
                                        transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
                                        transitionDelay: fanOpen ? `${i * 55}ms` : '0ms',
                                        boxShadow: `0 6px 20px ${project.shadow}`,
                                        zIndex: 20,
                                    }}
                                >
                                    <span className={cn('text-xl leading-none', project.color)}>
                                        {project.icon}
                                    </span>
                                    <span className="text-[10px] font-bold text-foreground text-center leading-tight px-1">
                                        {project.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* الخصومات */}
                <ServiceCard
                    label={quickServices[1].label}
                    icon={quickServices[1].icon}
                    color={quickServices[1].color}
                    bg={quickServices[1].bg}
                    border={quickServices[1].border}
                    shadow={quickServices[1].shadow}
                    onClick={() => navigate(quickServices[1].path)}
                />

            </div>
        </section>
    );
}

// ─── Reusable card ───────────────────────────────────────────
function ServiceCard({
    label, icon: Icon, color, bg, border, shadow, onClick,
}: {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    shadow: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-2',
                'w-full h-[96px] rounded-2xl border',
                `bg-gradient-to-br ${bg}`,
                border,
                'hover:scale-[1.04] active:scale-95 transition-all duration-200 group',
            )}
            style={{ boxShadow: `0 4px 16px ${shadow}` }}
        >
            <div className="w-9 h-9 rounded-xl bg-background/30 group-hover:bg-background/50 flex items-center justify-center transition-colors">
                <Icon className={cn('w-5 h-5', color)} />
            </div>
            <span className="text-[11px] font-bold text-foreground">{label}</span>
        </button>
    );
}