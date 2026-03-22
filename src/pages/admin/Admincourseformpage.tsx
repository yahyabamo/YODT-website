import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Course, Lesson } from '@/integrations/supabase/academy.types'
import {
    ArrowRight, Plus, Trash2, GripVertical,
    Youtube, Save, Eye, EyeOff, AlertCircle, CheckCircle2,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
    const patterns = [
        /youtu\.be\/([^?&]+)/,
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtube\.com\/embed\/([^?&]+)/,
    ]
    for (const p of patterns) {
        const m = url.match(p)
        if (m) return m[1]
    }
    return null
}

type LessonDraft = Omit<Lesson, 'id' | 'course_id' | 'created_at'> & { _id: string }

function newLesson(order: number): LessonDraft {
    return { _id: crypto.randomUUID(), title: '', youtube_url: '', order_index: order, duration_mins: 0 }
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminCourseFormPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const isNew = !id || id === 'new'

    const [form, setForm] = useState({
        title: '', description: '', instructor: '',
        thumbnail_url: '', duration_mins: 0, is_published: false,
    })
    const [lessons, setLessons] = useState<LessonDraft[]>([newLesson(0)])
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    const [activeLesson, setActiveLesson] = useState<string | null>(null)

    useEffect(() => {
        if (!isNew) loadCourse()
    }, [id])

    async function loadCourse() {
        const [{ data: c }, { data: l }] = await Promise.all([
            supabase.from('courses').select('*').eq('id', id).single(),
            supabase.from('lessons').select('*').eq('course_id', id).order('order_index'),
        ])
        if (c) setForm({ title: c.title, description: c.description ?? '', instructor: c.instructor, thumbnail_url: c.thumbnail_url ?? '', duration_mins: c.duration_mins, is_published: c.is_published })
        if (l) setLessons(l.map(lesson => ({ _id: lesson.id, title: lesson.title, youtube_url: lesson.youtube_url, order_index: lesson.order_index, duration_mins: lesson.duration_mins })))
        setLoading(false)
    }

    function showToast(type: 'success' | 'error', msg: string) {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 3500)
    }

    async function handleSave() {
        if (!form.title.trim()) return showToast('error', 'عنوان الكورس مطلوب')
        if (!form.instructor.trim()) return showToast('error', 'اسم المدرب مطلوب')
        if (lessons.some(l => !l.title.trim() || !l.youtube_url.trim())) return showToast('error', 'يرجى إكمال بيانات جميع الدروس')

        setSaving(true)
        try {
            let courseId = id

            if (isNew) {
                const { data, error } = await supabase.from('courses').insert({ ...form }).select().single()
                if (error) throw error
                courseId = data.id
            } else {
                const { error } = await supabase.from('courses').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id)
                if (error) throw error
                // delete old lessons, re-insert
                await supabase.from('lessons').delete().eq('course_id', id)
            }

            const lessonRows = lessons.map((l, i) => ({
                course_id: courseId,
                title: l.title,
                youtube_url: l.youtube_url,
                order_index: i,
                duration_mins: l.duration_mins,
            }))
            const { error: le } = await supabase.from('lessons').insert(lessonRows)
            if (le) throw le

            showToast('success', isNew ? 'تم إنشاء الكورس بنجاح!' : 'تم حفظ التغييرات بنجاح!')
            setTimeout(() => navigate('/admin/academy'), 1200)
        } catch {
            showToast('error', 'حدث خطأ أثناء الحفظ. حاول مجدداً.')
        } finally {
            setSaving(false)
        }
    }

    function updateLesson(id: string, field: keyof LessonDraft, value: string | number) {
        setLessons(prev => prev.map(l => l._id === id ? { ...l, [field]: value } : l))
    }

    function addLesson() {
        setLessons(prev => {
            const next = [...prev, newLesson(prev.length)]
            setActiveLesson(next[next.length - 1]._id)
            return next
        })
    }

    function removeLesson(lid: string) {
        setLessons(prev => prev.filter(l => l._id !== lid).map((l, i) => ({ ...l, order_index: i })))
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F5' }}>
            <div className="w-8 h-8 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen pb-20" style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

            {/* ── Toast ── */}
            {toast && (
                <div
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all duration-300"
                    style={
                        toast.type === 'success'
                            ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }
                            : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
                    }
                >
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* ── Top bar ── */}
            <div
                className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EEE' }}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/academy')}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                        إدارة الأكاديمية
                    </button>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm font-bold text-gray-900">{isNew ? 'كورس جديد' : 'تعديل الكورس'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={
                            form.is_published
                                ? { background: '#ECFDF5', color: '#065F46' }
                                : { background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                        }
                    >
                        {form.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {form.is_published ? 'منشور' : 'مسودة'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ background: '#B91C1C', boxShadow: '0 4px 12px rgba(185,28,28,0.3)' }}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'جارٍ الحفظ...' : 'حفظ الكورس'}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Course Info ── */}
                <div className="lg:col-span-2 space-y-5">
                    <Card title="معلومات الكورس">
                        <Field label="عنوان الكورس *">
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="أدخل عنوان الكورس..."
                                className="form-input"
                            />
                        </Field>
                        <Field label="الوصف">
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="وصف مختصر للكورس..."
                                rows={3}
                                className="form-input resize-none"
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="اسم المدرب *">
                                <input
                                    value={form.instructor}
                                    onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                                    placeholder="م. أحمد..."
                                    className="form-input"
                                />
                            </Field>
                            <Field label="المدة الإجمالية (دقيقة)">
                                <input
                                    type="number"
                                    value={form.duration_mins}
                                    onChange={e => setForm(f => ({ ...f, duration_mins: +e.target.value }))}
                                    placeholder="60"
                                    className="form-input"
                                    min={0}
                                />
                            </Field>
                        </div>
                        <Field label="رابط الصورة المصغرة (Thumbnail URL)">
                            <input
                                value={form.thumbnail_url}
                                onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                                placeholder="https://..."
                                className="form-input"
                                dir="ltr"
                            />
                        </Field>
                        {form.thumbnail_url && (
                            <div className="aspect-video w-full overflow-hidden mt-1" style={{ borderRadius: '12px', background: '#111' }}>
                                <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
                    </Card>

                    {/* ── Lessons ── */}
                    <Card title={`الدروس (${lessons.length})`} action={
                        <button
                            onClick={addLesson}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                            style={{ background: '#111' }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            إضافة درس
                        </button>
                    }>
                        <div className="space-y-3">
                            {lessons.map((lesson, i) => (
                                <LessonRow
                                    key={lesson._id}
                                    lesson={lesson}
                                    index={i}
                                    expanded={activeLesson === lesson._id}
                                    onToggle={() => setActiveLesson(prev => prev === lesson._id ? null : lesson._id)}
                                    onChange={(field, val) => updateLesson(lesson._id, field, val)}
                                    onRemove={() => removeLesson(lesson._id)}
                                    canRemove={lessons.length > 1}
                                />
                            ))}
                        </div>
                        <button
                            onClick={addLesson}
                            className="w-full mt-4 py-3 rounded-xl border-2 border-dashed text-sm font-bold text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-all duration-200"
                            style={{ borderColor: '#E5E7EB' }}
                        >
                            + إضافة درس جديد
                        </button>
                    </Card>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-5">
                    <Card title="ملخص الكورس">
                        <div className="space-y-3">
                            {[
                                { lbl: 'عدد الدروس', val: lessons.length },
                                { lbl: 'المدة الإجمالية', val: `${form.duration_mins} دقيقة` },
                                { lbl: 'المدرب', val: form.instructor || '—' },
                                { lbl: 'الحالة', val: form.is_published ? 'منشور ✓' : 'مسودة' },
                            ].map(({ lbl, val }) => (
                                <div key={lbl} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #F5F2EE' }}>
                                    <span className="text-xs text-gray-400">{lbl}</span>
                                    <span className="text-xs font-bold text-gray-900">{val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="نصائح">
                        <ul className="space-y-2">
                            {[
                                'أضف وصفاً واضحاً يشرح ما سيتعلمه الطالب',
                                'رتّب الدروس من الأبسط إلى الأصعب',
                                'تأكد من صحة روابط YouTube قبل النشر',
                                'أضف صورة مصغرة جذابة للكورس',
                            ].map(tip => (
                                <li key={tip} className="flex gap-2 text-xs text-gray-500 leading-relaxed">
                                    <span style={{ color: '#B91C1C' }}>•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            <style>{`
        .form-input {
          width: 100%;
          padding: 10px 14px;
          font-family: 'Cairo', sans-serif;
          font-size: 14px;
          color: #111;
          background: #F8F7F5;
          border: 1.5px solid #E8E3DC;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s;
          direction: rtl;
        }
        .form-input:focus {
          border-color: #B91C1C;
          background: #fff;
        }
        .form-input::placeholder { color: #B0A9A0; }
      `}</style>
        </div>
    )
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────
function LessonRow({
    lesson, index, expanded, onToggle, onChange, onRemove, canRemove,
}: {
    lesson: LessonDraft
    index: number
    expanded: boolean
    onToggle: () => void
    onChange: (field: keyof LessonDraft, val: string | number) => void
    onRemove: () => void
    canRemove: boolean
}) {
    const videoId = getYouTubeId(lesson.youtube_url)

    return (
        <div
            className="overflow-hidden transition-all duration-200"
            style={{ borderRadius: '14px', border: `1.5px solid ${expanded ? '#B91C1C33' : '#F0EDE8'}` }}
        >
            {/* Row header */}
            <div
                className="flex items-center gap-3 p-3 cursor-pointer select-none"
                style={{ background: expanded ? '#FEF2F2' : '#FAFAF9' }}
                onClick={onToggle}
            >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: expanded ? '#B91C1C' : '#1A1A1A' }}
                >
                    {index + 1}
                </div>
                <p className="flex-1 text-sm font-bold text-gray-900 line-clamp-1 min-w-0">
                    {lesson.title || <span className="text-gray-400 font-normal">درس بدون عنوان</span>}
                </p>
                {videoId && <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />}
                {canRemove && (
                    <button
                        onClick={e => { e.stopPropagation(); onRemove() }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                        style={{ background: '#FEE2E2', color: '#EF4444' }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Expanded body */}
            {expanded && (
                <div className="p-4 space-y-3" style={{ background: '#fff' }}>
                    <Field label="عنوان الدرس *">
                        <input
                            value={lesson.title}
                            onChange={e => onChange('title', e.target.value)}
                            placeholder="عنوان الدرس..."
                            className="form-input"
                            onClick={e => e.stopPropagation()}
                        />
                    </Field>

                    <Field label="رابط YouTube *">
                        <div className="relative">
                            <Youtube className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-red-500" />
                            <input
                                value={lesson.youtube_url}
                                onChange={e => onChange('youtube_url', e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className="form-input"
                                style={{ paddingRight: '36px' }}
                                dir="ltr"
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </Field>

                    {videoId && (
                        <div className="aspect-video w-full overflow-hidden" style={{ borderRadius: '10px', background: '#111' }}>
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    )}

                    <Field label="مدة الدرس (دقيقة)">
                        <input
                            type="number"
                            value={lesson.duration_mins}
                            onChange={e => onChange('duration_mins', +e.target.value)}
                            placeholder="10"
                            className="form-input"
                            min={0}
                            style={{ maxWidth: '120px' }}
                            onClick={e => e.stopPropagation()}
                        />
                    </Field>
                </div>
            )}
        </div>
    )
}

// ─── Reusable Components ──────────────────────────────────────────────────────
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="bg-white p-6" style={{ borderRadius: '20px', border: '1px solid #F0EDE8' }}>
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900">{title}</h3>
                {action}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
            {children}
        </div>
    )
}