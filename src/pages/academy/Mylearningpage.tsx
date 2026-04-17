import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Course, UserCourseProgress, Certificate } from '@/integrations/supabase/academy.types'
import { GraduationCap, BookOpen, Trophy, Clock, Download, Play, ChevronLeft } from 'lucide-react'
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';


interface TrackPageState {
    track: any;
    userId: string | null;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    bookmarkedPages: Set<number>;
    noteInput: string;
    savingNote: boolean;
    showAllNotes: boolean;
    showSearch: boolean;
    searchQuery: string;

    chatInput: string;
    sendingMsg: boolean;
}

interface EnrichedProgress extends UserCourseProgress {
    course: Course
}
interface EnrichedCert extends Certificate {
    course: Course
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MyLearningPage() {
    const navigate = useNavigate()
    const [inProgress, setInProgress] = useState<EnrichedProgress[]>([])
    const [certs, setCerts] = useState<EnrichedCert[]>([])
    const [loading, setLoading] = useState(true)
    const [showSearch, setShowSearch] = useState(false)
    const [state, setState] = useState<TrackPageState>({
        track: null,
        userId: null,
        loading: true,
        currentPage: 1,
        totalPages: 0,
        bookmarkedPages: new Set(),
        noteInput: '',
        savingNote: false,
        showAllNotes: false,
        showSearch: false,
        searchQuery: '',
        chatInput: '',
        sendingMsg: false,
    });
    const updateState = useCallback((updates: Partial<TrackPageState>) => {
        setState((prev) => ({ ...prev, ...updates }));

    }, []);

    useEffect(() => {
        load()
    }, [])

    async function load() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/login'); return }

        const uid = user.id

        const { data: progress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', uid)

        const { data: certificates } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', uid)
            .order('issued_at', { ascending: false })

        const courseIds = [
            ...new Set([
                ...(progress?.map(p => p.course_id) ?? []),
                ...(certificates?.map(c => c.course_id) ?? []),
            ])
        ]

        if (courseIds.length > 0) {
            const { data: courses } = await supabase
                .from('courses')
                .select('*')
                .in('id', courseIds)

            const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

            setInProgress(
                (progress ?? [])
                    .filter(p => !p.is_completed)
                    .map(p => ({ ...p, course: courseMap[p.course_id] }))
                    .filter(p => p.course)
            )
            setCerts(
                (certificates ?? [])
                    .map(c => ({ ...c, course: courseMap[c.course_id] }))
                    .filter(c => c.course)
            )
        }

        setLoading(false)
    }

    const totalProgress = inProgress.length > 0
        ? Math.round(inProgress.reduce((acc, p) => acc + p.progress_pct, 0) / inProgress.length)
        : 0

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F5' }}>
            <div className="w-8 h-8 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen pb-20" style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />

                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/academy')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                            {' تعلّمي'}
                        </h1>

                    </div>
                </div>
            </header>
            <div
                className="px-6 py-10 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #111111 0%, #1A0606 100%)' }}
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='white'/%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="relative max-w-5xl mx-auto">
                    <h1 className="text-3xl font-black text-white mb-1">تعلّمي</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">تابع رحلتك التعليمية وشهاداتك</p>

                    {/* Stats row */}
                    <div className="flex gap-4 mt-8 flex-wrap">
                        {[
                            { icon: BookOpen, val: inProgress.length, lbl: 'كورس جارٍ', color: '#DC2626' },
                            { icon: Trophy, val: certs.length, lbl: 'شهادة مكتسبة', color: '#D97706' },
                            // { icon: GraduationCap, val: `${totalProgress}٪`, lbl: 'متوسط التقدم', color: '#10B981' },
                        ].map(({ icon: Icon, val, lbl, color }) => (
                            <div
                                key={lbl}
                                className="flex items-center gap-3 px-5 py-4 rounded-2xl flex-1 min-w-[140px]"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${color}22` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-white leading-none">{val}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{lbl}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 pt-8 space-y-10">

                {/* ── In Progress ── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-black text-gray-900">كورساتي الجارية</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{inProgress.length} كورس</p>
                        </div>
                        <Link to="/academy" className="text-xs font-bold flex items-center gap-1" style={{ color: '#B91C1C' }}>
                            <span>استكشف المزيد</span>
                            <ChevronLeft className="w-3 h-3" />
                        </Link>
                    </div>

                    {inProgress.length === 0 ? (
                        <EmptyState
                            icon={<BookOpen className="w-10 h-10 text-gray-300" />}
                            title="لم تبدأ أي كورس بعد"
                            sub="تصفّح الأكاديمية واختر كورسك الأول"
                            action={{ label: 'تصفّح الكورسات', to: '/academy' }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inProgress.map(p => (
                                <ProgressCard key={p.course_id} progress={p} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Certificates ── */}
                <section>
                    <h2 className="text-lg font-black text-gray-900 mb-5">شهاداتي</h2>

                    {certs.length === 0 ? (
                        <EmptyState
                            icon={<Trophy className="w-10 h-10 text-gray-300" />}
                            title="لا توجد شهادات بعد"
                            sub="أكمل أي كورس لتحصل على شهادة معتمدة"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {certs.map(cert => (
                                <CertificateCard key={cert.id} cert={cert} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

// ─── Progress Card ────────────────────────────────────────────────────────────
function ProgressCard({ progress: p }: { progress: EnrichedProgress }) {
    const pct = Math.round(p.progress_pct)


    return (
        <div
            className="bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ borderRadius: '20px', border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
            <div className="flex gap-3 p-4">
                <div
                    className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: '#1A1A1A' }}
                >
                    {p.course.thumbnail_url
                        ? <img src={p.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-white/20" /></div>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: '#B91C1C' }}>الأكاديمية</p>
                    <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{p.course.title}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.completed_lessons} من {p.total_lessons} درس
                    </p>
                </div>
            </div>

            <div className="px-4 pb-4">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-black text-gray-900">{pct}٪</span>
                    <span className="text-[10px] text-gray-400">{p.total_lessons - p.completed_lessons} درس متبقي</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: '#F0EDE8' }}>
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: '#B91C1C' }}
                    />
                </div>
                <Link
                    to={`/academy/course/${p.course_id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: '#111111' }}
                >
                    <Play className="w-3 h-3" />
                    متابعة التعلم
                </Link>
            </div>
        </div>
    )
}

// ─── Certificate Card ─────────────────────────────────────────────────────────
function CertificateCard({ cert }: { cert: EnrichedCert }) {
    const navigate = useNavigate()

    return (
        <div
            className="relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1"
            style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #1C1008 0%, #111111 100%)',
                border: '1px solid rgba(180,83,9,0.25)',
            }}
        >
            <div
                className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, rgba(180,83,9,0.12), transparent 70%)' }}
            />
            <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
                style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}
            >
                🏆
            </div>
            <p className="font-black text-white text-sm mb-1 line-clamp-2">{cert.course.title}</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {cert.course.instructor}
            </p>
            <p className="text-[10px] font-bold mb-4" style={{ color: 'rgba(180,83,9,0.8)' }}>
                صادرة في {formatDate(cert.issued_at)}
            </p>
            <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{ background: 'rgba(180,83,9,0.18)', color: '#D97706', border: '1px solid rgba(180,83,9,0.25)' }}
                onClick={() => navigate(`/academy/certificate/${cert.course_id}`)}
            >
                <Download className="w-3.5 h-3.5" />
                تحميل الشهادة
            </button>
        </div>
    )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
    icon, title, sub, action,
}: {
    icon: React.ReactNode
    title: string
    sub: string
    action?: { label: string; to: string }
}) {
    return (
        <div
            className="flex flex-col items-center justify-center py-14 text-center"
            style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EDE8' }}
        >
            <div className="mb-3 opacity-40">{icon}</div>
            <p className="font-bold text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-xs text-gray-400 mb-5">{sub}</p>
            {action && (
                <Link
                    to={action.to}
                    className="text-xs font-bold px-5 py-2.5 rounded-xl text-white"
                    style={{ background: '#B91C1C' }}
                >
                    {action.label}
                </Link>
            )}
        </div>
    )
}