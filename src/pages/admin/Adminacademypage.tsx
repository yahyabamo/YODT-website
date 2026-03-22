import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Course } from '@/integrations/supabase/academy.types'
import {
    Plus, Pencil, Trash2, Eye, EyeOff,
    BookOpen, Users, Trophy, TrendingUp,
    MoreVertical, Search,
} from 'lucide-react'

export default function AdminAcademyPage() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [stats, setStats] = useState({ total: 0, published: 0, students: 0, certs: 0 })
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    useEffect(() => {
        loadAll()
    }, [])

    async function loadAll() {
        const [{ data: c }, { count: s }, { count: cert }] = await Promise.all([
            supabase.from('courses').select('*').order('created_at', { ascending: false }),
            supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
            supabase.from('certificates').select('*', { count: 'exact', head: true }),
        ])
        const all = c ?? []
        setCourses(all)
        setStats({
            total: all.length,
            published: all.filter(x => x.is_published).length,
            students: s ?? 0,
            certs: cert ?? 0,
        })
        setLoading(false)
    }

    async function togglePublish(course: Course) {
        setTogglingId(course.id)
        const { error } = await supabase
            .from('courses')
            .update({ is_published: !course.is_published })
            .eq('id', course.id)
        if (!error) {
            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c))
            setStats(prev => ({
                ...prev,
                published: prev.published + (course.is_published ? -1 : 1),
            }))
        }
        setTogglingId(null)
    }

    async function deleteCourse(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا الكورس؟ سيتم حذف جميع الدروس والتقدم المرتبط به.')) return
        setDeletingId(id)
        await supabase.from('courses').delete().eq('id', id)
        setCourses(prev => prev.filter(c => c.id !== id))
        setDeletingId(null)
    }

    const filtered = courses.filter(c => {
        const matchSearch = c.title.includes(search) || c.instructor.includes(search)
        const matchFilter = filter === 'all' || (filter === 'published' ? c.is_published : !c.is_published)
        return matchSearch && matchFilter
    })

    return (
        <div className="min-h-screen pb-20" style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

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
                <div className="relative flex items-start justify-between max-w-7xl mx-auto">
                    <div>
                        <p className="text-xs font-bold mb-1" style={{ color: 'rgba(220,38,38,0.8)' }}>لوحة الإدارة</p>
                        <h1 className="text-2xl font-black text-white mb-1">إدارة الأكاديمية</h1>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {stats.total} كورس · {stats.students} طالب مسجّل
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/academy/new')}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: '#B91C1C', boxShadow: '0 4px 20px rgba(185,28,28,0.4)' }}
                    >
                        <Plus className="w-4 h-4" />
                        إضافة كورس
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-8">

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: BookOpen, val: stats.total, lbl: 'إجمالي الكورسات', color: '#B91C1C' },
                        { icon: Eye, val: stats.published, lbl: 'منشور', color: '#10B981' },
                        { icon: Users, val: stats.students, lbl: 'طلاب مسجّلون', color: '#3B82F6' },
                        { icon: Trophy, val: stats.certs, lbl: 'شهادات صادرة', color: '#D97706' },
                    ].map(({ icon: Icon, val, lbl, color }) => (
                        <div
                            key={lbl}
                            className="bg-white p-5 flex items-center gap-4"
                            style={{ borderRadius: '18px', border: '1px solid #F0EDE8' }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${color}15` }}
                            >
                                <Icon className="w-5 h-5" style={{ color }} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900">{val}</p>
                                <p className="text-xs text-gray-400">{lbl}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap gap-3 mb-5 items-center">
                    <div className="relative flex-1" style={{ minWidth: '200px', maxWidth: '320px' }}>
                        <Search className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="بحث..."
                            className="w-full py-2.5 pr-10 pl-4 text-sm outline-none"
                            style={{
                                background: '#fff', border: '1.5px solid #E5E7EB',
                                borderRadius: '12px', color: '#111',
                            }}
                        />
                    </div>
                    <div className="flex gap-1">
                        {(['all', 'published', 'draft'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150"
                                style={
                                    filter === f
                                        ? { background: '#111', color: '#fff' }
                                        : { background: '#fff', color: '#888', border: '1.5px solid #E5E7EB' }
                                }
                            >
                                {f === 'all' ? 'الكل' : f === 'published' ? 'منشور' : 'مسودة'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white overflow-hidden" style={{ borderRadius: '20px', border: '1px solid #F0EDE8' }}>
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-7 h-7 rounded-full border-2 border-red-700 border-t-transparent animate-spin mx-auto" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-bold">لا توجد كورسات</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F5F2EE' }}>
                                    {['الكورس', 'المدرب', 'المدة', 'الحالة', 'الإجراءات'].map(h => (
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
                                {filtered.map((course, i) => (
                                    <tr
                                        key={course.id}
                                        className="transition-colors duration-150 hover:bg-gray-50"
                                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F8F6F3' : 'none' }}
                                    >
                                        {/* Course */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0"
                                                    style={{ background: '#1A1A1A' }}
                                                >
                                                    {course.thumbnail_url
                                                        ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-white/20" /></div>
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{course.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Instructor */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                                                    style={{ background: '#1A1A1A' }}
                                                >
                                                    {course.instructor.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium">{course.instructor}</span>
                                            </div>
                                        </td>

                                        {/* Duration */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-500">
                                                {course.duration_mins < 60
                                                    ? `${course.duration_mins} د`
                                                    : `${Math.floor(course.duration_mins / 60)} س`}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => togglePublish(course)}
                                                disabled={togglingId === course.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
                                                style={
                                                    course.is_published
                                                        ? { background: '#ECFDF5', color: '#065F46' }
                                                        : { background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' }
                                                }
                                            >
                                                {course.is_published
                                                    ? <Eye className="w-3 h-3" />
                                                    : <EyeOff className="w-3 h-3" />
                                                }
                                                {togglingId === course.id ? '...' : course.is_published ? 'منشور' : 'مسودة'}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <ActionBtn
                                                    icon={<Pencil className="w-3.5 h-3.5" />}
                                                    label="تعديل"
                                                    onClick={() => navigate(`/admin/academy/${course.id}`)}
                                                    color="#3B82F6"
                                                />
                                                <ActionBtn
                                                    icon={<Trash2 className="w-3.5 h-3.5" />}
                                                    label="حذف"
                                                    onClick={() => deleteCourse(course.id)}
                                                    color="#EF4444"
                                                    loading={deletingId === course.id}
                                                />
                                                <ActionBtn
                                                    icon={<Users className="w-3.5 h-3.5" />}
                                                    label="الطلاب"
                                                    onClick={() => navigate(`/admin/academy/${course.id}/students`)}
                                                    color="#10B981"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

function ActionBtn({
    icon, label, onClick, color, loading = false,
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    color: string
    loading?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            title={label}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105 disabled:opacity-40"
            style={{ background: `${color}12`, color }}
        >
            {icon}
        </button>
    )
}