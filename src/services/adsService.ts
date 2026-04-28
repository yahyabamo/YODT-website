import { supabase } from '@/integrations/supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────

export const AD_SLIDE_INTERVAL_MS = 5000; // 5 seconds — update here for global change

export const AD_PAGE_OPTIONS = [
  { value: 'all', label: 'جميع الصفحات / All Pages' },
  { value: 'home', label: 'الصفحة الرئيسية / Home' },
  { value: 'store', label: 'المتجر / Store' },
  { value: 'about_istanbul', label: 'عن إسطنبول / About Istanbul' },
  { value: 'about_yemen', label: 'عن اليمن / About Yemen' },
  { value: 'achievements', label: 'الإنجازات / Achievements' },
  { value: 'student', label: 'الطلاب / Students' },
  { value: 'student_details', label: 'تفاصيل الطالب / Student Details' },
  { value: 'university', label: 'الجامعات / Universities' },
  { value: 'university_details', label: 'تفاصيل الجامعة / University Details' },
  { value: 'student_projects', label: 'مشاريع الطلاب / Student Projects' },
  { value: 'student_project_details', label: 'تفاصيل مشروع الطالب / Student Project Details' },
  { value: 'home_tsx', label: 'بعد تسجيل الدخول  (الرئيسية) / Home.tsx' },
  { value: 'track_details', label: 'تفاصيل المسار / Track Details' },
  { value: 'library', label: 'المكتبة / Library' },
  { value: 'academy_course_details', label: 'تفاصيل الدورة / Course Details' },
  { value: 'jobs', label: 'الوظائف / Jobs' },
  { value: 'offers', label: 'العروض / Offers' },
  { value: '3wn', label: 'عون / 3wn' },
  { value: 'turkey_apps', label: 'تطبيقات تركيا / Turkey Apps' },
  { value: 'faq', label: 'الأسئلة الشائعة / FAQ' },
  { value: 'map', label: 'الخريطة / Map' },
] as const;

export const AD_POSITION_OPTIONS = [
  { value: 'top', label: 'أعلى الصفحة / Top of Page' },
  { value: 'bottom', label: 'أسفل الصفحة / Bottom of Page' },
  { value: 'after_partners', label: 'بعد الشركاء / After Partners (Home only)' },
  { value: 'between_sections', label: 'بين الأقسام / Between Sections' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteAd {
  id: string;
  image_url: string;
  redirect_url: string;
  alt_text: string;
  page_names: string[];
  position: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type SiteAdInsert = Omit<SiteAd, 'id' | 'created_at' | 'updated_at'>;

// ─── Public Queries ───────────────────────────────────────────────────────────

/**
 * Fetch ads for a specific page+position slot.
 * Includes ads where page_names contains 'page' OR 'all'.
 * Ordered by priority DESC so paid/higher-priority ads appear first.
 */
export async function fetchAds(page: string, position: string): Promise<SiteAd[]> {
  const { data, error } = await (supabase as any)
    .from('site_ads')
    .select('*')
    .eq('is_active', true)
    .eq('position', position)
    .order('priority', { ascending: false });

  if (error) throw error;

  const allAds = (data ?? []) as any[];
  return allAds.filter(ad =>
    (Array.isArray(ad.page_names) && (ad.page_names.includes(page) || ad.page_names.includes('all')))
  ) as SiteAd[];
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

export async function fetchAllAdsAdmin(): Promise<SiteAd[]> {
  const { data, error } = await (supabase as any)
    .from('site_ads')
    .select('*')
    .order('priority', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SiteAd[];
}

export async function upsertAd(data: Partial<SiteAd> & { id?: string }): Promise<SiteAd> {
  const cleanData: any = {
    image_url: data.image_url,
    redirect_url: data.redirect_url,
    alt_text: data.alt_text ?? '',
    page_names: data.page_names ?? [],
    position: data.position,
    is_active: data.is_active ?? true,
    priority: data.priority ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { data: row, error } = await (supabase as any)
      .from('site_ads')
      .update(cleanData)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return row as SiteAd;
  }

  cleanData.created_at = new Date().toISOString();
  const { data: row, error } = await (supabase as any)
    .from('site_ads')
    .insert([cleanData])
    .select()
    .single();
  if (error) throw error;
  return row as SiteAd;
}

export async function toggleAdActive(id: string, is_active: boolean): Promise<void> {
  const { error } = await (supabase as any)
    .from('site_ads')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAd(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('site_ads')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
