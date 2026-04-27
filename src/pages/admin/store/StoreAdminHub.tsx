import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreStats } from '@/hooks/store/useStoreOrders';
import { Store, ShoppingBag, ListOrdered, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StoreAdminHub() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useStoreStats();

  const cards = [
    {
      title: 'إجمالي الطلبات',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      path: '/admin/store/orders'
    },
    {
      title: 'طلبات قيد الانتظار',
      value: stats?.pendingOrders ?? 0,
      icon: ListOrdered,
      color: 'text-warning',
      bg: 'bg-warning/10',
      path: '/admin/store/orders'
    },
    {
      title: 'المنتجات النشطة',
      value: stats?.totalProducts ?? 0,
      icon: Tag,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      path: '/admin/store/products'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Store size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المتجر</h1>
          <p className="text-muted-foreground">نظرة عامة على أداء المتجر والطلبات</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-secondary/50 rounded-t-xl" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(card.path)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                  <card.icon size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الكتالوج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/store/categories')}>
              <Tag className="mr-2 h-4 w-4" /> فئات المتجر
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/store/products')}>
              <ShoppingBag className="mr-2 h-4 w-4" /> المنتجات
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إدارة المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/store/orders')}>
              <ListOrdered className="mr-2 h-4 w-4" /> جميع الطلبات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
