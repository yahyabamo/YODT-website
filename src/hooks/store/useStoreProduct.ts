import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/services/storeService';

/** Fetch a single product by ID — used by StoreProductPage */
export const useStoreProduct = (id: string | undefined) =>
  useQuery({
    queryKey: ['store_product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await fetchProductById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
