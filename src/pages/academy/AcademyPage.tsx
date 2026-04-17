import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Course } from '@/integrations/supabase/academy.types'
import { BookOpen, Clock, Search, GraduationCap, Users, Trophy, ArrowLeft } from 'lucide-react'
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCallback } from 'react';


interface TrackPageState {
    track: any;
    userId: string | null;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    bookmarkedPages: Set<number>;
    noteInput: string;
    savingNote: boolean;
    showAllNotes: boolean;
    showSearch: boolean;
    searchQuery: string;

    chatInput: string;
    sendingMsg: boolean;
}

const CATEGORIES = ['الكل', 'برمجة', 'تصميم', 'تسويق', 'لغات', 'ريادة أعمال', 'مهارات شخصية']

// ─── helpers ────────────────────────────────────────────────────────────────
function formatMins(mins: number): string {
    if (mins < 60) return `${mins} دقيقة`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h} س ${m} د` : `${h} ساعة`
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AcademyPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('الكل')
    const [stats, setStats] = useState({ courses: 0, students: 0, certs: 0 })
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const [state, setState] = useState<TrackPageState>({
        track: null,
        userId: null,
        loading: true,
        currentPage: 1,
        totalPages: 0,
        bookmarkedPages: new Set(),
        noteInput: '',
        savingNote: false,
        showAllNotes: false,
        showSearch: false,
        searchQuery: '',
        chatInput: '',
        sendingMsg: false,
    });
    const updateState = useCallback((updates: Partial<TrackPageState>) => {
        setState((prev) => ({ ...prev, ...updates }));

    }, []);




    useEffect(() => {
        fetchCourses()
        fetchStats()
    }, [])

    async function fetchCourses() {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
        setCourses(data ?? [])
        setLoading(false)
    }

    async function fetchStats() {
        const [{ count: c }, { count: s }, { count: cert }] = await Promise.all([
            supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
            supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
            supabase.from('certificates').select('*', { count: 'exact', head: true }),
        ])
        setStats({ courses: c ?? 0, students: s ?? 0, certs: cert ?? 0 })
    }

    const filtered = courses.filter(c =>
        c.title.includes(search) || c.instructor.includes(search)
    )

    return (
        <div className="min-h-screen" style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/home')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                            {' أكاديمية الاتحاد'}
                        </h1>

                    </div>
                </div>
            </header>


            {/* ── Hero ── */}
            <section
                className="relative overflow-hidden px-6 py-20"
                style={{ background: 'linear-gradient(135deg, #111111 0%, #1A0606 60%, #111111 100%)' }}
            >

                {/* geometric overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px',
                    }}
                />
                {/* red glow */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: '-120px', left: '40%',
                        width: '500px', height: '500px',
                        background: 'radial-gradient(circle, rgba(185,28,28,0.18) 0%, transparent 65%)',
                    }}
                />

                <div className="relative max-w-5xl mx-auto">
                    {/* Badge */}

                    <div className="hero-eyebrow">
                        <div className="eyebrow-line"></div>
                        <span className="eyebrow-text ar-only">منصة التعلم الرسمية — اتحاد الطلاب اليمني</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                        طوّر مهاراتك مع{' '}
                        <span style={{ color: '#DC2626' }}>أكاديمية الاتحاد</span>
                    </h1>
                    <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '520px' }}>
                        كورسات احترافية بالعربية، شهادات معتمدة، ومجتمع طلابي نشط.
                    </p>

                    {/* Search */}
                    <div className="relative" style={{ maxWidth: '440px' }}>
                        <Search
                            className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                        />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="ابحث عن كورس أو مدرب..."
                            className="w-full py-3 pr-11 pl-4 text-sm outline-none transition-all duration-200"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px',
                                color: 'white',
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = 'rgba(185,28,28,0.5)'
                                e.target.style.background = 'rgba(255,255,255,0.12)'
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                                e.target.style.background = 'rgba(255,255,255,0.08)'
                            }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        {[
                            { icon: BookOpen, val: `${stats.courses}+`, lbl: 'كورس متاح' },
                            { icon: Users, val: stats.students.toLocaleString('ar'), lbl: 'طالب مسجّل' },
                            { icon: Trophy, val: `${stats.certs}+`, lbl: 'شهادة صادرة' },
                        ].map(({ icon: Icon, val, lbl }) => (
                            <div key={lbl}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4" style={{ color: '#DC2626' }} />
                                    <span className="text-xl font-black text-white">{val}</span>
                                </div>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{lbl}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── My Learning CTA ── */}
                <div
                    className="flex items-center gap-4 p-4 mt-4 cursor-pointer group"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        maxWidth: '440px',
                        transition: 'all 0.25s',
                        position: 'relative',  // ← add this
                        zIndex: 1,
                    }}
                    onClick={() => navigate('/academy/my-learning')}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(185,28,28,0.4)'
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(185,28,28,0.25)' }}
                    >
                        <GraduationCap className="w-5 h-5" style={{ color: '#FCA5A5' }} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">متابعة التعلم</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            تحقق من كورساتك وشهاداتك
                        </p>
                    </div>
                    <ArrowLeft className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </div>

            </section>


            {/* ── Categories ── */}
            <div className="px-6 py-5 flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200"
                        style={
                            activeCategory === cat
                                ? { background: '#111111', color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }
                                : { background: '#ffffff', color: '#888', border: '1.5px solid #E5E7EB' }
                        }
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Grid ── */}
            <main className="px-6 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-video bg-gray-100" />
                                <div className="p-5 space-y-3">
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    <div className="h-5 bg-gray-100 rounded w-4/5" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-bold text-lg">لا توجد كورسات مطابقة</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

// ─── Card ────────────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
    return (
        <Link
            to={`/academy/course/${course.id}`}
            className="group block bg-white overflow-hidden transition-all duration-300"
            style={{
                borderRadius: '20px',
                border: '1px solid #F0EDE8',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-5px)'
                el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.10)'
                el.style.borderColor = '#E0D9D0'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                el.style.borderColor = '#F0EDE8'
            }}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                        <BookOpen className="w-10 h-10 text-white/20" />
                    </div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                <div
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                >
                    <Clock className="w-3 h-3" />
                    {formatMins(course.duration_mins)}
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <p className="text-xs font-bold mb-2 tracking-wide" style={{ color: '#B91C1C' }}>
                    الأكاديمية
                </p>
                <h3 className="font-extrabold text-gray-900 text-base leading-snug mb-3 line-clamp-2">
                    {course.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: '#F0EDE8', color: '#666' }}
                    >
                        {course.instructor.charAt(0)}
                    </div>
                    {course.instructor}
                </div>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #F5F2EE' }}>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#ECFDF5', color: '#065F46' }}>
                        مجاني
                    </span>
                    <div
                        className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl"
                        style={{ background: '#B91C1C' }}
                    >
                        <BookOpen className="w-3 h-3" />
                        ابدأ الآن
                    </div>
                </div>
            </div>
        </Link>
    )
}