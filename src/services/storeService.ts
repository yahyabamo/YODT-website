import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreCategory {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  icon: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface StoreProduct {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  name_tr: string;
  description_ar: string | null;
  description_en: string | null;
  description_tr: string | null;
  price: number;
  currency: 'TRY' | 'USD' | 'YER';
  images: string[];
  thumbnail: string | null;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  stock_note_ar: string | null;
  stock_note_en: string | null;
  stock_note_tr: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  store_categories?: Pick<StoreCategory, 'name_ar' | 'name_en' | 'name_tr'>;
}

export type OrderStatus = 'pending' | 'reviewing' | 'confirmed' | 'cancelled' | 'completed';

export interface StoreOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_note: string | null;
  status: OrderStatus;
  admin_note: string | null;
  product_name_ar: string;
  product_name_en: string;
  product_name_tr: string;
  product_price: number;
  product_currency: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  store_products?: { thumbnail: string | null };
}

export interface OrderPayload {
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_note?: string;
  user_id?: string;
  product_name_ar: string;
  product_name_en: string;
  product_name_tr: string;
  product_price: number;
  product_currency: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const fetchActiveCategories = () =>
  supabase
    .from('store_categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

export const fetchAllCategories = () =>
  supabase
    .from('store_categories')
    .select('*')
    .order('order_index');

export const fetchCategoryById = (id: string) =>
  supabase.from('store_categories').select('*').eq('id', id).single();

export const upsertCategory = (data: Partial<StoreCategory> & { id?: string }) => {
  if (data.id) {
    return supabase.from('store_categories').update(data).eq('id', data.id).select().single();
  }
  return supabase.from('store_categories').insert([data]).select().single();
};

export const deleteCategory = (id: string) =>
  supabase.from('store_categories').delete().eq('id', id);

// ─── Products ─────────────────────────────────────────────────────────────────

export const fetchProducts = (categoryId?: string) => {
  let query = supabase
    .from('store_products')
    .select('*, store_categories(name_ar, name_en, name_tr)')
    .eq('is_active', true)
    .order('order_index');
  if (categoryId) query = query.eq('category_id', categoryId);
  return query;
};

export const fetchAllProductsAdmin = () =>
  supabase
    .from('store_products')
    .select('*, store_categories(name_ar, name_en, name_tr)')
    .order('order_index');

export const fetchProductById = (id: string) =>
  supabase
    .from('store_products')
    .select('*, store_categories(name_ar, name_en, name_tr)')
    .eq('id', id)
    .single();

export const upsertProduct = (data: Partial<StoreProduct> & { id?: string }) => {
  if (data.id) {
    return supabase.from('store_products').update(data).eq('id', data.id).select().single();
  }
  return supabase.from('store_products').insert([data]).select().single();
};

export const deleteProduct = (id: string) =>
  supabase.from('store_products').delete().eq('id', id);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const submitOrder = (payload: OrderPayload) =>
  supabase.from('store_orders').insert([payload]).select().single();

export const fetchAllOrders = (status?: OrderStatus) => {
  let query = supabase
    .from('store_orders')
    .select('*, store_products(thumbnail)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  return query;
};

export const updateOrderStatus = (id: string, status: OrderStatus, adminNote?: string) =>
  supabase
    .from('store_orders')
    .update({
      status,
      ...(adminNote !== undefined && { admin_note: adminNote }),
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    })
    .eq('id', id)
    .select()
    .single();

export const fetchOrderStats = async () => {
  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('store_orders').select('id, status', { count: 'exact', head: false }),
    supabase.from('store_products').select('id', { count: 'exact', head: false }).eq('is_active', true),
  ]);
  const orders = ordersRes.data ?? [];
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalProducts: productsRes.data?.length ?? 0,
  };
};
