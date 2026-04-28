import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllAdsAdmin, useToggleAdActive, useDeleteAd } from '@/hooks/useAds';
import { AD_PAGE_OPTIONS, AD_POSITION_OPTIONS } from '@/services/adsService';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2, Globe, LayoutTemplate, Star, ExternalLink, Power } from 'lucide-react';
import { toast } from 'sonner';

// Lookup helpers
const getPageLabel = (v: string) => AD_PAGE_OPTIONS.find(o => o.value === v)?.label ?? v;
const getPosLabel = (v: string) => AD_POSITION_OPTIONS.find(o => o.value === v)?.label ?? v;

export default function AdsAdmin() {
  const navigate = useNavigate();
  const { data: ads, isLoading } = useAllAdsAdmin();
  const toggleActive = useToggleAdActive();
  const deleteAd = useDeleteAd();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    setDeletingId(id);
    try {
      await deleteAd.mutateAsync(id);
      toast.success('تم حذف الإعلان');
    } catch {
      toast.error('فشل الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
      toast.success(!current ? 'تم تفعيل الإعلان' : 'تم إيقاف الإعلان');
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الإعلانات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ads?.length ?? 0} إعلان مسجل — الإعلانات ذات الأولوية الأعلى تظهر أولاً
          </p>
        </div>
        <Button onClick={() => navigate('/admin/ads/new')} className="gap-2">
          <Plus size={16} />
          إعلان جديد
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-muted-foreground">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : !ads || ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-4">
            <LayoutTemplate size={40} className="opacity-30" />
            <p className="text-sm">لا توجد إعلانات بعد. أضف أول إعلان الآن.</p>
            <Button variant="outline" onClick={() => navigate('/admin/ads/new')} className="gap-2">
              <Plus size={14} /> إضافة إعلان
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الصورة</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الصفحات المستهدفة</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الموضع</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><Star size={12} /> الأولوية</span>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الرابط</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحالة</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-24 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                        <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Page names */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {ad.page_names && ad.page_names.includes('all') ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <Globe size={10} />
                            جميع الصفحات / All
                          </span>
                        ) : (
                          (ad.page_names || ((ad as any).page_name ? [(ad as any).page_name] : ['home'])).map((p: string) => (
                            <span key={p} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {getPageLabel(p)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {getPosLabel(ad.position)}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                        ad.priority > 0
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Star size={10} />
                        {ad.priority}
                      </span>
                    </td>

                    {/* URL */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <a
                        href={ad.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline truncate max-w-[150px]"
                      >
                        <ExternalLink size={10} className="shrink-0" />
                        <span className="truncate">{ad.redirect_url}</span>
                      </a>
                    </td>

                    {/* Active toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(ad.id, ad.is_active)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                          ad.is_active
                            ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Power size={11} />
                        {ad.is_active ? 'نشط' : 'موقوف'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => navigate(`/admin/ads/${ad.id}`)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(ad.id)}
                          disabled={deletingId === ad.id}
                        >
                          {deletingId === ad.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
