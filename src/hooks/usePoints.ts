import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// ── Local Types ──────────────────────────────────────────────────────────────

export interface EngPointsLog {
  id: string;
  user_id: string;
  action: string;
  points: number;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** ISO date string in YYYY-MM-DD format using local time */
const todayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePoints() {
  const { user } = useAuth();
  const [engPoints, setEngPoints] = useState(0);
  const [scannerPoints, setScannerPoints] = useState(0);
  const [engLog, setEngLog] = useState<EngPointsLog[]>([]);
  const [scannerLog, setScannerLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayVisited, setTodayVisited] = useState(false);
  const [visitGranted, setVisitGranted] = useState(false);

  // ── Fetch all points data ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      const [engRes, engLogRes, scanRes, scanLogRes] = await Promise.all([
        // eng_user_points total
        (supabase as any)
          .from('eng_user_points')
          .select('total_points')
          .eq('user_id', user.id)
          .maybeSingle(),
        // eng_points_log history
        (supabase as any)
          .from('eng_points_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        // profile total_points from existing system
        supabase
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .maybeSingle(),
        // points_history from existing ScannerAdmin system
        supabase
          .from('points_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      setEngPoints(engRes.data?.total_points ?? 0);
      setEngLog((engLogRes.data as EngPointsLog[]) || []);
      setScannerPoints(scanRes.data?.total_points ?? 0);
      setScannerLog(scanLogRes.data || []);
    } catch (err) {
      console.error('[usePoints] fetchData error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Daily visit check + award +2 points (race-condition safe) ─────────────
  const checkDailyVisit = useCallback(async () => {
    if (!user) return;
    const today = todayDateStr();

    try {
      // Try to insert the visit — unique(user_id, date) constraint prevents duplicates
      const { error: insErr } = await (supabase as any)
        .from('eng_daily_visits')
        .insert({ user_id: user.id, date: today });

      if (insErr) {
        // 23505 = unique_violation → already visited today
        if (insErr.code === '23505') {
          setTodayVisited(true);
          return;
        }
        // Any other error: log and bail
        console.error('[usePoints] checkDailyVisit insert error:', insErr);
        return;
      }

      // ── Insert succeeded → first visit today → award +2 points ───────────

      // 1. Upsert eng_user_points
      const { data: existingPts } = await (supabase as any)
        .from('eng_user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      const newTotal = (existingPts?.total_points ?? 0) + 2;

      await (supabase as any)
        .from('eng_user_points')
        .upsert({ user_id: user.id, total_points: newTotal }, { onConflict: 'user_id' });

      // 2. Insert into eng_points_log
      await (supabase as any)
        .from('eng_points_log')
        .insert({ user_id: user.id, action: 'daily_login', points: 2 });

      setTodayVisited(true);
      setVisitGranted(true); // trigger toast in UI
      setEngPoints(newTotal);
    } catch (err) {
      console.error('[usePoints] checkDailyVisit error:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Run daily visit check first, then fetch full data
    checkDailyVisit().then(fetchData);
  }, [user, checkDailyVisit, fetchData]);

  /** Combined total = eng_user_points + ScannerAdmin total_points */
  const totalPoints = engPoints + scannerPoints;

  /** Unified log: merge eng_points_log + points_history, sorted by date desc */
  const unifiedLog = [
    ...engLog.map((e) => ({
      id: e.id,
      points: e.points,
      label: e.action === 'daily_login' ? 'زيارة يومية' : e.action,
      created_at: e.created_at,
      source: 'engagement' as const,
    })),
    ...scannerLog.map((e) => ({
      id: e.id,
      points: e.change_amount ?? e.points ?? 0,
      label: e.reason || 'فعالية',
      created_at: e.created_at,
      source: 'scanner' as const,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    totalPoints,
    engPoints,
    scannerPoints,
    unifiedLog,
    loading,
    todayVisited,
    visitGranted,
    resetVisitGranted: () => setVisitGranted(false),
    refresh: fetchData,
  };
}
