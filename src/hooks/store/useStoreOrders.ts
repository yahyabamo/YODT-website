import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, updateOrderStatus, fetchOrderStats } from '@/services/storeService';
import type { OrderStatus } from '@/services/storeService';

/** Admin: fetch all orders, optionally filtered by status */
export const useStoreOrders = (status?: OrderStatus) =>
  useQuery({
    queryKey: ['store_orders', status ?? 'all'],
    queryFn: async () => {
      const { data, error } = await fetchAllOrders(status);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 30, // 30 sec — orders refresh more frequently
  });

/** Admin: store stats for hub dashboard */
export const useStoreStats = () =>
  useQuery({
    queryKey: ['store_stats'],
    queryFn: fetchOrderStats,
    staleTime: 1000 * 60,
  });

/** Admin: mutation to update order status */
export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      adminNote,
    }: {
      id: string;
      status: OrderStatus;
      adminNote?: string;
    }) => updateOrderStatus(id, status, adminNote).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store_orders'] });
      qc.invalidateQueries({ queryKey: ['store_stats'] });
    },
  });
};
