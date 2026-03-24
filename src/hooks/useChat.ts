import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// ── Local Types ──────────────────────────────────────────────────────────────

export interface ChatGroup {
  id: string;
  name: string;
  description: string | null;
  gender: string; // 'male' | 'female' | 'both'
  created_at: string;
  member_count?: number;
}

export interface ChatRequest {
  id: string;
  user_id: string;
  group_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
  eng_chat_groups?: { name: string };
}

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;
const SEND_COOLDOWN_MS = 2000;

export function useChat() {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [approvedGroupIds, setApprovedGroupIds] = useState<Set<string>>(new Set());
  const [pendingGroupIds, setPendingGroupIds] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSentAt = useRef<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch groups filtered by gender ──────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    if (!user || !profile) return;
    try {
      const gender = profile.gender as string | null;

      // Fetch groups relevant to this user's gender (or gender = 'both')
      const { data: gData, error: gErr } = await (supabase as any)
        .from('eng_chat_groups')
        .select('*')
        .or(`gender.eq.${gender},gender.eq.both`)
        .order('created_at', { ascending: false });

      if (gErr) throw gErr;
      setGroups((gData as ChatGroup[]) || []);

      // Fetch the user's own requests to know join status
      const { data: rData, error: rErr } = await (supabase as any)
        .from('eng_chat_requests')
        .select('group_id, status')
        .eq('user_id', user.id);

      if (rErr) throw rErr;
      const approved = new Set<string>();
      const pending = new Set<string>();
      for (const r of rData || []) {
        if (r.status === 'approved') approved.add(r.group_id);
        else if (r.status === 'pending') pending.add(r.group_id);
      }
      setApprovedGroupIds(approved);
      setPendingGroupIds(pending);
    } catch (err: any) {
      console.error('[useChat] fetchGroups error:', err);
      setError('فشل تحميل المجموعات.');
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ── Request to join a group ───────────────────────────────────────────────
  const requestJoin = async (groupId: string): Promise<{ ok: boolean; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (approvedGroupIds.has(groupId)) return { ok: false, message: 'أنت بالفعل عضو في هذه المجموعة' };
    if (pendingGroupIds.has(groupId)) return { ok: false, message: 'طلبك قيد الانتظار' };

    const { error: insErr } = await (supabase as any)
      .from('eng_chat_requests')
      .insert({ user_id: user.id, group_id: groupId, status: 'pending' });

    if (insErr) {
      if (insErr.code === '23505') {
        setPendingGroupIds((prev) => new Set([...prev, groupId]));
        return { ok: false, message: 'طلبك قيد الانتظار' };
      }
      return { ok: false, message: 'فشل إرسال طلب الانضمام' };
    }
    setPendingGroupIds((prev) => new Set([...prev, groupId]));
    return { ok: true, message: 'تم إرسال طلب الانضمام. سيُراجع من قِبَل المسؤول.' };
  };

  // ── Fetch messages for a group (with access check) ────────────────────────
  const fetchMessages = useCallback(async (groupId: string, quiet = false) => {
    if (!user) return;
    // Access control: only approved members may fetch messages
    if (!approvedGroupIds.has(groupId)) return;
    if (!quiet) setMessagesLoading(true);
    try {
      const { data, error: mErr } = await (supabase as any)
        .from('eng_chat_messages')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (mErr) throw mErr;
      setMessages((data as ChatMessage[]) || []);
    } catch (err) {
      console.error('[useChat] fetchMessages error:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [user, approvedGroupIds]);

  // ── Start / stop polling ──────────────────────────────────────────────────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedGroupId || !approvedGroupIds.has(selectedGroupId)) return;

    fetchMessages(selectedGroupId);
    pollRef.current = setInterval(() => fetchMessages(selectedGroupId, true), POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, approvedGroupIds]);

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = async (content: string): Promise<{ ok: boolean; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (!selectedGroupId) return { ok: false, message: 'اختر مجموعة أولاً' };
    if (!approvedGroupIds.has(selectedGroupId)) return { ok: false, message: 'غير مسموح لك بالإرسال في هذه المجموعة' };
    if (!content.trim()) return { ok: false, message: 'الرسالة فارغة' };

    // Client-side rate limit
    const now = Date.now();
    if (now - lastSentAt.current < SEND_COOLDOWN_MS) {
      return { ok: false, message: 'الرجاء الانتظار قبل إرسال رسالة أخرى' };
    }
    lastSentAt.current = now;

    const { data, error: insErr } = await (supabase as any)
      .from('eng_chat_messages')
      .insert({ group_id: selectedGroupId, user_id: user.id, content: content.trim() })
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single();

    if (insErr) return { ok: false, message: 'فشل إرسال الرسالة' };

    setMessages((prev) => [...prev, data as ChatMessage]);
    return { ok: true, message: '' };
  };

  return {
    groups,
    approvedGroupIds,
    pendingGroupIds,
    selectedGroupId,
    setSelectedGroupId,
    messages,
    loading,
    messagesLoading,
    error,
    requestJoin,
    sendMessage,
    refresh: fetchGroups,
  };
}

// ── Admin hook ────────────────────────────────────────────────────────────────

export function useChatAdmin() {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, gRes] = await Promise.all([
        (supabase as any)
          .from('eng_chat_requests')
          .select('*, profiles:user_id(full_name, avatar_url), eng_chat_groups:group_id(name)')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('eng_chat_groups')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);
      if (!rRes.error) setRequests(rRes.data as ChatRequest[]);
      if (!gRes.error) setGroups(gRes.data as ChatGroup[]);
    } catch (err) {
      console.error('[useChatAdmin] fetchAll error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const approveRequest = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from('eng_chat_requests')
      .update({ status: 'approved' })
      .eq('id', id);
    if (error) return false;
    await fetchAll();
    return true;
  };

  const rejectRequest = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from('eng_chat_requests')
      .update({ status: 'rejected' })
      .eq('id', id);
    if (error) return false;
    await fetchAll();
    return true;
  };

  return { requests, groups, loading, approveRequest, rejectRequest, refresh: fetchAll };
}
