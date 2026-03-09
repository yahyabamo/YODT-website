import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Shield, Calendar, Award, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateSecureToken, getTokenExpirySeconds } from '@/lib/qrToken';
import { SmartTopBar } from '@/components/layout/SmartTopBar';

interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  university: string | null;
  faculty: string | null;
  student_id: string | null;
  avatar_url: string | null;
  membership_qr_token: string | null;
  membership_expires_at: string | null;
  role: string;
  status: string;
  total_points: number;
  created_at: string | null;
  updated_at: string | null;
}

const MembershipCard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState('');
  const [expirySeconds, setExpirySeconds] = useState(60);
  const [showSearch, setShowSearch] = useState(false);
  const verifyUrl = `${window.location.origin}/verify/${qrToken}`;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); } else { fetchProfile(); }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      if (data) { setProfile(data as Profile); refreshToken(data.id); }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = (userId?: string) => {
    const id = userId || profile?.id;
    if (!id) return;
    setQrToken(generateSecureToken(id));
    setExpirySeconds(getTokenExpirySeconds());
  };

  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => refreshToken(), 600000);
    const countdown = setInterval(() => {
      setExpirySeconds(prev => { if (prev <= 1) { refreshToken(); return 60; } return prev - 1; });
    }, 1000);
    return () => { clearInterval(interval); clearInterval(countdown); };
  }, [profile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">لم يتم العثور على الملف الشخصي</p>
      </div>
    );
  }

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const joinDate = profile.created_at ? fmt(profile.created_at) : 'غير محدد';
  const validUntil = profile.membership_expires_at
    ? fmt(profile.membership_expires_at)
    : (() => {
      const e = new Date(profile.created_at!);
      e.setFullYear(e.getFullYear() + 1);
      return fmt(e.toISOString());
    })();

  const verificationCode = `🇾🇪-${profile.id.slice(0, 8)}-2026`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');

        /* ── ALL colors come from CSS variables → auto light/dark ── */

        .mc-page {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 96px;
          font-family: 'Tajawal', sans-serif;
        }

        /* ── Main card shell ── */
        .mc-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 26px;
          overflow: hidden;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.06),
            0 10px 40px rgba(0,0,0,0.08),
            0 0 0 1px rgba(255,255,255,0.5) inset;
        }
        .dark .mc-card {
          box-shadow:
            0 1px 3px rgba(0,0,0,0.3),
            0 10px 40px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .mc-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 2px 6px rgba(0,0,0,0.08),
            0 20px 60px rgba(0,0,0,0.13),
            0 0 0 1px rgba(255,255,255,0.6) inset;
        }
        .dark .mc-card:hover {
          box-shadow:
            0 2px 6px rgba(0,0,0,0.4),
            0 20px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.07) inset;
        }

        /* ── Gradient header using primary ── */
        .mc-header {
          background: linear-gradient(135deg,
            hsl(var(--primary)) 0%,
            hsl(var(--primary) / 0.82) 100%
          );
          padding: 20px 20px 64px;   /* extra bottom padding so avatar is centered on edge */
          position: relative;
          overflow: hidden;
        }
        /* shine overlay */
        .mc-header::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%);
          pointer-events: none;
        }
        /* decorative circle */
        .mc-header::after {
          content: '';
          position: absolute;
          top: -70px; right: -50px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          pointer-events: none;
        }

        /* ── Active member badge ── */
        .mc-badge {
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.4);
          color: #fff;
          font-family: 'Tajawal', sans-serif;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          backdrop-filter: blur(4px);
        }
        .mc-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #86efac;
          box-shadow: 0 0 8px #4ade80;
          animation: mc-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes mc-dot-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.5; transform:scale(0.75); }
        }

        /* ── Avatar area ──
           The outer div just reserves space.
           The ring SVG rotates. The <img> is absolutely positioned
           and has its own transform:none so it is ALWAYS still.
        ── */
        .mc-avatar-area {
          display: flex;
          justify-content: center;
          /* pull it up so avatar overlaps header bottom */
          margin-top: -56px;
          position: relative;
          z-index: 10;
        }
        .mc-avatar-shell {
          position: relative;
          width: 116px;
          height: 116px;
        }
        /* The spinning ring — only this element rotates */
        .mc-ring-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          animation: mc-ring 5s linear infinite;
        }
        @keyframes mc-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Photo container — absolutely positioned, transform: none! */
        .mc-photo {
          position: absolute;
          inset: 5px;          /* 5px breathing room from ring stroke */
          border-radius: 50%;
          overflow: hidden;
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          /* Critically: no transform, no animation */
          transform: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .mc-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }

        /* ── Body ── */
        .mc-body {
          padding: 0 20px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mc-divider {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin: 18px 0;
        }

        /* ── QR box ── */
        .mc-qr-box {
          background: #ffffff;
          border-radius: 18px;
          padding: 14px;
          position: relative;
          box-shadow:
            0 6px 24px rgba(0,0,0,0.1),
            0 0 0 1.5px hsl(var(--primary) / 0.3);
          animation: mc-qr-glow 3s ease-in-out infinite;
        }
        @keyframes mc-qr-glow {
          0%,100% {
            box-shadow: 0 6px 24px rgba(0,0,0,0.1), 0 0 0 1.5px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 6px 24px rgba(0,0,0,0.12), 0 0 0 2px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.12);
          }
        }

        /* corner brackets */
        .mc-c { position:absolute; width:18px; height:18px; border-style:solid; border-color:hsl(var(--primary)); }
        .mc-c-tl { top:5px; left:5px;   border-width:3px 0 0 3px; border-radius:4px 0 0 0; }
        .mc-c-tr { top:5px; right:5px;  border-width:3px 3px 0 0; border-radius:0 4px 0 0; }
        .mc-c-bl { bottom:5px; left:5px;  border-width:0 0 3px 3px; border-radius:0 0 0 4px; }
        .mc-c-br { bottom:5px; right:5px; border-width:0 3px 3px 0; border-radius:0 0 4px 0; }

        /* scan line */
        .mc-scan {
          position: absolute;
          left: 10px; right: 10px;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.7), transparent);
          border-radius: 2px;
          animation: mc-scan 2.2s ease-in-out infinite;
        }
        @keyframes mc-scan {
          0%   { top:10px; opacity:0; }
          8%   { opacity:1; }
          92%  { opacity:1; }
          100% { top:calc(100% - 10px); opacity:0; }
        }

        /* timer pill */
        .mc-timer-pill {
          background: var(--card);
          border: 1px solid hsl(var(--primary) / 0.35);
          border-radius: 20px;
          padding: 5px 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: hsl(var(--primary));
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        @keyframes mc-spin { to { transform: rotate(360deg); } }
        .mc-spin { animation: mc-spin 2s linear infinite; display:block; }

        /* verification chip */
        .mc-chip {
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 18px;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: var(--muted-foreground);
          letter-spacing: 1px;
          direction: ltr;
        }

        /* info rows */
        .mc-row {
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.18s;
        }
        .mc-row:hover { border-color: hsl(var(--primary) / 0.4); }
        .mc-icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mc-pts {
          font-weight: 800; font-size: 15px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.65));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* instructions card */
        .mc-instr {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .mc-step {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.3);
          color: hsl(var(--primary));
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      <div className="mc-page" dir="rtl">

        {/* Sticky top bar */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
          </div>
        </header>

        <div className="px-4 py-6 max-w-sm mx-auto space-y-4">

          {/* ════ MEMBERSHIP CARD ════ */}
          <div className="mc-card">

            {/* Header */}
            <div className="mc-header">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 border border-white/30">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px] leading-none">اتحاد الطلاب اليمنيين</p>
                    <p className="text-white/70 text-[11px] mt-0.5">فرع إسطنبول — تركيا</p>
                  </div>
                </div>
                <div className="mc-badge">
                  <span className="mc-dot" />
                  عضو فعال
                </div>
              </div>
            </div>

            {/* Avatar — overlaps header / body boundary */}
            <div className="mc-avatar-area">
              <div className="mc-avatar-shell">
                {/* Spinning ring only */}
                <svg className="mc-ring-svg" viewBox="0 0 116 116">
                  <defs>
                    <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <circle cx="58" cy="58" r="53"
                    fill="none"
                    stroke="url(#rg)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="200 133"
                  />
                </svg>
                {/* Static photo — absolutely positioned, NEVER rotates */}
                <div className="mc-photo">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.full_name} />
                    : <User className="w-12 h-12 text-muted-foreground" />
                  }
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="mc-body">
              <h2 className="text-foreground font-bold text-2xl text-center leading-tight mt-3">
                {profile.full_name}
              </h2>
              <p className="text-muted-foreground text-sm mt-1 text-center">
                {profile.university || 'الجامعة غير محددة'}
              </p>

              <div className="mc-divider" />

              {/* QR */}
              <p className="text-muted-foreground text-xs mb-4 text-center">
                امسح رمز QR للتحقق من العضوية
              </p>

              <div className="mc-qr-box relative">
                <div className="mc-c mc-c-tl" />
                <div className="mc-c mc-c-tr" />
                <div className="mc-c mc-c-bl" />
                <div className="mc-c mc-c-br" />
                <div className="mc-scan" />
                <QRCodeSVG value={verifyUrl} size={195} level="H" includeMargin={false} className="relative z-10 block" />
              </div>

              {/* Timer + note */}
              <div className="flex flex-col items-center gap-1.5 mt-4">
                <div className="mc-timer-pill">
                  <RefreshCw className="w-3.5 h-3.5 mc-spin" />
                  <span>{expirySeconds}s</span>
                </div>
                <p className="text-muted-foreground text-[11px] text-center">
                  🔒 يتجدد الرمز تلقائياً كل دقيقة
                </p>
              </div>

              {/* Verification code */}
              <div className="mc-chip mt-3">{verificationCode}</div>

              <div className="mc-divider" />

              {/* Info rows */}
              <div className="w-full space-y-2.5">
                <div className="mc-row">
                  <div className="flex items-center gap-3">
                    <div className="mc-icon"><Calendar className="w-4 h-4 text-primary" /></div>
                    <span className="text-muted-foreground text-sm">تاريخ الانضمام</span>
                  </div>
                  <span className="text-foreground text-sm font-semibold" style={{ direction: 'ltr' }}>{joinDate}</span>
                </div>

                <div className="mc-row">
                  <div className="flex items-center gap-3">
                    <div className="mc-icon"><Shield className="w-4 h-4 text-primary" /></div>
                    <span className="text-muted-foreground text-sm">صالحة حتى</span>
                  </div>
                  <span className="text-foreground text-sm font-semibold" style={{ direction: 'ltr' }}>{validUntil}</span>
                </div>

                <div className="mc-row">
                  <div className="flex items-center gap-3">
                    <div className="mc-icon"><Award className="w-4 h-4 text-primary" /></div>
                    <span className="text-muted-foreground text-sm">رصيد النقاط</span>
                  </div>
                  <span className="mc-pts">{profile.total_points} نقطة</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════ INSTRUCTIONS ════ */}
          <div className="mc-instr">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-foreground font-bold text-sm">كيفية استخدام البطاقة</h3>
            </div>
            <div className="space-y-3">
              {[
                'أظهر هذه البطاقة عند زيارة الشركاء والداعمين',
                'سيقوم الداعم بمسح رمز QR للتحقق من عضويتك',
                'ستحصل على الخصم المخصص لأعضاء الاتحاد فوراً!',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mc-step">{i + 1}</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default MembershipCard;