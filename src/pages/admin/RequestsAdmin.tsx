import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchSuggestions, updateRequestStatus, UnifiedRequest } from '@/service/supabaseData';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  Loader2,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox,
  X,
  RefreshCw,
  Filter,
  User,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  NEW: { label: 'جديد', color: 'bg-blue-100 text-blue-700', icon: Clock },
  UNDER_REVIEW: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700', icon: Search },
  IN_PROGRESS: { label: 'جاري العمل', color: 'bg-purple-100 text-purple-700', icon: Loader2 },
  COMPLETED: { label: 'تمت المعالجة', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const STATUSES = Object.keys(STATUS_MAP);

const TYPE_COLORS: Record<string, string> = {
  suggestion: 'bg-primary/10 text-primary',
  problem: 'bg-red-100 text-red-600',
  question: 'bg-amber-100 text-amber-700',
  idea: 'bg-amber-100 text-amber-700', // legacy fallback
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeText = (text?: string | null): string => {
  if (text === null || text === undefined) return '';
  return String(text);
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const getStatusInfo = (status: string) => STATUS_MAP[status] ?? STATUS_MAP['NEW'];

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const info = getStatusInfo(status);
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${info.color}`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  );
};

// ─── Reply Modal ──────────────────────────────────────────────────────────────

interface ReplyModalProps {
  request: UnifiedRequest;
  onClose: () => void;
  onSaved: () => void;
}

const ReplyModal = ({ request, onClose, onSaved }: ReplyModalProps) => {
  const [editStatus, setEditStatus] = useState(request.status || 'NEW');
  const [editResponse, setEditResponse] = useState(safeText(request.admin_response));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRequestStatus('suggestions', request.id, editStatus, editResponse);
      toast.success('تم حفظ الرد بنجاح');
      onSaved();
      onClose();
    } catch (err) {
      console.error('[ReplyModal] save error:', err);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const typeColor = TYPE_COLORS[request.type] || 'bg-gray-100 text-gray-500';
  const typeName = safeText(request.title) || safeText(request.type);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">الرد على الاقتراح</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${typeColor}`}>
                  {typeName}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {safeText(request.tracking_code) || request.user_id?.substring(0, 8) || 'ضيف'}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Original message */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">الرسالة الأصلية</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {safeText(request.message) || '(لا يوجد نص)'}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">{formatDate(request.created_at)}</span>
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-2">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <p className="font-semibold text-blue-900 truncate">
                  {safeText(request.user_name) || 'مستخدم غير مسجل (ضيف)'}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5 text-xs text-blue-700 font-mono">
                  {(safeText(request.contact_phone) || safeText(request.user_phone)) && (
                    <span>{safeText(request.contact_phone) || safeText(request.user_phone)}</span>
                  )}
                  {safeText(request.contact_email) && (
                    <span>{safeText(request.contact_email)}</span>
                  )}
                </div>
              </div>
              {/* WhatsApp Link */}
              {(safeText(request.contact_phone) || safeText(request.user_phone)) && (
                <a
                  href={`https://wa.me/${safeText(request.contact_phone) || safeText(request.user_phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                  title="مراسلة عبر واتساب"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Status update */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">تحديث الحالة</label>
            <select
              className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={editStatus}
              onChange={e => setEditStatus(e.target.value)}
            >
              {STATUSES.map(st => (
                <option key={st} value={st}>{STATUS_MAP[st].label}</option>
              ))}
            </select>
          </div>

          {/* Admin reply */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              ردك <span className="font-normal text-gray-400">(يظهر للمستخدم في صفحة طلباتي)</span>
            </label>
            <Textarea
              placeholder="اكتب ردك هنا..."
              className="min-h-[130px] rounded-xl resize-none text-sm"
              value={editResponse}
              onChange={e => setEditResponse(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 rounded-xl h-11">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ الرد'}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Suggestion Card ──────────────────────────────────────────────────────────

  const SuggestionCard = ({
  request,
  onClick,
}: {
  request: UnifiedRequest;
  onClick: () => void;
}) => {
  const typeColor = TYPE_COLORS[request.type] || 'bg-gray-100 text-gray-500';
  const hasResponse = !!safeText(request.admin_response);

  // Page label map for source_page
  const PAGE_LABELS: Record<string, string> = {
    home: 'الرئيسية', store: 'المتجر', activities: 'الأنشطة',
    busla: 'بوصلة', discounts: 'العروض', universities: 'الجامعات',
    university_details: 'تفاصيل الجامعة', about_istanbul: 'عن إسطنبول',
    about_yemen: 'عن اليمن', article_detail: 'تفاصيل المقال',
    student: 'الطلاب', points: 'النقاط', '3wn': 'عون',
    jobs: 'الوظائف', partners: 'الشركاء', faq: 'الأسئلة الشائعة', guide: 'الدليل',
  };

  return (
    <div
      className="bg-white border border-gray-100 hover:border-primary/30 hover:shadow-md rounded-2xl p-5 cursor-pointer transition-all duration-200 group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${typeColor}`}>
            {safeText(request.title)}
          </span>
          <span className="text-[12px] font-medium text-gray-700 truncate">
            {safeText(request.contact_name) || safeText(request.user_name) || 'ضيف'}
          </span>
          <span className="text-[11px] text-gray-400 font-mono truncate hidden sm:inline-block">
            {safeText(request.tracking_code) || request.user_id?.substring(0, 8)}
          </span>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Message */}
      <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 leading-relaxed">
        {safeText(request.message) || '(لا يوجد نص)'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{formatDate(request.created_at)}</span>
          {request.source_page && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold text-[10px] border border-blue-100">
              {PAGE_LABELS[request.source_page] ?? request.source_page}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasResponse ? (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> تم الرد
            </span>
          ) : (
            <span className="text-amber-500 font-semibold">بانتظار الرد</span>
          )}
          <span className="text-primary/60 font-medium group-hover:text-primary transition-colors">
            اضغط للرد ←
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RequestsAdmin() {
  const [suggestions, setSuggestions] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'suggestion' | 'problem' | 'question'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuggestions();
      setSuggestions(data);
    } catch (err: any) {
      console.error('[RequestsAdmin] fetchSuggestions error:', err);
      setError(err?.message ?? 'خطأ غير معروف');
      toast.error('تعذّر تحميل الاقتراحات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();

    // Real-time: re-fetch when any row in suggestions changes
    const channel = supabase
      .channel('admin-suggestions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, loadSuggestions)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return suggestions.filter(r => {
      // When filtering by 'question', also include legacy 'idea' rows
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'question' ? (r.type === 'question' || r.type === 'idea') : r.type === typeFilter);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch = !q ||
        safeText(r.message).toLowerCase().includes(q) ||
        safeText(r.tracking_code).toLowerCase().includes(q) ||
        safeText(r.contact_email).toLowerCase().includes(q) ||
        safeText(r.contact_name).toLowerCase().includes(q) ||
        safeText(r.contact_phone).toLowerCase().includes(q);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [suggestions, typeFilter, statusFilter, searchQuery]);

  const counts = useMemo(() => ({
    all: suggestions.length,
    suggestion: suggestions.filter(r => r.type === 'suggestion').length,
    problem: suggestions.filter(r => r.type === 'problem').length,
    question: suggestions.filter(r => r.type === 'question' || r.type === 'idea').length,
    pending: suggestions.filter(r => r.status === 'NEW').length,
  }), [suggestions]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">الاقتراحات والمشاكل</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {counts.all} اقتراح إجمالاً —{' '}
            <span className="text-amber-600 font-semibold">{counts.pending} بانتظار الرد</span>
          </p>
        </div>
        <Button variant="outline" onClick={loadSuggestions} disabled={loading} className="gap-2 rounded-xl">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'الكل', count: counts.all },
          { key: 'suggestion', label: 'اقتراح', count: counts.suggestion },
          { key: 'problem', label: 'مشكلة', count: counts.problem },
          { key: 'question', label: 'استفسار', count: counts.question },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 ${typeFilter === key
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
          >
            {label} <span className="opacity-70 text-xs">({count})</span>
          </button>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="ابحث في الرسائل، كود التتبع، أو البريد الإلكتروني..."
            className="pr-10 rounded-xl"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <select
            className="h-10 pr-9 pl-3 rounded-xl border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[140px]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            {STATUSES.map(st => (
              <option key={st} value={st}>{STATUS_MAP[st].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">تعذّر تحميل البيانات</p>
            <p className="text-xs mt-0.5 opacity-70 font-mono">{error}</p>
            <p className="text-xs mt-1 opacity-80">
              تأكد من تشغيل سكربت SQL وإضافة policy تتيح للأدمن قراءة جميع السجلات.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadSuggestions} className="shrink-0 text-red-700">
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Inbox className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-base font-semibold">
            {suggestions.length === 0 ? 'لا توجد اقتراحات بعد' : 'لا توجد نتائج مطابقة'}
          </p>
          {suggestions.length === 0 && (
            <p className="text-xs mt-2 opacity-70 max-w-sm mx-auto">
              إذا كانت الاقتراحات قد أُرسلت لكنها لا تظهر هنا، تحقق من سياسات RLS في Supabase.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(req => (
            <SuggestionCard
              key={req.id}
              request={req}
              onClick={() => setSelectedRequest(req)}
            />
          ))}
        </div>
      )}

      {/* Reply modal */}
      {selectedRequest && (
        <ReplyModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSaved={loadSuggestions}
        />
      )}
    </div>
  );
}