import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MessageCircle, Send, Loader2, Users, Lock, Clock } from 'lucide-react';

const ACCENT = '#8B1A2A';

export default function Chat() {
  const { user } = useAuth();
  const {
    groups, approvedGroupIds, pendingGroupIds,
    selectedGroupId, setSelectedGroupId,
    messages, loading, messagesLoading,
    error, requestJoin, sendMessage,
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = async (groupId: string) => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    setJoiningId(groupId);
    const res = await requestJoin(groupId);
    setJoiningId(null);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    const res = await sendMessage(messageText);
    setSending(false);
    if (res.ok) setMessageText('');
    else toast.error(res.message);
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const isApproved = selectedGroupId ? approvedGroupIds.has(selectedGroupId) : false;

  return (
    <div className="min-h-screen bg-background pb-0 flex flex-col" dir="rtl">
      <PageHeader title="الدردشة" showBack />

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12 text-red-500 px-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="flex flex-col flex-1 overflow-hidden max-w-lg mx-auto w-full">

          {/* Groups List */}
          {!selectedGroupId && (
            <div className="px-4 pt-4 pb-24 space-y-3">
              {groups.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-500">لا توجد مجموعات متاحة</p>
                  <p className="text-sm text-gray-400 mt-1">سيتم إضافة مجموعات قريباً</p>
                </div>
              ) : (
                groups.map(group => {
                  const approved = approvedGroupIds.has(group.id);
                  const pending = pendingGroupIds.has(group.id);
                  return (
                    <div key={group.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800">{group.name}</h3>
                          {group.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                          )}
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          {approved ? (
                            <button
                              onClick={() => setSelectedGroupId(group.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold"
                              style={{ background: ACCENT }}
                            >
                              <MessageCircle className="h-4 w-4" />
                              فتح
                            </button>
                          ) : pending ? (
                            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700">
                              <Clock className="h-3.5 w-3.5" />
                              قيد الانتظار
                            </span>
                          ) : (
                            <button
                              onClick={() => handleJoin(group.id)}
                              disabled={joiningId === group.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                              style={{ background: '#059669' }}
                            >
                              {joiningId === group.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Users className="h-4 w-4" />}
                              انضمام
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Chat View */}
          {selectedGroupId && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Group Header */}
              <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setSelectedGroupId(null)} className="text-gray-500 text-sm font-semibold">
                  ← رجوع
                </button>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{selectedGroup?.name}</p>
                </div>
              </div>

              {/* Access Denied */}
              {!isApproved && (
                <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
                  <Lock className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="font-bold text-gray-600">غير مسموح بالوصول</p>
                  <p className="text-sm text-gray-400 mt-1">يجب أن يتم قبول طلبك أولاً لعرض الرسائل</p>
                </div>
              )}

              {/* Messages Area */}
              {isApproved && (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ paddingBottom: 80 }}>
                    {messagesLoading && messages.length === 0 && (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!messagesLoading && messages.length === 0 && (
                      <div className="text-center py-12 text-gray-400 text-sm">
                        لا توجد رسائل بعد. ابدأ المحادثة!
                      </div>
                    )}
                    {messages.map(msg => {
                      const isMe = msg.user_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                          <div className="max-w-[75%]">
                            {!isMe && (
                              <p className="text-xs text-gray-400 mb-1 px-1">{msg.profiles?.full_name || 'مستخدم'}</p>
                            )}
                            <div
                              className="rounded-2xl px-4 py-2 text-sm"
                              style={{
                                background: isMe ? `${ACCENT}15` : ACCENT,
                                color: isMe ? '#1f2937' : 'white',
                                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              }}
                            >
                              {msg.content}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 px-1">
                              {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send Bar */}
                  <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-2">
                      <input
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="اكتب رسالة..."
                        className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-red-300"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !messageText.trim()}
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center disabled:opacity-50 shrink-0"
                        style={{ background: ACCENT }}
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedGroupId && <BottomNav />}
    </div>
  );
}
