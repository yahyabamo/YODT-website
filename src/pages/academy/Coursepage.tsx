import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Course, Lesson } from '@/integrations/supabase/academy.types'
import {
    ChevronRight, Clock, CheckCircle2, Circle,
    PlayCircle, Lock, ArrowRight, AlertCircle,
} from 'lucide-react'
import { AdSlot } from '@/components/ads/AdSlot'

declare global {
    interface Window {
        YT: {
            Player: new (el: string | HTMLElement, opts: YTPlayerOptions) => YTPlayer
            PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
        }
        onYouTubeIframeAPIReady: () => void
    }
}
interface YTPlayer { destroy: () => void }
interface YTPlayerOptions {
    videoId: string
    width?: string | number
    height?: string | number
    playerVars?: Record<string, unknown>
    events?: {
        onStateChange?: (e: { data: number }) => void
        onReady?: () => void
    }
}

function getYouTubeId(url: string): string | null {
    const patterns = [/youtu\.be\/([^?&]+)/, /youtube\.com\/watch\?v=([^&]+)/, /youtube\.com\/embed\/([^?&]+)/]
    for (const p of patterns) { const m = url.match(p); if (m) return m[1] }
    return null
}
function formatMins(mins: number) {
    if (mins < 60) return `${mins} د`
    return `${Math.floor(mins / 60)}س ${mins % 60 > 0 ? `${mins % 60}د` : ''}`
}

export default function CoursePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [course, setCourse] = useState<Course | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
    const [enrolled, setEnrolled] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [hasCert, setHasCert] = useState(false)
    const [videoEnded, setVideoEnded] = useState(false)
    const [ytReady, setYtReady] = useState(false)
    const playerRef = useRef<YTPlayer | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    // Guard against double-init in React strict mode
    const initingRef = useRef(false)

    // ── Load YouTube IFrame API once ──────────────────────────────────────
    useEffect(() => {
        if (window.YT?.Player) { setYtReady(true); return }
        // If script already added by a previous mount, just wait for the callback
        if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            // Poll until ready (handles strict mode double-mount)
            const interval = setInterval(() => {
                if (window.YT?.Player) { setYtReady(true); clearInterval(interval) }
            }, 100)
            return () => clearInterval(interval)
        }
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
        window.onYouTubeIframeAPIReady = () => setYtReady(true)
    }, [])

    // ── Init / reinit player when lesson or API ready ─────────────────────
    useEffect(() => {
        if (!ytReady || !activeLesson || !containerRef.current) return
        if (initingRef.current) return
        const videoId = getYouTubeId(activeLesson.youtube_url)
        if (!videoId) return

        initingRef.current = true
        setVideoEnded(false)

        // Destroy old player
        try { playerRef.current?.destroy() } catch (_) { /* ignore */ }
        playerRef.current = null

        // Clear container and create a fresh div absolutely positioned
        // inside the padding-trick box (paddingTop: 56.25% = 16:9 ratio)
        containerRef.current.innerHTML = ''
        const div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.top = '0'
        div.style.left = '0'
        div.style.width = '100%'
        div.style.height = '100%'
        containerRef.current.appendChild(div)

        playerRef.current = new window.YT.Player(div, {
            videoId,
            width: '100%',
            height: '100%',
            playerVars: {
                rel: 0,
                modestbranding: 1,
                // Allow API to work properly
                enablejsapi: 1,
                origin: window.location.origin,
            },
            events: {
                onReady: () => { initingRef.current = false },
                onStateChange: (e) => { if (e.data === 0) setVideoEnded(true) },
            },
        })

        return () => {
            initingRef.current = false
            try { playerRef.current?.destroy() } catch (_) { /* ignore */ }
            playerRef.current = null
        }
    }, [ytReady, activeLesson])

    // ── Data loading ──────────────────────────────────────────────────────
    useEffect(() => { if (id) init() }, [id])

    async function init() {
        if (!id) { setLoading(false); return }
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id ?? null
        setUserId(uid)
        const [{ data: c }, { data: l }] = await Promise.all([
            supabase.from('courses').select('*').eq('id', id).single(),
            supabase.from('lessons').select('*').eq('course_id', id).order('order_index'),
        ])
        setCourse(c); setLessons(l ?? [])
        if (l && l.length > 0) setActiveLesson(l[0])
        if (uid) {
            const [{ data: enr }, { data: prog }, { data: cert }] = await Promise.all([
                supabase.from('course_enrollments').select('id').eq('user_id', uid).eq('course_id', id).maybeSingle(),
                supabase.from('lesson_progress').select('lesson_id').eq('user_id', uid).eq('course_id', id),
                supabase.from('certificates').select('id').eq('user_id', uid).eq('course_id', id).maybeSingle(),
            ])
            setEnrolled(!!enr)
            setCompletedIds(new Set(prog?.map(p => p.lesson_id) ?? []))
            setHasCert(!!cert)
        }
        setLoading(false)
    }

    async function handleEnroll() {
        if (!userId || !id) return navigate('/login')
        setEnrolling(true)
        await supabase.from('course_enrollments').insert({ user_id: userId, course_id: id })
        setEnrolled(true); setEnrolling(false)
    }

    const markComplete = useCallback(async (lesson: Lesson) => {
        if (!userId || !enrolled || completedIds.has(lesson.id)) return
        await supabase.from('lesson_progress').insert({ user_id: userId, course_id: lesson.course_id, lesson_id: lesson.id })
        const next = new Set(completedIds); next.add(lesson.id)
        setCompletedIds(next); setVideoEnded(false)
        if (next.size === lessons.length && !hasCert) {
            await supabase.from('certificates').insert({ user_id: userId, course_id: lesson.course_id })
            setHasCert(true)
        }
        const idx = lessons.findIndex(l => l.id === lesson.id)
        if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1])
    }, [userId, enrolled, completedIds, lessons, hasCert])

    const progress = lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0
    const alreadyDone = activeLesson ? completedIds.has(activeLesson.id) : false
    const canComplete = enrolled && videoEnded && !alreadyDone

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F5' }}>
            <div className="w-8 h-8 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
        </div>
    )
    if (!course) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#F8F7F5' }}>
            الكورس غير موجود
        </div>
    )

    return (
        <div className="min-h-screen" style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

            {/* Top bar */}
            <div className="sticky top-0 z-50 flex items-center gap-3 px-6 py-3"
                style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EEE' }}>
                <button onClick={() => navigate('/academy')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowRight className="w-4 h-4" />الأكاديمية
                </button>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-sm font-bold text-gray-900 line-clamp-1">{course.title}</span>
                {enrolled && (
                    <div className="mr-auto flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold">{progress}٪</span>
                        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0EDE8' }}>
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress}%`, background: progress === 100 ? '#10B981' : '#B91C1C' }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
                <div className="flex-1 min-w-0 p-4 md:p-6">
                    <AdSlot page="academy_course_details" position="top" className="mb-6" />

                    {/* ── YouTube container ──
                        overflow-hidden is REMOVED — it was clipping the iframe.
                        The container needs a defined height for the API to size into. */}
                    <div
                        ref={containerRef}
                        className="w-full mb-6"
                        style={{
                            borderRadius: '20px',
                            background: '#111',
                            // aspect-ratio via padding trick keeps height relative to width
                            position: 'relative',
                            paddingTop: '56.25%', // 16:9
                        }}
                    >
                        {/* The YouTube API iframe will be injected into the child div,
                            which is absolutely positioned to fill this padding box */}
                    </div>

                    {/* Lesson info + complete button */}
                    {activeLesson && (
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                                <p className="text-xs font-bold mb-1" style={{ color: '#B91C1C' }}>
                                    الدرس {activeLesson.order_index + 1} من {lessons.length}
                                </p>
                                <h2 className="text-xl font-black text-gray-900">{activeLesson.title}</h2>
                                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />{formatMins(activeLesson.duration_mins)}
                                </p>
                            </div>
                            {enrolled && (
                                alreadyDone ? (
                                    <div className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl"
                                        style={{ background: '#ECFDF5', color: '#065F46' }}>
                                        <CheckCircle2 className="w-4 h-4" />مكتمل
                                    </div>
                                ) : canComplete ? (
                                    <button onClick={() => markComplete(activeLesson)}
                                        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:-translate-y-0.5"
                                        style={{ background: '#111111', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                        <CheckCircle2 className="w-4 h-4" />تم إكمال الدرس
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
                                        style={{ background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
                                        <AlertCircle className="w-4 h-4" />أكمل مشاهدة الفيديو أولاً
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Course info */}
                    <div className="bg-white p-6 mb-4" style={{ borderRadius: '20px', border: '1px solid #F0EDE8' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                                style={{ background: '#1A1A1A' }}>
                                {course.instructor.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">المدرب</p>
                                <p className="font-bold text-gray-900 text-sm">{course.instructor}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
                    </div>

                    {/* Certificate banner */}
                    {hasCert && (
                        <div className="flex items-center gap-4 p-5"
                            style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #1C1008, #111111)', border: '1px solid rgba(180,83,9,0.3)' }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #D97706, #92400E)' }}>🏆</div>
                            <div>
                                <p className="font-black text-white text-sm">تهانينا! أكملت الكورس</p>
                                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>شهادتك جاهزة</p>
                            </div>
                            <button onClick={() => navigate(`/academy/certificate/${id}`)}
                                className="mr-auto text-xs font-bold px-4 py-2 rounded-xl"
                                style={{ background: 'rgba(180,83,9,0.2)', color: '#D97706', border: '1px solid rgba(180,83,9,0.3)' }}>
                                عرض الشهادة
                            </button>
                        </div>
                    )}
                    <AdSlot page="academy_course_details" position="bottom" className="mt-8" />
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 p-4 md:p-6 lg:pr-0">
                    <div className="sticky top-20 bg-white overflow-hidden"
                        style={{ borderRadius: '20px', border: '1px solid #F0EDE8' }}>
                        {!enrolled && (
                            <div className="p-5" style={{ borderBottom: '1px solid #F5F2EE' }}>
                                <p className="font-black text-gray-900 mb-1">سجّل مجاناً</p>
                                <p className="text-xs text-gray-400 mb-4">
                                    {lessons.length} درس · {formatMins(course.duration_mins)}
                                </p>
                                <button onClick={handleEnroll} disabled={enrolling}
                                    className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                                    style={{ background: '#B91C1C', boxShadow: '0 4px 16px rgba(185,28,28,0.3)' }}>
                                    {enrolling ? 'جارٍ التسجيل...' : 'التسجيل في الكورس'}
                                </button>
                            </div>
                        )}
                        <div className="p-4">
                            <p className="text-xs font-black text-gray-400 mb-3 px-1">محتوى الكورس</p>
                            <div className="space-y-1 max-h-[520px] overflow-y-auto">
                                {lessons.map((lesson, i) => {
                                    const done = completedIds.has(lesson.id)
                                    const active = activeLesson?.id === lesson.id
                                    const locked = !enrolled && i > 0
                                    return (
                                        <button key={lesson.id}
                                            onClick={() => !locked && setActiveLesson(lesson)}
                                            disabled={locked}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all duration-150"
                                            style={active ? { background: '#111111' } : {}}
                                            onMouseEnter={e => { if (!active && !locked) (e.currentTarget as HTMLElement).style.background = '#F8F7F5' }}
                                            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                                            <div className="flex-shrink-0">
                                                {done ? <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
                                                    : locked ? <Lock className="w-4 h-4 text-gray-300" />
                                                        : active ? <PlayCircle className="w-5 h-5 text-white" />
                                                            : <Circle className="w-5 h-5 text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold line-clamp-2 leading-snug"
                                                    style={{ color: active ? '#fff' : locked ? '#CCC' : '#111' }}>
                                                    {lesson.title}
                                                </p>
                                                <p className="text-[10px] mt-0.5"
                                                    style={{ color: active ? 'rgba(255,255,255,0.4)' : '#AAA' }}>
                                                    {formatMins(lesson.duration_mins)}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}