import { useState } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Lightbulb, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type SuggestionType = 'suggestion' | 'problem' | 'idea';

const suggestionTypes = [
  { type: 'suggestion' as SuggestionType, label: 'اقتراح', icon: MessageSquare, color: 'bg-primary/10 text-primary border-primary/20' },
  { type: 'problem' as SuggestionType, label: 'مشكلة', icon: AlertCircle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  { type: 'idea' as SuggestionType, label: 'فكرة', icon: Lightbulb, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
];

const Suggestions = () => {
  const [selectedType, setSelectedType] = useState<SuggestionType>('suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error('يرجى كتابة رسالتك');
      return;
    }
    
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      setSelectedType('suggestion');
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="ماذا تريد من الاتحاد؟" showBack />
        
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">شكراً لك!</h2>
          <p className="text-muted-foreground text-center max-w-xs">
            تم استلام رسالتك بنجاح. سنقوم بمراجعتها والرد عليك في أقرب وقت.
          </p>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="ماذا تريد من الاتحاد؟" showBack />
      
      <div className="px-4 py-6 space-y-6">
        <p className="text-muted-foreground text-center">
          صوتك مهم لنا! شاركنا أفكارك ومقترحاتك لتطوير خدماتنا.
        </p>
        
        {/* Type Selection */}
        <div className="grid grid-cols-3 gap-3">
          {suggestionTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedType === item.type 
                  ? item.color + ' border-current' 
                  : 'bg-card border-border hover:border-muted-foreground/30'
              }`}
            >
              <item.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* Message Input */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] resize-none border-0 focus-visible:ring-0 text-base"
            />
          </CardContent>
        </Card>
        
        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          className="w-full h-14 text-lg rounded-2xl gap-2"
        >
          <Send className="w-5 h-5" />
          إرسال
        </Button>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Suggestions;
