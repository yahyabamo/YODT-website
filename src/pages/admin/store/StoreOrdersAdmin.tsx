import React, { useState } from 'react';
import { useStoreOrders, useUpdateOrderStatus } from '@/hooks/store/useStoreOrders';
import { Button } from '@/components/ui/button';
import { ListOrdered, CheckCircle2, Clock, XCircle, FileText, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OrderStatus, StoreOrder } from '@/services/storeService';
import { toast } from 'sonner';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  reviewing: 'قيد المراجعة',
  confirmed: 'تم التأكيد',
  cancelled: 'ملغى',
  completed: 'مكتمل',
};

export default function StoreOrdersAdmin() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const { data: orders, isLoading } = useStoreOrders(filter === 'all' ? undefined : filter);
  const updateMutation = useUpdateOrderStatus();
  
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    
    try {
      await updateMutation.mutateAsync({
        id: selectedOrder.id,
        status,
        adminNote: adminNote !== selectedOrder.admin_note ? adminNote : undefined
      });
      toast.success('تم تحديث حالة الطلب');
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error('فشل تحديث الحالة: ' + error.message);
    }
  };

  const openDialog = (order: StoreOrder) => {
    setSelectedOrder(order);
    setAdminNote(order.admin_note || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ListOrdered size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">الطلبات</h1>
            <p className="text-sm text-muted-foreground">إدارة طلبات المتجر ومتابعة الحالات</p>
          </div>
        </div>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">الكل</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">رقم الطلب</th>
                <th className="px-4 py-3 font-medium">العميل</th>
                <th className="px-4 py-3 font-medium">المنتج</th>
                <th className="px-4 py-3 font-medium">الإجمالي</th>
                <th className="px-4 py-3 font-medium">التاريخ</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium text-left">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="animate-pulse">جارٍ التحميل...</div>
                  </td>
                </tr>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <div className="w-8 h-8 rounded bg-secondary overflow-hidden shrink-0">
                          {order.store_products?.thumbnail ? (
                            <img src={order.store_products.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ShoppingBag size={12} /></div>
                          )}
                        </div>
                        <div className="truncate" title={order.product_name_ar}>
                          {order.product_name_ar}
                          <span className="text-xs text-muted-foreground block">× {order.quantity}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary" dir="ltr">
                      {(order.product_price * order.quantity).toLocaleString()} {order.product_currency}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" dir="ltr">
                      {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <Button variant="outline" size="sm" onClick={() => openDialog(order)}>
                        عرض
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <FileText className="text-primary" /> تفاصيل الطلب
                </DialogTitle>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedOrder.status]}`}>
                  {STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1" dir="ltr">
                {selectedOrder.order_number}
              </p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Customer Info */}
              <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                <h3 className="font-bold border-b border-border/50 pb-2 mb-2 text-sm">بيانات العميل</h3>
                <div>
                  <span className="block text-xs text-muted-foreground">الاسم</span>
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">الجوال</span>
                  <span className="font-medium" dir="ltr">{selectedOrder.customer_phone}</span>
                </div>
                {selectedOrder.customer_email && (
                  <div>
                    <span className="block text-xs text-muted-foreground">البريد</span>
                    <span className="font-medium" dir="ltr">{selectedOrder.customer_email}</span>
                  </div>
                )}
                {selectedOrder.customer_note && (
                  <div>
                    <span className="block text-xs text-muted-foreground">ملاحظات العميل</span>
                    <span className="text-sm bg-background p-2 rounded block mt-1 border border-border">
                      {selectedOrder.customer_note}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Info */}
              <div className="bg-primary/5 p-4 rounded-xl space-y-3 border border-primary/10">
                <h3 className="font-bold border-b border-primary/10 pb-2 mb-2 text-sm text-primary">تفاصيل المنتج</h3>
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded bg-background border border-border shrink-0 overflow-hidden">
                    {selectedOrder.store_products?.thumbnail && (
                      <img src={selectedOrder.store_products.thumbnail} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold block text-sm">{selectedOrder.product_name_ar}</span>
                    <span className="text-xs text-muted-foreground block mt-1">الكمية: {selectedOrder.quantity}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-sm font-bold">الإجمالي</span>
                  <span className="font-bold text-lg text-primary" dir="ltr">
                    {(selectedOrder.product_price * selectedOrder.quantity).toLocaleString()} {selectedOrder.product_currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Management Section */}
            <div className="border-t border-border pt-4 mt-2 space-y-4">
              <div className="space-y-2">
                <Label>ملاحظة الإدارة (داخلية)</Label>
                <Textarea 
                  value={adminNote} 
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="ملاحظات تخص معالجة الطلب (لن يراها العميل)..."
                />
              </div>

              <div className="space-y-2">
                <Label>تحديث حالة الطلب</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button 
                    variant={selectedOrder.status === 'reviewing' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleUpdateStatus('reviewing')}
                    disabled={updateMutation.isPending}
                  >
                    <Clock size={14} className="mr-1" /> مراجعة
                  </Button>
                  <Button 
                    variant={selectedOrder.status === 'confirmed' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white border-none"
                    onClick={() => handleUpdateStatus('confirmed')}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle2 size={14} className="mr-1" /> تأكيد
                  </Button>
                  <Button 
                    variant={selectedOrder.status === 'completed' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                    onClick={() => handleUpdateStatus('completed')}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle2 size={14} className="mr-1" /> مكتمل
                  </Button>
                  <Button 
                    variant={selectedOrder.status === 'cancelled' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full bg-red-500 hover:bg-red-600 text-white border-none"
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={updateMutation.isPending}
                  >
                    <XCircle size={14} className="mr-1" /> إلغاء
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-start">
              <span className="text-xs text-muted-foreground mr-auto mt-2">
                تاريخ الطلب: {format(new Date(selectedOrder.created_at), 'yyyy-MM-dd HH:mm')}
              </span>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
