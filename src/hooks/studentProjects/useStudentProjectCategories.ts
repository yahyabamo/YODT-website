import { useQuery } from '@tanstack/react-query';
import {
  fetchProjectCategories,
  fetchAllProjectCategoriesAdmin,
} from '@/services/studentProjectsService';

/** Public: active project categories */
export const useProjectCategories = () =>
  useQuery({
    queryKey: ['project_categories'],
    queryFn: async () => {
      const { data, error } = await fetchProjectCategories();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

/** Admin: all categories */
export const useAllProjectCategoriesAdmin = () =>
  useQuery({
    queryKey: ['project_categories_admin'],
    queryFn: async () => {
      const { data, error } = await fetchAllProjectCategoriesAdmin();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
