import React from 'react';
import { Power, Loader2, RefreshCw, MessageSquare, HelpCircle, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAllBoxSettingsAdmin, useToggleBoxSetting, useSeedBoxSettings } from '@/hooks/useSuggestionBox';
import { BOX_PAGE_OPTIONS } from '@/services/suggestionBoxService';

// Page label lookup
const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  BOX_PAGE_OPTIONS.map(p => [p.value, p.label])
);

export default function SuggestionBoxAdmin() {
  const { data: settings, isLoading, refetch } = useAllBoxSettingsAdmin();
  const toggleBox = useToggleBoxSetting();
  const seedDefaults = useSeedBoxSettings();

  const handleToggle = async (page_key: string, box_type: 'suggestion' | 'question', current: boolean) => {
    try {
      await toggleBox.mutateAsync({ page_key, box_type, is_active: !current });
      toast.success(!current ? 'تم تفعيل الصندوق' : 'تم إيقاف الصندوق');
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const handleSeed = async () => {
    try {
      await seedDefaults.mutateAsync();
      toast.success('تم إنشاء الإعدادات الافتراضية لجميع الصفحات');
    } catch {
      toast.error('فشل إنشاء الإعدادات الافتراضية');
    }
  };

  // Build a lookup: { [pageKey]: { suggestion: setting, question: setting } }
  const settingsMap = React.useMemo(() => {
    const map: Record<string, Record<string, { id: string; is_active: boolean }>> = {};
    for (const s of settings ?? []) {
      if (!map[s.page_key]) map[s.page_key] = {};
      map[s.page_key][s.box_type] = { id: s.id, is_active: s.is_active };
    }
    return map;
  }, [settings]);

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة صناديق الاقتراحات والأسئلة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تحكم في ظهور صندوق الاقتراحات وصندوق الأسئلة لكل صفحة
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            variant="outline"
            onClick={handleSeed}
            disabled={seedDefaults.isPending}
            className="gap-2 rounded-xl"
          >
            {seedDefaults.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutGrid className="w-4 h-4" />}
            إنشاء الإعدادات الافتراضية
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          صندوق الاقتراحات
        </span>
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          صندوق الأسئلة / الاستفسارات
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-muted-foreground">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الصفحة</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                    <span className="flex items-center justify-center gap-1">
                      <MessageSquare size={13} className="text-primary" />
                      صندوق الاقتراحات
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                    <span className="flex items-center justify-center gap-1">
                      <HelpCircle size={13} className="text-amber-600" />
                      صندوق الأسئلة
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {BOX_PAGE_OPTIONS.map((page) => {
                  const pageSetting = settingsMap[page.value] ?? {};
                  const suggSetting = pageSetting['suggestion'];
                  const questSetting = pageSetting['question'];

                  return (
                    <tr
                      key={page.value}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      {/* Page name */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{page.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">{page.value}</p>
                        </div>
                      </td>

                      {/* Suggestion toggle */}
                      <td className="px-4 py-3 text-center">
                        {suggSetting ? (
                          <button
                            onClick={() => handleToggle(page.value, 'suggestion', suggSetting.is_active)}
                            disabled={toggleBox.isPending}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                              suggSetting.is_active
                                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            <Power size={11} />
                            {suggSetting.is_active ? 'مفعّل' : 'معطّل'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggle(page.value, 'suggestion', false)}
                            className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          >
                            لم يُعيَّن بعد
                          </button>
                        )}
                      </td>

                      {/* Question toggle */}
                      <td className="px-4 py-3 text-center">
                        {questSetting ? (
                          <button
                            onClick={() => handleToggle(page.value, 'question', questSetting.is_active)}
                            disabled={toggleBox.isPending}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                              questSetting.is_active
                                ? 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            <Power size={11} />
                            {questSetting.is_active ? 'مفعّل' : 'معطّل'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggle(page.value, 'question', false)}
                            className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          >
                            لم يُعيَّن بعد
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">كيفية الاستخدام</p>
        <ul className="space-y-1 text-xs opacity-80 list-disc list-inside">
          <li>كل زر تبديل يحفظ الإعداد فوراً في قاعدة البيانات</li>
          <li>إذا كانت الصفحة تعرض "لم يُعيَّن بعد"، اضغط عليها لإنشاء الإعداد أو استخدم زر "إنشاء الإعدادات الافتراضية"</li>
          <li>المستخدمون يرون الصناديق فقط إذا كانت مفعّلة من هنا</li>
          <li>جميع الطلبات تصل إلى صفحة الاقتراحات والأسئلة في لوحة التحكم</li>
        </ul>
      </div>
    </div>
  );
}
