import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, BookOpen, Lightbulb, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AILearningAssistantProps {
  courseTitle?: string;
  currentLesson?: string;
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { icon: BookOpen, label: 'اشرح المفهوم', prompt: 'اشرح لي هذا المفهوم بطريقة مبسطة' },
  { icon: Lightbulb, label: 'أمثلة عملية', prompt: 'أعطني أمثلة عملية على هذا الموضوع' },
  { icon: HelpCircle, label: 'أسئلة للمراجعة', prompt: 'اعطني أسئلة للمراجعة' },
];

export const AILearningAssistant = ({ 
  courseTitle, 
  currentLesson, 
  isOpen, 
  onClose 
}: AILearningAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `مرحباً! أنا مساعدك الذكي في الأكاديمية 🎓\n\nأنا هنا لمساعدتك في فهم ${courseTitle || 'المحتوى التعليمي'}. يمكنني:\n• شرح المفاهيم الصعبة\n• إعطاء أمثلة عملية\n• الإجابة على أسئلتك\n• اقتراح تمارين للممارسة\n\nكيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulated AI responses based on context
    const responses = [
      `بناءً على سؤالك حول "${userMessage.slice(0, 30)}..."، دعني أشرح لك:\n\nهذا الموضوع يتعلق بأساسيات مهمة في ${courseTitle || 'هذا المجال'}. الفكرة الرئيسية هي فهم الأسس النظرية أولاً ثم تطبيقها عملياً.\n\n💡 نصيحة: حاول ربط المفاهيم الجديدة بما تعرفه مسبقاً.`,
      `سؤال ممتاز! ${currentLesson ? `في درس "${currentLesson}"` : 'في هذا الموضوع'}، نتعلم كيفية:\n\n1. فهم الأساسيات\n2. التطبيق العملي\n3. حل المشكلات\n\nهل تريد أن أعطيك تمريناً عملياً؟`,
      `أفهم ما تسأل عنه. دعني أوضح لك بطريقة مبسطة:\n\n📚 المفهوم الأساسي:\nفكر في الأمر كأنك تبني منزلاً - تحتاج أساساً قوياً أولاً.\n\n✨ التطبيق:\nعندما تفهم الأساس، يمكنك البناء عليه بسهولة.\n\nهل هذا واضح؟`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full sm:max-w-lg h-[85vh] sm:h-[600px] flex flex-col animate-slide-up rounded-t-2xl sm:rounded-2xl">
        <CardHeader className="border-b flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">مساعد التعلم الذكي</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  مدعوم بالذكاء الاصطناعي
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {courseTitle && (
            <Badge variant="secondary" className="w-fit mt-2">
              {courseTitle}
            </Badge>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-[10px] opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4 flex-shrink-0 space-y-3">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="h-3 w-3 ml-1" />
                {action.label}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
