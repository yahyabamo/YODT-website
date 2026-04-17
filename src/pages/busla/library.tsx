'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Layers, Download, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { getLibraryItems } from '@/lib/queries';
import type { LibraryItem } from '@/integrations/supabase/types';
import { LIBRARY_TYPE_LABELS } from '@/integrations/supabase/types';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface TrackPageState {
    track: any;
    userId: string | null;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    bookmarkedPages: Set<number>;
    noteInput: string;
    savingNote: boolean;
    showAllNotes: boolean;
    showSearch: boolean;
    searchQuery: string;

    chatInput: string;
    sendingMsg: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
    book: <BookOpen className="h-5 w-5" />,
    course: <Video className="h-5 w-5" />,
    lecture: <Layers className="h-5 w-5" />,
    summary: <FileText className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
    book: 'bg-red-700',
    course: 'bg-gray-800',
    lecture: 'bg-red-900',
    summary: 'bg-gray-700',
};

const filters = [
    { label: 'الكل', value: 'all' },
    { label: 'كتب', value: 'book' },
    { label: 'دورات', value: 'course' },
    { label: 'محاضرات', value: 'lecture' },
    { label: 'ملخصات', value: 'summary' },
];

export default function LibraryPage() {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const [state, setState] = useState<TrackPageState>({
        track: null,
        userId: null,
        loading: true,
        currentPage: 1,
        totalPages: 0,
        bookmarkedPages: new Set(),
        noteInput: '',
        savingNote: false,
        showAllNotes: false,
        showSearch: false,
        searchQuery: '',
        chatInput: '',
        sendingMsg: false,
    });
    const updateState = useCallback((updates: Partial<TrackPageState>) => {
        setState((prev) => ({ ...prev, ...updates }));

    }, []);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getLibraryItems(filter);
            setItems(data);
            setLoading(false);
        };
        fetch();
    }, [filter]);

    const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/busla')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                            {'المكتبة'}
                        </h1>
                        {/* <Button size="icon" variant="ghost" className="h-10 w-10">
                            <Share2 className="h-5 w-5 text-slate-600" />
                        </Button> */}
                    </div>
                </div>
            </header>


            <div className="px-4 py-4 max-w-lg mx-auto">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="ابحث في المكتبة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted border-0 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 text-right"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                                filter === f.value
                                    ? 'gradient-primary text-primary-foreground shadow-soft'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-44 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Items Grid */}
                {!loading && (
                    <>
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد عناصر</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filtered.map((item, index) => (
                                    <Card
                                        key={item.id}
                                        className="shadow-soft overflow-hidden animate-slide-up"
                                        style={{ animationDelay: `${index * 0.04}s` }}
                                    >
                                        <CardContent className="p-0">
                                            {/* Color top */}
                                            <div
                                                className={cn(
                                                    typeColors[item.type] ?? 'bg-gray-700',
                                                    'p-4 flex items-center justify-center h-24'
                                                )}
                                            >
                                                <div className="text-white/90">
                                                    {typeIcons[item.type] ?? <FileText className="h-5 w-5" />}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-3">
                                                <span className="text-xs text-muted-foreground">
                                                    {LIBRARY_TYPE_LABELS[item.type] ?? item.type}
                                                </span>
                                                <h3 className="font-semibold text-sm mt-0.5 leading-tight line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                {item.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {item.file_url && (
                                                    <a
                                                        href={item.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 flex items-center gap-1 text-xs text-red-700 font-medium hover:underline"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        تحميل
                                                    </a>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
}