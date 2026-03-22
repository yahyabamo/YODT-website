import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    Loader2,
    PartyPopper,
    UserCircle2,
    Vote,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
    castVote,
    getApprovedCandidates,
    getElectionWithPositions,
    getMyVotes,
} from '../../lib/elections'
import type { Candidate, Election, Position, Vote as VoteType } from '../../lib/elections'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidateWithProfile extends Candidate {
    profiles?: {
        full_name: string
        faculty: string | null
        avatar_url: string | null
    }
}

interface PositionStep {
    position: Position
    candidates: CandidateWithProfile[]
}

type StepState = 'pending' | 'voting' | 'voted' | 'skipped'

// ─── Component ────────────────────────────────────────────────────────────────

export default function VotingPage() {
    const { electionId } = useParams<{ electionId: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const preselectedCandidateId = searchParams.get('candidate') ?? null

    const [election, setElection] = useState<Election | null>(null)
    const [steps, setSteps] = useState<PositionStep[]>([])
    const [myVotes, setMyVotes] = useState<VoteType[]>([])
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [selections, setSelections] = useState<Record<string, string>>({}) // positionId → candidateId
    const [submitting, setSubmitting] = useState(false)
    const [stepError, setStepError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [pageError, setPageError] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    // ── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!electionId) return

        const load = async () => {
            setLoading(true)
            setPageError(null)
            try {
                const [electionData, candidatesData, votesData] = await Promise.all([
                    getElectionWithPositions(electionId),
                    getApprovedCandidates(electionId),
                    user ? getMyVotes(electionId) : Promise.resolve([]),
                ])

                if (!electionData) {
                    setPageError('الانتخاب غير موجود.')
                    return
                }

                // Phase guard: only accessible during voting
                if (electionData.status !== 'voting') {
                    navigate(`/elections/${electionId}`, { replace: true })
                    return
                }

                setElection(electionData)
                setMyVotes(votesData)

                const positions: Position[] = electionData.positions ?? []

                const built: PositionStep[] = positions.map((pos) => ({
                    position: pos,
                    candidates: (candidatesData as CandidateWithProfile[]).filter(
                        (c) => c.position_id === pos.id
                    ),
                }))

                setSteps(built)

                // Pre-select from URL param
                if (preselectedCandidateId) {
                    const targetStep = built.findIndex((s) =>
                        s.candidates.some((c) => c.id === preselectedCandidateId)
                    )
                    const matchingStep = built[targetStep]
                    if (matchingStep) {
                        const preselected: Record<string, string> = {}
                        preselected[matchingStep.position.id] = preselectedCandidateId
                        setSelections(preselected)
                        // Navigate to the matching step if not already voted
                        const alreadyVoted = votesData.some(
                            (v) => v.position_id === matchingStep.position.id
                        )
                        if (!alreadyVoted && targetStep >= 0) {
                            setCurrentStepIndex(targetStep)
                        }
                    }
                }

                // If every position already has a vote, go straight to done
                const allVoted =
                    built.length > 0 &&
                    built.every((s) =>
                        votesData.some((v) => v.position_id === s.position.id)
                    )
                if (allVoted) setDone(true)
            } catch (err) {
                console.error(err)
                setPageError('فشل في تحميل صفحة التصويت. يرجى المحاولة مرة أخرى.')
            } finally {
                setLoading(false)
            }
        }

        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [electionId, user])

    // ── Derived state ──────────────────────────────────────────────────────────

    const stepStates = useMemo<StepState[]>(() => {
        return steps.map((s) => {
            if (myVotes.some((v) => v.position_id === s.position.id)) return 'voted'
            return 'pending'
        })
    }, [steps, myVotes])

    const currentStep = steps[currentStepIndex]
    const currentState = stepStates[currentStepIndex]
    const currentSelection = currentStep
        ? selections[currentStep.position.id] ?? null
        : null

    const votedCount = stepStates.filter((s) => s === 'voted').length

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleSelect = (candidateId: string) => {
        if (!currentStep) return
        setStepError(null)
        setSelections((prev) => ({
            ...prev,
            [currentStep.position.id]: candidateId,
        }))
    }

    const handleVote = async () => {
        if (!currentStep || !currentSelection || !electionId) return
        setSubmitting(true)
        setStepError(null)

        try {
            await castVote({
                election_id: electionId,
                position_id: currentStep.position.id,
                candidate_id: currentSelection,
            })

            // Refresh votes
            if (user) {
                const updated = await getMyVotes(electionId)
                setMyVotes(updated)

                // Check if all done
                const allDone = steps.every((s) =>
                    updated.some((v) => v.position_id === s.position.id)
                )
                if (allDone) {
                    setDone(true)
                    return
                }
            }

            // Advance to next unvoted step
            advanceToNext()
        } catch (err: unknown) {
            const pgError = err as { code?: string; message?: string }
            if (pgError?.code === '23505') {
                setStepError('لقد قمت بالتصويت لهذا المنصب بالفعل.')
            } else {
                setStepError('فشل في تسجيل التصويت. يرجى المحاولة مرة أخرى.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const advanceToNext = () => {
        const nextIndex = steps.findIndex(
            (s, i) =>
                i > currentStepIndex &&
                !myVotes.some((v) => v.position_id === s.position.id)
        )
        if (nextIndex >= 0) {
            setCurrentStepIndex(nextIndex)
        } else {
            setDone(true)
        }
    }

    const goToStep = (index: number) => {
        setStepError(null)
        setCurrentStepIndex(index)
    }

    // ── Render: states ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen bg-background flex flex-col">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
                <BottomNav />
            </div>
        )
    }

    if (pageError || !election) {
        return (
            <div dir="rtl" className="min-h-screen bg-background flex flex-col">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex items-center gap-3 max-w-md w-full text-red-700 shadow-sm">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 opacity-80" />
                        <p className="font-bold">{pageError ?? 'حدث خطأ ما.'}</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    // ── Done screen ────────────────────────────────────────────────────────────

    if (done) {
        return (
            <div dir="rtl" className="min-h-screen bg-background flex flex-col">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="flex-1 flex items-center justify-center p-6 pb-32">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="bg-card border-2 border-emerald-500/20 rounded-3xl p-10 shadow-lg shadow-emerald-500/5 bg-gradient-to-br from-card to-emerald-50/20">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-200">
                                <PartyPopper className="w-12 h-12 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-foreground tracking-tight m-0 mb-3">
                                    تم استلام تصويتاتك!
                                </h2>
                                <p className="text-[15px] font-medium text-muted-foreground leading-relaxed mt-2 mb-8 md:px-4">
                                    شكراً لمشاركتك في{' '}
                                    <span className="font-extrabold text-foreground">
                                        {election.title}
                                    </span>
                                    . تم تسجيل تصويتاتك بأمان.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to={`/elections/${electionId}/candidates`}
                                    className="px-6 py-3.5 text-sm font-extrabold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all shadow-sm"
                                >
                                    عرض المرشحين
                                </Link>
                                <Link
                                    to={`/elections`}
                                    className="px-6 py-3.5 text-sm font-extrabold text-background bg-foreground hover:bg-foreground/90 rounded-xl transition-all shadow-sm"
                                >
                                    جميع الانتخابات
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    // ── Main voting UI ─────────────────────────────────────────────────────────

    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            {/* Topbar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            {/* Header section with progress */}
            <div className="bg-card border-b border-border relative overflow-hidden sticky top-[73px] z-40 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        to={`/elections/${electionId}`}
                        className="bg-secondary p-2 rounded-xl border border-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center gap-1.5 font-bold text-sm shrink-0"
                        aria-label="الرجوع للانتخاب"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-muted-foreground uppercase m-0 opacity-80 mb-0.5">
                            التصويت
                        </p>
                        <h1 className="text-[17px] font-extrabold text-foreground truncate m-0">
                            {election.title}
                        </h1>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground shrink-0 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                        {votedCount} من {steps.length} تم التصويت
                    </span>
                </div>

                {/* Step progress bar */}
                <div className="max-w-3xl mx-auto px-6 pb-4">
                    <div className="w-full bg-secondary rounded-full h-2 border border-border/50 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{
                                width: `${steps.length > 0 ? (votedCount / steps.length) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
                {/* Step navigator pills */}
                {steps.length > 1 && (
                    <div className="flex gap-2.5 flex-wrap overflow-x-auto pb-2 scrollbar-hide">
                        {steps.map((s, i) => {
                            const state = stepStates[i]
                            const isActive = i === currentStepIndex
                            return (
                                <button
                                    key={s.position.id}
                                    onClick={() => goToStep(i)}
                                    className={`flex items-center shrink-0 gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all border-2 ${isActive
                                        ? 'bg-foreground text-background border-foreground shadow-md -translate-y-0.5'
                                        : state === 'voted'
                                            ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
                                            : 'bg-card text-foreground border-border hover:bg-secondary hover:border-muted-foreground/30'
                                        }`}
                                >
                                    {state === 'voted' && (
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    )}
                                    {s.position.title}
                                </button>
                            )
                        })}
                    </div>
                )}

                {currentStep ? (
                    <div className="bg-card border border-border shadow-sm rounded-3xl p-6 sm:p-8 relative">
                        {/* Position header */}
                        <div className="mb-8">
                            <p className="text-xs font-bold text-emerald-600 mb-2">
                                خطوة {currentStepIndex + 1} من {steps.length}
                            </p>
                            <h2 className="text-2xl font-extrabold text-foreground m-0 tracking-tight flex items-center gap-3">
                                {currentStep.position.title}
                            </h2>
                            {currentStep.position.description && (
                                <p className="text-[15px] font-medium text-muted-foreground mt-2 leading-relaxed">
                                    {currentStep.position.description}
                                </p>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <p className="text-[13px] font-bold bg-secondary text-foreground px-3 py-1.5 rounded-lg border border-border m-0 inline-flex items-center gap-1.5">
                                    <UserCircle2 className="w-4 h-4 opacity-50" />
                                    اختر مرشحاً واحداً
                                </p>
                                <p className="text-[13px] font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 m-0 inline-flex items-center gap-1.5">
                                    انتخاب {currentStep.position.max_winners} فائز{currentStep.position.max_winners > 1 ? 'ين' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Already voted notice */}
                        {currentState === 'voted' ? (
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 text-emerald-800 my-8">
                                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[17px] mb-1 m-0">تم التصويت</h3>
                                    <p className="text-[14px] font-medium opacity-90 m-0">
                                        لقد قمت بالتصويت لهذا المنصب بالفعل. لا يمكنك التصويت مرة أخرى لهذا المنصب.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Candidate list */}
                                {currentStep.candidates.length === 0 ? (
                                    <div className="bg-secondary/20 border border-border border-dashed rounded-3xl p-10 text-center">
                                        <p className="text-sm font-bold text-muted-foreground m-0">
                                            لا يوجد مرشحون معتمدون لهذا المنصب.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {currentStep.candidates.map((candidate) => {
                                            const name =
                                                candidate.profiles?.full_name ?? 'غير معروف'
                                            const faculty = candidate.profiles?.faculty ?? null
                                            const avatarUrl =
                                                candidate.photo_url ??
                                                candidate.profiles?.avatar_url ??
                                                null
                                            const isSelected = currentSelection === candidate.id

                                            return (
                                                <button
                                                    key={candidate.id}
                                                    onClick={() => handleSelect(candidate.id)}
                                                    className={`w-full text-right bg-card border-2 rounded-2xl p-4 sm:p-5 flex gap-4 transition-all group ${isSelected
                                                        ? 'border-emerald-500 bg-emerald-50/30 shadow-md shadow-emerald-500/10'
                                                        : 'border-border hover:border-emerald-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {/* Avatar */}
                                                    <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-secondary flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform duration-300">
                                                        {avatarUrl ? (
                                                            <img
                                                                src={avatarUrl}
                                                                alt={name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserCircle2 className="w-8 h-8 text-muted-foreground opacity-50" />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                                                        <p className="font-extrabold text-foreground text-[16px] truncate m-0 group-hover:text-emerald-700 transition-colors">
                                                            {name}
                                                        </p>
                                                        {faculty && (
                                                            <p className="text-[12px] font-bold text-muted-foreground truncate opacity-80 mt-1 m-0">
                                                                {faculty}
                                                            </p>
                                                        )}
                                                        {candidate.bio && (
                                                            <p className="text-[13px] font-medium text-muted-foreground mt-2 line-clamp-2 leading-relaxed m-0 border-t border-border pt-1">
                                                                "{candidate.bio}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Radio indicator */}
                                                    <div className="shrink-0 self-center me-2">
                                                        <div
                                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                                                                ? 'border-emerald-500 bg-emerald-500 shadow-sm shadow-emerald-500/30 scale-110'
                                                                : 'border-muted-foreground/30 group-hover:border-emerald-400'
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Error */}
                                {stepError && (
                                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 shadow-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0 opacity-80" />
                                        <p className="text-[14px] font-bold m-0">{stepError}</p>
                                    </div>
                                )}

                                {/* Action bar */}
                                <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                                    {/* Back | Candidate profile link */}
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        {currentStepIndex > 0 && (
                                            <button
                                                onClick={() => goToStep(currentStepIndex - 1)}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[14px] font-extrabold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border px-5 py-3.5 rounded-xl transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                                رجوع
                                            </button>
                                        )}
                                        {currentSelection && (
                                            <Link
                                                to={`/elections/${electionId}/candidates/${currentSelection}`}
                                                className="hidden sm:flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground hover:text-emerald-600 transition-colors"
                                            >
                                                الملف الشخصي
                                                <ChevronLeft className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Submit button */}
                                    <div className="w-full sm:w-auto">
                                        <button
                                            onClick={handleVote}
                                            disabled={!currentSelection || submitting}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:translate-y-0 hover:-translate-y-0.5 disabled:hover:translate-y-0"
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Vote className="w-5 h-5" />
                                            )}
                                            {submitting ? 'جاري تسجيل التصويت...' : 'تصويت'}
                                            {!submitting && (
                                                <ArrowLeft className="w-4 h-4 opacity-80" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigate next if already voted */}
                        {currentState === 'voted' && currentStepIndex < steps.length - 1 && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => goToStep(currentStepIndex + 1)}
                                    className="flex items-center gap-2 text-[15px] font-extrabold text-foreground bg-secondary hover:bg-secondary/80 border border-border px-8 py-4 rounded-xl transition-all"
                                >
                                    المنصب التالي
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
                        <p className="text-[15px] font-bold text-muted-foreground m-0">
                            لا توجد مناصب متاحة لهذا الانتخاب.
                        </p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    )
}