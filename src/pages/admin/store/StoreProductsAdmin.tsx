import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAllStoreProducts } from '@/hooks/store/useStoreProducts';
import { deleteProduct } from '@/services/storeService';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Check, X, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function StoreProductsAdmin() {
  useRoleGuard(['store']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useAllStoreProducts();
  const { setConfirm } = useOutletContext<any>();

  const handleDelete = (id: string, name: string) => {
    setConfirm({
      title: 'حذف المنتج',
      description: `هل أنت متأكد من حذف المنتج "${name}"؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        try {
          const { error } = await deleteProduct(id);
          if (error) throw error;
          toast.success('تم الحذف بنجاح');
          queryClient.invalidateQueries({ queryKey: ['store_products_admin'] });
          queryClient.invalidateQueries({ queryKey: ['store_products'] });
        } catch (error: any) {
          toast.error('حدث خطأ أثناء الحذف: ' + error.message);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">المنتجات</h1>
            <p className="text-sm text-muted-foreground">إدارة المنتجات وأسعارها وتوفرها</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/store/products/new')}>
          <Plus className="mr-2 h-4 w-4" /> منتج جديد
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">الصورة</th>
                <th className="px-4 py-3 font-medium">الاسم (AR)</th>
                <th className="px-4 py-3 font-medium">الفئة</th>
                <th className="px-4 py-3 font-medium">السعر</th>
                <th className="px-4 py-3 font-medium">مميز</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="animate-pulse">جارٍ التحميل...</div>
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden border border-border">
                        {prod.thumbnail ? (
                          <img src={prod.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate" title={prod.name_ar}>
                      {prod.name_ar}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prod.category_id?.name_ar || '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary" dir="ltr">
                      {prod.price} {prod.currency}
                    </td>
                    <td className="px-4 py-3">
                      {prod.is_featured && <Star size={16} className="text-warning fill-warning" />}
                    </td>
                    <td className="px-4 py-3">
                      {prod.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                          <Check size={12} /> نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          <X size={12} /> مخفي
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => navigate(`/admin/store/products/${prod.id}`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(prod.id, prod.name_ar)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    لا توجد منتجات مضافة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
