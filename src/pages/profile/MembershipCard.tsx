import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Shield, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateSecureToken, getTokenExpirySeconds } from '@/lib/qrToken';
import { SmartTopBar } from '@/components/layout/SmartTopBar';

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

  const [state, setState] = useState<TrackPageState>({
    track: null, userId: null, loading: true, currentPage: 1, totalPages: 0,
    bookmarkedPages: new Set(), noteInput: '', savingNote: false,
    showAllNotes: false, showSearch: false, searchQuery: '', chatInput: '', sendingMsg: false,
  });
  const updateState = useCallback((updates: Partial<TrackPageState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const verifyUrl = `${window.location.origin}/verify-member/${qrToken}`;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); } else { fetchProfile(); }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      if (data) { setProfile(data as Profile); refreshToken(data.id); }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally { setLoading(false); }
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
        <p className="text-muted-foreground" style={{ fontFamily: 'Tajawal, sans-serif' }}>لم يتم العثور على الملف الشخصي</p>
      </div>
    );
  }

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  const joinDate = profile.created_at ? fmt(profile.created_at) : 'غير محدد';
  const validUntil = profile.membership_expires_at
    ? fmt(profile.membership_expires_at)
    : (() => {
      const e = new Date(profile.created_at!);
      e.setFullYear(e.getFullYear() + 1);
      return fmt(e.toISOString());
    })();

  const memberId = `🇾🇪-${profile.id.slice(0, 8).toUpperCase()}-2026`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');

        .mc3-page {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 100px;
          font-family: 'Tajawal', sans-serif;
        }

        .mc3-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--background);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(14px);
          padding: 12px 16px;
        }

        /* ══ CARD SHELL ══ */
        .mc3-card {
          width: 100%;
          max-width: 360px;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.1);
        }
        .dark .mc3-card {
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.45);
        }

        /* ══ HEADER ══ */
        .mc3-header {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.78) 100%);
          padding: 18px 18px 52px;
          position: relative;
          overflow: hidden;
        }
        .mc3-header::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 55%);
          pointer-events: none;
        }
        .mc3-header::after {
          content: '';
          position: absolute;
          top: -60px; right: -55px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .mc3-header-circle2 {
          position: absolute;
          bottom: -30px; left: -30px;
          width: 110px; height: 110px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }
        .mc3-org-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }
        .mc3-org-logo { display: flex; align-items: center; gap: 9px; }
        .mc3-emblem {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        }
        .mc3-org-name { color: #fff; font-size: 12px; font-weight: 700; line-height: 1.2; }
        .mc3-org-sub  { color: rgba(255,255,255,0.65); font-size: 9.5px; margin-top: 1px; }
        .mc3-active-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 20px;
          padding: 4px 10px;
          backdrop-filter: blur(4px);
        }
        .mc3-active-badge span { color: #fff; font-size: 10.5px; font-weight: 700; }
        .mc3-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #86efac; box-shadow: 0 0 7px #4ade80;
          animation: mc3-pulse 2s ease-in-out infinite;
        }
        @keyframes mc3-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.7); }
        }

        /* ══ AVATAR ══ */
        .mc3-avatar-area {
          display: flex;
          justify-content: center;
          margin-top: -52px;
          position: relative;
          z-index: 10;
        }
        .mc3-avatar-shell { position: relative; width: 108px; height: 108px; }
        .mc3-ring-svg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          animation: mc3-ring 5s linear infinite;
        }
        @keyframes mc3-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mc3-photo {
          position: absolute; inset: 5px;
          border-radius: 50%;
          background: var(--muted);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          transform: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18);
          border: 3px solid var(--card);
        }
        .mc3-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }

        /* ══ BODY ══ */
        .mc3-body {
          padding: 6px 18px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mc3-name {
          color: var(--foreground);
          font-size: 18px; font-weight: 800;
          text-align: center; line-height: 1.25;
          margin-top: 8px; margin-bottom: 2px;
        }
        .mc3-university {
          color: var(--muted-foreground);
          font-size: 11px; text-align: center;
        }
        .mc3-id-chip {
          display: inline-flex;
          align-items: center;
          background: hsl(var(--primary) / 0.08);
          border: 1px solid hsl(var(--primary) / 0.2);
          border-radius: 8px;
          padding: 5px 12px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: hsl(var(--primary));
          letter-spacing: 0.5px;
          direction: ltr;
          margin-top: 8px;
        }

        /* ══ STATS ══ */
        .mc3-stats {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr;
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          margin-top: 14px;
        }
        .mc3-sdiv { background: var(--border); }
        .mc3-stat { padding: 10px 6px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .mc3-stat-val { font-size: 11.5px; font-weight: 800; color: var(--foreground); direction: ltr; letter-spacing: -0.2px; }
        .mc3-stat-val.primary { color: hsl(var(--primary)); }
        .mc3-stat-lbl { font-size: 8.5px; color: var(--muted-foreground); text-align: center; }

        /* ══ DIVIDER ══ */
        .mc3-divider { width: 100%; height: 1px; background: var(--border); margin: 14px 0; }

        /* ══ QR ══ */
        .mc3-qr-wrap { width: 100%; display: flex; align-items: center; gap: 14px; }
        .mc3-qr-box {
          flex-shrink: 0;
          position: relative;
          width: 106px; height: 106px;
          border-radius: 16px; padding: 9px;
          background: #ffffff;
          box-shadow: 0 0 0 1.5px hsl(var(--primary)/0.35), 0 6px 20px rgba(0,0,0,0.12);
          animation: mc3-qr-breathe 3s ease-in-out infinite;
        }
        @keyframes mc3-qr-breathe {
          0%,100% { box-shadow: 0 0 0 1.5px hsl(var(--primary)/0.35), 0 6px 20px rgba(0,0,0,0.12); }
          50%      { box-shadow: 0 0 0 2.5px hsl(var(--primary)/0.6), 0 6px 24px rgba(0,0,0,0.14), 0 0 18px hsl(var(--primary)/0.1); }
        }
        .mc3-scan {
          position: absolute; left: 7px; right: 7px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)/0.75), transparent);
          animation: mc3-scan 2.3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes mc3-scan {
          0%   { top: 7px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: calc(100% - 7px); opacity: 0; }
        }
        .mc3-br { position: absolute; width: 12px; height: 12px; border-style: solid; border-color: hsl(var(--primary)); }
        .mc3-br-tl { top:3px; left:3px;    border-width:2px 0 0 2px; border-radius:3px 0 0 0; }
        .mc3-br-tr { top:3px; right:3px;   border-width:2px 2px 0 0; border-radius:0 3px 0 0; }
        .mc3-br-bl { bottom:3px; left:3px;  border-width:0 0 2px 2px; border-radius:0 0 0 3px; }
        .mc3-br-br { bottom:3px; right:3px; border-width:0 2px 2px 0; border-radius:0 0 3px 0; }

        .mc3-qr-meta { flex: 1; display: flex; flex-direction: column; gap: 7px; }
        .mc3-qr-title { color: var(--foreground); font-size: 12.5px; font-weight: 700; }
        .mc3-qr-sub { color: var(--muted-foreground); font-size: 9.5px; line-height: 1.5; }
        .mc3-timer {
          display: inline-flex; align-items: center; gap: 5px;
          background: hsl(var(--primary)/0.08);
          border: 1px solid hsl(var(--primary)/0.25);
          border-radius: 20px; padding: 4px 10px;
          align-self: flex-start;
        }
        .mc3-timer span { color: hsl(var(--primary)); font-size: 11px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
        @keyframes mc3-spin { to { transform: rotate(360deg); } }
        .mc3-spin { animation: mc3-spin 2s linear infinite; }
        .mc3-secure { color: var(--muted-foreground); font-size: 9px; }

        /* ══ FOOTER ══ */
        .mc3-footer {
          background: hsl(var(--primary)/0.06);
          border-top: 1px solid hsl(var(--primary)/0.15);
          padding: 9px 18px;
          display: flex; align-items: center; justify-content: space-between;
          direction: ltr;
        }
        .mc3-footer-text { color: hsl(var(--primary)/0.5); font-size: 8.5px; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.5px; }
        .mc3-footer-year { color: hsl(var(--primary)); font-size: 11px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px; }

        /* ══ INSTRUCTIONS ══ */
        .mc3-instr {
          max-width: 360px; width: 100%;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 14px 16px;
        }
        .mc3-instr-title {
          color: var(--foreground); font-size: 12px; font-weight: 700;
          margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
        }
        .mc3-step-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 7px 0; border-bottom: 1px solid var(--border);
        }
        .mc3-step-row:last-child { border-bottom: none; padding-bottom: 0; }
        .mc3-step-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: hsl(var(--primary)/0.1); border: 1px solid hsl(var(--primary)/0.3);
          color: hsl(var(--primary)); font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mc3-step-text { color: var(--muted-foreground); font-size: 11.5px; line-height: 1.55; padding-top: 2px; }
      `}</style>

      <div className="mc3-page" dir="rtl">

        {/* ── Top Bar ── */}
        <header className="mc3-topbar">
          <div className="max-w-screen-xl mx-auto">
            <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => navigate('/profile')} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <ArrowRight className="h-4 w-4 text-foreground/70" />
              </button>
              <h1 className="text-sm font-bold flex-1 text-center px-4 text-foreground" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                بطاقة العضوية
              </h1>
              <div className="w-8" />
            </div>
          </div>
        </header>

        <div className="px-4 pt-6 pb-6 flex flex-col items-center gap-4 max-w-sm mx-auto">

          {/* ═══════════ CARD ═══════════ */}
          <div className="mc3-card">

            {/* Header */}
            <div className="mc3-header">
              <div className="mc3-header-circle2" />
              <div className="mc3-org-row">
                <div className="mc3-org-logo">
                  <div className="mc3-emblem">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="mc3-org-name">اتحاد الطلاب اليمنيين</div>
                    <div className="mc3-org-sub">فرع إسطنبول — تركيا 🇹🇷</div>
                  </div>
                </div>
                <div className="mc3-active-badge">
                  <span className="mc3-dot" />
                  <span>عضو فعّال</span>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="mc3-avatar-area">
              <div className="mc3-avatar-shell">
                <svg className="mc3-ring-svg" viewBox="0 0 108 108">
                  <defs>
                    <linearGradient id="mc3rg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                      <stop offset="55%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  <circle cx="54" cy="54" r="50" fill="none"
                    stroke="url(#mc3rg)" strokeWidth="3.5"
                    strokeLinecap="round" strokeDasharray="180 135"
                  />
                </svg>
                <div className="mc3-photo">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.full_name} />
                    : <User className="w-10 h-10 text-muted-foreground" />
                  }
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="mc3-body">
              <div className="mc3-name">{profile.full_name}</div>
              <div className="mc3-university">{profile.university || 'الجامعة غير محددة'}</div>
              <div className="mc3-id-chip">{memberId}</div>

              {/* Stats */}
              <div className="mc3-stats">
                <div className="mc3-stat">
                  <span className="mc3-stat-val">{joinDate.slice(-4)}</span>
                  <span className="mc3-stat-lbl">انضمام</span>
                </div>
                <div className="mc3-sdiv" />
                <div className="mc3-stat">
                  <span className="mc3-stat-val" style={{ fontSize: '10px' }}>{validUntil}</span>
                  <span className="mc3-stat-lbl">صالحة حتى</span>
                </div>
                <div className="mc3-sdiv" />
                <div className="mc3-stat">
                  <span className="mc3-stat-val primary">{profile.total_points}</span>
                  <span className="mc3-stat-lbl">نقطة</span>
                </div>
              </div>

              <div className="mc3-divider" />

              {/* QR */}
              <div className="mc3-qr-wrap">
                <div className="mc3-qr-box">
                  <div className="mc3-br mc3-br-tl" />
                  <div className="mc3-br mc3-br-tr" />
                  <div className="mc3-br mc3-br-bl" />
                  <div className="mc3-br mc3-br-br" />
                  <div className="mc3-scan" />
                  <QRCodeSVG value={verifyUrl} size={88} level="H" includeMargin={false}
                    style={{ position: 'relative', zIndex: 1, display: 'block' }} />
                </div>
                <div className="mc3-qr-meta">
                  <div>
                    <div className="mc3-qr-title">تحقق من العضوية</div>
                    <div className="mc3-qr-sub">امسح الرمز للتحقق الفوري من هوية العضو</div>
                  </div>
                  <div className="mc3-timer">
                    <RefreshCw className="w-3 h-3 mc3-spin" style={{ color: 'hsl(var(--primary))' }} />
                    <span>{expirySeconds}s</span>
                  </div>
                  <div className="mc3-secure">🔒 يتجدد تلقائياً كل دقيقة</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mc3-footer">
              <span style={{ fontSize: '16px' }}>🇾🇪</span>
              <span className="mc3-footer-text">YEMENI STUDENTS UNION · ISTANBUL</span>
              <span className="mc3-footer-year">2026</span>
            </div>
          </div>

          {/* ═══════════ INSTRUCTIONS ═══════════ */}
          <div className="mc3-instr">
            <div className="mc3-instr-title">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              كيفية استخدام البطاقة
            </div>
            {[
              'أظهر هذه البطاقة عند زيارة الشركاء والداعمين',
              'سيقوم الداعم بمسح رمز QR للتحقق من عضويتك',
              'ستحصل على الخصم المخصص لأعضاء الاتحاد فوراً!',
            ].map((step, i) => (
              <div key={i} className="mc3-step-row">
                <div className="mc3-step-num">{i + 1}</div>
                <p className="mc3-step-text">{step}</p>
              </div>
            ))}
          </div>

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default MembershipCard;