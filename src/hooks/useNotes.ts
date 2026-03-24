import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// ── Local Types ──────────────────────────────────────────────────────────────

export interface EngNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 800;

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<EngNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch all notes for the current user ─────────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error: fErr } = await (supabase as any)
        .from('eng_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fErr) throw fErr;
      setNotes((data as EngNote[]) || []);
    } catch (err: any) {
      console.error('[useNotes] fetchNotes error:', err);
      setError('فشل تحميل الملاحظات.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Create a new note ─────────────────────────────────────────────────────
  const createNote = async (
    title: string,
    color: string = '0'
  ): Promise<{ ok: boolean; note?: EngNote; message: string }> => {
    if (!user) return { ok: false, message: 'يجب تسجيل الدخول أولاً' };
    if (!title.trim()) return { ok: false, message: 'يرجى إدخال عنوان للملاحظة' };

    const { data, error: insErr } = await (supabase as any)
      .from('eng_notes')
      .insert({ user_id: user.id, title: title.trim(), content: '', color })
      .select()
      .single();

    if (insErr) return { ok: false, message: 'فشل إنشاء الملاحظة' };

    const newNote = data as EngNote;
    setNotes((prev) => [newNote, ...prev]);
    return { ok: true, note: newNote, message: 'تم إنشاء الملاحظة!' };
  };

  // ── Update note content (immediate + debounced auto-save) ─────────────────
  const updateNote = useCallback(
    (id: string, content: string, immediate = false) => {
      // Optimistic UI update
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, content, updated_at: new Date().toISOString() } : n))
      );

      const doSave = async () => {
        setSaving(true);
        const { error: upErr } = await (supabase as any)
          .from('eng_notes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (upErr) console.error('[useNotes] updateNote error:', upErr);
        setSaving(false);
      };

      if (immediate) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        doSave();
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(doSave, DEBOUNCE_MS);
    },
    []
  );

  // ── Delete a note ─────────────────────────────────────────────────────────
  const deleteNote = async (id: string): Promise<{ ok: boolean; message: string }> => {
    const { error: delErr } = await (supabase as any)
      .from('eng_notes')
      .delete()
      .eq('id', id);

    if (delErr) return { ok: false, message: 'فشل حذف الملاحظة' };

    setNotes((prev) => prev.filter((n) => n.id !== id));
    return { ok: true, message: 'تم حذف الملاحظة' };
  };

  return {
    notes,
    loading,
    saving,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}
