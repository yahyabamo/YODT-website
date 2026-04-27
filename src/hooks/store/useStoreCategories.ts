import { useQuery } from '@tanstack/react-query';
import { fetchActiveCategories, fetchAllCategories } from '@/services/storeService';

/** Public: only active categories, ordered */
export const useStoreCategories = () =>
  useQuery({
    queryKey: ['store_categories'],
    queryFn: async () => {
      const { data, error } = await fetchActiveCategories();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

/** Admin: all categories regardless of is_active */
export const useAllStoreCategories = () =>
  useQuery({
    queryKey: ['store_categories_admin'],
    queryFn: async () => {
      const { data, error } = await fetchAllCategories();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
