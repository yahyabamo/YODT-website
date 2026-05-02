'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { Loader2, Trash2, Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ACCENT = '#8B1A2A';

export default function BuslaCommunityAdmin() {
  useRoleGuard(['busla']); // Protect this page

  const [activeTab, setActiveTab] = useState<'messages' | 'members'>('messages');

  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('busla_chat_messages')
      .select('*, profiles:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setMessages(data);
    }
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('track_members')
      .select('id, user_id, profiles(full_name), tracks(title)')
      .eq('status', 'approved');

    if (!error && data) {
      // Group by user
      const userMap = new Map();
      data.forEach((row: any) => {
        if (!userMap.has(row.user_id)) {
          userMap.set(row.user_id, {
            user_id: row.user_id,
            full_name: row.profiles?.full_name || 'غير معروف',
            tracks: []
          });
        }
        userMap.get(row.user_id).tracks.push(row.tracks?.title);
      });
      setMembers(Array.from(userMap.values()));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchMembers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    setProcessingId(id);
    const { error } = await supabase.from('busla_chat_messages').delete().eq('id', id);
    setProcessingId(null);

    if (error) {
      toast.error('فشل حذف الرسالة');
    } else {
      toast.success('تم الحذف بنجاح');
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من إزالة هذا العضو من مجتمع بوصلة؟ سيتم إزالته من جميع المدارات الحالية.')) return;
    setProcessingId(userId);

    const { error } = await supabase.from('track_members').delete().eq('user_id', userId);
    setProcessingId(null);

    if (error) {
      toast.error('فشل إزالة العضو');
    } else {
      toast.success('تمت إزالة العضو بنجاح');
      setMembers(members.filter(m => m.user_id !== userId));
      // Optionally reload messages to reflect any missing user references if needed
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" dir="rtl">
      <div className="shrink-0 bg-white shadow-sm z-10 relative">
        <button
          onClick={() => navigate('/admin/busla')}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold mb-4"
        >
          <ChevronRight size={18} /> العودة للقائمة
        </button>
        <PageHeader title="إدارة مجتمع بوصلة" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'messages'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            <MessageCircle className="h-4 w-4" />
            الرسائل
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'members'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            <Users className="h-4 w-4" />
            الأعضاء
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'messages' && (
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-500 py-12">لا توجد رسائل</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-slate-800 text-sm">
                            {msg.profiles?.full_name || 'مستخدم غير معروف'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_at).toLocaleString('ar-EG')}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={processingId === msg.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="حذف الرسالة"
                      >
                        {processingId === msg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-3">
                {members.length === 0 ? (
                  <p className="text-center text-slate-500 py-12">لا يوجد أعضاء في المجتمع</p>
                ) : (
                  members.map(member => (
                    <div key={member.user_id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm mb-1">{member.full_name}</p>
                        <div className="flex flex-wrap gap-1">
                          {member.tracks.map((t: string, idx: number) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md border border-blue-100">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={processingId === member.user_id}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {processingId === member.user_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        إزالة وطرد من المجتمع
                      </button> */}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}