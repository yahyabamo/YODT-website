import { useState } from 'react';
import { useChatAdmin } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '../components/AdminUI';
import { toast } from 'sonner';

const B = '#8B1A2A';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  approved: 'مقبول',
  rejected: 'مرفوض',
};

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const genderMap = {
  "ذكور": "male",
  "إناث": "female",
  "الكل": null
}
export default function ChatAdmin() {
  const { requests, groups, loading, approveRequest, rejectRequest, refresh } = useChatAdmin();
  const [processing, setProcessing] = useState<string | null>(null);
  const [tab, setTab] = useState<'requests' | 'groups'>('requests');

  // Group creation state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupCategory, setGroupCategory] = useState('');
  const [groupGender, setGroupGender] = useState<'male' | 'female' | 'both'>('both');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // ── Request handlers ──────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    setProcessing(id);
    const ok = await approveRequest(id);
    setProcessing(null);
    if (ok) toast.success('تم قبول الطلب');
    else toast.error('فشل قبول الطلب');
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    const ok = await rejectRequest(id);
    setProcessing(null);
    if (ok) toast.success('تم رفض الطلب');
    else toast.error('فشل رفض الطلب');
  };

  // ── Group handlers ────────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    if (!groupName.trim()) { toast.error('أدخل اسم المجموعة'); return; }
    setCreatingGroup(true);

    const mappedGender = groupGender === 'both' ? null : groupGender;

    const { data, error } = await (supabase as any)
      .from('eng_chat_groups')
      .insert({
        name: groupName.trim(),
        description: groupCategory.trim() || null,
        gender: mappedGender,
      })
      .select()
      .single();

    setCreatingGroup(false);

    if (error) {
      console.error('[ChatAdmin] eng_chat_groups insert error:', JSON.stringify(error, null, 2));
      toast.error(`فشل إنشاء المجموعة: ${error.message}`);
      return;
    }

    console.log('[ChatAdmin] Group created:', data);
    toast.success('تم إنشاء المجموعة');
    setGroupName(''); setGroupCategory(''); setGroupGender('both');
    setShowCreateGroup(false);
    await refresh();
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الرسائل والطلبات.')) return;

    setProcessing('del_' + id);

    // Delete messages and requests first
    await (supabase as any).from('eng_chat_messages').delete().eq('group_id', id);
    await (supabase as any).from('eng_chat_requests').delete().eq('group_id', id);
    const { error } = await (supabase as any).from('eng_chat_groups').delete().eq('id', id);

    setProcessing(null);

    if (error) { toast.error('فشل حذف المجموعة'); return; }
    toast.success('تم حذف المجموعة');
    await refresh();
  };

  if (loading) return <Spinner />;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const otherRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة الدردشة</h2>
        <p className="m-0 mt-0.5 text-[#6b7280] text-[13px]">مراجعة طلبات الانضمام وإدارة المجموعات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'طلبات معلقة', value: pendingRequests.length, color: '#f59e0b' },
          { label: 'إجمالي الطلبات', value: requests.length, color: B },
          { label: 'المجموعات', value: groups.length, color: '#3b82f6' },
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
          { id: 'requests', label: 'طلبات الانضمام' },
          { id: 'groups', label: 'المجموعات' },
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

      {/* ── Requests Tab ─────────────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="font-bold text-[#111] mb-2 text-sm">طلبات معلقة ({pendingRequests.length})</h3>
              <div className="space-y-2">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0f0f0] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#111]">{req.profiles?.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-[#6b7280]">المجموعة: {(req as any).eng_chat_groups?.name || req.group_id}</p>
                      <p className="text-xs text-[#9ca3af] mt-0.5">{new Date(req.created_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={processing === req.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                        style={{ background: '#10b981', border: 'none', cursor: 'pointer', opacity: processing === req.id ? 0.6 : 1 }}
                      >
                        {processing === req.id ? '...' : 'قبول'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={processing === req.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                        style={{ background: '#ef4444', border: 'none', cursor: 'pointer', opacity: processing === req.id ? 0.6 : 1 }}
                      >
                        {processing === req.id ? '...' : 'رفض'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherRequests.length > 0 && (
            <div>
              <h3 className="font-bold text-[#111] mb-2 text-sm">سجل الطلبات</h3>
              <div className="space-y-2">
                {otherRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0f0f0] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#111]">{req.profiles?.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-[#6b7280]">المجموعة: {(req as any).eng_chat_groups?.name || req.group_id}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${statusColors[req.status]}20`, color: statusColors[req.status] }}
                    >
                      {statusLabels[req.status] || req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="text-center py-12 text-[#9ca3af]">
              <div className="text-4xl mb-3">💬</div>
              <p>لا توجد طلبات بعد</p>
            </div>
          )}
        </div>
      )}

      {/* ── Groups Tab ────────────────────────────────────────────────────────── */}
      {tab === 'groups' && (
        <div className="space-y-4">
          {/* Create Group Button */}
          {!showCreateGroup ? (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="w-full py-3 rounded-2xl text-sm font-bold border-2 border-dashed transition"
              style={{ borderColor: B, color: B, background: `${B}08`, cursor: 'pointer' }}
            >
              ＋ إنشاء مجموعة جديدة
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] space-y-3">
              <h3 className="font-bold text-[#111] text-sm m-0">إنشاء مجموعة</h3>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">اسم المجموعة *</label>
                <input
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="مثال: مجموعة الطلاب اليمنيين"
                  className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B1A2A]"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">الوصف / التصنيف (اختياري)</label>
                <input
                  value={groupCategory}
                  onChange={e => setGroupCategory(e.target.value)}
                  placeholder="مثال: دراسة، ترفيه، دعم..."
                  className="w-full rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B1A2A]"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">للجنس</label>
                <div className="flex gap-2">
                  {[
                    { val: 'male', label: '👨 ذكور فقط' },
                    { val: 'female', label: '👩 إناث فقط' },
                    { val: 'both', label: '👥 الكل' },
                  ].map(g => (
                    <button
                      key={g.val}
                      onClick={() => setGroupGender(g.val as any)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition"
                      style={{
                        background: groupGender === g.val ? B : '#f1f5f9',
                        color: groupGender === g.val ? '#fff' : '#6b7280',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreateGroup}
                  disabled={creatingGroup}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: B, border: 'none', cursor: creatingGroup ? 'default' : 'pointer' }}
                >
                  {creatingGroup ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
                </button>
                <button
                  onClick={() => { setShowCreateGroup(false); setGroupName(''); setGroupCategory(''); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#6b7280]"
                  style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Groups List */}
          {groups.length === 0 ? (
            <div className="text-center py-12 text-[#9ca3af]">
              <div className="text-4xl mb-3">👥</div>
              <p>لا توجد مجموعات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map(group => {
                const memberCount = requests.filter(r => r.group_id === group.id && r.status === 'approved').length;
                const isDeleting = processing === 'del_' + group.id;
                return (
                  <div key={group.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0f0f0]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#111]">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-[#6b7280] mt-0.5">{group.description}</p>
                        )}
                        <p className="text-xs text-[#9ca3af] mt-1">
                          {group.gender === 'male' ? '👨 ذكور' : group.gender === 'female' ? '👩 إناث' : '👥 الكل'}
                          {' · '}
                          {memberCount} عضو
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        disabled={isDeleting}
                        className="text-xs font-bold text-white px-3 py-1.5 rounded-xl"
                        style={{ background: '#ef4444', border: 'none', cursor: isDeleting ? 'default' : 'pointer', opacity: isDeleting ? 0.6 : 1 }}
                      >
                        {isDeleting ? '...' : '🗑 حذف'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
