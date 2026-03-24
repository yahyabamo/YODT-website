import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Trash2, Lock, Check, X, Folder,
  ChevronLeft, Loader2, CloudOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const noteColors = [
  { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', accent: 'bg-amber-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', accent: 'bg-rose-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', accent: 'bg-emerald-500' },
  { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800', accent: 'bg-sky-500' },
  { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', accent: 'bg-violet-500' },
];

const Notes = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { notes, loading, saving, error, createNote, updateNote, deleteNote } = useNotes();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;
  const gender = user ? null : localStorage.getItem('userGender');
  const isStudent = gender === 'male';

  // ── Open a note ──────────────────────────────────────────────────────────
  const openNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setActiveNoteId(id);
    setEditContent(note.content);
  };

  // ── Auto-save on content change ───────────────────────────────────────────
  const handleContentChange = (value: string) => {
    setEditContent(value);
    if (activeNoteId) updateNote(activeNoteId, value);
  };

  // ── Save & go back ────────────────────────────────────────────────────────
  const handleBack = () => {
    if (activeNoteId) updateNote(activeNoteId, editContent, true);
    setActiveNoteId(null);
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const res = await createNote(newTitle, selectedColor.toString());
    if (res.ok && res.note) {
      toast.success(res.message);
      setNewTitle('');
      setIsCreating(false);
      openNote(res.note.id);
    } else {
      toast.error(res.message);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(id);
    const res = await deleteNote(id);
    setDeleting(null);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
    if (activeNoteId === id) setActiveNoteId(null);
  };

  // ── Loading / Auth ────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <CloudOff className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} size="sm">إعادة المحاولة</Button>
        <BottomNav />
      </div>
    );
  }

  // ── Active Note Editor ────────────────────────────────────────────────────
  if (activeNote) {
    const colorIdx = parseInt(activeNote.color) || 0;
    const col = noteColors[colorIdx % noteColors.length];
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-primary"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
              <span>العودة</span>
            </button>
            <h1 className="font-bold text-lg truncate max-w-[50%]">{activeNote.title}</h1>
            {saving
              ? <span className="text-xs text-muted-foreground animate-pulse">جاري الحفظ...</span>
              : <span className="text-xs text-green-500">محفوظ ✓</span>
            }
          </div>
        </div>

        {/* Editor */}
        <div className={`flex-1 p-4 ${col.bg}`}>
          <Textarea
            value={editContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={isStudent ? 'ابدأ الكتابة هنا...' : 'ابدئي الكتابة هنا...'}
            className="w-full min-h-[calc(100vh-200px)] resize-none border-0 bg-transparent focus-visible:ring-0 text-lg leading-relaxed"
            style={{ direction: 'rtl' }}
          />
        </div>
      </div>
    );
  }

  // ── Notes List ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <PageHeader title="مذكّراتي" showBack />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Privacy Notice */}
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl">
          <Lock className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            {isStudent
              ? 'ملاحظاتك الخاصة'
              : 'ملاحظاتكِ الخاصة'
            }
          </p>
        </div>

        {/* Create New */}
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
                      className={`w-8 h-8 rounded-full ${color.accent} ${selectedColor === index ? 'ring-2 ring-offset-2 ring-primary' : ''
                        } transition-all`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1 h-12 gap-2 rounded-xl">
                  <Check className="w-4 h-4" />
                  إنشاء
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setIsCreating(false); setNewTitle(''); }}
                  className="gap-2 rounded-xl"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Grid */}
        {notes.length === 0 && !isCreating ? (
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
            {notes.map((note) => {
              const colorIndex = parseInt(note.color) || 0;
              const color = noteColors[colorIndex % noteColors.length];
              return (
                <Card
                  key={note.id}
                  className={`border-2 shadow-soft cursor-pointer hover:shadow-card transition-all ${color.bg} ${color.border}`}
                  onClick={() => openNote(note.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${color.accent}`} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        disabled={deleting === note.id}
                        className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                      >
                        {deleting === note.id
                          ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          : <Trash2 className="w-4 h-4 text-destructive" />
                        }
                      </button>
                    </div>
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2">{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.content || 'صفحة فارغة...'}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString('ar-EG', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
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
