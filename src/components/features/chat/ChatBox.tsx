// src/components/features/chat/ChatBox.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '@/integrations/supabase/types';
import { fetchMessages, sendMessage, subscribeToMessages } from '@/service/chatCMS';

interface ChatBoxProps {
    requestId: string;
    currentUserRole: 'student' | 'admin' | 'volunteer';
    currentUserId: string;
    lang?: 'ar' | 'en' | 'tr';
}

export default function ChatBox({ requestId, currentUserRole, currentUserId, lang = 'ar' }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isRTL = lang === 'ar';

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Initial fetch + real-time subscription
    useEffect(() => {
        if (!requestId) return;

        fetchMessages(requestId)
            .then(data => setMessages(data))
            .catch(err => console.error('Failed to fetch messages:', err));

        const unsubscribe = subscribeToMessages(requestId, (msg) => {
            // Avoid duplicates from our own optimistic update
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        });

        return unsubscribe;
    }, [requestId]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic UI update
        const optimistic: ChatMessage = {
            id: `temp_${Date.now()}`,
            request_id: requestId,
            sender_id: currentUserId,
            sender_role: currentUserRole,
            content,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            await sendMessage({ request_id: requestId, sender_id: currentUserId, sender_role: currentUserRole, content });
        } catch (err) {
            console.error('Failed to send message:', err);
            // Roll back optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
            setNewMessage(content);
        } finally {
            setSending(false);
        }
    };

    const getSenderLabel = (role: string) => {
        if (role === 'admin') return 'الإدارة';
        if (role === 'volunteer') return 'فريق الاستقبال';
        return 'الطالب';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-1, #0d0f14)', direction: isRTL ? 'rtl' : 'ltr' }}>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2,#a1a1aa)', fontSize: '0.9rem' }}>
                        لا توجد رسائل بعد. ابدأ المحادثة!
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-start' : 'flex-end' }}>
                            {!isMe && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-2, #a1a1aa)', marginBottom: '4px', padding: '0 4px' }}>
                                    {getSenderLabel(msg.sender_role)}
                                </span>
                            )}
                            <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '16px', borderBottomRightRadius: isMe && isRTL ? '4px' : '16px', borderBottomLeftRadius: isMe && !isRTL ? '4px' : '16px', background: isMe ? '#1d4ed8' : 'var(--bg-2, #14171f)', color: '#fff', fontSize: '0.95rem', lineHeight: '1.5', border: isMe ? 'none' : '1px solid var(--border, #2a2e3d)', opacity: msg.id.startsWith('temp_') ? 0.7 : 1 }}>
                                {msg.content}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-2, #a1a1aa)', marginTop: '4px' }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{ padding: '16px', background: 'var(--bg-2, #14171f)', borderTop: '1px solid var(--border, #2a2e3d)', display: 'flex', gap: '12px' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Type a message...'}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border, #2a2e3d)', color: '#fff', outline: 'none' }}
                />
                <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#1d4ed8', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: sending ? 0.6 : 1 }}
                >
                    <Send size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                </button>
            </div>
        </div>
    );
}