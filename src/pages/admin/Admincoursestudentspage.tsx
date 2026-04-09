import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Course } from '@/integrations/supabase/academy.types'
import {
    ArrowRight, Users, CheckCircle2, Clock,
    Trophy, Search, TrendingUp,
} from 'lucide-react'
import { useRoleGuard } from '@/hooks/useRoleGuard'

interface StudentRow {
    user_id: string
    enrolled_at: string
    total_lessons: number
    completed_lessons: number
    progress_pct: number
    is_completed: boolean
    profile: {
        full_name: string | null
        email: string | null
        avatar_url: string | null
    }
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ar-YE', {
        year: 'numeric', month: 'short', day: 'numeric',
    })
}

export default function AdminCourseStudentsPage() {
    useRoleGuard(['academy']);
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [course, setCourse] = useState<Course | null>(null)
    const [students, setStudents] = useState<StudentRow[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'completed' | 'inprogress'>('all')

    useEffect(() => {
        if (id) load()
    }, [id])

    async function load() {
        // fetch course info
        const { data: c } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single()
        setCourse(c)

        // fetch progress view joined with profiles
        const { data: progress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('course_id', id)

        if (!progress || progress.length === 0) {
            setLoading(false)
            return
        }

        const userIds = progress.map(p => p.user_id)

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .in('id', userIds)

        const profileMap = Object.fromEntries(
            (profiles ?? []).map(p => [p.id, p])
        )

        setStudents(
            progress.map(p => ({
                ...p,
                profile: profileMap[p.user_id] ?? { full_name: null, email: null, avatar_url: null },
            }))
        )
        setLoading(false)
    }

    const filtered = students.filter(s => {
        const name = s.profile.full_name ?? s.profile.email ?? ''
        const matchSearch = name.toLowerCase().includes(search.toLowerCase())
        const matchFilter =
            filter === 'all' ||
            (filter === 'completed' ? s.is_completed : !s.is_completed)
        return matchSearch && matchFilter
    })

    const completedCount = students.filter(s => s.is_completed).length
    const avgProgress = students.length > 0
        ? Math.round(students.reduce((acc, s) => acc + s.progress_pct, 0) / students.length)
        : 0

    return (
        <div
            className="min-h-screen pb-20"
            style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }}
            dir="rtl"
        >
            {/* ── Header ── */}
            <div
                className="px-8 py-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #111111 0%, #1A0606 100%)' }}
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px',
                    }}
                />
                <div className="relative max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/admin/academy')}
                        className="flex items-center gap-2 text-sm mb-5 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                    >
                        <ArrowRight className="w-4 h-4" />
                        العودة لإدارة الأكاديمية
                    </button>

                    <p className="text-xs font-bold mb-1" style={{ color: 'rgba(220,38,38,0.8)' }}>
                        الطلاب المسجّلون
                    </p>
                    <h1 className="text-2xl font-black text-white mb-1">
                        {course?.title ?? '...'}
                    </h1>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {students.length} طالب مسجّل
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mt-8 flex-wrap">
                        {[
                            { icon: Users, val: students.length, lbl: 'إجمالي المسجّلين', color: '#DC2626' },
                            { icon: Trophy, val: completedCount, lbl: 'أكملوا الكورس', color: '#D97706' },
                            { icon: TrendingUp, val: `${avgProgress}٪`, lbl: 'متوسط التقدم', color: '#10B981' },
                        ].map(({ icon: Icon, val, lbl, color }) => (
                            <div
                                key={lbl}
                                className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    minWidth: '160px',
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${color}22` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-white leading-none">{val}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{lbl}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 pt-8">

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap gap-3 mb-5 items-center">
                    <div className="relative flex-1" style={{ minWidth: '200px', maxWidth: '320px' }}>
                        <Search className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="بحث باسم الطالب..."
                            className="w-full py-2.5 pr-10 pl-4 text-sm outline-none"
                            style={{
                                background: '#fff',
                                border: '1.5px solid #E5E7EB',
                                borderRadius: '12px',
                                color: '#111',
                            }}
                        />
                    </div>
                    <div className="flex gap-1">
                        {([
                            { key: 'all', label: 'الكل' },
                            { key: 'completed', label: 'مكتمل' },
                            { key: 'inprogress', label: 'جارٍ' },
                        ] as const).map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150"
                                style={
                                    filter === f.key
                                        ? { background: '#111', color: '#fff' }
                                        : { background: '#fff', color: '#888', border: '1.5px solid #E5E7EB' }
                                }
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div
                    className="bg-white overflow-hidden"
                    style={{ borderRadius: '20px', border: '1px solid #F0EDE8' }}
                >
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-7 h-7 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-bold text-sm">لا يوجد طلاب مطابقون</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F5F2EE' }}>
                                    {['الطالب', 'تاريخ التسجيل', 'الدروس المكتملة', 'التقدم', 'الحالة'].map(h => (
                                        <th
                                            key={h}
                                            className="text-right text-xs font-bold text-gray-400 px-5 py-4"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => {
                                    const pct = Math.round(s.progress_pct)
                                    const displayName = s.profile.full_name ?? s.profile.email ?? 'مستخدم'
                                    const initials = displayName.slice(0, 2)

                                    return (
                                        <tr
                                            key={s.user_id}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                            style={{
                                                borderBottom: i < filtered.length - 1 ? '1px solid #F8F6F3' : 'none',
                                            }}
                                        >
                                            {/* Student */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {s.profile.avatar_url ? (
                                                        <img
                                                            src={s.profile.avatar_url}
                                                            alt=""
                                                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                                                            style={{ background: '#1A1A1A' }}
                                                        >
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{displayName}</p>
                                                        {s.profile.email && (
                                                            <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                                                                {s.profile.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Enrolled at */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-500">{formatDate(s.enrolled_at)}</span>
                                            </td>

                                            {/* Lessons */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                    <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
                                                    <span className="font-bold">{s.completed_lessons}</span>
                                                    <span className="text-gray-400">/ {s.total_lessons}</span>
                                                </div>
                                            </td>

                                            {/* Progress bar */}
                                            <td className="px-5 py-4" style={{ minWidth: '140px' }}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                                                        style={{ background: '#F0EDE8' }}
                                                    >
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{
                                                                width: `${pct}%`,
                                                                background: s.is_completed ? '#10B981' : '#B91C1C',
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-700 w-8 text-left">
                                                        {pct}٪
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                                                    style={
                                                        s.is_completed
                                                            ? { background: '#ECFDF5', color: '#065F46' }
                                                            : pct > 0
                                                                ? { background: '#FEF3C7', color: '#92400E' }
                                                                : { background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                                                    }
                                                >
                                                    {s.is_completed ? '✓ مكتمل' : pct > 0 ? 'جارٍ' : 'لم يبدأ'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
