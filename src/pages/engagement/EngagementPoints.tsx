import { useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePoints } from '@/hooks/usePoints';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Star, Gift, Zap, Loader2 } from 'lucide-react';

const ACCENT = '#8B1A2A';

const actionLabels: Record<string, string> = {
  daily_login: '🌅 زيارة يومية',
  scanner_activity: '🎯 فعالية',
};

export default function EngagementPoints() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { totalPoints, engPoints, scannerPoints, unifiedLog, loading, visitGranted, resetVisitGranted } = usePoints();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // Show toast once on grant
  useEffect(() => {
    if (visitGranted) {
      toast.success('🎉 +2 نقاط! شكراً لزيارتك اليومية', { duration: 4000 });
      resetVisitGranted();
    }
  }, [visitGranted, resetVisitGranted]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <PageHeader title="نقاطي" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">

        {/* Total Points Card */}
        <div
          className="rounded-2xl p-6 text-white shadow-lg text-center"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #c0392b)` }}
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <Star className="h-8 w-8 fill-yellow-300 text-yellow-300" />
          </div>
          <p className="text-white/70 text-sm mb-1">مجموع نقاطك</p>
          <p className="text-5xl font-black">{totalPoints}</p>
          <p className="text-white/70 text-sm mt-2">نقطة مكتسبة</p>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-xl font-bold">{engPoints}</span>
              </div>
              <p className="text-xs text-white/60">من التفاعل</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Gift className="h-4 w-4 text-green-300" />
                <span className="text-xl font-bold">{scannerPoints}</span>
              </div>
              <p className="text-xs text-white/60">من الفعاليات</p>
            </div>
          </div>
        </div>

        {/* Unified History */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">سجل النقاط الموحّد</h3>
          {unifiedLog.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-semibold">لا يوجد سجل بعد</p>
              <p className="text-sm text-gray-400 mt-1">ابدأ بالمشاركة لكسب النقاط</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unifiedLog.map(entry => (
                <div key={`${entry.source}-${entry.id}`} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                      style={{ background: entry.source === 'engagement' ? `${ACCENT}15` : '#ecfdf5' }}
                    >
                      {entry.source === 'engagement' ? '⚡' : '🎯'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {actionLabels[entry.label] ?? entry.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="font-black text-base"
                    style={{ color: entry.points > 0 ? '#059669' : '#dc2626' }}
                  >
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
