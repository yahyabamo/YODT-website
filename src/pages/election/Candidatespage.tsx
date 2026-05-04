import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowRight,
    ChevronLeft,
    Loader2,
    UserCircle2,
    Vote,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
    getApprovedCandidates,
    getElectionWithPositions,
    canVote,
} from '../../lib/elections'
import type { Candidate, Election, Position } from '../../lib/elections'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidateWithProfile extends Candidate {
    profile?: {
        full_name: string
        faculty: string | null
        avatar_url: string | null
        student_id?: string | null
    }
}

interface PositionGroup {
    position: Position
    candidates: CandidateWithProfile[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CandidatesPage() {
    const { electionId } = useParams<{ electionId: string }>()
    const navigate = useNavigate()
    const { profile } = useAuth()

    const [election, setElection] = useState<Election | null>(null)
    const [groups, setGroups] = useState<PositionGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activePositionId, setActivePositionId] = useState<string | null>(null)
    const [showSearch, setShowSearch] = useState(false)

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

    // ── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!electionId) return

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const [electionData, candidatesData] = await Promise.all([
                    getElectionWithPositions(electionId),
                    getApprovedCandidates(electionId),
                ])

                if (!electionData) {
                    setError('الانتخاب غير موجود.')
                    return
                }

                // Phase guard: hide in draft
                if (electionData.status === 'draft') {
                    navigate(`/elections/${electionId}`, { replace: true })
                    return
                }

                setElection(electionData)

                // Group candidates by position, preserving positions sort_order
                const positions: Position[] = electionData.positions ?? []
                const grouped: PositionGroup[] = positions.map((pos) => ({
                    position: pos,
                    candidates: (candidatesData as CandidateWithProfile[]).filter(
                        (c) => c.position_id === pos.id
                    ),
                }))

                setGroups(grouped)
                if (positions.length > 0) setActivePositionId(positions[0].id)
            } catch (err) {
                console.error(err)
                setError('فشل في تحميل المرشحين. يرجى المحاولة مرة أخرى.')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [electionId, navigate])

    // ── Scroll spy ─────────────────────────────────────────────────────────────

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActivePositionId(entry.target.id)
                    }
                })
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        )

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [groups])

    // ── Helpers ────────────────────────────────────────────────────────────────

    const scrollToPosition = (positionId: string) => {
        const el = sectionRefs.current[positionId]
        if (el) {
            const offset = 140 // Add padding for double header (topbar + sticky positions tape)
            const top = el.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top, behavior: 'smooth' })
        }
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

    if (error || !election) {
        return (
            <div dir="rtl" className="min-h-screen bg-background flex flex-col">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex items-center gap-3 max-w-md w-full text-red-700 shadow-sm">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 opacity-80" />
                        <p className="font-bold">{error ?? 'حدث خطأ ما.'}</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    const votingOpen = canVote(election.status)
    const totalCandidates = groups.reduce((n, g) => n + g.candidates.length, 0)

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            {/* Topbar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            {/* Header section */}
            <div className="bg-card border-b border-border relative overflow-hidden sticky top-[73px] z-40">
                <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/elections/${electionId}`}
                            className="bg-secondary p-2 rounded-xl border border-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center gap-1.5 font-bold text-sm"
                            aria-label="الرجوع للانتخاب"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span className="hidden sm:inline">رجوع</span>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-xl font-extrabold text-foreground truncate m-0">
                                المرشحون
                            </h1>
                            <p className="text-[13px] font-bold text-muted-foreground truncate m-0 opacity-80">
                                {election.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex-shrink-0 bg-secondary/50 px-4 py-1.5 rounded-full border border-border">
                        <p className="text-xs font-bold text-muted-foreground m-0">
                            {totalCandidates} مرشح معتمد في {groups.length} مناصب
                        </p>
                    </div>
                </div>

                {/* Position filter pills */}
                {groups.length > 1 && (
                    <div className="max-w-4xl mx-auto px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide snap-x">
                        {groups.map(({ position }) => (
                            <button
                                key={position.id}
                                onClick={() => scrollToPosition(position.id)}
                                className={`shrink-0 px-5 py-2 rounded-xl text-sm font-extrabold transition-all border-2 snap-center ${activePositionId === position.id
                                    ? 'bg-foreground text-background border-foreground shadow-md -translate-y-0.5'
                                    : 'bg-secondary text-foreground border-border hover:bg-secondary/80 hover:border-muted-foreground/30'
                                    }`}
                            >
                                {position.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Body */}
            <main className="max-w-4xl mx-auto px-6 py-10 space-y-16">
                {groups.length === 0 ? (
                    <div className="bg-card border border-border flex flex-col items-center rounded-3xl p-12 text-center shadow-sm">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 border border-border">
                            <UserCircle2 className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-extrabold text-foreground mb-2">لا يوجد مرشحون بعد</h3>
                        <p className="text-muted-foreground font-medium max-w-sm mx-auto">لم يتم اعتماد أي مرشحين حتى الآن لهذا الانتخاب.</p>
                    </div>
                ) : (
                    groups.map(({ position, candidates }) => (
                        <section
                            key={position.id}
                            id={position.id}
                            ref={(el) => {
                                sectionRefs.current[position.id] = el
                            }}
                            className="scroll-mt-[160px]"
                        >
                            {/* Position header */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 rounded-full bg-blue-500 shrink-0" />
                                <div>
                                    <h2 className="text-2xl font-extrabold text-foreground m-0 tracking-tight flex items-center gap-2">
                                        {position.title}
                                        <span className="text-xs font-bold bg-secondary/80 border border-border text-foreground px-2 py-0.5 rounded-md self-center">{candidates.length}</span>
                                    </h2>
                                    {position.description && (
                                        <p className="text-[15px] font-medium text-muted-foreground mt-1 mb-2 leading-relaxed max-w-2xl">
                                            {position.description}
                                        </p>
                                    )}
                                    <div className="flex gap-4 items-center mt-2">
                                        <span className="text-[13px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 inline-block">
                                            انتخاب {position.max_winners} فائز{position.max_winners > 1 ? 'ين' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {candidates.length === 0 ? (
                                <div className="bg-card border border-border border-dashed rounded-3xl p-8 text-center bg-secondary/20">
                                    <p className="text-muted-foreground font-bold text-sm">
                                        لا يوجد مرشحون معتمدون لهذا المنصب.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {candidates.map((candidate) => (
                                        <CandidateCard
                                            key={candidate.id}
                                            candidate={candidate}
                                            electionId={electionId!}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    ))
                )}


            </main>

            {/* Sticky "Go vote" CTA */}
            {votingOpen && (
                <div className="fixed bottom-20 sm:bottom-16 z-50 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-6 py-4 flex justify-center">
                    <Link
                        to={`/elections/${electionId}/voting`}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center"
                    >
                        <Vote className="w-5 h-5" />
                        صوّت الآن
                    </Link>
                </div>
            )}

            <BottomNav />
        </div>
    )
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({
    candidate,
    electionId,
}: {
    candidate: CandidateWithProfile
    electionId: string
}) {
    const name = candidate.profile?.full_name ?? 'غير معروف'
    const faculty = candidate.profile?.faculty ?? null
    const avatarUrl = candidate.photo_url ?? candidate.profile?.avatar_url ?? null

    return (
        <Link
            to={`/elections/${electionId}/candidates/${candidate.id}/profile`}
            className="group bg-card border-border hover:border-emerald-500/30 border-2 rounded-3xl p-5 flex gap-5 hover:bg-emerald-50/50 transition-all shadow-sm hover:shadow-md"
        >
            {/* Avatar */}
            <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-secondary border border-border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <UserCircle2 className="w-10 h-10 text-muted-foreground opacity-50" />
                )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 flex flex-col justify-center">
                <p className="font-extrabold text-foreground text-[16px] truncate leading-tight group-hover:text-emerald-700 transition-colors uppercase m-0">{name}</p>
                {faculty && (
                    <p className="text-[12px] font-bold text-muted-foreground truncate opacity-80 mt-1 m-0">{faculty}</p>
                )}
                {candidate.bio && (
                    <p className="text-[13px] font-medium text-muted-foreground mt-2 line-clamp-2 leading-relaxed m-0 border-t border-border pt-2 italic">
                        "{candidate.bio}"
                    </p>
                )}
            </div>

            {/* Arrow */}
            <div className="shrink-0 self-center w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
            </div>
        </Link>
    )
}