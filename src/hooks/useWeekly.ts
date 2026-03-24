import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// ── Local Types ──────────────────────────────────────────────────────────────

export type ActivityType = 'text_question' | 'multiple_choice' | 'poll';

/** JSON payload stored in eng_weekly_questions.description */
export interface ActivityMeta {
  type: ActivityType;
  options?: string[]; // For multiple_choice / poll
}

export interface WeeklyQuestion {
  id: string;
  title: string;
  description: string | null; // raw JSON string (ActivityMeta)
  is_active: boolean;
  created_at: string;
  // Parsed fields (derived)
  meta: ActivityMeta;
}

export interface WeeklyAnswer {
  id: string;
  question_id: string;
  user_id: string;
  content: string; // text response OR option label
  votes: number;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

export interface WeeklyComment {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

// ── Helper: parse JSON meta from description field ────────────────────────────
function parseMeta(description: string | null): ActivityMeta {
  if (!description) return { type: 'text_question' };
  try {
    const parsed = JSON.parse(description);
    return {
      type: parsed.type ?? 'text_question',
      options: Array.isArray(parsed.options) ? parsed.options : undefined,
    };
  } catch {
    return { type: 'text_question' };
  }
}
// Simplified: Just returns the data since it's already flat
// Replace your old parseMeta and enrichQuestion with this:

function enrichQuestion(raw: any): WeeklyQuestion {
  if (!raw) return raw;

  return {
    ...raw,
    // We map the new flat columns into the 'meta' object 
    // so the rest of your React code doesn't have to change!
    meta: {
      type: raw.activity_type as ActivityType,
      options: Array.isArray(raw.options) ? raw.options : undefined,
    }
  };
}

// ── User Hook ─────────────────────────────────────────────────────────────────

export function useWeekly() {
  const { user } = useAuth();
  const [question, setQuestion] = useState<WeeklyQuestion | null>(null);
  const [answers, setAnswers] = useState<WeeklyAnswer[]>([]);
  const [comments, setComments] = useState<WeeklyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<WeeklyAnswer | null>(null);
  const [votedAnswerIds, setVotedAnswerIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: qData, error: qErr } = await (supabase as any)
        .from('eng_weekly_questions')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (qErr) throw qErr;
      if (!qData) { setQuestion(null); setLoading(false); return; }

      const enriched = enrichQuestion(qData);
      setQuestion(enriched);

      const { data: aData, error: aErr } = await (supabase as any)
        .from('eng_weekly_answers')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('question_id', qData.id)
        .order('votes', { ascending: false });

      if (aErr) throw aErr;
      const answersArr = (aData as WeeklyAnswer[]) || [];
      setAnswers(answersArr);

      if (user) {
        const mine = answersArr.find((a) => a.user_id === user.id) ?? null;
        setHasAnswered(!!mine);
        setUserAnswer(mine);
      }

      const { data: cData, error: cErr } = await (supabase as any)
        .from('eng_weekly_comments')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('question_id', qData.id)
        .order('created_at', { ascending: true });

      if (cErr) throw cErr;
      setComments((cData as WeeklyComment[]) || []);
    } catch (err: any) {
      console.error('[useWeekly] fetchData error:', err);
      setError('فشل تحميل النشاط. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Submit text answer ────────────────────────────────────────────────────
  const submitAnswer = async (content: string): Promise<{ ok: boolean; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (!question) return { ok: false, message: 'لا يوجد نشاط نشط' };
    if (hasAnswered) return { ok: false, message: 'لقد أجبت مسبقاً' };
    if (!content.trim()) return { ok: false, message: 'يرجى كتابة إجابة' };

    const { error: insErr } = await (supabase as any)
      .from('eng_weekly_answers')
      .insert({ question_id: question.id, user_id: user.id, content: content.trim(), votes: 0 });

    if (insErr) {
      if (insErr.code === '23505') { setHasAnswered(true); return { ok: false, message: 'لقد أجبت مسبقاً' }; }
      return { ok: false, message: 'حدث خطأ أثناء إرسال الإجابة' };
    }
    setHasAnswered(true);
    await fetchData();
    return { ok: true, message: 'تم إرسال إجابتك بنجاح!' };
  };

  // ── Vote/pick an option (MCQ/Poll) ────────────────────────────────────────
  const pickOption = async (optionLabel: string): Promise<{ ok: boolean; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (!question) return { ok: false, message: 'لا يوجد نشاط نشط' };
    if (hasAnswered) return { ok: false, message: 'لقد اخترت مسبقاً' };

    // Find existing answer row for this option, or create one
    const existing = answers.find((a) => a.content === optionLabel);

    if (existing) {
      // Increment votes on existing row
      const { error: upErr } = await (supabase as any)
        .from('eng_weekly_answers')
        .update({ votes: existing.votes + 1 })
        .eq('id', existing.id);
      if (upErr) return { ok: false, message: 'فشل التصويت' };
    } else {
      // Insert new row for this option
      const { error: insErr } = await (supabase as any)
        .from('eng_weekly_answers')
        .insert({ question_id: question.id, user_id: user.id, content: optionLabel, votes: 1 });
      if (insErr) {
        if (insErr.code === '23505') { setHasAnswered(true); return { ok: false, message: 'لقد اخترت مسبقاً' }; }
        return { ok: false, message: 'فشل التصويت' };
      }
    }

    setHasAnswered(true);
    await fetchData();
    return { ok: true, message: 'تم تسجيل صوتك!' };
  };

  // ── Vote on a text answer (existing behavior) ─────────────────────────────
  const voteAnswer = async (answerId: string): Promise<{ ok: boolean; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (votedAnswerIds.has(answerId)) return { ok: false, message: 'لقد صوّت لهذه الإجابة مسبقاً' };
    const current = answers.find((a) => a.id === answerId);
    if (!current) return { ok: false, message: 'الإجابة غير موجودة' };

    const { error: upErr } = await (supabase as any)
      .from('eng_weekly_answers')
      .update({ votes: current.votes + 1 })
      .eq('id', answerId);

    if (upErr) return { ok: false, message: 'فشل التصويت' };
    setVotedAnswerIds((prev) => new Set([...prev, answerId]));
    setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, votes: a.votes + 1 } : a)));
    return { ok: true, message: 'تم تسجيل تصويتك!' };
  };

  // ── Add comment ───────────────────────────────────────────────────────────
  const addComment = async (content: string): Promise<{ ok: boolean; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (!question) return { ok: false, message: 'لا يوجد نشاط نشط' };
    if (!content.trim()) return { ok: false, message: 'يرجى كتابة تعليق' };

    const { data, error: insErr } = await (supabase as any)
      .from('eng_weekly_comments')
      .insert({ question_id: question.id, user_id: user.id, content: content.trim() })
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single();

    if (insErr) return { ok: false, message: 'فشل إضافة التعليق' };
    setComments((prev) => [...prev, data as WeeklyComment]);
    return { ok: true, message: 'تم إضافة تعليقك!' };
  };

  return {
    question,
    answers,
    comments,
    loading,
    error,
    hasAnswered,
    userAnswer,
    votedAnswerIds,
    submitAnswer,
    pickOption,
    voteAnswer,
    addComment,
    refresh: fetchData,
  };
}

// ── Admin Hook ────────────────────────────────────────────────────────────────

export interface WeeklyQuestionRaw {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  meta: ActivityMeta;
  answers?: WeeklyAnswer[];
}

export function useWeeklyAdmin() {
  const [activities, setActivities] = useState<WeeklyQuestionRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fErr } = await (supabase as any)
        .from('eng_weekly_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fErr) throw fErr;
      setActivities(((data as any[]) || []).map(enrichQuestion));
    } catch (err: any) {
      setError('فشل تحميل الأنشطة');
      console.error('[useWeeklyAdmin] fetchAll:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /** Create a new activity (inserted as inactive by default) */
  const createActivity = async (
    title: string,
    meta: ActivityMeta
  ): Promise<{ ok: boolean; message: string }> => {
    if (!title.trim()) return { ok: false, message: 'يرجى إدخال عنوان النشاط' };

    // NEW PAYLOAD: Matching the flattened table columns
    const payload = {
      title: title.trim(),
      activity_type: meta.type, // 'text_question', 'multiple_choice', etc.
      options: meta.options || null, // Standard Array
      is_active: false
    };

    console.log('[useWeeklyAdmin] Inserting activity payload:', payload);

    const { data: insData, error: insErr } = await (supabase as any)
      .from('eng_weekly_questions')
      .insert(payload)
      .select()
      .single();

    if (insErr) {
      console.error('[useWeeklyAdmin] Insert error:', insErr);
      return { ok: false, message: `فشل: ${insErr.message}` };
    }

    await fetchAll();
    return { ok: true, message: 'تم إنشاء النشاط بنجاح' };
  };

  /** Activate ONE activity and deactivate all others */
  const activateActivity = async (id: string): Promise<{ ok: boolean; message: string }> => {
    // First deactivate all
    const { error: e1 } = await (supabase as any)
      .from('eng_weekly_questions')
      .update({ is_active: false })
      .neq('id', id); // deactivate ALL except target (belt & suspenders)

    // Also explicitly deactivate ALL
    await (supabase as any)
      .from('eng_weekly_questions')
      .update({ is_active: false })
      .eq('is_active', true)
      .neq('id', id);

    const { error: e2 } = await (supabase as any)
      .from('eng_weekly_questions')
      .update({ is_active: true })
      .eq('id', id);

    if (e2) return { ok: false, message: 'فشل تفعيل النشاط' };
    await fetchAll();
    return { ok: true, message: 'تم تفعيل النشاط' };
  };

  /** Deactivate an activity */
  const deactivateActivity = async (id: string): Promise<{ ok: boolean; message: string }> => {
    const { error } = await (supabase as any)
      .from('eng_weekly_questions')
      .update({ is_active: false })
      .eq('id', id);
    if (error) return { ok: false, message: 'فشل إيقاف النشاط' };
    await fetchAll();
    return { ok: true, message: 'تم إيقاف النشاط' };
  };

  /** Delete an activity and its answers/comments */
  const deleteActivity = async (id: string): Promise<{ ok: boolean; message: string }> => {
    // Delete dependent rows first
    await (supabase as any).from('eng_weekly_answers').delete().eq('question_id', id);
    await (supabase as any).from('eng_weekly_comments').delete().eq('question_id', id);
    const { error } = await (supabase as any).from('eng_weekly_questions').delete().eq('id', id);
    if (error) return { ok: false, message: 'فشل حذف النشاط' };
    await fetchAll();
    return { ok: true, message: 'تم حذف النشاط' };
  };

  /** Fetch answers for a specific activity (for results view) */
  const fetchAnswers = async (activityId: string): Promise<WeeklyAnswer[]> => {
    const { data } = await (supabase as any)
      .from('eng_weekly_answers')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('question_id', activityId)
      .order('votes', { ascending: false });
    return (data as WeeklyAnswer[]) || [];
  };

  return {
    activities,
    loading,
    error,
    createActivity,
    activateActivity,
    deactivateActivity,
    deleteActivity,
    fetchAnswers,
    refresh: fetchAll,
  };
}
