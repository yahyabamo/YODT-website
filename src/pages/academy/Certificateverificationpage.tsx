import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle2, XCircle, BookOpen, User, Calendar, Hash, ArrowRight } from 'lucide-react'

interface VerifyData {
    studentName: string
    courseName: string
    instructor: string
    issuedAt: string
    certId: string
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ar-YE', {
        year: 'numeric', month: 'long', day: 'numeric',
    })
}

export default function CertificateVerificationPage() {
    const { certId } = useParams<{ certId: string }>()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
    const [data, setData] = useState<VerifyData | null>(null)

    useEffect(() => {
        if (certId) verify()
    }, [certId])

    async function verify() {
        if (!certId) { setStatus('invalid'); return }

        // Fetch certificate — this is a public query (no auth needed)
        const { data: cert } = await supabase
            .from('certificates')
            .select('id, user_id, course_id, issued_at')
            .eq('id', certId)
            .maybeSingle()

        if (!cert) { setStatus('invalid'); return }

        const [{ data: course }, { data: profile }] = await Promise.all([
            supabase.from('courses').select('title, instructor').eq('id', cert.course_id).single(),
            supabase.from('profiles').select('full_name, email').eq('id', cert.user_id).single(),
        ])

        setData({
            studentName: profile?.full_name ?? profile?.email ?? 'الطالب',
            courseName: course?.title ?? '—',
            instructor: course?.instructor ?? '—',
            issuedAt: formatDate(cert.issued_at),
            certId: cert.id,
        })
        setStatus('valid')
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{ background: 'linear-gradient(135deg, #111111 0%, #1A0606 100%)', fontFamily: "'Cairo', sans-serif" }}
            dir="rtl"
        >
            {/* Bg pattern */}
            <div className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 25L25 50L0 25Z' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/svg%3E")`,
                    backgroundSize: '50px 50px',
                }} />

            {/* Loading */}
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                    <p className="text-white/50 text-sm">جارٍ التحقق من الشهادة...</p>
                </div>
            )}

            {/* Invalid */}
            {status === 'invalid' && (
                <div className="flex flex-col items-center gap-5 text-center max-w-sm">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}>
                        <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white mb-2">شهادة غير موجودة</h1>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            هذه الشهادة غير موجودة أو ربما تم حذفها. تأكد من صحة الرابط.
                        </p>
                    </div>
                    <button onClick={() => navigate('/academy')}
                        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <ArrowRight className="w-4 h-4" />
                        الذهاب للأكاديمية
                    </button>
                </div>
            )}

            {/* Valid */}
            {status === 'valid' && data && (
                <div className="w-full max-w-md">

                    {/* Union header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">شهادة موثّقة ✓</span>
                        </div>
                        <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(180,83,9,0.7)' }}>
                            اتحاد الطلاب اليمني — الأكاديمية
                        </p>
                    </div>

                    {/* Certificate card */}
                    <div className="relative overflow-hidden"
                        style={{
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(180,83,9,0.3)',
                            backdropFilter: 'blur(20px)',
                        }}>

                        {/* Top flag stripe */}
                        <div style={{ height: '4px', display: 'flex' }}>
                            <div style={{ flex: 1, background: '#CE1126' }} />
                            <div style={{ flex: 1, background: '#FFFFFF' }} />
                            <div style={{ flex: 1, background: '#000000' }} />
                        </div>

                        {/* Gold glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at top right, rgba(180,83,9,0.1), transparent 65%)' }} />

                        <div className="p-8">
                            {/* Trophy */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                    style={{ background: 'linear-gradient(135deg, #D97706, #92400E)', boxShadow: '0 8px 24px rgba(180,83,9,0.3)' }}>
                                    🏆
                                </div>
                            </div>

                            {/* Student name */}
                            <div className="text-center mb-8">
                                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>تُمنح هذه الشهادة إلى</p>
                                <h2 className="text-2xl font-black text-white mb-1">{data.studentName}</h2>
                                <div className="w-24 h-0.5 mx-auto rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-8">
                                {[
                                    { icon: BookOpen, label: 'الكورس', value: data.courseName, color: '#FCA5A5' },
                                    { icon: User, label: 'المدرب', value: data.instructor, color: 'rgba(255,255,255,0.7)' },
                                    { icon: Calendar, label: 'تاريخ الإصدار', value: data.issuedAt, color: 'rgba(255,255,255,0.7)' },
                                    { icon: Hash, label: 'رقم الشهادة', value: `#${data.certId.slice(0, 8).toUpperCase()}`, color: 'rgba(255,255,255,0.35)' },
                                ].map(({ icon: Icon, label, value, color }) => (
                                    <div key={label}
                                        className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(180,83,9,0.15)' }}>
                                            <Icon className="w-4 h-4" style={{ color: '#D97706' }} />
                                        </div>
                                        <div>
                                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                                            <p className="text-sm font-bold" style={{ color }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Verified stamp */}
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <p className="text-sm font-bold text-emerald-400">
                                    هذه الشهادة موثّقة وصادرة من نظام الاتحاد
                                </p>
                            </div>
                        </div>

                        {/* Bottom flag stripe */}
                        <div style={{ height: '4px', display: 'flex' }}>
                            <div style={{ flex: 1, background: '#CE1126' }} />
                            <div style={{ flex: 1, background: '#FFFFFF' }} />
                            <div style={{ flex: 1, background: '#000000' }} />
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        تم التحقق بواسطة منصة الأكاديمية — اتحاد الطلاب اليمني
                    </p>
                </div>
            )}
        </div>
    )
}