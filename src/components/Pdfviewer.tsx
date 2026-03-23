'use client';

/**
 * PDFViewer Component
 *
 * Install required packages:
 *   npm install react-pdf
 *
 * Also copy the worker to your public folder:
 *   node_modules/pdfjs-dist/build/pdf.worker.min.mjs → public/pdf.worker.min.mjs
 */

import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
    ChevronRight,
    ChevronLeft,
    ZoomIn,
    ZoomOut,
    BookmarkPlus,
    BookmarkCheck,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Use local worker (copy from node_modules)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
    url: string;
    initialPage?: number;
    isBookmarked?: boolean;
    onPageChange?: (page: number) => void;
    onBookmarkToggle?: (page: number) => void;
    onTotalPages?: (total: number) => void;
}

export default function PDFViewer({
    url,
    initialPage = 1,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPages,
}: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [containerWidth, setContainerWidth] = useState(0);

    // Measure container for responsive width
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (node) setContainerWidth(node.offsetWidth);
    }, []);

    useEffect(() => {
        setCurrentPage(initialPage);
    }, [initialPage]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        onTotalPages?.(numPages);
    };

    const goToPage = (page: number) => {
        const clamped = Math.max(1, Math.min(page, numPages));
        setCurrentPage(clamped);
        onPageChange?.(clamped);
    };

    const pageWidth = containerWidth ? containerWidth * scale : undefined;

    return (
        <div className="flex flex-col bg-gray-100 rounded-xl overflow-hidden" dir="ltr">
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-gray-900 text-white gap-2"
                dir="rtl"
            >
                {/* Page navigation */}
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <span className="text-xs font-mono text-white/80 min-w-[64px] text-center">
                        {currentPage} / {numPages || '—'}
                    </span>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= numPages}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* Zoom & Bookmark */}
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-white/70 min-w-[36px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-4 bg-white/20 mx-1" />

                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                            'h-7 w-7 hover:bg-white/20',
                            isBookmarked ? 'text-yellow-400' : 'text-white'
                        )}
                        onClick={() => onBookmarkToggle?.(currentPage)}
                    >
                        {isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4" />
                        ) : (
                            <BookmarkPlus className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* PDF Document */}
            <div
                ref={containerRef}
                className="overflow-auto max-h-[60vh] flex justify-center bg-gray-200"
            >
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading=""
                    error={
                        <div className="text-center py-16 text-muted-foreground px-4" dir="rtl">
                            <p>تعذّر تحميل الملف. تأكد من الرابط.</p>
                        </div>
                    }
                >
                    <Page
                        pageNumber={currentPage}
                        width={pageWidth}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        loading={
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-red-700" />
                            </div>
                        }
                    />
                </Document>
            </div>

            {/* Bottom page progress */}
            {numPages > 0 && (
                <div className="bg-gray-900 px-3 py-1.5">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                            className="bg-red-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(currentPage / numPages) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}