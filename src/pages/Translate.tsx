import { useState } from 'react';
import { ArrowLeftRight, Copy, Volume2, Languages, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { toast } from 'sonner';

type Language = 'ar' | 'tr' | 'en';

const languages: Record<Language, { name: string; flag: string; dir: 'rtl' | 'ltr' }> = {
  ar: { name: 'العربية', flag: '🇾🇪', dir: 'rtl' },
  tr: { name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
};

// Common phrases for quick translation
const commonPhrases = [
  { ar: 'مرحباً', tr: 'Merhaba', en: 'Hello' },
  { ar: 'شكراً', tr: 'Teşekkürler', en: 'Thank you' },
  { ar: 'من فضلك', tr: 'Lütfen', en: 'Please' },
  { ar: 'نعم', tr: 'Evet', en: 'Yes' },
  { ar: 'لا', tr: 'Hayır', en: 'No' },
  { ar: 'كيف حالك؟', tr: 'Nasılsın?', en: 'How are you?' },
  { ar: 'أنا بخير', tr: 'İyiyim', en: "I'm fine" },
  { ar: 'ما اسمك؟', tr: 'Adın ne?', en: 'What is your name?' },
  { ar: 'أين الجامعة؟', tr: 'Üniversite nerede?', en: 'Where is the university?' },
  { ar: 'كم الساعة؟', tr: 'Saat kaç?', en: 'What time is it?' },
  { ar: 'أحتاج مساعدة', tr: 'Yardıma ihtiyacım var', en: 'I need help' },
  { ar: 'لا أفهم', tr: 'Anlamıyorum', en: "I don't understand" },
];

const Translate = () => {
  const [fromLang, setFromLang] = useState<Language>('tr');
  const [toLang, setToLang] = useState<Language>('ar');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    
    // Simulate translation (in production, this would call an API)
    setTimeout(() => {
      // Simple mock translation - find matching phrase or show placeholder
      const phrase = commonPhrases.find(p => 
        p[fromLang].toLowerCase() === inputText.toLowerCase().trim()
      );
      
      if (phrase) {
        setOutputText(phrase[toLang]);
      } else {
        // Mock response for demo
        setOutputText(`[ترجمة: ${inputText}]`);
        toast.info('للترجمة الفعلية، يلزم تفعيل Lovable Cloud');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast.success('تم النسخ');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectLanguage = (lang: Language, type: 'from' | 'to') => {
    if (type === 'from') {
      if (lang === toLang) {
        swapLanguages();
      } else {
        setFromLang(lang);
      }
    } else {
      if (lang === fromLang) {
        swapLanguages();
      } else {
        setToLang(lang);
      }
    }
  };

  const usePhrase = (phrase: typeof commonPhrases[0]) => {
    setInputText(phrase[fromLang]);
    setOutputText(phrase[toLang]);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الترجمة الفورية" showBack />
      
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Language Selector */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* From Language */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2 text-center">من</p>
                <div className="flex justify-center gap-2">
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={`from-${lang}`}
                      onClick={() => selectLanguage(lang, 'from')}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        fromLang === lang 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <span className="text-lg">{languages[lang].flag}</span>
                      <span className="text-xs font-medium">{languages[lang].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={swapLanguages}
                className="mx-3 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </button>

              {/* To Language */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2 text-center">إلى</p>
                <div className="flex justify-center gap-2">
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={`to-${lang}`}
                      onClick={() => selectLanguage(lang, 'to')}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        toLang === lang 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <span className="text-lg">{languages[lang].flag}</span>
                      <span className="text-xs font-medium">{languages[lang].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{languages[fromLang].flag}</span>
              <span className="text-sm font-medium">{languages[fromLang].name}</span>
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب النص هنا..."
              className="min-h-32 resize-none text-lg"
              dir={languages[fromLang].dir}
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleTranslate} disabled={!inputText.trim() || isLoading}>
                <Languages className="w-4 h-4 ml-2" />
                {isLoading ? 'جاري الترجمة...' : 'ترجم'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-0 shadow-soft bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{languages[toLang].flag}</span>
                <span className="text-sm font-medium">{languages[toLang].name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="p-2 rounded-lg bg-background hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div 
              className="min-h-32 p-3 bg-background rounded-lg text-lg"
              dir={languages[toLang].dir}
            >
              {outputText || <span className="text-muted-foreground">الترجمة ستظهر هنا...</span>}
            </div>
          </CardContent>
        </Card>

        {/* Common Phrases */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">عبارات شائعة</h3>
          <div className="grid grid-cols-2 gap-2">
            {commonPhrases.slice(0, 8).map((phrase, index) => (
              <Card 
                key={index}
                className="border-0 shadow-soft cursor-pointer hover:shadow-card transition-all"
                onClick={() => usePhrase(phrase)}
              >
                <CardContent className="p-3">
                  <p className="font-medium text-foreground text-sm">{phrase.ar}</p>
                  <p className="text-xs text-muted-foreground">{phrase.tr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Translate;
