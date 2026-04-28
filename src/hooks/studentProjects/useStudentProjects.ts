import { useQuery } from '@tanstack/react-query';
import {
  fetchApprovedProjects,
  fetchProjectBySlug,
  fetchAllProjectsAdmin,
  fetchProjectByIdAdmin,
  fetchProjectImages,
  fetchStudentProjectStats,
} from '@/services/studentProjectsService';

/** Public: approved projects with optional filter/sort */
export const useStudentProjects = (params?: {
  categoryId?: string;
  featured?: boolean;
  sort?: 'newest' | 'az' | 'featured';
}) =>
  useQuery({
    queryKey: ['student_projects', params],
    queryFn: async () => {
      const { data, error } = await fetchApprovedProjects(params);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

/** Public: single project by slug */
export const useStudentProjectBySlug = (slug: string) =>
  useQuery({
    queryKey: ['student_project_slug', slug],
    queryFn: async () => {
      const { data, error } = await fetchProjectBySlug(slug);
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

/** Public: project gallery images */
export const useProjectImages = (projectId: string) =>
  useQuery({
    queryKey: ['student_project_images', projectId],
    queryFn: async () => {
      const { data, error } = await fetchProjectImages(projectId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

/** Admin: all projects */
export const useAllProjectsAdmin = () =>
  useQuery({
    queryKey: ['student_projects_admin'],
    queryFn: async () => {
      const { data, error } = await fetchAllProjectsAdmin();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });

/** Admin: single project by id */
export const useProjectByIdAdmin = (id: string) =>
  useQuery({
    queryKey: ['student_project_admin', id],
    queryFn: async () => {
      const { data, error } = await fetchProjectByIdAdmin(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });

/** Admin: stats */
export const useStudentProjectStats = () =>
  useQuery({
    queryKey: ['student_project_stats'],
    queryFn: fetchStudentProjectStats,
    staleTime: 1000 * 60 * 2,
  });
