import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchUserRequests, UnifiedRequest, getCurrentUser, linkGuestRequests } from '@/service/supabaseData';
import { FileText, MessageSquare, Briefcase, Search, Loader2, AlertCircle, Clock, CheckCircle2, ShoppingBag, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  'NEW':         { label: 'جديد',           color: 'bg-blue-100 text-blue-700',       icon: Clock },
  'pending':     { label: 'قيد الانتظار',   color: 'bg-amber-100 text-amber-700',     icon: Clock },
  'reviewing':   { label: 'قيد المراجعة',   color: 'bg-amber-100 text-amber-700',     icon: Search },
  'UNDER_REVIEW':{ label: 'قيد المراجعة',   color: 'bg-amber-100 text-amber-700',     icon: Search },
  'IN_PROGRESS': { label: 'جاري العمل',     color: 'bg-purple-100 text-purple-700',   icon: Loader2 },
  'confirmed':   { label: 'تم التأكيد',     color: 'bg-purple-100 text-purple-700',   icon: CheckCircle2 },
  'COMPLETED':   { label: 'مكتمل',          color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'completed':   { label: 'مكتمل',          color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'approved':    { label: 'تمت الموافقة',   color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'REJECTED':    { label: 'مرفوض',          color: 'bg-red-100 text-red-700',         icon: AlertCircle },
  'rejected':    { label: 'مرفوض',          color: 'bg-red-100 text-red-700',         icon: AlertCircle },
  'cancelled':   { label: 'ملغي',           color: 'bg-red-100 text-red-700',         icon: XCircle },
};

const getStatusInfo = (status: string) => {
  return statusMap[status] || statusMap['pending'];
};

const getTypeIcon = (type: string) => {
  if (type === 'project') return <Briefcase className="w-5 h-5" />;
  if (type === 'service') return <FileText className="w-5 h-5" />;
  if (type === 'job')     return <Briefcase className="w-5 h-5" />;
  if (type === 'store')   return <ShoppingBag className="w-5 h-5" />;
  return <MessageSquare className="w-5 h-5" />;
};

// Safe text: just null-guard, no encoding tricks.
// Supabase returns proper UTF-8 — decodeURIComponent(escape()) was corrupting valid Arabic.
const safeText = (text?: string | null): string => {
  if (text === null || text === undefined) return '';
  return String(text);
};

const TYPE_LABELS: Record<string, string> = {
  suggestion: 'اقتراح',
  problem:    'مشكلة',
  idea:       'فكرة',
  service:    'طلب خدمة',
  project:    'مشروع',
  job:        'طلب توظيف',
  store:      'طلب من المتجر',
};

const getDisplayTitle = (req: UnifiedRequest): string => {
  const t = safeText(req.title).trim();
  if (t) return t;
  if (req.source_table === 'suggestions')        return TYPE_LABELS[req.type] || 'اقتراح / ملاحظة';
  if (req.source_table === 'service_requests')   return 'طلب خدمة';
  if (req.source_table === 'project_submissions') return 'تسليم مشروع';
  if (req.source_table === 'job_applications')   return 'طلب توظيف';
  if (req.source_table === 'store_orders')       return 'طلب من المتجر';
  return 'طلب';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function MyRequests() {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'suggestions' | 'service_requests' | 'project_submissions' | 'job_applications' | 'store_orders'>('all');
  const [trackingCode, setTrackingCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRequests = async (currentUser = user, code = '') => {
    setLoading(true);
    try {
      const data = await fetchUserRequests({
        userId: currentUser?.id,
        email: currentUser?.email,
        phone: currentUser?.phone, // if exists in profile
        trackingCode: code || trackingCode
      });
      setRequests(data);
    } catch (err) {
      toast.error('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let channel: any;
    
    getCurrentUser().then(async (u) => {
      setUser(u);
      if (u) {
        // Auto-link requests on load if email exists
        if (u.email) {
          await linkGuestRequests(u.id, u.email);
        }
      }
      loadRequests(u);

      // Real-time subscription
      channel = supabase.channel('my-requests-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' },        () => loadRequests(u, trackingCode))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' },   () => loadRequests(u, trackingCode))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_submissions' },() => loadRequests(u, trackingCode))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' },   () => loadRequests(u, trackingCode))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_orders' },       () => loadRequests(u, trackingCode))
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [trackingCode]);

  const handleLookup = () => {
    if (!trackingCode.trim()) {
      toast.error('يرجى إدخال كود التتبع');
      return;
    }
    loadRequests(user, trackingCode);
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.source_table === filter);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <PageHeader title="طلباتي ومقترحاتي" showBack />
      
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        
        {/* Tracking Code Lookup for Guests or Manual Claim */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
          <Input 
            placeholder="أدخل كود التتبع (لطلبات الزوار)..." 
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button onClick={handleLookup} disabled={loading}>
            بحث
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {([
            { key: 'all',                 label: 'الكل' },
            { key: 'suggestions',         label: 'المقترحات' },
            { key: 'service_requests',    label: 'طلبات عون' },
            { key: 'store_orders',        label: 'المتجر' },
            { key: 'project_submissions', label: 'المشاريع' },
            { key: 'job_applications',    label: 'التوظيف' },
          ] as const).map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
              className="rounded-xl whitespace-nowrap"
            >
              {label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">لا توجد طلبات</h3>
            <p className="text-gray-500 text-sm">لم تقم بتقديم أي طلبات أو مقترحات بعد.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(req => {
              const statusInfo = getStatusInfo(req.status);
              const StatusIcon = statusInfo.icon;
              const hasNewResponse = req.admin_response && req.responded_at && new Date(req.responded_at).getTime() > new Date(req.created_at).getTime();
              const isExpanded = expandedId === req.id;

              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 flex gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      {getTypeIcon(req.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 truncate pr-2">{getDisplayTitle(req)}</h3>
                        <div className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 shrink-0 ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                        <span className="truncate max-w-[60%]">{formatDate(req.created_at)}</span>
                        {hasNewResponse && (
                          <span className="flex items-center gap-1 text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                            رد جديد
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/50">
                      {safeText(req.message) && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">التفاصيل</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                            {safeText(req.message)}
                          </p>
                        </div>
                      )}

                      {req.admin_response && (
                        <div>
                          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            رد الإدارة
                          </h4>
                          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-sm text-gray-800 whitespace-pre-wrap leading-relaxed relative">
                            {safeText(req.admin_response)}
                            <div className="text-[10px] text-gray-400 mt-2 text-left w-full" dir="ltr">
                              {req.responded_at ? formatDate(req.responded_at) : formatDate(req.last_updated_at)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Show order number for store orders */}
                      {req.order_number && (
                        <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500">رقم الطلب:</span>
                          <span className="text-sm font-mono font-bold text-primary">{req.order_number}</span>
                        </div>
                      )}

                      {/* Show tracking code for non-store, non-linked items */}
                      {req.tracking_code && !req.order_number && !req.user_id && (
                        <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500">كود التتبع:</span>
                          <span className="text-sm font-mono font-bold">{req.tracking_code}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
