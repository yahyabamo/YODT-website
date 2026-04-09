import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useLocation } from 'react-router-dom';
interface Project {
    id: string;
    name: string;
    description: string;
}

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

// ─── Project Members View ─────────────────────────────────────────────────────
const ProjectMembers = ({
    project,
    onBack,
    userGender,
    userRole,
}: {
    project: Project;
    onBack: () => void;
    userGender: string | null;
    userRole: string | null;
}) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const fetchProjectMembers = async () => {
            const { data, error } = await supabase
                .from('union_project_members')
                .select('union_team_members(*)')
                .eq('project_id', project.id);

            if (!error && data) {
                let result = data
                    .map((row: any) => row.union_team_members)
                    .filter(Boolean);
                // Admins & female users can see all members; male non-admins see only male members
                const canSeeAll = userRole === 'admin' || userGender === 'female';
                if (!canSeeAll) {
                    result = result.filter((m: TeamMember) => m.gender === 'male');
                }
                setMembers(shuffle(result));
            }
            setLoading(false);
        };
        fetchProjectMembers();
    }, [project.id, userGender]);

    const goTo = useCallback((index: number) => {
        if (animating) return;
        setAnimating(true);
        setTimeout(() => { setActiveIndex(index); setAnimating(false); }, 350);
    }, [animating]);

    const goNext = useCallback(() => goTo((activeIndex + 1) % members.length), [activeIndex, members.length, goTo]);
    const goPrev = useCallback(() => goTo((activeIndex - 1 + members.length) % members.length), [activeIndex, members.length, goTo]);

    useEffect(() => {
        if (members.length < 2) return;
        const interval = setInterval(goNext, 4000);
        return () => clearInterval(interval);
    }, [goNext, members.length]);

    const activeMember = members[activeIndex];

    return (
        <div className="space-y-5">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <span className="text-lg">→</span>
                <span>العودة للمشاريع</span>
            </button>

            {/* Project title card */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">📁</div>
                <div>
                    <h3 className="font-bold text-lg text-foreground">{project.name}</h3>
                    {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : members.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">لا يوجد أعضاء في هذا المشروع</div>
            ) : (
                <>
                    {/* Spotlight card */}
                    {activeMember && (
                        <div key={activeMember.id} className="spotlight-card relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card">
                            <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                            <div className="flex flex-col items-center gap-4 p-8 text-center">
                                <div className="ring-pulse w-28 h-28 rounded-full border-4 border-primary overflow-hidden">
                                    <img
                                        key={activeMember.id}
                                        src={activeMember.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeMember.name)}&background=random&color=fff&size=200`}
                                        alt={activeMember.name}
                                        className="avatar-main w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-foreground">{activeMember.name}</h2>
                                    <p className="text-primary font-medium text-sm">{activeMember.role}</p>
                                    {activeMember.description && (
                                        <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto leading-relaxed">{activeMember.description}</p>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground/60">{activeIndex + 1} / {members.length}</p>
                            </div>
                            <div className="flex justify-between items-center px-4 pb-5">
                                <button onClick={goPrev} className="nav-btn w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground">‹</button>
                                <div className="flex gap-1.5 items-center">
                                    {members.map((_, i) => (
                                        <button key={i} onClick={() => goTo(i)}
                                            className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'dot-active w-5 h-2 bg-primary' : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`} />
                                    ))}
                                </div>
                                <button onClick={goNext} className="nav-btn w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground">›</button>
                            </div>
                        </div>
                    )}

                    {/* Thumbnails */}
                    <div>
                        <p className="text-xs text-center text-muted-foreground mb-3">فريق المشروع · {members.length} أعضاء</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {members.map((m, i) => (
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
                </>
            )}
        </div>
    );
};

// ─── Projects List ────────────────────────────────────────────────────────────
const UnionProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [userGender, setUserGender] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const location = useLocation(); // 2. Initialize location

    useEffect(() => {
        const init = async () => {
            // Get user gender
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles').select('gender, role').eq('id', session.user.id).single();
                setUserGender(profile?.gender ?? null);
                setUserRole(profile?.role ?? null);
            }

            // Fetch projects
            const { data: proj } = await supabase
                .from('union_projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (proj) {
                setProjects(proj);
                if (location.state?.autoSelectId) {
                    const target = proj.find(p => p.name === location.state.autoSelectId);
                    if (target) {
                        setSelectedProject(target);
                    }
                    // Clear state so it doesn't re-open on every refresh
                    window.history.replaceState({}, document.title);
                }

                // Fetch member counts per project
                const counts: Record<string, number> = {};
                await Promise.all(proj.map(async (p: Project) => {
                    const { count } = await supabase
                        .from('union_project_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('project_id', p.id);
                    counts[p.id] = count ?? 0;
                }));
                setMemberCounts(counts);
            }

            setLoading(false);
        };
        init();
    }, [location.state]);

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
        .thumb-avatar   { transition: transform 0.2s, opacity 0.2s; }
        .thumb-avatar:hover { transform: scale(1.12); }
        .thumb-avatar.active-thumb  { transform: scale(1.18); opacity: 1; }
        .thumb-avatar.inactive-thumb { opacity: 0.55; }
        .nav-btn { transition: background 0.18s, transform 0.15s; }
        .nav-btn:active { transform: scale(0.92); }
      `}</style>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-5">

                {loading ? (
                    <div className="flex justify-center items-center h-56">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : selectedProject ? (
                    <ProjectMembers
                        project={selectedProject}
                        onBack={() => setSelectedProject(null)}
                        userGender={userGender}
                        userRole={userRole}
                    />
                ) : projects.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">لا توجد مشاريع بعد</div>
                ) : (
                    <>
                        <p className="text-sm text-center text-muted-foreground">اختر مشروعاً لعرض فريقه</p>
                        <div className="space-y-3">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProject(p)}
                                    className="w-full text-right rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">📁</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground truncate">{p.name}</p>
                                        {p.description && <p className="text-sm text-muted-foreground truncate mt-0.5">{p.description}</p>}
                                    </div>
                                    <div className="flex flex-col items-center flex-shrink-0 min-w-[36px]">
                                        <span className="text-2xl font-black text-primary">{memberCounts[p.id] ?? 0}</span>
                                        <span className="text-[10px] text-muted-foreground">عضو</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default UnionProjects;