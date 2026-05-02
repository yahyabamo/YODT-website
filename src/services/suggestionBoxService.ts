import { supabase } from '@/integrations/supabase/client';

// ─── Page Options ─────────────────────────────────────────────────────────────

export const BOX_PAGE_OPTIONS = [
  { value: 'home',               label: 'الرئيسية (بعد تسجيل الدخول)' },
  { value: 'store',              label: 'المتجر' },
  { value: 'activities',         label: 'الأنشطة' },
  { value: 'busla',              label: 'بوصلة' },
  { value: 'discounts',          label: 'العروض والخصومات' },
  { value: 'universities',       label: 'الجامعات' },
  { value: 'university_details', label: 'تفاصيل الجامعة' },
  { value: 'about_istanbul',     label: 'عن إسطنبول' },
  { value: 'about_yemen',        label: 'عن اليمن' },
  { value: 'article_detail',     label: 'تفاصيل المقال' },
  { value: 'student',            label: 'الطلاب' },
  { value: 'points',             label: 'النقاط' },
  { value: '3wn',                label: 'عون' },
  { value: 'jobs',               label: 'الوظائف' },
  { value: 'partners',           label: 'الشركاء' },
  { value: 'faq',                label: 'الأسئلة الشائعة' },
  { value: 'guide',              label: 'الدليل' },
] as const;

export type BoxPageKey = typeof BOX_PAGE_OPTIONS[number]['value'];
export type BoxType = 'suggestion' | 'question';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuggestionBoxSetting {
  id: string;
  page_key: string;
  box_type: BoxType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Public Queries ───────────────────────────────────────────────────────────

/**
 * Fetch visibility settings for a specific page.
 * Returns an object indicating whether each box type is active.
 */
export async function fetchBoxSettings(
  pageKey: string
): Promise<{ suggestion: boolean; question: boolean }> {
  const { data, error } = await (supabase as any)
    .from('suggestion_box_settings')
    .select('box_type, is_active')
    .eq('page_key', pageKey);

  if (error) {
    console.error('[fetchBoxSettings] error:', error);
    return { suggestion: false, question: false };
  }

  const rows = (data ?? []) as { box_type: BoxType; is_active: boolean }[];
  return {
    suggestion: rows.find(r => r.box_type === 'suggestion')?.is_active ?? false,
    question:   rows.find(r => r.box_type === 'question')?.is_active   ?? false,
  };
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

export async function fetchAllBoxSettings(): Promise<SuggestionBoxSetting[]> {
  const { data, error } = await (supabase as any)
    .from('suggestion_box_settings')
    .select('*')
    .order('page_key')
    .order('box_type');

  if (error) throw error;
  return (data ?? []) as SuggestionBoxSetting[];
}

/**
 * Toggle (upsert) a single box setting.
 * Creates the row if it doesn't exist, updates is_active if it does.
 */
export async function upsertBoxSetting(
  page_key: string,
  box_type: BoxType,
  is_active: boolean
): Promise<void> {
  const { error } = await (supabase as any)
    .from('suggestion_box_settings')
    .upsert(
      { page_key, box_type, is_active, updated_at: new Date().toISOString() },
      { onConflict: 'page_key,box_type' }
    );
  if (error) throw error;
}

/**
 * Seed default rows for all pages × box types.
 * Skips rows that already exist (ON CONFLICT DO NOTHING).
 */
export async function seedDefaultBoxSettings(): Promise<void> {
  const rows = BOX_PAGE_OPTIONS.flatMap(p => [
    { page_key: p.value, box_type: 'suggestion', is_active: false },
    { page_key: p.value, box_type: 'question',   is_active: false },
  ]);

  const { error } = await (supabase as any)
    .from('suggestion_box_settings')
    .upsert(rows, { onConflict: 'page_key,box_type', ignoreDuplicates: true });

  if (error) throw error;
}
