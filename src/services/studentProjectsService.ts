import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectCategory {
  id: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface StudentProject {
  id: string;
  slug: string;
  category_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  featured: boolean;
  owner_name: string | null;
  university: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  location: string | null;
  name_ar: string;
  name_en: string;
  name_tr: string;
  description_ar: string;
  description_en: string;
  description_tr: string;
  services_ar: string | null;
  services_en: string | null;
  services_tr: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  project_categories?: Pick<ProjectCategory, 'name_ar' | 'name_en' | 'name_tr' | 'icon'>;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface ProjectSubmission {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  full_name: string;
  university: string | null;
  phone: string;
  email: string | null;
  category_id: string | null;
  name_ar: string;
  name_en: string | null;
  name_tr: string | null;
  description_ar: string;
  description_en: string | null;
  description_tr: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  location: string | null;
  image_urls: string[] | null;
  services_ar: string | null;
  services_en: string | null;
  services_tr: string | null;
  agreed_to_terms: boolean;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  project_categories?: Pick<ProjectCategory, 'name_ar' | 'name_en' | 'name_tr'>;
}

export interface SubmissionPayload {
  full_name: string;
  university?: string;
  phone: string;
  email?: string;
  category_id?: string;
  name_ar: string;
  name_en?: string;
  name_tr?: string;
  description_ar: string;
  description_en?: string;
  description_tr?: string;
  instagram?: string;
  whatsapp?: string;
  website?: string;
  location?: string;
  image_urls?: string[];
  services_ar?: string;
  services_en?: string;
  services_tr?: string;
  agreed_to_terms: boolean;
}

// ─── Cloudinary Upload (same pattern as PartnersAdmin) ────────────────────────

export async function uploadProjectImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'activity_unsigned');
  formData.append('folder', 'student-projects');
  const res = await fetch('https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

// ─── Project Categories ───────────────────────────────────────────────────────

export const fetchProjectCategories = () =>
  supabase
    .from('project_categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

export const fetchAllProjectCategoriesAdmin = () =>
  supabase.from('project_categories').select('*').order('order_index');

export const fetchProjectCategoryById = (id: string) =>
  supabase.from('project_categories').select('*').eq('id', id).single();

export const upsertProjectCategory = (data: Partial<ProjectCategory> & { id?: string }) => {
  if (data.id) {
    return supabase.from('project_categories').update(data).eq('id', data.id).select().single();
  }
  return supabase.from('project_categories').insert([data]).select().single();
};

export const deleteProjectCategory = (id: string) =>
  supabase.from('project_categories').delete().eq('id', id);

// ─── Student Projects (Public) ────────────────────────────────────────────────

export const fetchApprovedProjects = (params?: {
  categoryId?: string;
  featured?: boolean;
  sort?: 'newest' | 'az' | 'featured';
}) => {
  let query = supabase
    .from('student_projects')
    .select('*, project_categories(name_ar, name_en, name_tr, icon)')
    .eq('status', 'approved');

  if (params?.categoryId) query = query.eq('category_id', params.categoryId);
  if (params?.featured) query = query.eq('featured', true);

  switch (params?.sort) {
    case 'az':
      query = query.order('name_ar', { ascending: true });
      break;
    case 'featured':
      query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
      break;
    default: // newest
      query = query.order('created_at', { ascending: false });
  }

  return query;
};

export const fetchProjectBySlug = (slug: string) =>
  supabase
    .from('student_projects')
    .select('*, project_categories(name_ar, name_en, name_tr, icon)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

// ─── Project Images ───────────────────────────────────────────────────────────

export const fetchProjectImages = (projectId: string) =>
  supabase
    .from('student_project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order');

export const insertProjectImages = (images: { project_id: string; image_url: string; sort_order: number }[]) =>
  supabase.from('student_project_images').insert(images);

export const deleteProjectImage = (id: string) =>
  supabase.from('student_project_images').delete().eq('id', id);

export const deleteAllProjectImages = (projectId: string) =>
  supabase.from('student_project_images').delete().eq('project_id', projectId);

// ─── Student Projects (Admin) ─────────────────────────────────────────────────

export const fetchAllProjectsAdmin = () =>
  supabase
    .from('student_projects')
    .select('*, project_categories(name_ar, name_en, name_tr, icon)')
    .order('created_at', { ascending: false });

export const fetchProjectByIdAdmin = (id: string) =>
  supabase
    .from('student_projects')
    .select('*, project_categories(name_ar, name_en, name_tr, icon)')
    .eq('id', id)
    .single();

export const upsertProject = (data: Partial<StudentProject> & { id?: string }) => {
  if (data.id) {
    const { id, ...rest } = data;
    return supabase
      .from('student_projects')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }
  return supabase.from('student_projects').insert([data]).select().single();
};

export const updateProjectStatus = (id: string, status: StudentProject['status']) =>
  supabase
    .from('student_projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

export const toggleProjectFeatured = (id: string, featured: boolean) =>
  supabase
    .from('student_projects')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

export const deleteProject = (id: string) =>
  supabase.from('student_projects').delete().eq('id', id);

// ─── Submissions ──────────────────────────────────────────────────────────────

export const submitProjectForm = (payload: SubmissionPayload) =>
  supabase.from('project_submissions').insert([payload]).select().single();

export const fetchAllSubmissions = (status?: ProjectSubmission['status']) => {
  let query = supabase
    .from('project_submissions')
    .select('*, project_categories(name_ar, name_en, name_tr)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  return query;
};

export const fetchSubmissionById = (id: string) =>
  supabase
    .from('project_submissions')
    .select('*, project_categories(name_ar, name_en, name_tr)')
    .eq('id', id)
    .single();

export const updateSubmissionStatus = (
  id: string,
  status: ProjectSubmission['status'],
  adminNote?: string,
) =>
  supabase
    .from('project_submissions')
    .update({
      status,
      ...(adminNote !== undefined && { admin_note: adminNote }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

export const updateSubmission = (id: string, data: Partial<ProjectSubmission>) =>
  supabase
    .from('project_submissions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

// Helper: generate a URL-safe slug from Arabic + English name
export function generateSlug(nameEn: string, nameAr: string): string {
  const base = nameEn || nameAr;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    + '-'
    + Date.now().toString(36);
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export const fetchStudentProjectStats = async () => {
  const [submissionsRes, projectsRes, featuredRes] = await Promise.all([
    supabase
      .from('project_submissions')
      .select('id, status', { count: 'exact', head: false })
      .eq('status', 'pending'),
    supabase
      .from('student_projects')
      .select('id', { count: 'exact', head: false })
      .eq('status', 'approved'),
    supabase
      .from('student_projects')
      .select('id', { count: 'exact', head: false })
      .eq('featured', true)
      .eq('status', 'approved'),
  ]);
  return {
    pendingSubmissions: submissionsRes.data?.length ?? 0,
    totalProjects: projectsRes.data?.length ?? 0,
    featuredProjects: featuredRes.data?.length ?? 0,
  };
};
