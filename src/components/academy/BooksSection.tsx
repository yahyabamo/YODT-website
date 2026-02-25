import { useState } from 'react';
import { Book, Download, Users, ChevronDown, X, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { books, bookCategories } from '@/data/academyData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BookDetails {
  id: string;
  title: string;
  author: string;
  pages: number;
  category: string;
  summary: string;
  downloadUrl: string;
  readers: number;
}

export const BooksSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortByReaders, setSortByReaders] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);

  let filteredBooks = selectedCategory === 'الكل' 
    ? books 
    : books.filter(b => b.category === selectedCategory);

  if (sortByReaders) {
    filteredBooks = [...filteredBooks].sort((a, b) => b.readers - a.readers);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          مكتبة الكتب
        </h3>
        <Button
          variant={sortByReaders ? "default" : "outline"}
          size="sm"
          onClick={() => setSortByReaders(!sortByReaders)}
          className="text-xs"
        >
          الأكثر قراءة
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {bookCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredBooks.map((book) => (
          <Card
            key={book.id}
            className="border-0 shadow-soft cursor-pointer hover:shadow-card transition-all"
            onClick={() => setSelectedBook(book)}
          >
            <CardContent className="p-3">
              <div className="w-full h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-2">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-medium text-sm text-foreground line-clamp-1">{book.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{book.readers} قارئ</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-right">{selectedBook?.title}</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الكاتب:</span>
                  <span className="font-medium">{selectedBook.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الصفحات:</span>
                  <span className="font-medium">{selectedBook.pages} صفحة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التصنيف:</span>
                  <span className="font-medium">{selectedBook.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد القرّاء:</span>
                  <span className="font-medium">{selectedBook.readers}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">ملخص الكتاب</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedBook.summary}</p>
              </div>

              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                تحميل الكتاب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
