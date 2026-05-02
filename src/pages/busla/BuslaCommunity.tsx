'use client';

import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Send, Loader2, Lock, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#8B1A2A';

// Helper to get initials for the avatar
const getInitial = (name?: string) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

export default function BuslaCommunity() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check access based on track_members
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('track_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .limit(1);

      if (error || !data || data.length === 0) {
        console.log("BuslaCommunity: Access Denied (No approved membership found)");
        setHasAccess(false);
      } else {
        console.log("BuslaCommunity: Access Granted (Approved membership found)");
        setHasAccess(true);
      }
      setLoading(false);
    };
    checkAccess();
  }, [user]);

  // Fetch messages if has access
  useEffect(() => {
    if (!hasAccess) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('busla_chat_messages')
        .select('*, profiles:user_id(full_name)')
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('busla_community_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'busla_chat_messages' },
        (payload) => {
          // Fetch the profile for the new message
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single()
            .then(({ data }) => {
              setMessages(prev => {
                // CRITICAL FIX: Check if the message is already on the screen!
                if (prev.some(m => m.id === payload.new.id)) {
                  return prev; // Do nothing if it's already there
                }
                return [...prev, { ...payload.new, profiles: data }];
              });
            });
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'busla_chat_messages' },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [hasAccess]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !messageText.trim()) return;

    // Save the text temporarily and clear the input instantly for a fast UI feel
    const tempText = messageText.trim();
    setMessageText('');
    setSending(true);

    // Insert AND return the new message with the profile data
    const { data, error } = await supabase
      .from('busla_chat_messages')
      .insert({ user_id: user.id, content: tempText })
      .select('*, profiles:user_id(full_name)')
      .single(); // .single() returns the exact row we just created

    setSending(false);

    if (error) {
      toast.error('فشل إرسال الرسالة');
      setMessageText(tempText); // Put the text back if it failed
    } else if (data) {
      // Instantly add it to the chat screen
      setMessages((prev) => {
        // Double check it's not already there to prevent glitches
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50" dir="rtl">
      <div className="shrink-0 bg-white shadow-sm z-10 relative">
        <PageHeader title="مجتمع بوصلة" showBack />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: ACCENT }} />
          <p className="text-slate-500 font-medium animate-pulse">جاري تحميل المجتمع...</p>
        </div>
      )}

      {!loading && hasAccess === false && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 bg-slate-50/50">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ background: ACCENT }} />
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">خاص بالأعضاء</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              يجب الانضمام إلى أحد المدارات للوصول إلى مجتمع بوصلة
            </p>
            <button
              onClick={() => navigate('/busla/tracks')}
              className="w-full py-3.5 rounded-2xl text-white font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              style={{ background: ACCENT }}
            >
              تصفح المدارات المتاحة
            </button>
          </div>
          <BottomNav />
        </div>
      )}

      {!loading && hasAccess === true && (
        <div className="flex flex-col flex-1 overflow-hidden max-w-2xl mx-auto w-full bg-slate-50">

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">لا توجد رسائل بعد.</p>
                <p className="text-slate-400 text-sm mt-1">كن أول من يبدأ المحادثة في المجتمع!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.user_id === user?.id;
                const authorName = msg.profiles?.full_name || 'مستخدم';

                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>

                    {/* Avatar for others */}
                    {!isMe && (
                      <div className="shrink-0 w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm">
                        {getInitial(authorName)}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-[11px] font-semibold text-slate-500 mb-1 px-1">
                          {authorName}
                        </span>
                      )}

                      <div
                        className="px-4 py-2.5 text-[15px] leading-relaxed shadow-sm break-words relative group"
                        style={{
                          background: isMe ? ACCENT : '#ffffff',
                          color: isMe ? '#ffffff' : '#1e293b',
                          border: isMe ? 'none' : '1px solid #e2e8f0',
                          borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        }}
                      >
                        {msg.content}
                      </div>

                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                        {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3 pb-safe">
            <div className="flex items-end gap-2 bg-slate-50 rounded-3xl p-1.5 border border-slate-200 focus-within:border-slate-300 focus-within:bg-white transition-colors shadow-sm">
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="شارك أفكارك مع المجتمع..."
                className="flex-1 bg-transparent max-h-32 min-h-[44px] resize-none px-4 py-3 text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={sending || !messageText.trim()}
                className="w-11 h-11 shrink-0 rounded-full text-white flex items-center justify-center disabled:opacity-50 disabled:scale-95 transition-all mb-0.5 ml-0.5 shadow-md"
                style={{ background: ACCENT }}
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}