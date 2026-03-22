import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    Loader2,
    Plus,
    Settings2,
    Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
    getElections,
    updateElectionStatus,
    isAdmin,
} from '../../lib/elections'
import ElectionStatusBadge from '../../components/elections/Electionstatusbadge'
import type { Election, ElectionStatus } from '../../lib/elections'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ElectionWithCounts extends Election {
    position_count?: number
    candidate_count?: number
}

// ─── Phase advance map ────────────────────────────────────────────────────────

const NEXT_STATUS: Partial<Record<ElectionStatus, ElectionStatus>> = {
    draft: 'nomination',
    nomination: 'voting',
    voting: 'closed',
}

const NEXT_LABEL: Partial<Record<ElectionStatus, string>> = {
    draft: 'فتح باب الترشيح',
    nomination: 'بدء التصويت',
    voting: 'إغلاق الانتخاب',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminElectionsPage() {
    const navigate = useNavigate()
    const { profile } = useAuth()

    const [elections, setElections] = useState<ElectionWithCounts[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [advancingId, setAdvancingId] = useState<string | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{
        electionId: string
        title: string
        nextStatus: ElectionStatus
        label: string
    } | null>(null)

    // ── Auth guard ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (profile && !isAdmin(profile.role)) {
            navigate('/', { replace: true })
        }
    }, [profile, navigate])

    // ── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getElections()
                setElections(data as ElectionWithCounts[])
            } catch (err) {
                console.error(err)
                setError('فشل في تحميل الانتخابات.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // ── Handlers ───────────────────────────────────────────────────────────────

    const openConfirm = (election: ElectionWithCounts) => {
        const next = NEXT_STATUS[election.status]
        if (!next) return
        setConfirmDialog({
            electionId: election.id,
            title: election.title,
            nextStatus: next,
            label: NEXT_LABEL[election.status] ?? '',
        })
    }

    const handleAdvance = async () => {
        if (!confirmDialog) return
        setAdvancingId(confirmDialog.electionId)
        setConfirmDialog(null)
        try {
            await updateElectionStatus(confirmDialog.electionId, confirmDialog.nextStatus)
            setElections((prev) =>
                prev.map((e) =>
                    e.id === confirmDialog.electionId
                        ? { ...e, status: confirmDialog.nextStatus }
                        : e
                )
            )
        } catch (err) {
            console.error(err)
            setError('فشل في تغيير حالة الانتخاب. يرجى المحاولة مرة أخرى.')
        } finally {
            setAdvancingId(null)
        }
    }

    // ── Render: states ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[12px] font-bold text-muted-foreground uppercase opacity-80 mb-0.5 m-0">
                            لوحة التحكم
                        </p>
                        <h1 className="text-xl font-extrabold text-foreground m-0">الانتخابات</h1>
                    </div>
                    <Link
                        to="/admin/elections/new"
                        className="flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        إنشاء انتخاب
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700 shadow-sm">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 opacity-80" />
                        <p className="text-[14px] font-bold m-0">{error}</p>
                    </div>
                )}

                {/* Empty */}
                {elections.length === 0 && !error ? (
                    <div className="bg-card border border-border border-dashed rounded-3xl p-16 text-center shadow-sm">
                        <Settings2 className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                        <p className="font-bold text-muted-foreground m-0 mb-6 text-[15px]">لا توجد انتخابات بعد.</p>
                        <Link
                            to="/admin/elections/new"
                            className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-extrabold px-6 py-3 rounded-xl hover:bg-foreground/90 transition-all shadow-sm active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            إنشاء أول انتخاب
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Summary row */}
                        <p className="text-[13px] font-bold text-muted-foreground bg-secondary/50 border border-border px-4 py-2 rounded-xl inline-flex m-0 mb-2">
                            {elections.length} انتخاب
                        </p>

                        {/* Election cards */}
                        <div className="space-y-4">
                            {elections.map((election) => (
                                <ElectionRow
                                    key={election.id}
                                    election={election}
                                    advancing={advancingId === election.id}
                                    onAdvanceClick={() => openConfirm(election)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Confirm dialog */}
            {confirmDialog && (
                <ConfirmAdvanceDialog
                    title={confirmDialog.title}
                    label={confirmDialog.label}
                    nextStatus={confirmDialog.nextStatus}
                    onConfirm={handleAdvance}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    )
}

// ─── Election Row ─────────────────────────────────────────────────────────────

function ElectionRow({
    election,
    advancing,
    onAdvanceClick,
}: {
    election: ElectionWithCounts
    advancing: boolean
    onAdvanceClick: () => void
}) {
    const nextStatus = NEXT_STATUS[election.status]
    const nextLabel = NEXT_LABEL[election.status]
    const canAdvance = !!nextStatus

    return (
        <div className="bg-card border border-border hover:border-border/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-all">
            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                    <h2 className="text-lg font-extrabold text-foreground truncate m-0">
                        {election.title}
                    </h2>
                    <ElectionStatusBadge status={election.status} size="sm" />
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-bold text-muted-foreground opacity-90 p-3 bg-secondary/50 rounded-xl border border-border/50">
                    {election.position_count !== undefined && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-70"></span>
                            {election.position_count} منصب
                        </span>
                    )}
                    {election.candidate_count !== undefined && (
                        <span className="flex items-center gap-1.5 text-foreground/80">
                            <Users className="w-3.5 h-3.5 opacity-70" />
                            {election.candidate_count} مرشح
                        </span>
                    )}
                    {election.nomination_end && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-70"></span>
                            يُغلق الترشيح في{' '}
                            <span dir="ltr" className="inline-block text-foreground/80">{new Date(election.nomination_end).toLocaleDateString()}</span>
                        </span>
                    )}
                    {election.voting_end && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-70"></span>
                            يُغلق التصويت في{' '}
                            <span dir="ltr" className="inline-block text-foreground/80">{new Date(election.voting_end).toLocaleDateString()}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-border">
                <Link
                    to={`/admin/elections/${election.id}/candidates`}
                    className="text-[13px] font-extrabold text-foreground bg-secondary hover:bg-secondary/80 border border-border px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                    إدارة المرشحين
                </Link>
                <Link
                    to={`/elections/${election.id}/results`}
                    className="text-[13px] font-extrabold text-foreground bg-secondary hover:bg-secondary/80 border border-border px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                    مراقبة
                </Link>

                {canAdvance && (
                    <button
                        onClick={onAdvanceClick}
                        disabled={advancing}
                        className="flex items-center gap-2 text-[13px] font-extrabold text-background bg-foreground hover:bg-foreground/90 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        {advancing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ArrowLeft className="w-4 h-4 opacity-80" />
                        )}
                        {nextLabel}
                    </button>
                )}

                {election.status === 'closed' && (
                    <span className="text-[13px] font-extrabold text-red-500 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5">
                        مغلق
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmAdvanceDialog({
    title,
    label,
    nextStatus,
    onConfirm,
    onCancel,
}: {
    title: string
    label: string
    nextStatus: ElectionStatus
    onConfirm: () => void
    onCancel: () => void
}) {
    const statusColors: Record<ElectionStatus, string> = {
        draft: 'text-muted-foreground',
        nomination: 'text-blue-600',
        voting: 'text-emerald-600',
        closed: 'text-red-500',
    }

    const translatedStatus: Record<ElectionStatus, string> = {
        draft: 'مسودة',
        nomination: 'الترشيح',
        voting: 'التصويت',
        closed: 'مغلق',
    }

    return (
        <div dir="rtl" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card rounded-3xl shadow-xl shadow-foreground/5 border border-border max-w-sm w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
                {/* Icon */}
                <div className="w-14 h-14 bg-secondary border border-border rounded-2xl flex items-center justify-center">
                    <ArrowLeft className="w-6 h-6 text-foreground opacity-80" />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h3 className="text-xl font-extrabold text-foreground m-0">{label}؟</h3>
                    <p className="text-[15px] font-medium text-muted-foreground leading-relaxed m-0">
                        أنت على وشك نقل{' '}
                        <span className="font-extrabold text-foreground">"{title}"</span> إلى مرحلة{' '}
                        <span className={`font-extrabold ${statusColors[nextStatus]}`}>
                            {translatedStatus[nextStatus]}
                        </span>
                        . لا يمكن التراجع عن هذا الإجراء.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-5 py-3.5 text-[15px] font-extrabold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-5 py-3.5 text-[15px] font-extrabold text-background bg-foreground hover:bg-foreground/90 shadow-sm rounded-xl transition-all active:scale-95"
                    >
                        تأكيد
                    </button>
                </div>
            </div>
        </div>
    )
}