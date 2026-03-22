import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
    getElectionWithPositions,
    getMyNomination,
    submitNomination,
    canNominate,
    type Election,
    type Position,
    type Candidate,
} from '../../lib/elections'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../integrations/supabase/client'
import ElectionStatusBadge from '../../components/elections/Electionstatusbadge'
import {
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Upload,
    X,
    ClipboardList,
    Clock,
} from 'lucide-react'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

// ─── Already nominated state ───────────────────────────────────────────────────

function AlreadyNominated({ nomination }: { nomination: Candidate }) {
    const statusStyles: Record<string, string> = {
        pending: 'bg-amber-50/50 border-amber-200 text-amber-800',
        approved: 'bg-emerald-50/50 border-emerald-200 text-emerald-800',
        rejected: 'bg-red-50/50 border-red-200 text-red-800',
    }
    const statusLabels: Record<string, string> = {
        pending: 'ترشيحك قيد المراجعة.',
        approved: 'تمت الموافقة على ترشيحك! أنت الآن مرشح رسمي.',
        rejected: `لم تتم الموافقة على ترشيحك.${nomination.rejection_reason ? ' السبب: ' + nomination.rejection_reason : ''
            }`,
    }

    return (
        <div className={`rounded-xl border p-5 ${statusStyles[nomination.status]}`}>
            <div className="flex items-start gap-3">
                {nomination.status === 'pending' && <Clock size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />}
                {nomination.status === 'approved' && <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5 text-emerald-600" />}
                {nomination.status === 'rejected' && <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-600" />}
                <div>
                    <p className="font-extrabold text-sm mb-1">
                        {nomination.status === 'pending' && 'تم تقديم الترشيح'}
                        {nomination.status === 'approved' && 'تمت الموافقة على الترشيح'}
                        {nomination.status === 'rejected' && 'تم رفض الترشيح'}
                    </p>
                    <p className="text-sm font-medium opacity-90">{statusLabels[nomination.status]}</p>
                </div>
            </div>
        </div>
    )
}

// ─── Photo upload ─────────────────────────────────────────────────────────────

function PhotoUpload({
    value,
    onChange,
}: {
    value: string
    onChange: (url: string) => void
}) {
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFile(file: File) {
        if (!file.type.startsWith('image/')) {
            setUploadError('الرجاء رفع ملف صورة.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('يجب أن يكون حجم الصورة أقل من 5 ميغابايت.')
            return
        }

        setUploading(true)
        setUploadError(null)
        const ext = file.name.split('.').pop()
        const path = `candidates/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        // Try 'avatars' first as it's common, or standard 'media'
        const { error } = await supabase.storage
            .from('media') // User's storage bucket
            .upload(path, file, { cacheControl: '3600', upsert: false })

        if (error) {
            // Fallback to election-assets if media fails
            const fallback = await supabase.storage.from('election-assets').upload(path, file, { cacheControl: '3600', upsert: false })
            if (fallback.error) {
                setUploadError(fallback.error.message)
                setUploading(false)
                return
            }
            const { data } = supabase.storage.from('election-assets').getPublicUrl(path)
            onChange(data.publicUrl)
            setUploading(false)
            return
        }

        const { data } = supabase.storage.from('media').getPublicUrl(path)
        onChange(data.publicUrl)
        setUploading(false)
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-extrabold text-foreground">
                صورة الحملة <span className="text-muted-foreground font-medium text-xs mr-1 opacity-70">(اختياري)</span>
            </label>

            {value ? (
                <div className="relative w-32 h-32">
                    <img
                        src={value}
                        alt="Campaign"
                        className="w-32 h-32 rounded-2xl object-cover border-2 border-border shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-md border-2 border-background"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all disabled:opacity-50 bg-secondary/30"
                >
                    {uploading ? (
                        <Loader2 size={24} className="animate-spin mb-2 text-emerald-500" />
                    ) : (
                        <Upload size={24} className="mb-2 opacity-50" />
                    )}
                    <span className="text-sm font-bold mb-1">{uploading ? 'جارٍ الرفع...' : 'انقر للرفع'}</span>
                    <span className="text-xs font-medium opacity-60">JPG، PNG — بحد أقصى 5 ميغابايت</span>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                }}
            />

            {uploadError && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 mt-2 bg-red-50 p-2 rounded-lg w-fit">
                    <AlertCircle size={14} />
                    {uploadError}
                </p>
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NominationPage() {
    const { electionId } = useParams<{ electionId: string }>()
    const [searchParams] = useSearchParams()
    const { profile } = useAuth()
    const navigate = useNavigate()

    const [election, setElection] = useState<Election | null>(null)
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSearch, setShowSearch] = useState(false)

    // Form state
    const [selectedPosition, setSelectedPosition] = useState<string>(
        searchParams.get('position') ?? ''
    )
    const [bio, setBio] = useState('')
    const [program, setProgram] = useState('')
    const [photoUrl, setPhotoUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    // Existing nomination for selected position
    const [existingNomination, setExistingNomination] = useState<Candidate | null>(null)
    const [checkingNomination, setCheckingNomination] = useState(false)

    useEffect(() => {
        if (!electionId) return
        getElectionWithPositions(electionId)
            .then((data) => {
                if (!data) return navigate('/elections', { replace: true })
                setElection(data)
                setPositions(data.positions ?? [])
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [electionId, navigate])

    // Check if already nominated whenever position changes
    useEffect(() => {
        if (!electionId || !selectedPosition) {
            setExistingNomination(null)
            return
        }
        setCheckingNomination(true)
        getMyNomination(electionId, selectedPosition)
            .then(setExistingNomination)
            .catch(() => setExistingNomination(null))
            .finally(() => setCheckingNomination(false))
    }, [electionId, selectedPosition])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!electionId || !selectedPosition) return

        setSubmitError(null)

        if (bio.trim().length < 30) {
            setSubmitError('يجب أن تحتوي النبذة التعريفية على 30 حرفاً على الأقل.')
            return
        }
        if (program.trim().length < 30) {
            setSubmitError('يجب أن يحتوي البرنامج الانتخابي على 30 حرفاً على الأقل.')
            return
        }

        setSubmitting(true)
        try {
            await submitNomination({
                election_id: electionId,
                position_id: selectedPosition,
                bio: bio.trim(),
                program: program.trim(),
                photo_url: photoUrl || undefined,
            })
            setSubmitted(true)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'فشل التقديم'
            setSubmitError(
                msg.includes('23505')
                    ? 'لقد قمت بتقديم ترشيح لهذا المنصب بالفعل.'
                    : msg
            )
        } finally {
            setSubmitting(false)
        }
    }

    // ── Loading & error states ──
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

    // ── Phase guard ──
    if (!canNominate(election.status)) {
        return (
            <div dir="rtl" className="min-h-screen bg-background pb-32">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                        <span className="text-4xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-3">الترشيحات غير مفتوحة</h2>
                    <p className="text-muted-foreground text-[15px] font-medium mb-8 max-w-md mx-auto leading-relaxed">
                        مرحلة الترشيح لـ <strong className="text-foreground">{election.title}</strong>{' '}
                        {election.status === 'closed' || election.status === 'voting'
                            ? 'مغلقة بالفعل'
                            : 'لم تفتح بعد'}
                        .
                    </p>
                    <Link
                        to={`/elections/${electionId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground text-sm font-extrabold rounded-xl hover:bg-secondary/80 transition-colors"
                    >
                        <ChevronRight size={16} />
                        العودة للانتخاب
                    </Link>
                </div>
                <BottomNav />
            </div>
        )
    }

    // ── Success state ──
    if (submitted) {
        return (
            <div dir="rtl" className="min-h-screen bg-background pb-32">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
                </header>
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                        <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">تم تقديم الترشيح بنجاح!</h2>
                    <p className="text-muted-foreground text-[15px] font-medium mb-10 max-w-md mx-auto leading-relaxed text-balance">
                        تم إرسال ترشيحك لمراجعة الإدارة. ستتمكن من رؤية حالتك في صفحة الانتخاب بمجرد مراجعتها.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            to={`/elections/${electionId}`}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background text-sm font-extrabold rounded-2xl hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            العودة للانتخاب
                        </Link>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    // ── Form ──
    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            {/* Header section */}
            <div className="bg-card border-b border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="max-w-2xl mx-auto px-6 py-8 relative z-10">
                    <Link
                        to={`/elections/${electionId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6 bg-secondary/50 px-3 py-1.5 rounded-lg w-fit"
                    >
                        <ChevronRight size={14} />
                        {election.title}
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-100 flex items-center justify-center shadow-inner">
                            <ClipboardList size={28} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground tracking-tight m-0 mb-2">رشّح نفسك</h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-muted-foreground">{election.title}</span>
                                <ElectionStatusBadge status={election.status} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-6 py-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Info banner */}
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 text-[13px] leading-relaxed text-blue-900 shadow-sm flex gap-3 items-start">
                        <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="block text-[14px] mb-1 text-blue-800">قبل التقديم:</strong>
                            ستتم مراجعة ترشيحك من قبل الإدارة قبل نشره للعامة. تأكد من اكتمال النبذة التعريفية والبرنامج الانتخابي وصحتهما اللغوية.
                        </div>
                    </div>

                    {/* Position selector */}
                    <div className="space-y-2.5">
                        <label htmlFor="position" className="block text-sm font-extrabold text-foreground">
                            المنصب <span className="text-red-500 mr-1">*</span>
                        </label>
                        <select
                            id="position"
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            required
                            className="w-full px-4 py-3.5 bg-card border-2 border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:border-border/80"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="" disabled className="text-muted-foreground">اختر منصباً...</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Existing nomination status */}
                    {checkingNomination && (
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border">
                            <Loader2 size={16} className="animate-spin text-emerald-500" />
                            جاري التحقق من الترشيحات السابقة...
                        </div>
                    )}

                    {existingNomination && (
                        <AlreadyNominated nomination={existingNomination} />
                    )}

                    {/* Show form only if no existing nomination */}
                    {!existingNomination && selectedPosition && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Member info (read-only) */}
                            <div className="bg-secondary/30 border border-border rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-1">التقديم باسم</p>
                                    <p className="text-[15px] font-extrabold text-foreground">{profile?.full_name}</p>
                                    {profile?.faculty && (
                                        <p className="text-[13px] font-medium text-muted-foreground mt-1 opacity-80">{profile.faculty}</p>
                                    )}
                                </div>
                                <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center border border-border shadow-sm">
                                    <span className="text-lg font-bold text-foreground/50">{profile?.full_name?.charAt(0) || '?'}</span>
                                </div>
                            </div>

                            {/* Photo */}
                            <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />

                            {/* Bio */}
                            <div className="space-y-2.5">
                                <label htmlFor="bio" className="flex items-baseline flex-wrap gap-2 text-sm font-extrabold text-foreground">
                                    النبذة التعريفية <span className="text-red-500 -mr-1.5">*</span>
                                    <span className="text-muted-foreground font-medium text-xs opacity-80 mr-1">— عرّف الأعضاء بنفسك</span>
                                </label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={5}
                                    placeholder="اكتب مقدمة قصيرة عن هويتك وخلفيتك وسبب ترشحك والخبرات التي تمتلكها..."
                                    className="w-full p-4 bg-card border-2 border-border rounded-2xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none leading-relaxed transition-all hover:border-border/80"
                                    required
                                />
                                <div className="flex justify-end">
                                    <p className={`text-[11px] font-bold ${bio.length < 30 && bio.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{bio.length} حرف</p>
                                </div>
                            </div>

                            {/* Program */}
                            <div className="space-y-2.5">
                                <label htmlFor="program" className="flex items-baseline flex-wrap gap-2 text-sm font-extrabold text-foreground">
                                    البرنامج الانتخابي <span className="text-red-500 -mr-1.5">*</span>
                                    <span className="text-muted-foreground font-medium text-xs opacity-80 mr-1">— ماذا ستفعل إذا تم انتخابك؟</span>
                                </label>
                                <textarea
                                    id="program"
                                    value={program}
                                    onChange={(e) => setProgram(e.target.value)}
                                    rows={8}
                                    placeholder="صف رؤيتك والإجراءات المحددة التي تخطط لاتخاذها إذا تم انتخابك لهذا المنصب، ما هي المشاكل التي ستحلها وكيف..."
                                    className="w-full p-4 bg-card border-2 border-border rounded-2xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none leading-relaxed transition-all hover:border-border/80"
                                    required
                                />
                                <div className="flex justify-end">
                                    <p className={`text-[11px] font-bold ${program.length < 30 && program.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{program.length} حرف</p>
                                </div>
                            </div>

                            {/* Submit error */}
                            {submitError && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold shadow-sm animate-in fade-in zoom-in-95">
                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                    {submitError}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 gap-4 border-t border-border mt-8">
                                <Link
                                    to={`/elections/${electionId}`}
                                    className="w-full sm:w-auto text-center px-6 py-3.5 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all"
                                >
                                    إلغاء الرجوع للانتخاب
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white text-sm font-extrabold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            جارٍ التقديم...
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardList size={18} />
                                            تقديم الترشيح
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <BottomNav />
        </div>
    )
}