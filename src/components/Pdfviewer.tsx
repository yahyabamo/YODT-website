'use client';

import { useState } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    BookmarkPlus,
    BookmarkCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
    url: string;
    initialPage?: number;
    isBookmarked?: boolean;
    onPageChange?: (page: number) => void;
    onBookmarkToggle?: (page: number) => void;
}

export default function PDFViewer({
    url,
    initialPage = 1,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
}: PDFViewerProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const goToPage = (page: number) => {
        const next = Math.max(1, page);
        setCurrentPage(next);
        onPageChange?.(next);
    };

    // ⚠️ Safari supports #page=
    const pdfUrl = `${url}#page=${currentPage}`;

    return (
        <div className="flex flex-col bg-gray-100 rounded-xl overflow-hidden">

            {/* Top Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-900 text-white">

                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        <ChevronRight />
                    </Button>

                    <span className="text-sm">{currentPage}</span>

                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        <ChevronLeft />
                    </Button>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        isBookmarked ? 'text-yellow-400' : 'text-white'
                    )}
                    onClick={() => onBookmarkToggle?.(currentPage)}
                >
                    {isBookmarked ? <BookmarkCheck /> : <BookmarkPlus />}
                </Button>
            </div>

            {/* PDF */}
            <div className="w-full h-[65vh]">
                <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                />
            </div>
        </div>
    );
}