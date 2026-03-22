import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    getElectionWithPositions,
    isAdmin,
    canNominate,
    canVote,
    canViewResults,
    formatDeadline,
    type Election,
    type Position,
    type Candidate,
} from '../../lib/elections'
import { useAuth } from '../../context/AuthContext'
import ElectionStatusBadge from '../../components/elections/Electionstatusbadge'
import {
    ChevronRight,
    Vote,
    ClipboardList,
    BarChart2,
    Calendar,
    Users,
    ShieldCheck,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Plus
} from 'lucide-react'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

// ─── Candidate mini-card ──────────────────────────────────────────────────────

function CandidateMiniCard({ candidate }: { candidate: Candidate }) {
    const name = candidate.profile?.full_name ?? 'غير معروف'
    const faculty = candidate.profile?.faculty
    const initial = name.charAt(0).toUpperCase()

    return (
        <Link
            to={`/elections/${candidate.election_id}/candidates/${candidate.id}`}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-emerald-500/30 hover:bg-emerald-50/50 transition-all group bg-card"
        >
            {candidate.photo_url || candidate.profile?.avatar_url ? (
                <img
                    src={candidate.photo_url ?? candidate.profile?.avatar_url ?? ''}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    <span className="text-sm font-bold text-muted-foreground">{initial}</span>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground truncate">{name}</p>
                {faculty && <p className="text-[11px] font-bold text-muted-foreground truncate opacity-80">{faculty}</p>}
            </div>
            <ArrowLeft size={16} className="text-muted-foreground group-hover:text-emerald-500 transition-colors ml-1" />
        </Link>
    )
}

// ─── Position section ─────────────────────────────────────────────────────────

function PositionSection({
    position,
    electionId,
    electionStatus,
}: {
    position: Position
    electionId: string
    electionStatus: Election['status']
}) {
    const approved = (position.candidates ?? []).filter((c) => c.status === 'approved')

    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Position header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4 bg-secondary/30">
                <div>
                    <h3 className="text-lg font-extrabold text-foreground">{position.title}</h3>
                    {position.description && (
                        <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1">{position.description}</p>
                    )}
                </div>
                <span className="flex-shrink-0 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                    {approved.length} {approved.length === 1 ? 'مرشح' : 'مرشحون'}
                </span>
            </div>

            {/* Candidates list */}
            <div className="p-6">
                {approved.length === 0 ? (
                    <div className="text-center py-6 bg-secondary/50 rounded-2xl border border-dashed border-border mb-4">
                        <Users size={24} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                        <p className="text-xs font-bold text-muted-foreground">
                            {canNominate(electionStatus)
                                ? 'لا يوجد مرشحون بعد — كن أول من يرشح نفسه!'
                                : 'لا يوجد مرشحون معتمدون لهذا المنصب.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {approved.map((c) => (
                            <CandidateMiniCard key={c.id} candidate={c} />
                        ))}
                    </div>
                )}

                {/* Nominate CTA inside position card */}
                {canNominate(electionStatus) && (
                    <div className="pt-2">
                        <Link
                            to={`/elections/${electionId}/nominate?position=${position.id}`}
                            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <ClipboardList size={14} />
                            رشّح نفسك لـ {position.title}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Timeline step ────────────────────────────────────────────────────────────

function TimelineStep({
    label,
    date,
    done,
    active,
}: {
    label: string
    date: string | null
    done: boolean
    active: boolean
}) {
    return (
        <div className="flex items-start gap-4">
            <div
                className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${done
                    ? 'bg-emerald-500'
                    : active
                        ? 'bg-blue-500 ring-4 ring-blue-50'
                        : 'bg-secondary border border-border'
                    }`}
            >
                {done ? (
                    <CheckCircle2 size={12} className="text-white" />
                ) : active ? (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ) : (
                    <Clock size={12} className="text-muted-foreground" />
                )}
            </div>
            <div>
                <p className={`text-sm font-extrabold ${done ? 'text-muted-foreground line-through opacity-70' : active ? 'text-blue-700' : 'text-foreground'}`}>
                    {label}
                </p>
                {date && <p className="text-[11px] font-bold text-muted-foreground mt-0.5">{formatDeadline(date)}</p>}
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ElectionDetailPage() {
    const { electionId } = useParams<{ electionId: string }>()
    const { profile } = useAuth()
    const navigate = useNavigate()
    const admin = profile ? isAdmin(profile.role) : false

    const [election, setElection] = useState<Election | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        if (!electionId) return
        getElectionWithPositions(electionId)
            .then((data) => {
                if (!data) navigate('/elections', { replace: true })
                else setElection(data)
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [electionId, navigate])

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen bg-background">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
                    <Loader2 size={24} className="animate-spin text-emerald-500" />
                    <span className="text-sm font-bold">جار التحميل...</span>
                </div>
                <BottomNav />
            </div>
        )
    }

    if (error || !election) {
        return (
            <div dir="rtl" className="min-h-screen bg-background">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-center flex-col py-16 bg-card border border-border rounded-3xl">
                        <AlertCircle size={48} className="text-red-500 mb-4 opacity-80" />
                        <h3 className="text-xl font-extrabold text-foreground mb-2">تعذر تحميل الانتخاب</h3>
                        <p className="text-sm text-muted-foreground">{error ?? 'الانتخاب غير موجود.'}</p>
                        <Link to="/elections" className="mt-6 px-6 py-2 bg-secondary text-foreground rounded-xl font-bold hover:bg-muted transition-colors">العودة للانتخابات</Link>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    const { title, description, status, positions = [] } = election

    // Timeline state helpers
    const phaseOrder = ['draft', 'nomination', 'voting', 'closed']
    const phaseIndex = phaseOrder.indexOf(status)

    return (
        <div dir="rtl" className="min-h-screen bg-background transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            {/* ── Top section ── */}
            <div className="bg-card border-b border-border relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
                    <Link
                        to="/elections"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6 bg-secondary/50 px-3 py-1.5 rounded-lg w-fit"
                    >
                        <ChevronRight size={14} />
                        الانتخابات
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-3">
                                <h1 className="text-3xl font-extrabold text-foreground tracking-tight m-0">{title}</h1>
                                <ElectionStatusBadge status={status} />
                            </div>
                            {description && (
                                <p className="text-muted-foreground text-[15px] leading-relaxed max-w-2xl font-medium m-0">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Admin quick-actions */}
                        {admin && (
                            <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <Link
                                    to={`/admin/elections/${election.id}/candidates`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-border rounded-xl text-xs font-extrabold text-foreground hover:bg-secondary transition-all"
                                >
                                    <ShieldCheck size={14} />
                                    إدارة المرشحين
                                </Link>
                                <Link
                                    to={`/admin/elections/${election.id}/monitor`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-800 transition-all shadow-sm"
                                >
                                    <BarChart2 size={14} />
                                    مراقبة
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Action bar (member) ── */}
                    <div className="flex items-center gap-3 mt-8 flex-wrap">
                        {canNominate(status) && (
                            <Link
                                to={`/elections/${election.id}/nominate`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-extrabold rounded-2xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <ClipboardList size={18} />
                                رشّح نفسك
                            </Link>
                        )}
                        {canVote(status) && (
                            <Link
                                to={`/elections/${election.id}/vote`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-extrabold rounded-2xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 animate-pulse"
                            >
                                <Vote size={18} />
                                صوّت الآن
                            </Link>
                        )}
                        {canViewResults(status) && (
                            <Link
                                to={`/elections/${election.id}/results`}
                                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-700 bg-emerald-50 text-sm font-extrabold rounded-2xl hover:bg-emerald-100 transition-all"
                            >
                                <BarChart2 size={18} />
                                {status === 'closed' ? 'النتائج النهائية' : 'النتائج المباشرة'}
                            </Link>
                        )}
                        <Link
                            to={`/elections/${election.id}/candidates`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground text-sm font-extrabold rounded-2xl hover:bg-secondary/80 transition-all"
                        >
                            <Users size={18} />
                            عرض المرشحين
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Main layout ── */}
            <div className="max-w-5xl mx-auto px-6 py-10 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Right: positions ── */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
                            <h2 className="text-lg font-extrabold text-foreground m-0">
                                المناصب ({positions.length})
                            </h2>
                        </div>

                        {positions.length === 0 ? (
                            <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-sm">
                                <ClipboardList size={40} className="mx-auto text-muted-foreground opacity-30 mb-4" />
                                <p className="text-muted-foreground font-bold mb-4">لم يتم إضافة مناصب بعد.</p>
                                {admin && (
                                    <Link
                                        to={`/admin/elections/${election.id}/edit`}
                                        className="inline-flex items-center gap-2 text-sm text-emerald-700 font-extrabold bg-emerald-50 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors"
                                    >
                                        <Plus size={16} />
                                        إضافة مناصب
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {positions.map((p) => (
                                    <PositionSection
                                        key={p.id}
                                        position={p}
                                        electionId={election.id}
                                        electionStatus={status}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Left: sidebar ── */}
                    <div className="space-y-6">
                        {/* Timeline card */}
                        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Clock size={16} className="text-emerald-500" />
                                <h3 className="text-sm font-extrabold text-foreground m-0 tracking-wide">
                                    الجدول الزمني
                                </h3>
                            </div>

                            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-auto before:mr-[11px] before:-translate-x-1/2 md:before:translate-x-0 before:h-full before:w-[2px] before:bg-border before:-z-10 z-0">
                                <TimelineStep
                                    label="تم إنشاء الانتخاب"
                                    date={election.created_at}
                                    done={phaseIndex >= 1}
                                    active={phaseIndex === 0}
                                />
                                <TimelineStep
                                    label="بداية الترشيحات"
                                    date={election.nomination_start}
                                    done={phaseIndex >= 2}
                                    active={phaseIndex === 1}
                                />
                                <TimelineStep
                                    label="نهاية الترشيحات"
                                    date={election.nomination_end}
                                    done={phaseIndex >= 2}
                                    active={false}
                                />
                                <TimelineStep
                                    label="بداية التصويت"
                                    date={election.voting_start}
                                    done={phaseIndex >= 3}
                                    active={phaseIndex === 2}
                                />
                                <TimelineStep
                                    label="نهاية التصويت"
                                    date={election.voting_end}
                                    done={phaseIndex >= 3}
                                    active={false}
                                />
                                <TimelineStep
                                    label="نشر النتائج"
                                    date={null}
                                    done={phaseIndex === 3}
                                    active={phaseIndex === 3}
                                />
                            </div>
                        </div>

                        {/* Stats card */}
                        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart2 size={16} className="text-blue-500" />
                                <h3 className="text-sm font-extrabold text-foreground m-0 tracking-wide">
                                    نظرة عامة
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                                    <span className="text-muted-foreground font-bold text-xs flex items-center gap-2">
                                        <Calendar size={14} />
                                        إجمالي المناصب
                                    </span>
                                    <span className="font-extrabold text-foreground text-sm bg-background px-2 py-0.5 rounded-md shadow-sm border border-border">{positions.length}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                                    <span className="text-muted-foreground font-bold text-xs flex items-center gap-2">
                                        <Users size={14} />
                                        المرشحون المعتمدون
                                    </span>
                                    <span className="font-extrabold text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded-md shadow-sm border border-emerald-100">
                                        {positions
                                            .flatMap((p) => p.candidates ?? [])
                                            .filter((c) => c.status === 'approved').length}
                                    </span>
                                </div>

                                {admin && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                        <span className="text-amber-700 font-bold text-xs flex items-center gap-2">
                                            <ShieldCheck size={14} />
                                            بانتظار المراجعة
                                        </span>
                                        <span className="font-extrabold text-amber-600 text-sm bg-white px-2 py-0.5 rounded-md shadow-sm border border-amber-200">
                                            {positions
                                                .flatMap((p) => p.candidates ?? [])
                                                .filter((c) => c.status === 'pending').length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}