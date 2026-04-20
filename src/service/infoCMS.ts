/**
 * infoCMS.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * CRUD helpers for the five Informational CMS tables:
 *   • info_articles
 *   • info_universities
 *   • info_students
 *   • info_icons
 *   • info_achievements
 *
 * Public pages  → fetchXxx()   (read-only, filters is_published = true)
 * Admin Panel   → upsertXxx() / deleteXxx()  (write)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface InfoArticle {
  id?: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  title_tr?: string;
  excerpt: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  excerpt_tr?: string;
  content: string;
  content_ar?: string;
  content_en?: string;
  content_tr?: string;
  image_url?: string;
  content_images?: string[];
  category: 'istanbul' | 'yemen' | 'general';
  author: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface InfoUniversity {
  id?: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_tr?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
  image_url?: string;
  website_url?: string;
  location: string;
  specialties?: string;
  established?: string;
  student_count?: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface InfoStudent {
  id?: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_tr?: string;
  bio: string;
  bio_ar?: string;
  bio_en?: string;
  bio_tr?: string;
  image_url?: string;
  major: string;
  university: string;
  academic_year: string;
  achievement: string;
  gpa?: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface InfoIcon {
  id?: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_tr?: string;
  bio: string;
  bio_ar?: string;
  bio_en?: string;
  bio_tr?: string;
  image_url?: string;
  field: string;
  notable_work: string;
  birth_year?: string;
  nationality: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface InfoAchievement {
  id?: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  title_tr?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
  image_url?: string;
  achievement_date: string;
  category: string;
  icon: string;
  is_published: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function upsertRow<T extends { id?: string }>(table: string, row: T): Promise<T> {
  const { id, created_at, updated_at, ...fields } = row as any;
  const now = new Date().toISOString();
  if (id) {
    const { data, error } = await supabase.from(table).update({ ...fields, updated_at: now }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from(table).insert({ ...fields, created_at: now, updated_at: now }).select().single();
    if (error) throw error;
    return data;
  }
}

async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchArticles(category?: string): Promise<InfoArticle[]> {
  let q = supabase.from('info_articles').select('*').eq('is_published', true).order('order_index', { ascending: true });
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchArticleById(id: string): Promise<InfoArticle | null> {
  const { data, error } = await supabase.from('info_articles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllArticles(): Promise<InfoArticle[]> {
  const { data, error } = await supabase.from('info_articles').select('*').order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertArticle(row: InfoArticle): Promise<InfoArticle> {
  return upsertRow('info_articles', row);
}

export async function deleteArticle(id: string): Promise<void> {
  return deleteRow('info_articles', id);
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSITIES
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchUniversities(): Promise<InfoUniversity[]> {
  const { data, error } = await supabase.from('info_universities').select('*').eq('is_published', true).order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchUniversityById(id: string): Promise<InfoUniversity | null> {
  const { data, error } = await supabase.from('info_universities').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllUniversities(): Promise<InfoUniversity[]> {
  const { data, error } = await supabase.from('info_universities').select('*').order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertUniversity(row: InfoUniversity): Promise<InfoUniversity> {
  return upsertRow('info_universities', row);
}

export async function deleteUniversity(id: string): Promise<void> {
  return deleteRow('info_universities', id);
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchStudents(): Promise<InfoStudent[]> {
  const { data, error } = await supabase.from('info_students').select('*').eq('is_published', true).order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchStudentById(id: string): Promise<InfoStudent | null> {
  const { data, error } = await supabase.from('info_students').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllStudents(): Promise<InfoStudent[]> {
  const { data, error } = await supabase.from('info_students').select('*').order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertStudent(row: InfoStudent): Promise<InfoStudent> {
  return upsertRow('info_students', row);
}

export async function deleteStudent(id: string): Promise<void> {
  return deleteRow('info_students', id);
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchIcons(): Promise<InfoIcon[]> {
  const { data, error } = await supabase.from('info_icons').select('*').eq('is_published', true).order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchIconById(id: string): Promise<InfoIcon | null> {
  const { data, error } = await supabase.from('info_icons').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllIcons(): Promise<InfoIcon[]> {
  const { data, error } = await supabase.from('info_icons').select('*').order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertIcon(row: InfoIcon): Promise<InfoIcon> {
  return upsertRow('info_icons', row);
}

export async function deleteIcon(id: string): Promise<void> {
  return deleteRow('info_icons', id);
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAchievements(): Promise<InfoAchievement[]> {
  const { data, error } = await supabase.from('info_achievements').select('*').eq('is_published', true).order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllAchievements(): Promise<InfoAchievement[]> {
  const { data, error } = await supabase.from('info_achievements').select('*').order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertAchievement(row: InfoAchievement): Promise<InfoAchievement> {
  return upsertRow('info_achievements', row);
}

export async function deleteAchievement(id: string): Promise<void> {
  return deleteRow('info_achievements', id);
}
