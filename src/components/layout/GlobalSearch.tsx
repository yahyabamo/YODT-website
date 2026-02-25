import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, GraduationCap, Stethoscope, Briefcase, Calendar,
  Users, BookOpen, MapPin, Heart, Radio, FileText, ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Global Search - البحث في جميع أقسام التطبيق
 * يبحث في: الدورات، الأطباء، الوظائف، الفعاليات، الداعمين، الأخبار...
 */

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

// بيانات البحث الموحدة
const searchableContent: SearchResult[] = [
  // الجامعة والأكاديمية
  /*{ id: 'uni-1', title: 'جامعة الاتحاد', description: 'دورات ومسارات تعليمية', category: 'الجامعة', icon: GraduationCap, path: '/university', color: 'text-primary' },
  { id: 'uni-2', title: 'الأكاديمية', description: 'دورات عملية وتدريبية', category: 'الجامعة', icon: GraduationCap, path: '/academy', color: 'text-primary' },
  { id: 'uni-3', title: 'الشهادات', description: 'شهاداتك المكتسبة', category: 'الجامعة', icon: FileText, path: '/certificates', color: 'text-primary' },
  { id: 'uni-4', title: 'دورة LinkedIn', description: 'احترف LinkedIn للتوظيف', category: 'الجامعة', icon: GraduationCap, path: '/university', color: 'text-primary' },
  { id: 'uni-5', title: 'دورة Canva', description: 'تعلم التصميم بـ Canva', category: 'الجامعة', icon: GraduationCap, path: '/university', color: 'text-primary' },
  { id: 'uni-6', title: 'كتابة السيرة الذاتية', description: 'CV احترافي', category: 'الجامعة', icon: GraduationCap, path: '/university', color: 'text-primary' },
  
  // المستشفى
  { id: 'med-1', title: 'المستشفى الطلابي', description: 'استشارات طبية مجانية', category: 'المستشفى', icon: Stethoscope, path: '/medical-hub', color: 'text-accent' },
  { id: 'med-2', title: 'دليل الأطباء', description: 'ابحث عن طبيب', category: 'المستشفى', icon: Stethoscope, path: '/doctors-directory', color: 'text-accent' },
  { id: 'med-3', title: 'طب عام', description: 'استشارات الطب العام', category: 'المستشفى', icon: Stethoscope, path: '/medical-hub', color: 'text-accent' },
  { id: 'med-4', title: 'طب أسنان', description: 'استشارات طب الأسنان', category: 'المستشفى', icon: Stethoscope, path: '/medical-hub', color: 'text-accent' },
  { id: 'med-5', title: 'طب نفسي', description: 'استشارات نفسية', category: 'المستشفى', icon: Stethoscope, path: '/medical-hub', color: 'text-accent' },
  { id: 'med-6', title: 'المؤتمرات الطبية', description: 'ندوات ومؤتمرات', category: 'المستشفى', icon: Stethoscope, path: '/medical-congress', color: 'text-accent' },
  */
  // القرآن
  { id: 'quran-1', title: 'القرآن والحياة', description: 'تحفيظ وأذكار', category: 'القرآن', icon: BookOpen, path: '/quran-life', color: 'text-emerald-600' },
  { id: 'quran-2', title: 'مواقيت الصلاة', description: 'أوقات الصلاة حسب مدينتك', category: 'القرآن', icon: BookOpen, path: '/quran-life', color: 'text-emerald-600' },
  { id: 'quran-3', title: 'الأذكار', description: 'أذكار الصباح والمساء', category: 'القرآن', icon: BookOpen, path: '/quran-life', color: 'text-emerald-600' },
  { id: 'quran-4', title: 'التسبيح', description: 'مسبحة رقمية', category: 'القرآن', icon: BookOpen, path: '/quran-life', color: 'text-emerald-600' },

  // الإعلام
  /* { id: 'media-1', title: 'المدار الإعلامي', description: 'أخبار ومحتوى', category: 'الإعلام', icon: Radio, path: '/orbit', color: 'text-warning' },
  { id: 'media-2', title: 'الأخبار', description: 'آخر الأخبار', category: 'الإعلام', icon: Radio, path: '/news', color: 'text-warning' },
  { id: 'media-3', title: 'المحتوى البصري', description: 'فيديوهات وريلز', category: 'الإعلام', icon: Radio, path: '/visual-content', color: 'text-warning' },
  { id: 'media-4', title: 'ريلز اليمن', description: 'محتوى يمني', category: 'الإعلام', icon: Radio, path: '/yemen-reels', color: 'text-warning' }, */

  // الوظائف والتطوع
  { id: 'job-1', title: 'الوظائف', description: 'فرص عمل متاحة', category: 'الفرص', icon: Briefcase, path: '/jobs', color: 'text-violet-500' },
  { id: 'job-2', title: 'التطوع', description: 'فرص تطوعية', category: 'الفرص', icon: Users, path: '/volunteers', color: 'text-violet-500' },

  // الفعاليات
  { id: 'event-1', title: 'الفعاليات', description: 'أنشطة وفعاليات', category: 'الفعاليات', icon: Calendar, path: '/events', color: 'text-orange-500' },
  { id: 'event-2', title: 'الأنشطة', description: 'الأنشطة الطلابية', category: 'الفعاليات', icon: Calendar, path: '/activities', color: 'text-orange-500' },

  // الخدمات
  { id: 'srv-1', title: 'خريطة إسطنبول', description: 'خريطة تفاعلية', category: 'الخدمات', icon: MapPin, path: '/map', color: 'text-blue-500' },
  { id: 'srv-2', title: 'الترجمة', description: 'ترجمة النصوص', category: 'الخدمات', icon: FileText, path: '/translate', color: 'text-blue-500' },
  { id: 'srv-3', title: 'تطبيقات تركيا', description: 'تطبيقات مفيدة', category: 'الخدمات', icon: FileText, path: '/turkey-apps', color: 'text-blue-500' },
  { id: 'srv-4', title: 'دليل الطالب', description: 'معلومات للطلاب الجدد', category: 'الخدمات', icon: FileText, path: '/guide', color: 'text-blue-500' },

  // الداعمون
  { id: 'sup-1', title: 'الداعمون', description: 'شركاء وداعمين', category: 'الداعمون', icon: Heart, path: '/partners', color: 'text-pink-500' },
  { id: 'sup-2', title: 'الخصومات', description: 'عروض وخصومات', category: 'الداعمون', icon: Heart, path: '/discounts', color: 'text-pink-500' },
  { id: 'sup-3', title: 'بوابة الداعم', description: 'دخول الداعمين', category: 'الداعمون', icon: Heart, path: '/sponsor-portal', color: 'text-pink-500' },

  // المجتمع
  { id: 'com-1', title: 'المجتمع', description: 'تواصل مع الطلاب', category: 'المجتمع', icon: Users, path: '/community', color: 'text-teal-500' },
  { id: 'com-2', title: 'الكوادر', description: 'فرق العمل', category: 'المجتمع', icon: Users, path: '/corps', color: 'text-teal-500' },
  { id: 'com-3', title: 'الشفافية', description: 'أرقام وإحصائيات', category: 'المجتمع', icon: Users, path: '/transparency', color: 'text-teal-500' },

  // الحساب
  { id: 'acc-1', title: 'حسابي', description: 'الملف الشخصي', category: 'الحساب', icon: Users, path: '/profile', color: 'text-gray-600' },
  { id: 'acc-2', title: 'بطاقة العضوية', description: 'بطاقتك الرقمية', category: 'الحساب', icon: Users, path: '/membership-card', color: 'text-gray-600' },
  { id: 'acc-3', title: 'النقاط', description: 'نقاطك وترتيبك', category: 'الحساب', icon: Users, path: '/points', color: 'text-gray-600' },
  { id: 'acc-4', title: 'الأسئلة الشائعة', description: 'إجابات لأسئلتك', category: 'الحساب', icon: Users, path: '/faq', color: 'text-gray-600' },
  { id: 'acc-5', title: 'الاقتراحات', description: 'شاركنا رأيك', category: 'الحساب', icon: Users, path: '/suggestions', color: 'text-gray-600' },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );

    setResults(filtered.slice(0, 10));
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث في الجامعة، المستشفى، الوظائف..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded-md">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query && results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد نتائج لـ "{query}"</p>
              <p className="text-sm text-muted-foreground/60 mt-1">جرب كلمات أخرى</p>
            </div>
          ) : query ? (
            <div className="p-2">
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-3">
                  <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">{category}</p>
                  {items.map((result, idx) => {
                    const globalIdx = results.indexOf(result);
                    const Icon = result.icon;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-right",
                          globalIdx === selectedIndex ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn("w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0", result.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-muted-foreground px-2 mb-2 font-medium">اقتراحات</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  // { label: 'الدورات', path: '/university', icon: GraduationCap },
                  // { label: 'الأطباء', path: '/doctors-directory', icon: Stethoscope },
                  { label: 'الوظائف', path: '/jobs', icon: Briefcase },
                  { label: 'الفعاليات', path: '/events', icon: Calendar },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>↑↓ للتنقل • Enter للاختيار • Esc للإغلاق</span>
            <span>بحث شامل</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};