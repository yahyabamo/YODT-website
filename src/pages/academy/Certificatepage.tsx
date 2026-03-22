import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Download, ArrowRight, Loader2 } from 'lucide-react'

interface CertData {
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

export default function CertificatePage() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()
    const certRef = useRef<HTMLDivElement>(null)

    const [cert, setCert] = useState<CertData | null>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (courseId) load()
    }, [courseId])

    async function load() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/login'); return }

        const [{ data: certRow }, { data: course }, { data: profile }] = await Promise.all([
            supabase.from('certificates').select('*').eq('user_id', user.id).eq('course_id', courseId).maybeSingle(),
            supabase.from('courses').select('title, instructor').eq('id', courseId).single(),
            supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
        ])

        if (!certRow || !course) { setNotFound(true); setLoading(false); return }

        setCert({
            studentName: profile?.full_name ?? profile?.email ?? 'الطالب',
            courseName: course.title,
            instructor: course.instructor,
            issuedAt: formatDate(certRow.issued_at),
            certId: certRow.id,
        })
        setLoading(false)
    }

    async function downloadPDF() {
        if (!certRef.current || !cert) return
        setDownloading(true)
        try {
            const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                import('html2canvas'),
                import('jspdf'),
            ])
            const canvas = await html2canvas(certRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
            const pdfW = pdf.internal.pageSize.getWidth()
            const pdfH = pdf.internal.pageSize.getHeight()
            pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
            pdf.save(`شهادة-${cert.courseName}.pdf`)
        } catch (err) {
            console.error('PDF generation failed:', err)
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F5' }}>
            <div className="w-8 h-8 rounded-full border-2 border-red-700 border-t-transparent animate-spin" />
        </div>
    )

    if (notFound) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">
            <p className="text-xl font-black text-gray-700">لم يتم العثور على الشهادة</p>
            <p className="text-sm text-gray-400">تأكد من إكمال جميع دروس الكورس أولاً</p>
            <button onClick={() => navigate('/academy/my-learning')}
                className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: '#B91C1C' }}>
                العودة لتعلمي
            </button>
        </div>
    )

    return (
        <div className="min-h-screen pb-16" style={{ background: '#F0EDE8', fontFamily: "'Cairo', sans-serif" }} dir="rtl">

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E8E3DC' }}>
                <button onClick={() => navigate('/academy/my-learning')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowRight className="w-4 h-4" />تعلمي
                </button>
                <button onClick={downloadPDF} disabled={downloading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: '#B91C1C', boxShadow: '0 4px 16px rgba(185,28,28,0.3)' }}>
                    {downloading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التحميل...</>
                        : <><Download className="w-4 h-4" />تحميل PDF</>}
                </button>
            </div>

            {/* Preview label */}
            <p className="text-center text-xs text-gray-400 font-bold mt-6 mb-4 tracking-widest uppercase">
                معاينة الشهادة
            </p>

            {/* Certificate — this div is captured by html2canvas */}
            <div className="flex justify-center px-4">
                <div
                    ref={certRef}
                    style={{
                        width: '900px',
                        height: '636px',
                        background: '#ffffff',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: "'Cairo', sans-serif",
                        direction: 'rtl',
                    }}
                >
                    {/* ── Background layers ── */}

                    {/* Deep charcoal base */}
                    <div style={{ position: 'absolute', inset: 0, background: '#0F0F0F' }} />

                    {/* Red gradient glow top-right */}
                    <div style={{
                        position: 'absolute', top: '-80px', right: '-80px',
                        width: '400px', height: '400px',
                        background: 'radial-gradient(circle, rgba(185,28,28,0.35) 0%, transparent 65%)',
                    }} />

                    {/* Subtle red glow bottom-left */}
                    <div style={{
                        position: 'absolute', bottom: '-60px', left: '-60px',
                        width: '300px', height: '300px',
                        background: 'radial-gradient(circle, rgba(185,28,28,0.15) 0%, transparent 65%)',
                    }} />

                    {/* Diamond pattern overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.035,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 25L25 50L0 25Z' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/svg%3E")`,
                        backgroundSize: '50px 50px',
                    }} />

                    {/* Outer gold border */}
                    <div style={{
                        position: 'absolute', inset: '18px',
                        border: '1px solid rgba(180,83,9,0.4)',
                        borderRadius: '4px',
                    }} />
                    {/* Inner thin border */}
                    <div style={{
                        position: 'absolute', inset: '24px',
                        border: '0.5px solid rgba(180,83,9,0.2)',
                        borderRadius: '2px',
                    }} />

                    {/* Yemeni flag stripe — top */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', display: 'flex' }}>
                        <div style={{ flex: 1, background: '#CE1126' }} />
                        <div style={{ flex: 1, background: '#FFFFFF' }} />
                        <div style={{ flex: 1, background: '#000000' }} />
                    </div>

                    {/* Yemeni flag stripe — bottom */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', display: 'flex' }}>
                        <div style={{ flex: 1, background: '#CE1126' }} />
                        <div style={{ flex: 1, background: '#FFFFFF' }} />
                        <div style={{ flex: 1, background: '#000000' }} />
                    </div>

                    {/* Corner ornaments */}
                    {[
                        { top: '36px', right: '36px' },
                        { top: '36px', left: '36px' },
                        { bottom: '36px', right: '36px' },
                        { bottom: '36px', left: '36px' },
                    ].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', ...pos,
                            width: '28px', height: '28px',
                            border: '1.5px solid rgba(180,83,9,0.5)',
                            borderRadius: '4px',
                            transform: 'rotate(45deg)',
                        }} />
                    ))}

                    {/* ── Content ── */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '40px 60px',
                        gap: 0,
                    }}>
                        {/* Union name */}
                        <p style={{
                            fontSize: '11px', fontWeight: 600, letterSpacing: '3px',
                            color: 'rgba(180,83,9,0.85)', textTransform: 'uppercase',
                            marginBottom: '12px',
                        }}>
                            اتحاد الطلاب اليمني — الأكاديمية
                        </p>

                        {/* Title */}
                        <h1 style={{
                            fontSize: '38px', fontWeight: 900,
                            color: '#FFFFFF', marginBottom: '4px',
                            lineHeight: 1.2, textAlign: 'center',
                        }}>
                            شهادة إتمام
                        </h1>
                        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to left, transparent, #B91C1C, transparent)', marginBottom: '22px' }} />

                        {/* Awarded to */}
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                            تُمنح هذه الشهادة إلى
                        </p>

                        {/* Student name */}
                        <h2 style={{
                            fontSize: '34px', fontWeight: 900,
                            color: '#FFFFFF', marginBottom: '6px',
                            textAlign: 'center',
                            textShadow: '0 0 40px rgba(185,28,28,0.4)',
                        }}>
                            {cert!.studentName}
                        </h2>
                        <div style={{ width: '200px', height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '20px' }} />

                        {/* Completion text */}
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
                            لإتمامه بنجاح كورس
                        </p>

                        {/* Course name */}
                        <p style={{
                            fontSize: '20px', fontWeight: 800,
                            color: '#FCA5A5', textAlign: 'center',
                            marginBottom: '28px', maxWidth: '600px', lineHeight: 1.4,
                        }}>
                            {cert!.courseName}
                        </p>

                        {/* Bottom row */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                            width: '100%', marginTop: '8px',
                        }}>
                            {/* Instructor */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ width: '100px', height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '6px' }} />
                                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                                    {cert!.instructor}
                                </p>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>المدرب</p>
                            </div>

                            {/* Seal */}
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                border: '2px solid rgba(180,83,9,0.5)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(180,83,9,0.08)',
                            }}>
                                <span style={{ fontSize: '22px' }}>🏆</span>
                                <p style={{ fontSize: '7px', color: 'rgba(180,83,9,0.7)', fontWeight: 700, marginTop: '2px', letterSpacing: '1px' }}>
                                    معتمد
                                </p>
                            </div>

                            {/* Date + cert id */}
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ width: '100px', height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '6px' }} />
                                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                                    {cert!.issuedAt}
                                </p>
                                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '2px', direction: 'ltr' }}>
                                    #{cert!.certId.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}