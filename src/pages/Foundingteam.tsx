import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    image_url: string;
    gender: 'male' | 'female';
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const FoundingTeam = () => {
    const [shuffled, setShuffled] = useState<TeamMember[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            let userGender: string | null = null;
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles').select('gender').eq('id', session.user.id).single();
                userGender = profile?.gender ?? null;
            }

            let query = supabase
                .from('union_team_members')
                .select('*')
                .eq('team_type', 'founding');

            const { data, error } = await query;

            if (!error && data) {
                let result = data;
                if (userGender !== 'female') {
                    result = result.filter((m: TeamMember) => m.gender === 'male');
                }
                setShuffled(shuffle(result));
            }
            setLoading(false);
        };
        fetchMembers();
    }, []);

    const goTo = useCallback((index: number) => {
        if (animating) return;
        setAnimating(true);
        setTimeout(() => { setActiveIndex(index); setAnimating(false); }, 350);
    }, [animating]);

    const goNext = useCallback(() => goTo((activeIndex + 1) % shuffled.length), [activeIndex, shuffled.length, goTo]);
    const goPrev = useCallback(() => goTo((activeIndex - 1 + shuffled.length) % shuffled.length), [activeIndex, shuffled.length, goTo]);

    useEffect(() => {
        if (shuffled.length < 2) return;
        const interval = setInterval(goNext, 4000);
        return () => clearInterval(interval);
    }, [goNext, shuffled.length]);

    const activeMember = shuffled[activeIndex];

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            <header className="sticky-header">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes avatarPop {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0px rgba(var(--primary-rgb, 99,102,241), 0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(var(--primary-rgb, 99,102,241), 0); }
        }
        @keyframes dotBounce {
          0%, 100% { transform: scaleX(1); }
          50%       { transform: scaleX(1.35); }
        }
        .spotlight-card { animation: fadeSlideIn 0.4s cubic-bezier(.22,1,.36,1) both; }
        .avatar-main    { animation: avatarPop 0.5s cubic-bezier(.22,1,.36,1) both; }
        .ring-pulse     { animation: ringPulse 2.4s ease-in-out infinite; }
        .dot-active     { animation: dotBounce 0.4s ease-in-out both; }
        .thumb-avatar   { transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; }
        .thumb-avatar:hover { transform: scale(1.12); }
        .thumb-avatar.active-thumb  { transform: scale(1.18); opacity: 1; }
        .thumb-avatar.inactive-thumb { opacity: 0.55; }
        .nav-btn { transition: background 0.18s, transform 0.15s; }
        .nav-btn:active { transform: scale(0.92); }
      `}</style>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-6">

                {loading ? (
                    <div className="flex justify-center items-center h-56">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeMember ? (
                    <div key={activeMember.id} className="spotlight-card relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                        <div className="flex flex-col items-center gap-4 p-8 text-center">
                            <div className="relative">
                                <div className="ring-pulse w-28 h-28 rounded-full border-4 border-primary overflow-hidden">
                                    <img
                                        key={activeMember.id}
                                        src={activeMember.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeMember.name)}&background=random&color=fff&size=200`}
                                        alt={activeMember.name}
                                        className="avatar-main w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-foreground">{activeMember.name}</h2>
                                <p className="text-primary font-medium text-sm">{activeMember.role}</p>
                                {activeMember.description && (
                                    <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto leading-relaxed">{activeMember.description}</p>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-1">{activeIndex + 1} / {shuffled.length}</p>
                        </div>

                        <div className="flex justify-between items-center px-4 pb-5">
                            <button onClick={goPrev} className="nav-btn w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground" aria-label="Previous">‹</button>
                            <div className="flex gap-1.5 items-center">
                                {shuffled.map((_, i) => (
                                    <button key={i} onClick={() => goTo(i)}
                                        className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'dot-active w-5 h-2 bg-primary' : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                                        aria-label={`Go to member ${i + 1}`}
                                    />
                                ))}
                            </div>
                            <button onClick={goNext} className="nav-btn w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground" aria-label="Next">›</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">لا يوجد أعضاء حتى الآن</div>
                )}

                {/* Thumbnails */}
                {shuffled.length > 0 && (
                    <div>
                        <p className="text-xs text-center text-muted-foreground mb-3">جميع الأعضاء</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {shuffled.map((m, i) => (
                                <button key={m.id} onClick={() => goTo(i)}
                                    className={`thumb-avatar flex flex-col items-center gap-1 ${i === activeIndex ? 'active-thumb' : 'inactive-thumb'}`}>
                                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${i === activeIndex ? 'border-primary' : 'border-transparent'}`}>
                                        <img src={m.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random&color=fff&size=100`} alt={m.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground max-w-[52px] truncate text-center leading-tight">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-muted-foreground">
                    <h4 className="font-semibold text-sm mb-1">الفريق المؤسس</h4>
                    <p className="text-xs leading-relaxed">الأعضاء الذين أسسوا الاتحاد · يظهر الترتيب عشوائياً</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default FoundingTeam;