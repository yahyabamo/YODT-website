import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAllProjectsAdmin } from '@/hooks/studentProjects/useStudentProjects';
import { deleteProject, updateProjectStatus, toggleProjectFeatured } from '@/services/studentProjectsService';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'منشور', color: 'text-emerald-600 bg-emerald-100' },
  hidden:   { label: 'مخفي', color: 'text-gray-500 bg-gray-100' },
  pending:  { label: 'انتظار', color: 'text-amber-600 bg-amber-100' },
  rejected: { label: 'مرفوض', color: 'text-red-600 bg-red-100' },
};

export default function ProjectsAdmin() {
  useRoleGuard(['student-projects']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useAllProjectsAdmin();
  const { setConfirm } = useOutletContext<any>();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['student_projects_admin'] });
    queryClient.invalidateQueries({ queryKey: ['student_projects'] });
    queryClient.invalidateQueries({ queryKey: ['student_project_stats'] });
  };

  const handleDelete = (id: string, name: string) => {
    setConfirm({
      title: 'حذف المشروع',
      description: `هل أنت متأكد من حذف "${name}"؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        try {
          const { error } = await deleteProject(id);
          if (error) throw error;
          toast.success('تم الحذف');
          invalidate();
        } catch (err: any) {
          toast.error('خطأ: ' + err.message);
        }
      },
    });
  };

  const handleToggleVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
    try {
      const { error } = await updateProjectStatus(id, newStatus as any);
      if (error) throw error;
      toast.success(newStatus === 'approved' ? 'تم إظهار المشروع' : 'تم إخفاء المشروع');
      invalidate();
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const { error } = await toggleProjectFeatured(id, !current);
      if (error) throw error;
      toast.success(!current ? 'تم تمييز المشروع' : 'تم إلغاء التمييز');
      invalidate();
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">المشاريع</h1>
            <p className="text-sm text-muted-foreground">إدارة جميع مشاريع الطلاب</p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/student-projects/new')}>
          <Plus className="mr-2 h-4 w-4" /> إضافة يدوياً
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">الصورة</th>
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium">الفئة</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">مميز</th>
                <th className="px-4 py-3 font-medium">التاريخ</th>
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
              ) : projects && projects.length > 0 ? (
                projects.map((proj) => {
                  const statusInfo = STATUS_LABELS[proj.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={proj.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden border border-border">
                          {proj.cover_image_url ? (
                            <img src={proj.cover_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-base">
                              {proj.project_categories?.icon ?? '💼'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[180px] truncate" title={proj.name_ar}>
                        {proj.name_ar}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {proj.project_categories?.name_ar ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(proj.id, proj.featured)}
                          className={`transition-colors ${proj.featured ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'}`}
                          title={proj.featured ? 'إلغاء التمييز' : 'تمييز'}
                        >
                          <Star size={16} fill={proj.featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(proj.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex justify-end gap-1">
                          {/* Edit */}
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => navigate(`/admin/student-projects/${proj.id}`)}
                          >
                            <Edit size={15} />
                          </Button>
                          {/* Toggle visibility */}
                          <Button
                            variant="ghost" size="icon"
                            className={`h-8 w-8 ${proj.status === 'approved' ? 'text-gray-500 hover:bg-gray-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            onClick={() => handleToggleVisibility(proj.id, proj.status)}
                            title={proj.status === 'approved' ? 'إخفاء' : 'إظهار'}
                          >
                            {proj.status === 'approved' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </Button>
                          {/* Delete */}
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(proj.id, proj.name_ar)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    لا توجد مشاريع
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
