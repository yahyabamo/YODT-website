import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    getElectionWithPositions,
    getAllCandidatesForAdmin,
    reviewCandidate,
    isAdmin,
    type Election,
    type Candidate,
    type Position,
} from '../../lib/elections'
import { useAuth } from '../../context/AuthContext'
import ElectionStatusBadge from '../../components/elections/Electionstatusbadge'
import {
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    User,
    BookOpen,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewFilter = 'all' | 'pending' | 'approved' | 'rejected'

const FILTER_TABS: { label: string; value: ReviewFilter }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'قيد الانتظار', value: 'pending' },
    { label: 'مقبول', value: 'approved' },
    { label: 'مرفوض', value: 'rejected' },
]

// ─── Candidate review card ────────────────────────────────────────────────────

function CandidateReviewCard({
    candidate,
    onReview,
}: {
    candidate: Candidate
    onReview: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>
}) {
    const [expanded, setExpanded] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    const name = candidate.profile?.full_name ?? 'غير معروف'
    const faculty = candidate.profile?.faculty
    const studentId = candidate.profile?.student_id
    const initial = name !== 'غير معروف' ? name.charAt(0).toUpperCase() : '؟'

    async function handleApprove() {
        setLoading(true)
        setActionError(null)
        try {
            await onReview(candidate.id, 'approved')
        } catch (e: unknown) {
            setActionError(e instanceof Error ? e.message : 'فشل')
        } finally {
            setLoading(false)
        }
    }

    async function handleReject() {
        if (!rejectionReason.trim()) {
            setActionError('يرجى تقديم سبب للرفض.')
            return
        }
        setLoading(true)
        setActionError(null)
        try {
            await onReview(candidate.id, 'rejected', rejectionReason.trim())
            setRejecting(false)
        } catch (e: unknown) {
            setActionError(e instanceof Error ? e.message : 'فشل')
        } finally {
            setLoading(false)
        }
    }

    const statusConfig = {
        pending: { label: 'قيد الانتظار', icon: <Clock size={14} />, classes: 'bg-amber-50 text-amber-700 border-amber-200' },
        approved: { label: 'مقبول', icon: <CheckCircle2 size={14} />, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        rejected: { label: 'مرفوض', icon: <XCircle size={14} />, classes: 'bg-red-50 text-red-700 border-red-200' },
    }
    const { label, icon, classes } = statusConfig[candidate.status]

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Card header */}
            <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
                {/* Avatar */}
                {candidate.photo_url || candidate.profile?.avatar_url ? (
                    <img
                        src={candidate.photo_url ?? candidate.profile?.avatar_url ?? ''}
                        alt={name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border shadow-sm"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border shadow-sm">
                        <span className="text-xl font-extrabold text-muted-foreground">{initial}</span>
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="font-extrabold text-foreground text-base m-0">{name}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${classes} shadow-sm`}>
                            {icon}
                            {label}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-[12px] font-bold text-muted-foreground flex-wrap opacity-80">
                        {faculty && (
                            <span className="flex items-center gap-1.5">
                                <User size={14} className="opacity-70" />
                                {faculty}
                            </span>
                        )}
                        {studentId && <span>الرقم الجامعي: <span dir="ltr">{studentId}</span></span>}
                        <span>تاريخ التقديم: <span dir="ltr" className="inline-block text-foreground/80">{new Date(candidate.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></span>
                    </div>
                </div>

                {/* Expand toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
                    className="flex-shrink-0 p-2 rounded-xl text-muted-foreground bg-secondary hover:text-foreground hover:bg-secondary/80 transition-all border border-transparent shadow-sm"
                >
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {/* Expandable: bio + program */}
            {expanded && (
                <div className="border-t border-border px-5 py-5 space-y-5 bg-secondary/30">
                    {candidate.bio && (
                        <div>
                            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-80">
                                <User size={13} />
                                النبذة التعريفية
                            </p>
                            <p className="text-[14px] font-medium text-foreground leading-relaxed whitespace-pre-wrap bg-background p-4 rounded-xl border border-border shadow-sm">{candidate.bio}</p>
                        </div>
                    )}
                    {candidate.program && (
                        <div>
                            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-80">
                                <BookOpen size={13} />
                                البرنامج الانتخابي
                            </p>
                            <p className="text-[14px] font-medium text-foreground leading-relaxed whitespace-pre-wrap bg-background p-4 rounded-xl border border-border shadow-sm">{candidate.program}</p>
                        </div>
                    )}

                    {/* Rejection reason (if already rejected) */}
                    {candidate.status === 'rejected' && candidate.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700 shadow-sm flex items-start gap-2">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-extrabold block mb-1">سبب الرفض:</strong>
                                <span className="font-medium">{candidate.rejection_reason}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions — only for pending */}
            {candidate.status === 'pending' && (
                <div className="border-t border-border px-5 py-4 bg-background">
                    {actionError && (
                        <p className="text-[13px] font-bold text-red-600 mb-4 flex items-center gap-1.5 bg-red-50 p-2.5 rounded-lg border border-red-100">
                            <AlertCircle size={14} />
                            {actionError}
                        </p>
                    )}

                    {rejecting ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="سبب الرفض (مطلوب)..."
                                rows={2}
                                className="w-full px-4 py-3 text-[14px] font-medium border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground resize-none bg-background shadow-sm transition-all"
                                autoFocus
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 border border-red-700 text-white text-[13px] font-extrabold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                    تأكيد الرفض
                                </button>
                                <button
                                    onClick={() => { setRejecting(false); setActionError(null) }}
                                    className="px-5 py-2.5 text-[13px] font-extrabold text-foreground bg-secondary border border-border hover:bg-secondary/80 rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 border border-emerald-700 text-white text-[13px] font-extrabold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                    قبول
                                </button>
                                <button
                                    onClick={() => { setRejecting(true); setActionError(null) }}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-red-200 bg-red-50 text-red-600 text-[13px] font-extrabold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                >
                                    <XCircle size={14} />
                                    رفض
                                </button>
                            </div>
                            <button
                                onClick={() => setExpanded(true)}
                                className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors ml-auto underline underline-offset-4 decoration-border hover:decoration-muted-foreground"
                            >
                                {expanded ? '' : 'قراءة الطلب'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCandidatesPage() {
    const { electionId } = useParams<{ electionId: string }>()
    const { profile } = useAuth()
    const navigate = useNavigate()

    const [election, setElection] = useState<Election | null>(null)
    const [positions, setPositions] = useState<Position[]>([])
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<ReviewFilter>('pending')
    const [selectedPosition, setSelectedPosition] = useState<string>('all')

    // Role guard
    useEffect(() => {
        if (profile && !isAdmin(profile.role)) navigate('/', { replace: true })
    }, [profile, navigate])

    useEffect(() => {
        if (!electionId) return
        Promise.all([
            getElectionWithPositions(electionId),
            getAllCandidatesForAdmin(electionId),
        ])
            .then(([electionData, candidateData]) => {
                if (!electionData) return navigate('/admin/elections', { replace: true })
                setElection(electionData)
                setPositions(electionData.positions ?? [])
                setCandidates(candidateData)
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [electionId, navigate])

    async function handleReview(
        candidateId: string,
        status: 'approved' | 'rejected',
        reason?: string
    ) {
        await reviewCandidate(candidateId, status, reason)
        // Optimistic update
        setCandidates((prev) =>
            prev.map((c) =>
                c.id === candidateId
                    ? { ...c, status, rejection_reason: reason ?? null }
                    : c
            )
        )
    }

    if (loading) {
        return (
            <div dir="rtl" className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <span className="text-[15px] font-bold text-muted-foreground">جاري تحميل المرشحين...</span>
            </div>
        )
    }

    if (error || !election) {
        return (
            <div dir="rtl" className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="font-bold text-[14px]">{error ?? 'الانتخاب غير موجود.'}</span>
                </div>
            </div>
        )
    }

    // Count per status
    const counts = candidates.reduce<Record<string, number>>((acc, c) => {
        acc[c.status] = (acc[c.status] ?? 0) + 1
        return acc
    }, {})

    // Filter candidates
    const filtered = candidates
        .filter((c) => filter === 'all' || c.status === filter)
        .filter((c) => selectedPosition === 'all' || c.position_id === selectedPosition)

    // Group by position
    const grouped = positions.reduce<Record<string, Candidate[]>>((acc, p) => {
        acc[p.id] = filtered.filter((c) => c.position_id === p.id)
        return acc
    }, {})

    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-6 border-b border-border">
                    <Link
                        to={`/admin/elections`}
                        className="inline-flex items-center gap-2 text-[13px] font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border hover:text-foreground hover:bg-secondary/80 transition-all mb-6"
                    >
                        <ChevronRight size={16} />
                        العودة للانتخابات
                    </Link>

                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary rounded-2xl border border-border shadow-sm">
                                <ShieldCheck size={28} className="text-foreground opacity-80" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-foreground m-0 mb-1 tracking-tight">مراجعة المرشحين</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[14px] font-bold text-muted-foreground m-0">{election.title}</span>
                                    <ElectionStatusBadge status={election.status} size="sm" />
                                </div>
                            </div>
                        </div>

                        {/* Summary stats */}
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex flex-col items-center justify-center p-3 sm:px-4 bg-secondary border border-border rounded-xl shadow-sm min-w-[80px]">
                                <p className="text-xl font-extrabold text-amber-600 m-0 leading-none mb-1.5">{counts['pending'] ?? 0}</p>
                                <p className="text-[11px] font-bold text-muted-foreground m-0 uppercase tracking-wider">قيد الانتظار</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 sm:px-4 bg-secondary border border-border rounded-xl shadow-sm min-w-[80px]">
                                <p className="text-xl font-extrabold text-emerald-600 m-0 leading-none mb-1.5">{counts['approved'] ?? 0}</p>
                                <p className="text-[11px] font-bold text-muted-foreground m-0 uppercase tracking-wider">مقبول</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 sm:px-4 bg-secondary border border-border rounded-xl shadow-sm min-w-[80px]">
                                <p className="text-xl font-extrabold text-red-500 m-0 leading-none mb-1.5">{counts['rejected'] ?? 0}</p>
                                <p className="text-[11px] font-bold text-muted-foreground m-0 uppercase tracking-wider">مرفوض</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8">
                        {/* Status filter */}
                        <div className="flex items-center justify-between gap-1.5 bg-secondary border border-border rounded-xl p-1.5 shadow-sm overflow-x-auto scrollbar-hide">
                            {FILTER_TABS.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => setFilter(value)}
                                    className={`px-4 py-2 rounded-lg text-[13px] font-extrabold transition-all whitespace-nowrap shrink-0 ${filter === value
                                        ? 'bg-background text-foreground shadow-sm border border-border'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                        }`}
                                >
                                    {label}
                                    {value !== 'all' && counts[value]
                                        ? ` (${counts[value]})`
                                        : ''}
                                </button>
                            ))}
                        </div>

                        {/* Position filter */}
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="px-4 py-3 border border-border bg-card rounded-xl text-[13px] font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm appearance-none sm:min-w-[200px]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1rem center', backgroundSize: '1em' }}
                        >
                            <option value="all" className="font-extrabold">جميع المناصب</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id} className="font-bold">{p.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-border border-dashed rounded-3xl shadow-sm">
                        <ShieldCheck size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-[15px] font-bold text-muted-foreground m-0">لا يوجد مرشحين يطابقون هذا الفلتر.</p>
                    </div>
                ) : (
                    positions.map((position) => {
                        const positionCandidates = grouped[position.id] ?? []
                        if (positionCandidates.length === 0) return null

                        return (
                            <section key={position.id} className="space-y-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-lg font-extrabold text-foreground m-0">{position.title}</h2>
                                    <span className="text-[12px] font-bold text-muted-foreground bg-secondary border border-border px-2.5 py-1 rounded-full shadow-sm">
                                        {positionCandidates.length}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {positionCandidates.map((candidate) => (
                                        <CandidateReviewCard
                                            key={candidate.id}
                                            candidate={candidate}
                                            onReview={handleReview}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    })
                )}
            </div>
        </div>
    )
}