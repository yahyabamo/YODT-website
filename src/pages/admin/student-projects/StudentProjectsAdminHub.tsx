import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useStudentProjectStats } from '@/hooks/studentProjects/useStudentProjects';
import { Briefcase, Inbox, Star, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudentProjectsAdminHub() {
  useRoleGuard(['student-projects']);
  const navigate = useNavigate();
  const { data: stats, isLoading } = useStudentProjectStats();

  const statCards = [
    {
      title: 'طلبات قيد المراجعة',
      value: stats?.pendingSubmissions ?? 0,
      icon: Inbox,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      path: '/admin/student-projects/submissions',
      highlight: (stats?.pendingSubmissions ?? 0) > 0,
    },
    {
      title: 'المشاريع المنشورة',
      value: stats?.totalProjects ?? 0,
      icon: Briefcase,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      path: '/admin/student-projects/projects',
    },
    {
      title: 'المشاريع المميزة',
      value: stats?.featuredProjects ?? 0,
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      path: '/admin/student-projects/projects',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة مشاريع الطلاب</h1>
          <p className="text-muted-foreground">نظرة عامة على مشاريع الطلاب اليمنيين</p>
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
          {statCards.map((card, i) => (
            <Card
              key={i}
              className={`cursor-pointer hover:shadow-md transition-all ${card.highlight ? 'border-amber-400/40 bg-amber-500/5' : ''}`}
              onClick={() => navigate(card.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                  <card.icon size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${card.highlight ? 'text-amber-400' : ''}`}>{card.value}</div>
                {card.highlight && (
                  <p className="text-xs text-amber-400 mt-1 font-medium">تحتاج مراجعة</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/student-projects/submissions')}>
              <Inbox className="mr-2 h-4 w-4" /> الطلبات الواردة
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إدارة المحتوى</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/student-projects/projects')}>
              <Briefcase className="mr-2 h-4 w-4" /> المشاريع المنشورة
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/student-projects/categories')}>
              <Tag className="mr-2 h-4 w-4" /> الفئات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
