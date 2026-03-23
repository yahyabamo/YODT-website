import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Download, ArrowRight, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'

interface CertData {
    certId: string
    studentName: string
    courseName: string
    instructor: string
    issuedAt: string
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ar-YE', {
        year: 'numeric', month: 'long', day: 'numeric',
    })
}

// ─── Fetch a font URL and return it as a base64 data URI ────────────────────
async function fetchFontAsBase64(url: string): Promise<string> {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

// ─── Resolve the actual .ttf/.woff2 URL from a Google Fonts CSS URL ─────────
async function resolveGoogleFontUrl(cssUrl: string): Promise<string | null> {
    try {
        const css = await fetch(cssUrl).then(r => r.text())
        // Look for the arabic subset block if present, otherwise fallback to the first matched url
        const parts = css.split('/* arabic */')
        const arabicBlock = parts.length > 1 ? parts[1].split('}')[0] : css
        // Extract the first src: url(...) from the selected block
        const match = arabicBlock.match(/src:\s*url\(([^)]+)\)/)
        return match ? match[1].replace(/['"]/g, '') : null
    } catch {
        return null
    }
}

export default function CertificatePage() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()
    const certRef = useRef<HTMLDivElement>(null)

    const [cert, setCert] = useState<CertData | null>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [qrDataUrl, setQrDataUrl] = useState<string>('')

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

        const certData: CertData = {
            certId: certRow.id,
            studentName: profile?.full_name ?? profile?.email ?? 'الطالب',
            courseName: course.title,
            instructor: course.instructor,
            issuedAt: formatDate(certRow.issued_at),
        }
        setCert(certData)

        // Generate QR code pointing to the public verification page
        const verifyUrl = `${window.location.origin}/verify/${certRow.id}`
        const qr = await QRCode.toDataURL(verifyUrl, {
            width: 120,
            margin: 1,
            color: { dark: '#B45309', light: '#00000000' }, // gold on transparent
        })
        setQrDataUrl(qr)

        setLoading(false)
    }

    async function downloadPDF() {
        if (!cert) return
        setDownloading(true)

        try {
            // Vercel serverless API endpoint
            const res = await fetch('/api/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: cert.studentName,
                    courseName: cert.courseName,
                    instructor: cert.instructor,
                    issuedAt: cert.issuedAt,
                    certId: cert.certId,
                    qrDataUrl: qrDataUrl
                })
            })

            if (!res.ok) throw new Error('Failed to generate PDF')

            // Create a temporary Blob URL to download the generated PDF
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `شهادة-${cert.courseName}.pdf`
            document.body.appendChild(a)
            a.click()

            // Clean up
            window.URL.revokeObjectURL(url)
            a.remove()
        } catch (err) {
            console.error('PDF generation failed:', err)
            alert('حدث خطأ أثناء الاتصال بالخادم، حاول مجدداً')
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
        <div className="min-h-screen flex flex-col items-center justify-center gap-4"
            style={{ background: '#F8F7F5', fontFamily: "'Cairo', sans-serif" }} dir="rtl">
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verify/${cert?.certId}`).then(() => alert('تم نسخ رابط التحقق!'))}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background: '#F0EDE8', color: '#666', border: '1px solid #E0D9D0' }}
                    >
                        نسخ رابط التحقق
                    </button>
                    <button onClick={downloadPDF} disabled={downloading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ background: '#B91C1C', boxShadow: '0 4px 16px rgba(185,28,28,0.3)' }}>
                        {downloading
                            ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التحميل...</>
                            : <><Download className="w-4 h-4" />تحميل PDF</>}
                    </button>
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 font-bold mt-6 mb-4 tracking-widest uppercase">
                معاينة الشهادة
            </p>

            {/* ── Certificate ── */}
            <div className="flex justify-center px-4">
                <div
                    ref={certRef}
                    id="cert-printable"   // ← add this

                    style={{
                        width: '900px',
                        height: '636px',
                        background: '#0F0F0F',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: "'Cairo', sans-serif",
                    }}
                >
                    {/* Red glow top-right */}
                    <div style={{
                        position: 'absolute', top: '-80px', right: '-80px',
                        width: '400px', height: '400px',
                        background: 'radial-gradient(circle, rgba(185,28,28,0.35) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Red glow bottom-left */}
                    <div style={{
                        position: 'absolute', bottom: '-60px', left: '-60px',
                        width: '300px', height: '300px',
                        background: 'radial-gradient(circle, rgba(185,28,28,0.15) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />

                    {/* Diamond pattern */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.035,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 25L25 50L0 25Z' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/svg%3E")`,
                        backgroundSize: '50px 50px',
                    }} />

                    {/* Outer gold border */}
                    <div style={{ position: 'absolute', inset: '18px', border: '1px solid rgba(180,83,9,0.4)', borderRadius: '4px' }} />
                    <div style={{ position: 'absolute', inset: '24px', border: '0.5px solid rgba(180,83,9,0.2)', borderRadius: '2px' }} />

                    {/* Yemeni flag — top */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', display: 'flex' }}>
                        <div style={{ flex: 1, background: '#CE1126' }} />
                        <div style={{ flex: 1, background: '#FFFFFF' }} />
                        <div style={{ flex: 1, background: '#000000' }} />
                    </div>
                    {/* Yemeni flag — bottom */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', display: 'flex' }}>
                        <div style={{ flex: 1, background: '#CE1126' }} />
                        <div style={{ flex: 1, background: '#FFFFFF' }} />
                        <div style={{ flex: 1, background: '#000000' }} />
                    </div>

                    {/* Corner diamonds */}
                    {[{ top: '36px', right: '36px' }, { top: '36px', left: '36px' },
                    { bottom: '36px', right: '36px' }, { bottom: '36px', left: '36px' }].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', ...pos,
                            width: '24px', height: '24px',
                            border: '1.5px solid rgba(180,83,9,0.45)',
                            transform: 'rotate(45deg)',
                        }} />
                    ))}

                    {/* ── Main content ── */}
                    <div
                        id="cert-inner"
                        style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '48px 80px',
                            direction: 'rtl',
                        }}
                    >
                        {/* Union label */}
                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2.5px', color: 'rgba(180,83,9,0.85)', marginBottom: '14px' }}>
                            اتحاد الطلاب اليمني — الأكاديمية
                        </p>

                        {/* Title */}
                        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.2, textAlign: 'center' }}>
                            شهادة إتمام
                        </h1>
                        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to left, transparent, #B91C1C, transparent)', marginBottom: '20px' }} />

                        {/* Awarded to */}
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                            تُمنح هذه الشهادة إلى
                        </p>

                        {/* Student name */}
                        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px', textAlign: 'center', textShadow: '0 0 40px rgba(185,28,28,0.4)' }}>
                            {cert!.studentName}
                        </h2>
                        <div style={{ width: '200px', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '18px' }} />

                        {/* Completion text */}
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>
                            لإتمامه بنجاح كورس
                        </p>

                        {/* Course name */}
                        <p style={{ fontSize: '19px', fontWeight: 800, color: '#FCA5A5', textAlign: 'center', marginBottom: '24px', maxWidth: '580px', lineHeight: 1.4 }}>
                            {cert!.courseName}
                        </p>

                        {/* Bottom row */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', gap: '16px' }}>

                            {/* Instructor */}
                            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                <div style={{ width: '90px', height: '1px', background: 'rgba(255,255,255,0.18)', marginBottom: '6px' }} />
                                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{cert!.instructor}</p>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>المدرب</p>
                            </div>

                            {/* Center: seal + QR */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                {/* Seal */}

                                {/* QR code */}
                                {qrDataUrl && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <img src={qrDataUrl} alt="QR" style={{ width: '64px', height: '64px' }} />
                                        {/* <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
                                            امسح للتحقق
                                        </p> */}
                                    </div>
                                )}
                            </div>

                            {/* Date + cert ID */}
                            <div style={{ textAlign: 'left', minWidth: '120px' }}>
                                <div style={{ width: '90px', height: '1px', background: 'rgba(255,255,255,0.18)', marginBottom: '6px', marginRight: 'auto' }} />
                                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{cert!.issuedAt}</p>
                                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginTop: '2px', direction: 'ltr' }}>
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