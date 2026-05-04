// src/service/chatCMS.ts
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/integrations/supabase/types';

/**
 * جلب الرسائل السابقة لطلب معين
 */
export async function fetchMessages(requestId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
    return (data ?? []) as ChatMessage[];
}

/**
 * إرسال رسالة جديدة
 */
export async function sendMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
        .from('chat_messages')
        .insert([message]);

    if (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * الاستماع للرسائل الجديدة (Real-time)
 * يُرجع دالة إلغاء الاشتراك لاستخدامها في useEffect cleanup
 */
export function subscribeToMessages(
    requestId: string,
    onNewMessage: (msg: ChatMessage) => void
): () => void {
    const subscription = supabase
        .channel(`chat_${requestId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `request_id=eq.${requestId}`,
            },
            (payload) => {
                onNewMessage(payload.new as ChatMessage);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
}