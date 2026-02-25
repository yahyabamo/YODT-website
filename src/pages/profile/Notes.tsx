import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Plus, Trash2, Lock, Edit3, Check, X, FileText, Image as ImageIcon,
  ChevronLeft, MoreVertical, Folder
} from 'lucide-react';
import { toast } from 'sonner';

interface NotePage {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  hasAttachments?: boolean;
}

const noteColors = [
  { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', accent: 'bg-amber-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', accent: 'bg-rose-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', accent: 'bg-emerald-500' },
  { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800', accent: 'bg-sky-500' },
  { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', accent: 'bg-violet-500' },
];

const Notes = () => {
  const [pages, setPages] = useState<NotePage[]>(() => {
    const saved = localStorage.getItem('user-note-pages');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePage, setActivePage] = useState<NotePage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    localStorage.setItem('user-note-pages', JSON.stringify(pages));
  }, [pages]);

  const createPage = () => {
    if (!newTitle.trim()) {
      toast.error('يرجى إدخال عنوان للصفحة');
      return;
    }

    const page: NotePage = {
      id: Date.now().toString(),
      title: newTitle,
      content: '',
      createdAt: new Date().toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      updatedAt: new Date().toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      color: selectedColor.toString()
    };

    setPages([page, ...pages]);
    setNewTitle('');
    setIsCreating(false);
    setActivePage(page);
    setEditContent('');
    toast.success('تم إنشاء الصفحة');
  };

  const deletePage = (id: string) => {
    setPages(pages.filter(p => p.id !== id));
    if (activePage?.id === id) {
      setActivePage(null);
    }
    toast.success('تم حذف الصفحة');
  };

  const savePage = () => {
    if (!activePage) return;
    
    setPages(pages.map(p => 
      p.id === activePage.id 
        ? { 
            ...p, 
            content: editContent,
            updatedAt: new Date().toLocaleDateString('ar-EG', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          } 
        : p
    ));
    toast.success('تم الحفظ');
  };

  const gender = localStorage.getItem('userGender');
  const isStudent = gender === 'male';

  // Active Page View
  if (activePage) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => {
                savePage();
                setActivePage(null);
              }}
              className="flex items-center gap-2 text-primary"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
              <span>العودة</span>
            </button>
            <h1 className="font-bold text-lg truncate max-w-[50%]">{activePage.title}</h1>
            <Button onClick={savePage} size="sm" className="gap-1">
              <Check className="h-4 w-4" />
              حفظ
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder={isStudent ? 'ابدأ الكتابة هنا...' : 'ابدئي الكتابة هنا...'}
            className="w-full min-h-[calc(100vh-200px)] resize-none border-0 bg-transparent focus-visible:ring-0 text-lg leading-relaxed"
            style={{ direction: 'rtl' }}
          />
        </div>

        {/* Toolbar */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {activePage.updatedAt}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="مذكّراتي" showBack />
      
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Privacy Notice */}
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl">
          <Lock className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            {isStudent 
              ? 'ملاحظاتك خاصة ومحفوظة على جهازك فقط'
              : 'ملاحظاتكِ خاصة ومحفوظة على جهازكِ فقط'
            }
          </p>
        </div>

        {/* Create New Page */}
        {!isCreating ? (
          <Button 
            onClick={() => setIsCreating(true)}
            className="w-full h-14 rounded-2xl gap-2 text-base"
            variant="outline"
          >
            <Plus className="w-5 h-5" />
            إنشاء صفحة جديدة
          </Button>
        ) : (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="عنوان الصفحة..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-14 border-0 bg-muted/50 focus-visible:ring-0 text-lg font-medium rounded-xl"
                autoFocus
              />
              
              {/* Color Selection */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">اللون:</span>
                <div className="flex gap-2">
                  {noteColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full ${color.accent} ${
                        selectedColor === index ? 'ring-2 ring-offset-2 ring-primary' : ''
                      } transition-all`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createPage} className="flex-1 h-12 gap-2 rounded-xl">
                  <Check className="w-4 h-4" />
                  إنشاء
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setNewTitle('');
                  }}
                  className="gap-2 rounded-xl"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pages Grid */}
        {pages.length === 0 && !isCreating ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Folder className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">لا توجد صفحات بعد</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {isStudent ? 'أنشئ صفحتك الأولى' : 'أنشئي صفحتكِ الأولى'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pages.map((page) => {
              const colorIndex = parseInt(page.color) || 0;
              const color = noteColors[colorIndex % noteColors.length];
              
              return (
                <Card 
                  key={page.id}
                  className={`border-2 shadow-soft cursor-pointer hover:shadow-card transition-all ${color.bg} ${color.border}`}
                  onClick={() => {
                    setActivePage(page);
                    setEditContent(page.content);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${color.accent}`} />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2">{page.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {page.content || 'صفحة فارغة...'}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {page.updatedAt}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Notes;
