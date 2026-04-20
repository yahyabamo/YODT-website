/**
 * heroImages.ts
 * CRUD helpers for the `page_hero_images` table.
 * Each row represents one background image for a specific page's hero section.
 *
 * page_key values: 'istanbul' | 'yemen' | 'universities' | 'icons' | 'achievements'
 */

import { supabase } from '@/integrations/supabase/client';

export interface PageHeroImage {
  id?: string;
  page_key: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
}

/** Fetch all active hero images for a given page, ordered ascending */
export async function fetchHeroImages(pageKey: string): Promise<PageHeroImage[]> {
  const { data, error } = await supabase
    .from('page_hero_images')
    .select('*')
    .eq('page_key', pageKey)
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Fetch ALL hero images for all pages (admin use) */
export async function fetchAllHeroImages(): Promise<PageHeroImage[]> {
  const { data, error } = await supabase
    .from('page_hero_images')
    .select('*')
    .order('page_key', { ascending: true })
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Fetch hero images for a specific page (admin — includes inactive) */
export async function fetchHeroImagesAdmin(pageKey: string): Promise<PageHeroImage[]> {
  const { data, error } = await supabase
    .from('page_hero_images')
    .select('*')
    .eq('page_key', pageKey)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Insert or update a hero image row */
export async function upsertHeroImage(row: PageHeroImage): Promise<PageHeroImage> {
  const { id, created_at, ...fields } = row as any;
  if (id) {
    const { data, error } = await supabase
      .from('page_hero_images')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('page_hero_images')
      .insert({ ...fields, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

/** Delete a hero image row */
export async function deleteHeroImage(id: string): Promise<void> {
  const { error } = await supabase.from('page_hero_images').delete().eq('id', id);
  if (error) throw error;
}
