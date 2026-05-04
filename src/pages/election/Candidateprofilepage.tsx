import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Loader2,
    ScrollText,
    UserCircle2,
    Vote,
    Fingerprint
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
    canVote,
    getElectionWithPositions,
    getMyVotes,
} from '../../lib/elections'
import { supabase } from '../../integrations/supabase/client'
import type { Candidate, Election, Vote as VoteType } from '../../lib/elections'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidateWithProfile extends Candidate {
    profile: {
        full_name: string
        faculty: string | null
        student_id?: string | null
        avatar_url: string | null
    }
    positions?: {
        title: string
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CandidateProfilePage() {
    const { electionId, candidateId } = useParams<{
        electionId: string
        candidateId: string
    }>()
    const navigate = useNavigate()
    const { profile, user } = useAuth()

    const [election, setElection] = useState<Election | null>(null)
    const [candidate, setCandidate] = useState<CandidateWithProfile | null>(null)
    const [myVotes, setMyVotes] = useState<VoteType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSearch, setShowSearch] = useState(false)

    // ── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!electionId || !candidateId) return

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                // Fetch candidate with profile join
                const { data: candidateData, error: candidateErr } = await supabase
                    .from('candidates')
                    .select(
                        `
            *,
            profile:member_id (full_name, faculty, student_id, avatar_url),
            positions:position_id (title)
          `
                    )
                    .eq('id', candidateId)
                    .eq('election_id', electionId)
                    .eq('status', 'approved')
                    .single()

                if (candidateErr || !candidateData) {
                    setError('المرشح غير موجود أو غير معتمد.')
                    return
                }

                // Fetch election
                const electionData = await getElectionWithPositions(electionId)
                if (!electionData) {
                    setError('الانتخاب غير موجود.')
                    return
                }

                // Phase guard: hide in draft
                if (electionData.status === 'draft') {
                    navigate(`/elections/${electionId}`, { replace: true })
                    return
                }

                setCandidate(candidateData as CandidateWithProfile)
                setElection(electionData)

                // Load my votes (only when logged in)
                if (user) {
                    const votes = await getMyVotes(electionId)
                    setMyVotes(votes)
                }
            } catch (err) {
                console.error(err)
                setError('فشل في تحميل المرشح. يرجى المحاولة مرة أخرى.')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [electionId, candidateId, user, navigate])

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

    if (error || !candidate || !election) {
        return (
            <div dir="rtl" className="min-h-screen bg-background flex flex-col">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex flex-col items-center gap-4 max-w-md w-full text-red-700 shadow-sm text-center">
                        <AlertCircle className="w-12 h-12 shrink-0 opacity-80" />
                        <p className="font-extrabold text-lg">{error ?? 'حدث خطأ ما.'}</p>
                        <Link to={`/elections/${electionId}/candidates`} className="mt-2 bg-red-100 text-red-800 px-6 py-2 rounded-xl font-bold hover:bg-red-200 transition-colors">
                            العودة لقائمة المرشحين
                        </Link>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    const name = candidate.profile?.full_name ?? 'غير معروف'
    const faculty = candidate.profile?.faculty ?? null
    const studentId = candidate.profile?.student_id ?? null
    const avatarUrl = candidate.photo_url ?? candidate.profile?.avatar_url ?? null
    const positionTitle = candidate.positions?.title ?? 'منصب غير معروف'

    const votingOpen = canVote(election.status)

    // Check if user already voted for this candidate's position
    const alreadyVotedThisPosition = myVotes.some(
        (v) => v.position_id === candidate.position_id
    )

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            {/* Topbar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            {/* Header Sticky Action */}
            <div className="bg-card border-b border-border relative overflow-hidden sticky top-[73px] z-40">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        to={`/elections/${electionId}/candidates`}
                        className="bg-secondary p-2 rounded-xl border border-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center gap-1.5 font-bold text-sm"
                        aria-label="الرجوع لقائمة المرشحين"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span className="hidden sm:inline">المرشحون</span>
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-[17px] font-extrabold text-foreground truncate m-0">
                            الملف الشخصي للمرشح
                        </h1>
                        <p className="text-[12px] font-bold text-muted-foreground truncate m-0 opacity-80">
                            {name}
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                {/* Hero card */}
                <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm relative group">
                    {/* Photo banner - Abstract colorful background */}
                    <div className="h-32 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                        {avatarUrl && (
                            <img
                                src={avatarUrl}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-105"
                            />
                        )}
                    </div>

                    {/* Avatar + meta */}
                    <div className="px-6 pb-8 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-6">
                            <div className="w-28 h-28 rounded-3xl border-4 border-card overflow-hidden bg-secondary flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-500">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserCircle2 className="w-14 h-14 text-muted-foreground opacity-50" />
                                )}
                            </div>
                            <div className="pb-1 min-w-0 flex-1">
                                <h2 className="text-2xl font-extrabold text-foreground m-0 tracking-tight">{name}</h2>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm font-bold text-muted-foreground">مرشح لـ</span>
                                    <span className="text-[13px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                                        {positionTitle}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metadata chips */}
                        <div className="flex flex-wrap gap-2.5">
                            {faculty && (
                                <span className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground bg-secondary/80 border border-border px-3.5 py-1.5 rounded-xl">
                                    <GraduationCap className="w-4 h-4 opacity-70" />
                                    {faculty}
                                </span>
                            )}
                            {studentId && (
                                <span className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground bg-secondary/80 border border-border px-3.5 py-1.5 rounded-xl">
                                    <Fingerprint className="w-4 h-4 opacity-70" />
                                    الرقم الجامعي: {studentId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {candidate.bio && (
                    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
                                <UserCircle2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-extrabold text-foreground m-0">النبذة التعريفية</h3>
                        </div>
                        <p className="text-[15px] text-muted-foreground font-medium leading-loose whitespace-pre-wrap bg-secondary/30 p-5 rounded-2xl border border-border/50">
                            {candidate.bio}
                        </p>
                    </div>
                )}

                {/* Program / Manifesto */}
                {candidate.program && (
                    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                                <ScrollText className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-extrabold text-foreground m-0">البرنامج الانتخابي</h3>
                        </div>
                        <p className="text-[15px] text-muted-foreground font-medium leading-loose whitespace-pre-wrap bg-secondary/30 p-5 rounded-2xl border border-border/50">
                            {candidate.program}
                        </p>
                    </div>
                )}

                {/* Vote CTA area */}
                {votingOpen && (
                    <div className="bg-card border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-sm bg-gradient-to-br from-card to-emerald-50/10">
                        {alreadyVotedThisPosition ? (
                            <div className="flex items-start gap-4 text-emerald-700 bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="mt-0.5">
                                    <h4 className="font-extrabold text-[15px] text-emerald-900 m-0 mb-1">تم التصويت</h4>
                                    <p className="text-[13px] font-bold text-emerald-700 m-0 opacity-90">
                                        لقد قمت بالتصويت لهذا المنصب بالفعل. لا يمكنك التصويت مرة أخرى.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-extrabold text-lg text-foreground m-0 mb-1.5 flex items-center gap-2">
                                        التصويت متاح <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
                                    </h4>
                                    <p className="text-[14px] font-medium text-muted-foreground m-0 max-w-sm">
                                        التصويت متاح حالياً لهذا الانتخاب. كن جزءاً من التغيير!
                                    </p>
                                </div>
                                <Link
                                    to={`/elections/${electionId}/voting?candidate=${candidateId}`}
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <Vote className="w-5 h-5" />
                                    التصويت لـ {name.split(' ')[0]}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    )
}