/**
 * homepageCMS.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * CRUD helpers for the four Homepage CMS tables:
 *   • homepage_discount
 *   • homepage_activities + homepage_activity_items
 *   • homepage_partners
 *   • homepage_footer
 *
 * Public Homepage  → fetchXxx()   (read-only, filters is_published)
 * Admin Panel      → upsertXxx() / deleteXxx()  (write)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface HomepageDiscount {
  id?: string;
  title_ar: string;
  title_en: string;
  title_tr: string;
  desc_ar: string;
  desc_en: string;
  desc_tr: string;
  label_ar: string;
  label_en: string;
  label_tr: string;
  icon: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomepageActivity {
  id?: string;
  icon: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  tag_ar: string;
  tag_en: string;
  tag_tr: string;
  desc_ar: string;
  desc_en: string;
  desc_tr: string;
  is_published: boolean;
  order_index: number;
  items?: HomepageActivityItem[];
  created_at?: string;
  updated_at?: string;
}

export interface HomepageActivityItem {
  id?: string;
  activity_id: string;
  icon: string;
  title_ar: string;
  title_en: string;
  title_tr: string;
  desc_ar: string;
  desc_en: string;
  desc_tr: string;
  freq_ar: string;
  freq_en: string;
  freq_tr: string;
  image_url?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomepagePartner {
  id?: string;
  abbr: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  logo_url?: string;
  link?: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomepageFooter {
  id?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  telegram_url?: string;
  youtube_url?: string;
  whatsapp_url?: string;
  phone?: string;
  email?: string;
  address_ar?: string;
  address_en?: string;
  address_tr?: string;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCOUNT
// ─────────────────────────────────────────────────────────────────────────────

/** Public: fetch published discounts ordered by order_index */
export async function fetchDiscounts(): Promise<HomepageDiscount[]> {
  const { data, error } = await supabase
    .from('homepage_discount')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Admin: fetch ALL discounts (including unpublished) */
export async function fetchAllDiscounts(): Promise<HomepageDiscount[]> {
  const { data, error } = await supabase
    .from('homepage_discount')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Admin: create or update a discount row (explicit insert vs update) */
export async function upsertDiscount(row: HomepageDiscount): Promise<HomepageDiscount> {
  const { id, created_at, updated_at, ...fields } = row as any;
  const now = new Date().toISOString();

  if (id) {
    // UPDATE existing row
    const { data, error } = await supabase
      .from('homepage_discount')
      .update({ ...fields, updated_at: now })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // INSERT new row
    const { data, error } = await supabase
      .from('homepage_discount')
      .insert({ ...fields, created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

/** Admin: delete a discount row */
export async function deleteDiscount(id: string): Promise<void> {
  const { error } = await supabase.from('homepage_discount').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Public: fetch published activity programs (without sub-items) */
export async function fetchActivities(): Promise<HomepageActivity[]> {
  const { data, error } = await supabase
    .from('homepage_activities')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Admin: fetch ALL activity programs */
export async function fetchAllActivities(): Promise<HomepageActivity[]> {
  const { data, error } = await supabase
    .from('homepage_activities')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Public + Admin: fetch sub-items for one or all activities */
export async function fetchActivityItems(activityId?: string): Promise<HomepageActivityItem[]> {
  let query = supabase
    .from('homepage_activity_items')
    .select('*')
    .order('order_index', { ascending: true });
  if (activityId) {
    query = query.eq('activity_id', activityId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Public: fetch published activities WITH their items (for the homepage) */
export async function fetchActivitiesWithItems(): Promise<HomepageActivity[]> {
  const activities = await fetchActivities();
  if (activities.length === 0) return [];
  const items = await fetchActivityItems();
  return activities.map(a => ({
    ...a,
    items: items.filter(it => it.activity_id === a.id),
  }));
}

/** Admin: create or update an activity program */
export async function upsertActivity(row: HomepageActivity): Promise<HomepageActivity> {
  const { items: _items, ...payload } = row;
  const { data, error } = await supabase
    .from('homepage_activities')
    .upsert({ ...payload, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin: create or update an activity sub-item */
export async function upsertActivityItem(row: HomepageActivityItem): Promise<HomepageActivityItem> {
  const { data, error } = await supabase
    .from('homepage_activity_items')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin: delete an activity program (cascades to its items) */
export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('homepage_activities').delete().eq('id', id);
  if (error) throw error;
}

/** Admin: delete a single activity sub-item */
export async function deleteActivityItem(id: string): Promise<void> {
  const { error } = await supabase.from('homepage_activity_items').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTNERS
// ─────────────────────────────────────────────────────────────────────────────

/** Public: fetch published partners ordered by order_index */
export async function fetchPartners(): Promise<HomepagePartner[]> {
  const { data, error } = await supabase
    .from('homepage_partners')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Admin: fetch ALL partners */
export async function fetchAllPartners(): Promise<HomepagePartner[]> {
  const { data, error } = await supabase
    .from('homepage_partners')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Admin: create or update a partner */
export async function upsertPartner(row: HomepagePartner): Promise<HomepagePartner> {
  const { data, error } = await supabase
    .from('homepage_partners')
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin: delete a partner */
export async function deletePartner(id: string): Promise<void> {
  const { error } = await supabase.from('homepage_partners').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

/** Public + Admin: fetch the single footer settings row */
export async function fetchFooter(): Promise<HomepageFooter | null> {
  const { data, error } = await supabase
    .from('homepage_footer')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Admin: create or update footer settings (upsert singleton) */
export async function upsertFooter(row: HomepageFooter): Promise<HomepageFooter> {
  const payload = { ...row, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('homepage_footer')
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
