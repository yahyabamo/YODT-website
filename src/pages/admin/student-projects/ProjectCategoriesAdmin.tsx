import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAllProjectCategoriesAdmin } from '@/hooks/studentProjects/useStudentProjectCategories';
import { upsertProjectCategory, deleteProjectCategory } from '@/services/studentProjectsService';
import type { ProjectCategory } from '@/services/studentProjectsService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';

const IS: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: 10, fontSize: 14, background: '#fff', boxSizing: 'border-box',
  fontFamily: 'inherit', outline: 'none',
};

const BLANK: Partial<ProjectCategory> = {
  name_ar: '', name_en: '', name_tr: '', icon: '', order_index: 0, is_active: true,
};

export default function ProjectCategoriesAdmin() {
  useRoleGuard(['student-projects']);
  const queryClient = useQueryClient();
  const { setConfirm } = useOutletContext<any>();
  const { data: categories, isLoading } = useAllProjectCategoriesAdmin();

  const [editing, setEditing] = useState<Partial<ProjectCategory> | null>(null);
  const [saving, setSaving] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['project_categories_admin'] });
    queryClient.invalidateQueries({ queryKey: ['project_categories'] });
  };

  const handleSave = async () => {
    if (!editing?.name_ar?.trim()) { toast.error('الاسم بالعربي مطلوب'); return; }
    setSaving(true);
    try {
      const { error } = await upsertProjectCategory(editing);
      if (error) throw error;
      toast.success('تم الحفظ');
      setEditing(null);
      invalidate();
    } catch (err: any) {
      toast.error('خطأ: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirm({
      title: 'حذف الفئة',
      description: `هل أنت متأكد من حذف "${name}"؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        try {
          const { error } = await deleteProjectCategory(id);
          if (error) throw error;
          toast.success('تم الحذف');
          invalidate();
        } catch (err: any) {
          toast.error('خطأ: ' + err.message);
        }
      },
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
            <h1 className="text-xl font-bold text-foreground">الفئات</h1>
            <p className="text-sm text-muted-foreground">إدارة فئات مشاريع الطلاب</p>
          </div>
        </div>
        <Button onClick={() => setEditing({ ...BLANK })}>
          <Plus className="mr-2 h-4 w-4" /> فئة جديدة
        </Button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card border border-primary/30 rounded-xl p-6 space-y-4" dir="rtl">
          <h3 className="font-bold text-foreground">{editing.id ? 'تعديل الفئة' : 'فئة جديدة'}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">عربي *</label>
              <input style={{ ...IS, direction: 'rtl' }} value={editing.name_ar ?? ''} onChange={(e) => setEditing((p) => ({ ...p!, name_ar: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">English</label>
              <input style={{ ...IS, direction: 'ltr' }} value={editing.name_en ?? ''} onChange={(e) => setEditing((p) => ({ ...p!, name_en: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Türkçe</label>
              <input style={{ ...IS, direction: 'ltr' }} value={editing.name_tr ?? ''} onChange={(e) => setEditing((p) => ({ ...p!, name_tr: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">الأيقونة (إيموجي)</label>
              <input style={IS} value={editing.icon ?? ''} onChange={(e) => setEditing((p) => ({ ...p!, icon: e.target.value }))} placeholder="🌸" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">الترتيب</label>
              <input style={IS} type="number" value={editing.order_index ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, order_index: parseInt(e.target.value) }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing((p) => ({ ...p!, is_active: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-medium">فئة نشطة</span>
          </label>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">الأيقونة</th>
              <th className="px-4 py-3 font-medium">الاسم (عربي)</th>
              <th className="px-4 py-3 font-medium">English</th>
              <th className="px-4 py-3 font-medium">Türkçe</th>
              <th className="px-4 py-3 font-medium">الترتيب</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground animate-pulse">جارٍ التحميل...</td></tr>
            ) : categories && categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-xl">{cat.icon}</td>
                  <td className="px-4 py-3 font-medium">{cat.name_ar}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.name_en}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.name_tr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.order_index}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.is_active ? 'نشط' : 'مخفي'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-left">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => setEditing({ ...cat })}>
                        <Edit size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(cat.id, cat.name_ar)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">لا توجد فئات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
