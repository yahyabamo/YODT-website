import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getElections, isAdmin, type Election } from '../../lib/elections'
import ElectionCard from '../../components/elections/Electioncard'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, Vote } from 'lucide-react'
import { SmartTopBar } from '@/components/layout/SmartTopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function ElectionsPage() {
    const { profile } = useAuth()
    const admin = profile ? isAdmin(profile.role) : false

    const [elections, setElections] = useState<Election[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSearch, setShowSearch] = useState(false)

    useEffect(() => {
        getElections()
            .then(setElections)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    const visible = elections.filter((e) => admin || e.status !== 'draft')

    // In our concept, there is only one active election at a time
    const activeElection = visible.find((e) => e.status !== 'closed')
    const closedElections = visible.filter((e) => e.status === 'closed')

    return (
        <div dir="rtl" className="min-h-screen bg-background transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>


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
                        <span className="eyebrow-text ar-only">منصة الانتخابات الرسمية — اتحاد الطلاب اليمنيين</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                        شارك في صنع القرار مع{' '}
                        <span style={{ color: '#DC2626' }}>الاتحاد</span>
                    </h1>
                    <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '520px' }}>
                        رشّح نفسك، تابع البرامج الانتخابية، وصوّت لمن يمثلك.
                    </p>
                </div>
            </section>

            {/* ── Main content ── */}
            <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
                {loading && (
                    <div className="flex justify-center py-24">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-700 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold shadow-sm">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        {error}
                    </div>
                )}

                {!loading && !error && visible.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm max-w-2xl mx-auto">
                        <div className="text-7xl mb-6 drop-shadow-md">🗳️</div>
                        <h3 className="text-2xl font-extrabold text-zinc-900 mb-3">لا توجد انتخابات بعد</h3>
                        <p className="text-zinc-500 text-base">سيتم الإعلان عن الانتخابات القادمة قريباً. تابعنا لمعرفة كل جديد.</p>
                    </div>
                )}

                {!loading && !error && visible.length > 0 && (
                    <div className="space-y-12">
                        {/* Active Election */}
                        {activeElection ? (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-8 rounded-full bg-emerald-500" />
                                    <h2 className="text-2xl font-extrabold text-zinc-900 m-0">الانتخاب الحالي</h2>
                                </div>
                                <div className="max-w-3xl">
                                    <ElectionCard election={activeElection} />
                                </div>
                            </section>
                        ) : (
                            <section className="text-center py-16 bg-white rounded-3xl border border-zinc-100 shadow-sm max-w-3xl mx-auto">
                                <div className="text-6xl mb-4 drop-shadow-sm">⏳</div>
                                <h3 className="text-xl font-extrabold text-zinc-900 mb-2">لا يوجد انتخاب نشط حالياً</h3>
                                <p className="text-zinc-500 text-sm">شكراً لمشاركتكم في الانتخابات السابقة. ترقبوا الإعلان عن الدورة القادمة قريباً!</p>
                            </section>
                        )}

                        {/* Closed Elections */}
                        {closedElections.length > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                                <div className="flex items-center gap-3 mb-6 pt-10 border-t border-zinc-100">
                                    <h2 className="text-xl font-bold text-zinc-400 m-0">الانتخابات المنتهية</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-90 hover:opacity-100 transition-opacity">
                                    {closedElections.map((e) => (
                                        <ElectionCard key={e.id} election={e} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}