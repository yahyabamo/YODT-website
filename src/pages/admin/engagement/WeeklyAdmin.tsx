import { useState } from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useWeeklyAdmin, ActivityType, WeeklyAnswer } from '@/hooks/useWeekly';
import { Spinner } from '../components/AdminUI';
import { toast } from 'sonner';

const B = '#8B1A2A';

const typeLabels: Record<ActivityType, string> = {
  text_question: '✍️ سؤال مفتوح',
  multiple_choice: '☑️ اختيار متعدد',
  poll: '📊 استطلاع رأي',
};

const typeDescriptions: Record<ActivityType, string> = {
  text_question: 'يكتب المستخدمون إجاباتهم بأسلوبهم الخاص',
  multiple_choice: 'يختار المستخدمون من خيارات محددة',
  poll: 'تصويت بسيط بدون نصوص مفتوحة',
};

export default function WeeklyAdmin() {
  useRoleGuard(['weekly-engagement']);
  const {
    activities, loading, error,
    createActivity, activateActivity, deactivateActivity, deleteActivity, fetchAnswers,
  } = useWeeklyAdmin();

  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [viewAnswers, setViewAnswers] = useState<WeeklyAnswer[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [actType, setActType] = useState<ActivityType>('text_question');
  const [optionsText, setOptionsText] = useState(''); // one per line
  const [submitting, setSubmitting] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.error('أدخل عنوان النشاط أولاً'); return; }
    if ((actType === 'multiple_choice' || actType === 'poll') && !optionsText.trim()) {
      toast.error('أضف خيارات النشاط (سطر لكل خيار)'); return;
    }

    const options = optionsText.trim()
      ? optionsText.split('\n').map(s => s.trim()).filter(Boolean)
      : undefined;

    if ((actType === 'multiple_choice' || actType === 'poll') && (!options || options.length < 2)) {
      toast.error('يجب إضافة خيارين على الأقل'); return;
    }

    setSubmitting(true);
    const res = await createActivity(newTitle, { type: actType, options });
    setSubmitting(false);

    if (res.ok) {
      toast.success(res.message);
      setNewTitle(''); setOptionsText(''); setActType('text_question');
      setTab('list');
    } else {
      toast.error(res.message);
    }
  };

  const handleActivate = async (id: string) => {
    setProcessing(id + '_activate');
    const res = await activateActivity(id);
    setProcessing(null);
    if (res.ok) toast.success(res.message); else toast.error(res.message);
  };

  const handleDeactivate = async (id: string) => {
    setProcessing(id + '_deactivate');
    const res = await deactivateActivity(id);
    setProcessing(null);
    if (res.ok) toast.success(res.message); else toast.error(res.message);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;
    setProcessing(id + '_delete');
    const res = await deleteActivity(id);
    setProcessing(null);
    if (res.ok) { toast.success(res.message); if (viewingId === id) setViewingId(null); }
    else toast.error(res.message);
  };

  const handleViewResults = async (id: string) => {
    if (viewingId === id) { setViewingId(null); return; }
    setViewingId(id);
    setLoadingResults(true);
    const data = await fetchAnswers(id);
    setViewAnswers(data);
    setLoadingResults(false);
  };

  if (loading) return <Spinner />;

  const active = activities.find(a => a.is_active);
  const inactive = activities.filter(a => !a.is_active);

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة النشاط الأسبوعي</h2>
        <p className="m-0 mt-0.5 text-[#6b7280] text-[13px]">إنشاء وتفعيل الأنشطة الأسبوعية</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'إجمالي الأنشطة', value: activities.length, color: B },
          { label: 'النشط حالياً', value: active ? 1 : 0, color: '#10b981' },
          { label: 'غير نشط', value: inactive.length, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0f0f0] text-center">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#6b7280] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'list', label: '📋 الأنشطة' },
          { id: 'create', label: '➕ إنشاء نشاط' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition"
            style={{ background: tab === t.id ? B : '#f1f5f9', color: tab === t.id ? '#fff' : '#6b7280', border: 'none', cursor: 'pointer' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Create Tab ───────────────────────────────────────────────────────── */}
      {tab === 'create' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] space-y-4 max-w-xl">
          <h3 className="font-bold text-[#111] text-base m-0">إنشاء نشاط جديد</h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">عنوان / نص النشاط *</label>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="مثال: ما هو تخصصك الدراسي؟"
              className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm focus:outline-none focus:border-[#8B1A2A]"
              dir="rtl"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-2">نوع النشاط *</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(typeLabels) as ActivityType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActType(t)}
                  className="flex items-start gap-3 p-3 rounded-xl border-2 text-right transition"
                  style={{
                    borderColor: actType === t ? B : '#e5e7eb',
                    background: actType === t ? `${B}08` : '#fafafa',
                    cursor: 'pointer',
                  }}
                >
                  <span className="text-xl">{typeLabels[t].split(' ')[0]}</span>
                  <div>
                    <p className="font-bold text-sm text-[#111] m-0">{typeLabels[t].slice(3)}</p>
                    <p className="text-xs text-[#6b7280] m-0 mt-0.5">{typeDescriptions[t]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options (only for MCQ and Poll) */}
          {(actType === 'multiple_choice' || actType === 'poll') && (
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                الخيارات * (خيار واحد في كل سطر)
              </label>
              <textarea
                value={optionsText}
                onChange={e => setOptionsText(e.target.value)}
                placeholder={"هندسة\nطب\nتقنية معلومات\nاقتصاد"}
                rows={5}
                className="w-full rounded-xl border border-[#e5e7eb] px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#8B1A2A]"
                dir="rtl"
              />
              <p className="text-xs text-[#9ca3af] mt-1">
                {optionsText.split('\n').filter(s => s.trim()).length} خيار مُضاف
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition"
            style={{ background: B, border: 'none', cursor: submitting ? 'default' : 'pointer' }}
          >
            {submitting ? 'جاري الإنشاء...' : 'إنشاء النشاط'}
          </button>
        </div>
      )}

      {/* ── List Tab ─────────────────────────────────────────────────────────── */}
      {tab === 'list' && (
        <div className="space-y-4">
          {activities.length === 0 && (
            <div className="text-center py-12 text-[#9ca3af]">
              <div className="text-4xl mb-3">📋</div>
              <p>لا توجد أنشطة بعد. أنشئ نشاطك الأول!</p>
            </div>
          )}

          {/* Active */}
          {active && (
            <div>
              <h3 className="font-bold text-[#111] mb-2 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                النشاط الحالي
              </h3>
              <ActivityCard
                activity={active}
                isViewing={viewingId === active.id}
                viewAnswers={viewAnswers}
                loadingResults={loadingResults}
                processing={processing}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
                onViewResults={handleViewResults}
              />
            </div>
          )}

          {/* Inactive */}
          {inactive.length > 0 && (
            <div>
              <h3 className="font-bold text-[#111] mb-2 text-sm">الأنشطة غير النشطة ({inactive.length})</h3>
              <div className="space-y-2">
                {inactive.map(act => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    isViewing={viewingId === act.id}
                    viewAnswers={viewAnswers}
                    loadingResults={loadingResults}
                    processing={processing}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onDelete={handleDelete}
                    onViewResults={handleViewResults}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ActivityCard sub-component ────────────────────────────────────────────────

interface ActivityCardProps {
  activity: ReturnType<typeof useWeeklyAdmin>['activities'][0];
  isViewing: boolean;
  viewAnswers: WeeklyAnswer[];
  loadingResults: boolean;
  processing: string | null;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  onViewResults: (id: string) => void;
}

function ActivityCard({
  activity, isViewing, viewAnswers, loadingResults, processing,
  onActivate, onDeactivate, onDelete, onViewResults
}: ActivityCardProps) {
  const B = '#8B1A2A';
  const isProcActivate = processing === activity.id + '_activate';
  const isProcDeactivate = processing === activity.id + '_deactivate';
  const isProcDelete = processing === activity.id + '_delete';
  const anyProc = isProcActivate || isProcDeactivate || isProcDelete;

  const { meta } = activity;
  const totalVotes = viewAnswers.reduce((sum, a) => sum + (a.votes || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0f0f0]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: activity.is_active ? '#10b98120' : '#f1f5f9', color: activity.is_active ? '#10b981' : '#6b7280' }}
            >
              {activity.is_active ? '● نشط' : '○ غير نشط'}
            </span>
            <span className="text-[11px] text-[#9ca3af]">{typeLabelsShort[meta.type]}</span>
          </div>
          <p className="font-bold text-sm text-[#111] m-0 line-clamp-2">{activity.title}</p>
          {meta.options && (
            <p className="text-xs text-[#6b7280] mt-1">{meta.options.length} خيارات</p>
          )}
          <p className="text-xs text-[#9ca3af] mt-1">
            {new Date(activity.created_at).toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#f5f5f5]">
        {!activity.is_active ? (
          <button onClick={() => onActivate(activity.id)} disabled={anyProc}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: '#10b981', border: 'none', cursor: 'pointer', opacity: isProcActivate ? 0.6 : 1 }}>
            {isProcActivate ? '...' : '▶ تفعيل'}
          </button>
        ) : (
          <button onClick={() => onDeactivate(activity.id)} disabled={anyProc}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: '#f59e0b', border: 'none', cursor: 'pointer', opacity: isProcDeactivate ? 0.6 : 1 }}>
            {isProcDeactivate ? '...' : '⏸ إيقاف'}
          </button>
        )}
        <button onClick={() => onViewResults(activity.id)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: `${B}15`, color: B, border: 'none', cursor: 'pointer' }}>
          {isViewing ? '▲ إخفاء النتائج' : '📊 النتائج'}
        </button>
        <button onClick={() => onDelete(activity.id)} disabled={anyProc}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
          style={{ background: '#ef4444', border: 'none', cursor: 'pointer', opacity: isProcDelete ? 0.6 : 1 }}>
          {isProcDelete ? '...' : '🗑 حذف'}
        </button>
      </div>

      {/* Results Panel */}
      {isViewing && (
        <div className="mt-3 pt-3 border-t border-[#f5f5f5]">
          <p className="text-xs font-bold text-[#374151] mb-2">النتائج</p>
          {loadingResults ? (
            <p className="text-xs text-[#9ca3af]">جاري التحميل...</p>
          ) : viewAnswers.length === 0 ? (
            <p className="text-xs text-[#9ca3af]">لا توجد إجابات بعد</p>
          ) : (meta.type === 'text_question') ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {viewAnswers.map(a => (
                <div key={a.id} className="bg-[#f8fafc] rounded-xl p-2.5">
                  <p className="text-xs font-semibold text-[#374151]">{a.profiles?.full_name || 'مستخدم'}</p>
                  <p className="text-xs text-[#4b5563] mt-0.5">{a.content}</p>
                  {a.votes > 0 && <p className="text-[10px] text-[#9ca3af] mt-0.5">👍 {a.votes} تصويت</p>}
                </div>
              ))}
            </div>
          ) : (
            // MCQ / Poll: show vote bars
            <div className="space-y-2">
              {viewAnswers.map(a => {
                const pct = totalVotes > 0 ? Math.round((a.votes / totalVotes) * 100) : 0;
                return (
                  <div key={a.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[#374151]">{a.content}</span>
                      <span className="text-[#6b7280]">{a.votes} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: B }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-[#9ca3af] mt-1">إجمالي الأصوات: {totalVotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const typeLabelsShort: Record<ActivityType, string> = {
  text_question: '✍️ مفتوح',
  multiple_choice: '☑️ اختيار متعدد',
  poll: '📊 استطلاع',
};

