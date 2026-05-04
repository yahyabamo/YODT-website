import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAllStoreCategories } from '@/hooks/store/useStoreCategories';
import { deleteCategory } from '@/services/storeService';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function StoreCategoriesAdmin() {
  useRoleGuard(['store']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useAllStoreCategories();
  const { setConfirm } = useOutletContext<any>();

  const handleDelete = (id: string, name: string) => {
    setConfirm({
      title: 'حذف الفئة',
      description: `هل أنت متأكد من حذف الفئة "${name}"؟ قد يؤثر ذلك على المنتجات المرتبطة بها.`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        try {
          const { error } = await deleteCategory(id);
          if (error) throw error;
          toast.success('تم الحذف بنجاح');
          queryClient.invalidateQueries({ queryKey: ['store_categories_admin'] });
          queryClient.invalidateQueries({ queryKey: ['store_categories'] });
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
            <Tag size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">فئات المتجر</h1>
            <p className="text-sm text-muted-foreground">إدارة أقسام وتصنيفات المنتجات</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/store/categories/new')}>
          <Plus className="mr-2 h-4 w-4" /> فئة جديدة
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">الترتيب</th>
                <th className="px-4 py-3 font-medium">الرمز</th>
                <th className="px-4 py-3 font-medium">الاسم (AR)</th>
                <th className="px-4 py-3 font-medium">الاسم (EN)</th>
                <th className="px-4 py-3 font-medium">الاسم (TR)</th>
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
              ) : categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-mono">{cat.order_index}</td>
                    <td className="px-4 py-3 text-lg">{cat.icon || '-'}</td>
                    <td className="px-4 py-3 font-medium">{cat.name_ar}</td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">{cat.name_en}</td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">{cat.name_tr}</td>
                    <td className="px-4 py-3">
                      {cat.is_active ? (
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
                          onClick={() => navigate(`/admin/store/categories/${cat.id}`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(cat.id, cat.name_ar)}
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
                    لا توجد فئات مضافة بعد
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
