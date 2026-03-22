import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowRight,
    BarChart2,
    CheckCircle2,
    Loader2,
    Radio,
    Trophy,
    Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
    getElectionWithPositions,
    getElectionResults,
    canViewResults,
} from '../../lib/elections'
import { supabase } from '../../integrations/supabase/client'
import type { Election, ElectionResult } from '../../lib/elections'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PositionResultGroup {
    positionId: string
    positionTitle: string
    totalVotes: number
    candidates: ElectionResult[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupResults(results: ElectionResult[]): PositionResultGroup[] {
    const map = new Map<string, PositionResultGroup>()

    for (const r of results) {
        if (!map.has(r.position_id)) {
            map.set(r.position_id, {
                positionId: r.position_id,
                positionTitle: r.position_title,
                totalVotes: 0,
                candidates: [],
            })
        }
        const group = map.get(r.position_id)!
        group.candidates.push(r)
        group.totalVotes += r.vote_count
    }

    // Sort candidates within each group by rank
    map.forEach((group) => {
        group.candidates.sort((a, b) => a.rank_in_position - b.rank_in_position)
    })

    return Array.from(map.values())
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
    const { electionId } = useParams<{ electionId: string }>()
    const navigate = useNavigate()
    const { profile } = useAuth()

    const [election, setElection] = useState<Election | null>(null)
    const [groups, setGroups] = useState<PositionResultGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [liveIndicator, setLiveIndicator] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    // ── Fetch results ──────────────────────────────────────────────────────────

    const fetchResults = useCallback(async () => {
        if (!electionId) return
        try {
            const data = await getElectionResults(electionId)
            setGroups(groupResults(data))
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to refresh results:', err)
        }
    }, [electionId])

    // ── Initial load ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (!electionId) return

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const electionData = await getElectionWithPositions(electionId)

                if (!electionData) {
                    setError('الانتخاب غير موجود.')
                    return
                }

                // Phase guard: only voting or closed
                if (!canViewResults(electionData.status)) {
                    navigate(`/elections/${electionId}`, { replace: true })
                    return
                }

                setElection(electionData)

                const resultsData = await getElectionResults(electionId)
                setGroups(groupResults(resultsData))
                setLastUpdated(new Date())
            } catch (err) {
                console.error(err)
                setError('فشل في تحميل النتائج. يرجى المحاولة مرة أخرى.')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [electionId, navigate])

    // ── Realtime subscription (only during voting) ─────────────────────────────

    useEffect(() => {
        if (!election || election.status !== 'voting' || !electionId) return

        const channel = supabase
            .channel(`votes:election:${electionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votes',
                    filter: `election_id=eq.${electionId}`,
                },
                () => {
                    // Flash live indicator
                    setLiveIndicator(true)
                    setTimeout(() => setLiveIndicator(false), 1200)
                    // Re-fetch results
                    fetchResults()
                }
            )
            .subscribe()

        channelRef.current = channel

        return () => {
            channel.unsubscribe()
            channelRef.current = null
        }
    }, [election, electionId, fetchResults])

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

    const isLive = election.status === 'voting'
    const isClosed = election.status === 'closed'

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
            <div className="bg-card border-b border-border relative overflow-hidden sticky top-[73px] z-40 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        to={`/elections/${electionId}`}
                        className="bg-secondary p-2 rounded-xl border border-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center gap-1.5 font-bold text-sm shrink-0"
                        aria-label="الرجوع للانتخاب"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-muted-foreground uppercase m-0 opacity-80 mb-0.5">
                            النتائج
                        </p>
                        <h1 className="text-[17px] font-extrabold text-foreground truncate m-0">
                            {election.title}
                        </h1>
                    </div>

                    {/* Live badge */}
                    {isLive && (
                        <div
                            className={`flex items-center shrink-0 border gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${liveIndicator
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'bg-red-50 text-red-600 border-red-200/50'
                                }`}
                        >
                            <Radio
                                className={`w-3.5 h-3.5 ${liveIndicator ? 'text-emerald-500 animate-pulse' : 'text-red-500 animate-pulse'}`}
                            />
                            {liveIndicator ? 'تم التحديث' : 'مباشر'}
                        </div>
                    )}

                    {isClosed && (
                        <div className="flex items-center shrink-0 border gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-foreground border-border">
                            <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
                            نهائي
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">
                {/* Sub-header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-secondary/50 p-4 rounded-2xl border border-border">
                    <div className="flex items-center gap-2.5 text-[14px] font-bold text-muted-foreground m-0">
                        <BarChart2 className="w-4 h-4 opacity-70" />
                        {isLive
                            ? 'إحصاء مباشر للأصوات — يتم التحديث تلقائياً'
                            : 'نتائج الانتخاب النهائية'}
                    </div>
                    {lastUpdated && (
                        <p className="text-[12px] font-bold text-muted-foreground opacity-60 m-0">
                            آخر تحديث {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {groups.length === 0 ? (
                    <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center shadow-sm">
                        <BarChart2 className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                        <p className="font-bold text-muted-foreground m-0">لا توجد نتائج بعد.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groups.map((group) => (
                            <PositionResultCard
                                key={group.positionId}
                                group={group}
                                isClosed={isClosed}
                            />
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    )
}

// ─── Position Result Card ─────────────────────────────────────────────────────

function PositionResultCard({
    group,
    isClosed,
}: {
    group: PositionResultGroup
    isClosed: boolean
}) {
    const maxVotes = group.candidates[0]?.vote_count ?? 0

    return (
        <section className="bg-card border border-border shadow-sm rounded-3xl p-6 relative overflow-hidden">
            {/* Position header */}
            <div className="mb-6 relative z-10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-80 m-0">
                    المنصب
                </p>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-foreground m-0 tracking-tight">
                        {group.positionTitle}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground bg-secondary px-3 py-1.5 border border-border rounded-lg m-0">
                        <Users className="w-4 h-4 opacity-70" />
                        {group.totalVotes} صوت
                    </div>
                </div>
            </div>

            {/* Winner banner (closed only) */}
            {isClosed && group.candidates[0] && group.candidates[0].vote_count > 0 && (
                <WinnerBanner candidate={group.candidates[0]} />
            )}

            {/* Candidate bars */}
            <div className="bg-background border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/50 relative z-10">
                {group.candidates.map((candidate) => {
                    const pct =
                        group.totalVotes > 0
                            ? Math.round((candidate.vote_count / group.totalVotes) * 100)
                            : 0
                    const barWidth =
                        maxVotes > 0
                            ? Math.round((candidate.vote_count / maxVotes) * 100)
                            : 0
                    const isLeader = candidate.rank_in_position === 1 && group.totalVotes > 0

                    return (
                        <div key={candidate.candidate_id} className="p-4 sm:p-5 hover:bg-secondary/30 transition-colors">
                            <div className="flex items-center gap-4 mb-3.5">
                                {/* Avatar */}
                                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-secondary border border-border/50 flex items-center justify-center">
                                    {candidate.photo_url ? (
                                        <img
                                            src={candidate.photo_url}
                                            alt={candidate.candidate_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground opacity-70">
                                            {candidate.candidate_name?.charAt(0) ?? '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Name + stats */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <p
                                            className={`text-[15px] sm:text-[16px] font-extrabold truncate m-0 ${isLeader ? 'text-foreground' : 'text-muted-foreground/90'}`}
                                        >
                                            {candidate.candidate_name}
                                        </p>
                                        {isLeader && group.totalVotes > 0 && (
                                            <Trophy className="w-4 h-4 text-amber-500 shrink-0 mb-0.5" />
                                        )}
                                    </div>
                                    <p className="text-[12px] sm:text-[13px] font-bold text-muted-foreground opacity-80 mt-1 m-0">نسبة التصويت: <span dir="ltr" className="inline-block">{pct}%</span></p>
                                </div>

                                {/* Vote count */}
                                <div className="text-left shrink-0 min-w-[50px]">
                                    <p
                                        className={`text-xl font-extrabold m-0 leading-none mb-1 ${isLeader ? 'text-foreground' : 'text-muted-foreground'}`}
                                    >
                                        {candidate.vote_count}
                                    </p>
                                    <p className="text-[11px] font-bold text-muted-foreground opacity-70 m-0">صوت</p>
                                </div>
                            </div>

                            {/* Bar */}
                            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/30">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out flex justify-end ${isLeader
                                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                        : 'bg-muted-foreground/40'
                                        }`}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

// ─── Winner Banner ────────────────────────────────────────────────────────────

function WinnerBanner({ candidate }: { candidate: ElectionResult }) {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-5 sm:p-6 flex items-center gap-4.5 mb-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            {/* Avatar */}
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-amber-100/80 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center relative z-10 shadow-inner">
                {candidate.photo_url ? (
                    <img
                        src={candidate.photo_url}
                        alt={candidate.candidate_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
                )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 relative z-10 flex flex-col justify-center">
                <p className="text-[11px] sm:text-[12px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1.5 opacity-90 m-0">
                    🏆 الفائز
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-foreground truncate m-0 mb-1">
                    {candidate.candidate_name}
                </p>
                <p className="text-[13px] sm:text-[14px] font-bold text-muted-foreground/90 m-0">
                    {candidate.vote_count} صوت
                </p>
            </div>
        </div>
    )
}