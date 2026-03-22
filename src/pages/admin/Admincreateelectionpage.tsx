import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Check,
    FileText,
    Loader2,
    Plus,
    Trophy,
    Trash2,
    X,
} from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createElection, createPosition, isAdmin } from '../../lib/elections'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ElectionFormData {
    title: string
    description: string
    nomination_start: string
    nomination_end: string
    voting_start: string
    voting_end: string
}

interface PositionFormData {
    id: string // local UI id only
    title: string
    description: string
    max_winners: number
}

type Step = 1 | 2 | 3

const STEPS = [
    { label: 'التفاصيل', icon: FileText },
    { label: 'المناصب', icon: Trophy },
    { label: 'المراجعة', icon: Check },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCreateElectionPage() {
    const navigate = useNavigate()
    const { profile } = useAuth()

    // Auth guard
    useEffect(() => {
        if (profile && !isAdmin(profile.role)) {
            navigate('/', { replace: true })
        }
    }, [profile, navigate])

    const [step, setStep] = useState<Step>(1)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // ── Step 1 state ───────────────────────────────────────────────────────────

    const [electionData, setElectionData] = useState<ElectionFormData>({
        title: '',
        description: '',
        nomination_start: '',
        nomination_end: '',
        voting_start: '',
        voting_end: '',
    })
    const [step1Errors, setStep1Errors] = useState<
        Partial<Record<keyof ElectionFormData | 'window', string>>
    >({})

    // ── Step 2 state ───────────────────────────────────────────────────────────

    const [positions, setPositions] = useState<PositionFormData[]>([])
    const [newPositionTitle, setNewPositionTitle] = useState('')
    const [newPositionDesc, setNewPositionDesc] = useState('')
    const [newPositionWinners, setNewPositionWinners] = useState(1)
    const [positionFormVisible, setPositionFormVisible] = useState(false)
    const [step2Error, setStep2Error] = useState<string | null>(null)
    const [newPositionTitleError, setNewPositionTitleError] = useState<string | null>(null)

    // ── Step 1: validate ───────────────────────────────────────────────────────

    const validateStep1 = (): boolean => {
        const errors: typeof step1Errors = {}

        if (!electionData.title.trim()) errors.title = 'العنوان مطلوب.'
        if (!electionData.nomination_start) errors.nomination_start = 'مطلوب.'
        if (!electionData.nomination_end) errors.nomination_end = 'مطلوب.'
        if (!electionData.voting_start) errors.voting_start = 'مطلوب.'
        if (!electionData.voting_end) errors.voting_end = 'مطلوب.'

        if (
            electionData.nomination_end &&
            electionData.voting_start &&
            new Date(electionData.voting_start) <= new Date(electionData.nomination_end)
        ) {
            errors.window = 'يجب أن يبدأ التصويت بعد إغلاق الترشيح.'
        }

        if (
            electionData.nomination_start &&
            electionData.nomination_end &&
            new Date(electionData.nomination_end) <= new Date(electionData.nomination_start)
        ) {
            errors.nomination_end = 'يجب أن يكون موعد الانتهاء بعد موعد البدء.'
        }

        if (
            electionData.voting_start &&
            electionData.voting_end &&
            new Date(electionData.voting_end) <= new Date(electionData.voting_start)
        ) {
            errors.voting_end = 'يجب أن يكون موعد الانتهاء بعد موعد البدء.'
        }

        setStep1Errors(errors)
        return Object.keys(errors).length === 0
    }

    // ── Step 2: add / remove positions ────────────────────────────────────────

    const handleAddPosition = () => {
        if (!newPositionTitle.trim()) {
            setNewPositionTitleError('عنوان المنصب مطلوب.')
            return
        }
        setNewPositionTitleError(null)
        setStep2Error(null)
        setPositions((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                title: newPositionTitle.trim(),
                description: newPositionDesc.trim(),
                max_winners: newPositionWinners,
            },
        ])
        setNewPositionTitle('')
        setNewPositionDesc('')
        setNewPositionWinners(1)
        setPositionFormVisible(false)
    }

    const handleRemovePosition = (id: string) => {
        setPositions((prev) => prev.filter((p) => p.id !== id))
    }

    const validateStep2 = (): boolean => {
        if (positions.length === 0) {
            setStep2Error('أضف منصباً واحداً على الأقل.')
            return false
        }
        return true
    }

    // ── Navigation ─────────────────────────────────────────────────────────────

    const goNext = () => {
        if (step === 1) {
            if (!validateStep1()) return
            setStep(2)
        } else if (step === 2) {
            if (!validateStep2()) return
            setStep(3)
        }
    }

    const goBack = () => {
        if (step === 2) setStep(1)
        else if (step === 3) setStep(2)
    }

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        setSubmitting(true)
        setSubmitError(null)
        try {
            const election = await createElection({
                title: electionData.title.trim(),
                description: electionData.description.trim() || null,
                nomination_start: electionData.nomination_start,
                nomination_end: electionData.nomination_end,
                voting_start: electionData.voting_start,
                voting_end: electionData.voting_end,
            })

            // Create positions sequentially to preserve sort order
            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i]
                await createPosition({
                    election_id: election.id,
                    title: pos.title,
                    description: pos.description || null,
                    max_winners: pos.max_winners,
                    sort_order: i,
                })
            }

            navigate(`/admin/elections/${election.id}/candidates`, { replace: true })
        } catch (err) {
            console.error(err)
            setSubmitError('فشل إنشاء الانتخاب. يرجى المحاولة مرة أخرى.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    const formatDateDisplay = (iso: string) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleString('ar-SA', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div dir="rtl" className="min-h-screen bg-background pb-32">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/elections"
                            className="p-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 hover:text-foreground transition-all text-muted-foreground shadow-sm"
                            aria-label="الرجوع للانتخابات"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5 opacity-80">
                                الإدارة
                            </p>
                            <h1 className="text-xl font-extrabold text-foreground leading-none m-0">
                                إنشاء انتخاب
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
                {/* Step indicator */}
                <StepIndicator current={step} />

                {/* ── Step 1: Details ─────────────────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <p className="text-[13px] font-bold text-muted-foreground mb-1">
                                الخطوة ١
                            </p>
                            <h2 className="text-2xl font-extrabold text-foreground tracking-tight m-0">
                                تفاصيل الانتخاب
                            </h2>
                        </div>

                        {/* Title */}
                        <Field
                            label="العنوان"
                            required
                            error={step1Errors.title}
                        >
                            <input
                                type="text"
                                value={electionData.title}
                                onChange={(e) => {
                                    setElectionData((p) => ({ ...p, title: e.target.value }))
                                    setStep1Errors((p) => ({ ...p, title: undefined }))
                                }}
                                placeholder="م. انتخابات مجلس الطلبة ٢٠٢٥"
                                className="w-full border border-border bg-background rounded-xl px-5 py-3.5 text-[15px] font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                            />
                        </Field>

                        {/* Description */}
                        <Field label="الوصف" hint="اختياري">
                            <textarea
                                value={electionData.description}
                                onChange={(e) =>
                                    setElectionData((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="نبذة مختصرة عن هذا الانتخاب..."
                                rows={4}
                                className="w-full border border-border bg-background rounded-xl px-5 py-3.5 text-[15px] font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all resize-none"
                            />
                        </Field>

                        {/* Nominations */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-[15px] font-extrabold text-foreground m-0">
                                    فترة الترشيح
                                </p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="البدء" required error={step1Errors.nomination_start}>
                                    <input
                                        type="datetime-local"
                                        value={electionData.nomination_start}
                                        onChange={(e) => {
                                            setElectionData((p) => ({
                                                ...p,
                                                nomination_start: e.target.value,
                                            }))
                                            setStep1Errors((p) => ({
                                                ...p,
                                                nomination_start: undefined,
                                                window: undefined,
                                            }))
                                        }}
                                        className="w-full border border-border bg-background rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                    />
                                </Field>
                                <Field label="الانتهاء" required error={step1Errors.nomination_end}>
                                    <input
                                        type="datetime-local"
                                        value={electionData.nomination_end}
                                        onChange={(e) => {
                                            setElectionData((p) => ({
                                                ...p,
                                                nomination_end: e.target.value,
                                            }))
                                            setStep1Errors((p) => ({
                                                ...p,
                                                nomination_end: undefined,
                                                window: undefined,
                                            }))
                                        }}
                                        className="w-full border border-border bg-background rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Voting */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-[15px] font-extrabold text-foreground m-0">
                                    فترة التصويت
                                </p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="البدء" required error={step1Errors.voting_start}>
                                    <input
                                        type="datetime-local"
                                        value={electionData.voting_start}
                                        onChange={(e) => {
                                            setElectionData((p) => ({
                                                ...p,
                                                voting_start: e.target.value,
                                            }))
                                            setStep1Errors((p) => ({
                                                ...p,
                                                voting_start: undefined,
                                                window: undefined,
                                            }))
                                        }}
                                        className="w-full border border-border bg-background rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                    />
                                </Field>
                                <Field label="الانتهاء" required error={step1Errors.voting_end}>
                                    <input
                                        type="datetime-local"
                                        value={electionData.voting_end}
                                        onChange={(e) => {
                                            setElectionData((p) => ({
                                                ...p,
                                                voting_end: e.target.value,
                                            }))
                                            setStep1Errors((p) => ({
                                                ...p,
                                                voting_end: undefined,
                                            }))
                                        }}
                                        className="w-full border border-border bg-background rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Window validation error */}
                        {step1Errors.window && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2.5 text-red-700 shadow-sm">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-[13px] font-bold m-0">{step1Errors.window}</p>
                            </div>
                        )}

                        <StepActions step={step} onBack={goBack} onNext={goNext} />
                    </div>
                )}

                {/* ── Step 2: Positions ────────────────────────────────────────────── */}
                {step === 2 && (
                    <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <p className="text-[13px] font-bold text-muted-foreground mb-1">
                                الخطوة ٢
                            </p>
                            <h2 className="text-2xl font-extrabold text-foreground tracking-tight m-0">إضافة مناصب</h2>
                            <p className="text-[14px] font-bold text-muted-foreground mt-2">
                                أضف منصباً واحداً على الأقل ليتنافس عليه المرشحون.
                            </p>
                        </div>

                        {/* Existing positions */}
                        {positions.length > 0 && (
                            <div className="space-y-3">
                                {positions.map((pos, i) => (
                                    <div
                                        key={pos.id}
                                        className="flex items-center gap-4 bg-secondary/50 border border-border rounded-2xl px-5 py-4 shadow-sm group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-[13px] font-extrabold text-foreground shrink-0 shadow-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-extrabold text-foreground m-0">
                                                {pos.title}
                                            </p>
                                            {pos.description && (
                                                <p className="text-[13px] font-medium text-muted-foreground mt-1 line-clamp-1 m-0">
                                                    {pos.description}
                                                </p>
                                            )}
                                            <p className="text-[12px] font-bold text-muted-foreground mt-1.5 m-0 opacity-80 inline-flex px-2 py-0.5 bg-secondary border border-border rounded-md">
                                                {pos.max_winners} فائز
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemovePosition(pos.id)}
                                            className="p-2 rounded-xl bg-background border border-border hover:bg-red-50 text-muted-foreground hover:text-red-500 hover:border-red-200 transition-all shrink-0 shadow-sm"
                                            aria-label="إزالة المنصب"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add position form */}
                        {positionFormVisible ? (
                            <div className="border border-border bg-secondary/30 rounded-3xl p-6 space-y-6 shadow-sm">
                                <p className="text-lg font-extrabold text-foreground m-0">
                                    منصب جديد
                                </p>

                                <Field label="عنوان المنصب" required error={newPositionTitleError ?? undefined}>
                                    <input
                                        type="text"
                                        value={newPositionTitle}
                                        onChange={(e) => {
                                            setNewPositionTitle(e.target.value)
                                            setNewPositionTitleError(null)
                                        }}
                                        placeholder="م. رئيس، أمين سر..."
                                        className="w-full border border-border bg-background rounded-xl px-5 py-3 text-[14px] font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                        autoFocus
                                    />
                                </Field>

                                <Field label="الوصف" hint="اختياري">
                                    <input
                                        type="text"
                                        value={newPositionDesc}
                                        onChange={(e) => setNewPositionDesc(e.target.value)}
                                        placeholder="ملخص مختصر عن الدور..."
                                        className="w-full border border-border bg-background rounded-xl px-5 py-3 text-[14px] font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                    />
                                </Field>

                                <Field label="عدد الفائزين المطلوب">
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={newPositionWinners}
                                        onChange={(e) =>
                                            setNewPositionWinners(Math.max(1, parseInt(e.target.value) || 1))
                                        }
                                        className="w-32 border border-border bg-background rounded-xl px-5 py-3 text-[14px] font-bold text-foreground text-center focus:outline-none focus:ring-2 focus:ring-foreground shadow-sm transition-all"
                                    />
                                </Field>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleAddPosition}
                                        className="flex items-center gap-2 bg-foreground hover:bg-foreground/80 text-background text-[14px] font-extrabold px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        <Plus className="w-5 h-5 shrink-0" />
                                        إضافة المنصب
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPositionFormVisible(false)
                                            setNewPositionTitle('')
                                            setNewPositionDesc('')
                                            setNewPositionWinners(1)
                                            setNewPositionTitleError(null)
                                        }}
                                        className="flex items-center gap-2 text-[14px] font-extrabold text-foreground bg-background border border-border px-6 py-3 rounded-xl hover:bg-secondary transition-all shadow-sm active:scale-95"
                                    >
                                        <X className="w-5 h-5 shrink-0" />
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setPositionFormVisible(true)
                                    setStep2Error(null)
                                }}
                                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary hover:border-foreground/30 rounded-3xl py-6 text-[15px] font-extrabold text-foreground transition-all shadow-sm group"
                            >
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                أضف منصباً
                            </button>
                        )}

                        {/* Validation error */}
                        {step2Error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2.5 text-red-700 shadow-sm">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-[13px] font-bold m-0">{step2Error}</p>
                            </div>
                        )}

                        <StepActions step={step} onBack={goBack} onNext={goNext} />
                    </div>
                )}

                {/* ── Step 3: Review ───────────────────────────────────────────────── */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                            <div>
                                <p className="text-[13px] font-bold text-muted-foreground mb-1">
                                    الخطوة ٣
                                </p>
                                <h2 className="text-2xl font-extrabold text-foreground tracking-tight m-0">
                                    المراجعة والإنشاء
                                </h2>
                            </div>

                            {/* Election details summary */}
                            <div className="space-y-4">
                                <p className="text-[14px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    الانتخاب
                                </p>
                                <div className="bg-secondary/50 border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                                    <div>
                                        <p className="text-xl font-extrabold text-foreground m-0 leading-tight">
                                            {electionData.title}
                                        </p>
                                        {electionData.description && (
                                            <p className="text-[14px] font-medium text-muted-foreground mt-2">
                                                {electionData.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-border grid sm:grid-cols-2 gap-4 text-[13px] text-foreground font-bold">
                                        <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
                                            <p className="font-extrabold text-muted-foreground mb-1 text-[11px] uppercase opacity-80 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                الترشيحات
                                            </p>
                                            <p dir="ltr" className="text-right">
                                                {formatDateDisplay(electionData.nomination_start)} →{' '}
                                                {formatDateDisplay(electionData.nomination_end)}
                                            </p>
                                        </div>
                                        <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
                                            <p className="font-extrabold text-muted-foreground mb-1 text-[11px] uppercase opacity-80 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                التصويت
                                            </p>
                                            <p dir="ltr" className="text-right">
                                                {formatDateDisplay(electionData.voting_start)} →{' '}
                                                {formatDateDisplay(electionData.voting_end)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Positions summary */}
                            <div className="space-y-4">
                                <p className="text-[14px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    المناصب ({positions.length})
                                </p>
                                <div className="space-y-3">
                                    {positions.map((pos, i) => (
                                        <div
                                            key={pos.id}
                                            className="bg-secondary/50 border border-border rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-[13px] font-extrabold text-foreground shrink-0 shadow-sm">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[15px] font-extrabold text-foreground m-0">
                                                    {pos.title}
                                                </p>
                                                {pos.description && (
                                                    <p className="text-[13px] font-medium text-muted-foreground mt-1 line-clamp-1">
                                                        {pos.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[12px] font-bold text-muted-foreground shrink-0 bg-background border border-border px-3 py-1.5 rounded-lg shadow-sm">
                                                {pos.max_winners} فائز
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit error */}
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 text-red-700 shadow-sm animate-in fade-in duration-300">
                                <AlertCircle className="w-6 h-6 shrink-0" />
                                <p className="text-[14px] font-bold m-0 leading-relaxed">{submitError}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={goBack}
                                className="flex items-center gap-2 text-[14px] font-bold text-muted-foreground hover:text-foreground transition-all bg-card px-5 py-2.5 rounded-xl border border-border hover:bg-secondary shadow-sm active:scale-95"
                            >
                                <ArrowRight className="w-4 h-4" />
                                السابق
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 bg-foreground hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed text-background font-extrabold px-8 py-4 rounded-xl transition-all text-[15px] shadow-sm active:scale-95"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Check className="w-5 h-5" />
                                )}
                                {submitting ? 'جاري الإنشاء...' : 'إنشاء الانتخاب!'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
    return (
        <div className="flex items-center gap-0 w-full mb-8">
            {STEPS.map((s, i) => {
                const stepNum = (i + 1) as Step
                const isDone = current > stepNum
                const isActive = current === stepNum
                const Icon = s.icon

                return (
                    <div key={s.label} className="flex flex-row items-center flex-1 last:flex-none">
                        {/* Node */}
                        <div className="flex flex-col items-center gap-2.5 z-10">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isDone
                                    ? 'bg-foreground text-background scale-95'
                                    : isActive
                                        ? 'bg-foreground text-background ring-4 ring-foreground/20'
                                        : 'bg-secondary text-muted-foreground border border-border scale-90'
                                    }`}
                            >
                                {isDone ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>
                            <p
                                className={`text-[12px] font-extrabold m-0 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'
                                    }`}
                            >
                                {s.label}
                            </p>
                        </div>

                        {/* Connector (RTL support: mr -> ml depending on direction, flex layout handles it mostly) */}
                        {i < STEPS.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-3 -mt-6 rounded-full transition-all duration-500 overflow-hidden bg-secondary relative`}
                            >
                                <div className={`absolute top-0 right-0 h-full bg-foreground transition-all duration-500 ease-out`} style={{ width: isDone ? '100%' : '0%' }} />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string
    required?: boolean
    hint?: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <label className="text-[14px] font-extrabold text-foreground">{label}</label>
                {required && <span className="text-red-500 text-[13px] font-bold">*</span>}
                {hint && <span className="text-[12px] font-bold text-muted-foreground mr-1">({hint})</span>}
            </div>
            {children}
            {error && (
                <p className="text-[12px] font-bold text-red-600 flex items-center gap-1.5 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    )
}

// ─── Step Actions ─────────────────────────────────────────────────────────────

function StepActions({
    step,
    onBack,
    onNext,
}: {
    step: Step
    onBack: () => void
    onNext: () => void
}) {
    return (
        <div className="flex items-center justify-between pt-6 border-t border-border">
            {step > 1 ? (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[14px] font-bold text-muted-foreground hover:text-foreground transition-all bg-secondary px-5 py-2.5 border border-border rounded-xl shadow-sm active:scale-95 hover:bg-secondary/80"
                >
                    <ArrowRight className="w-4 h-4" />
                    السابق
                </button>
            ) : (
                <div />
            )}
            <button
                onClick={onNext}
                className="flex items-center gap-2 bg-foreground hover:bg-foreground/80 text-background font-extrabold px-7 py-3 rounded-xl transition-all text-[15px] shadow-sm active:scale-95"
            >
                التالي
                <ArrowLeft className="w-4 h-4" />
            </button>
        </div>
    )
}