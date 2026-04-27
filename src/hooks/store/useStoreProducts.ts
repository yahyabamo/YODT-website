import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchAllProductsAdmin } from '@/services/storeService';

/** Public: active products, optionally filtered by category */
export const useStoreProducts = (categoryId?: string) =>
  useQuery({
    queryKey: ['store_products', categoryId ?? 'all'],
    queryFn: async () => {
      const { data, error } = await fetchProducts(categoryId);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

/** Admin: all products regardless of is_active */
export const useAllStoreProducts = () =>
  useQuery({
    queryKey: ['store_products_admin'],
    queryFn: async () => {
      const { data, error } = await fetchAllProductsAdmin();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
