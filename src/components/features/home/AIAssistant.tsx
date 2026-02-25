/*import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserType = 'new' | 'volunteer' | 'jobseeker' | 'student';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const userTypeLabels: Record<UserType, string> = {
  new: 'طالب جديد',
  volunteer: 'متطوع',
  jobseeker: 'باحث عن عمل',
  student: 'طالب نشط',
};

const userTypeGreetings: Record<UserType, string> = {
  new: 'أهلاً بك في عائلة الاتحاد! 🎉\n\nأنا المساعد الذكي، سعيد بانضمامك. دعني أساعدك في:\n• التعرف على خدمات الاتحاد\n• التسجيل في الأكاديمية\n• الانضمام للأنشطة\n\nما الذي تود معرفته؟',
  volunteer: 'أهلاً بك يا بطل! 💪\n\nشكراً لعطائك في خدمة الطلاب. يمكنني مساعدتك في:\n• فرص التطوع الجديدة\n• تتبع ساعات التطوع\n• الترقية للمستوى التالي\n\nكيف أساعدك اليوم؟',
  jobseeker: 'أهلاً بك! 🎯\n\nأعلم أنك تبحث عن فرصة عمل. دعني أساعدك:\n• الفرص الوظيفية المتاحة\n• تحسين السيرة الذاتية\n• دورات تطوير المهارات\n\nما الذي تحتاجه؟',
  student: 'أهلاً بك مجدداً! ⭐\n\nسعيد برؤيتك. يمكنني مساعدتك في:\n• الدورات والشهادات\n• الأنشطة القادمة\n• تتبع نقاطك وإنجازاتك\n\nكيف أخدمك؟',
};

const quickReplies: Record<UserType, { label: string; query: string }[]> = {
  new: [
    { label: 'كيف أبدأ؟', query: 'أنا طالب جديد، كيف أبدأ في الاتحاد؟' },
    { label: 'الدورات المتاحة', query: 'ما هي الدورات المناسبة للمبتدئين؟' },
    { label: 'امتحان YÖS', query: 'ما هو امتحان YÖS وكيف أستعد له؟' },
  ],
  volunteer: [
    { label: 'فرص التطوع', query: 'ما هي فرص التطوع المتاحة حالياً؟' },
    { label: 'ساعات التطوع', query: 'كيف أحسب ساعات التطوع؟' },
    { label: 'شهادة التطوع', query: 'كيف أحصل على شهادة تطوع؟' },
  ],
  jobseeker: [
    { label: 'الوظائف', query: 'ما هي الوظائف المتاحة للطلاب في تركيا؟' },
    { label: 'تحسين CV', query: 'كيف أحسن سيرتي الذاتية؟' },
    { label: 'مقابلات العمل', query: 'كيف أستعد لمقابلة العمل؟' },
  ],
  student: [
    { label: 'الدورات', query: 'ما الدورات التي تنصحني بها؟' },
    { label: 'نظام النقاط', query: 'كيف يعمل نظام النقاط؟' },
    { label: 'الإقامة', query: 'كيف أجدد إقامتي الطلابية؟' },
  ],
};

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedType = localStorage.getItem('userType') as UserType | null;
    if (savedType) {
      setUserType(savedType);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: userTypeGreetings[savedType],
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();

    try {
      // Filter to only user and assistant messages for API
      const apiMessages = updatedMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل الاتصال بالمساعد الذكي');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add empty assistant message to update
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch { /* ignore  }
        }
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في الاتصال');
      
      // Fallback response
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى. 🙏',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (query: string) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="fixed inset-x-0 bottom-0 top-0 md:inset-4 md:top-auto md:bottom-4 md:right-4 md:left-auto md:w-96 md:h-[600px] bg-background rounded-t-2xl md:rounded-2xl shadow-elevated border flex flex-col">
        {/* Header }
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">المساعد الذكي</h3>
              <p className="text-xs text-primary-foreground/70">مدعوم بالذكاء الاصطناعي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages }
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-secondary rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Replies }
        {messages.length <= 2 && userType && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickReplies[userType].map((reply) => (
                <button
                  key={reply.label}
                  onClick={() => handleQuickReply(reply.query)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* User Type Selection }
        {!userType && messages.length === 0 && (
          <div className="px-4 pb-2">
            <p className="text-sm text-muted-foreground mb-2 text-center">اختر نوعك لتجربة مخصصة:</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(userTypeLabels) as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setUserType(type);
                    localStorage.setItem('userType', type);
                    setMessages([{
                      id: '1',
                      role: 'assistant',
                      content: userTypeGreetings[type],
                    }]);
                  }}
                  className="text-sm px-3 py-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {userTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input }
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

*/
