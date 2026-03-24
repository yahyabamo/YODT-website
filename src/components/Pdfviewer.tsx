'use client';

import {
    ChevronRight,
    ChevronLeft,
    BookmarkPlus,
    BookmarkCheck,
    Maximize2,
    Minimize2,
    ExternalLink,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

// Correct CSS import paths for react-pdf v9+
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - ULTIMATE METHOD
// Use a direct string path to bypass Vite's import analysis completely
// This forces the browser to fetch it as a plain static file
if (typeof window !== 'undefined') {
    // Get the base URL dynamically to handle both dev and production
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    console.log('✓ PDF.js worker configured:', pdfjs.GlobalWorkerOptions.workerSrc);
}

interface PDFViewerProps {
    url: string;
    currentPage: number;
    totalPages?: number;
    isBookmarked?: boolean;
    onPageChange?: (page: number) => void;
    onBookmarkToggle?: (page: number) => void;
    onTotalPagesChange?: (pages: number) => void;
}

export default function PDFViewer({
    url,
    currentPage,
    totalPages: propTotalPages = 0,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPagesChange,
}: PDFViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const [displayPage, setDisplayPage] = useState(currentPage);
    const [renderError, setRenderError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync displayPage with currentPage when currentPage changes from external source (buttons)
    useEffect(() => {
        setDisplayPage(currentPage);
        // Scroll to the page when currentPage changes from button clicks
        if (pageRefs.current.has(currentPage)) {
            const pageElement = pageRefs.current.get(currentPage);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [currentPage]);

    // Handle PDF load success - get actual page count
    const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
        console.log(`✓ PDF loaded successfully with ${pages} pages`);
        setNumPages(pages);
        onTotalPagesChange?.(pages);
        setIsLoading(false);
        setRenderError(null);
    }, [onTotalPagesChange]);

    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('❌ PDF load error:', error);
        setIsLoading(false);
        setRenderError(`Failed to load PDF: ${error.message}`);
    }, []);

    // Handle scroll detection - update currentPage based on visible page
    const handleScroll = useCallback(() => {
        if (!containerRef.current || !numPages) return;

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Debounce scroll events
        scrollTimeoutRef.current = setTimeout(() => {
            const container = containerRef.current;
            if (!container) return;

            // Find which page is currently in view
            let visiblePage = currentPage;
            let minDistance = Infinity;

            pageRefs.current.forEach((element, pageNum) => {
                const rect = element.getBoundingClientRect();
                const distance = Math.abs(rect.top - container.getBoundingClientRect().top);

                if (distance < minDistance) {
                    minDistance = distance;
                    visiblePage = pageNum;
                }
            });

            // Only update if the visible page changed
            if (visiblePage !== displayPage) {
                setDisplayPage(visiblePage);
                onPageChange?.(visiblePage);
            }
        }, 300);
    }, [currentPage, displayPage, numPages, onPageChange]);

    const goToPage = useCallback((page: number) => {
        const nextPage = Math.max(1, Math.min(page, numPages || page));
        setDisplayPage(nextPage);
        onPageChange?.(nextPage);
    }, [numPages, onPageChange]);

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        setScale((prev) => {
            const newScale = direction === 'in' ? prev + 0.2 : prev - 0.2;
            return Math.max(0.5, Math.min(newScale, 3));
        });
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        try {
            if (!isFullscreen) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if ((containerRef.current as any).webkitRequestFullscreen) {
                    await (containerRef.current as any).webkitRequestFullscreen();
                }
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                }
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    }, [isFullscreen]);

    const openExternal = () => {
        window.open(url, '_blank');
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPage(displayPage + 1);
            } else if (e.key === 'ArrowRight') {
                goToPage(displayPage - 1);
            } else if (e.key === '+' || e.key === '=') {
                handleZoom('in');
            } else if (e.key === '-') {
                handleZoom('out');
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [displayPage, goToPage, handleZoom, toggleFullscreen]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300',
                isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[65vh] md:h-[75vh]'
            )}
            onScroll={handleScroll}
        >
            {/* Decorative Gradient Orbs */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Floating Toolbar (Glassmorphism) */}
            <div className="absolute top-3 inset-x-3 z-20 mx-auto max-w-2xl">
                <div className="flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-lg rounded-full border border-white/10 shadow-lg overflow-x-auto">
                    {/* Left: Navigation & Page */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full flex-shrink-0"
                            onClick={() => goToPage(displayPage - 1)}
                            disabled={displayPage <= 1}
                            title="Previous page"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-1 text-white font-mono text-sm px-2 flex-shrink-0 whitespace-nowrap">
                            <span className="font-bold">{displayPage}</span>
                            {numPages && numPages > 0 && (
                                <span className="text-white/50 text-xs">/ {numPages}</span>
                            )}
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full flex-shrink-0"
                            onClick={() => goToPage(displayPage + 1)}
                            disabled={numPages ? displayPage >= numPages : false}
                            title="Next page"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Center: Zoom Controls (hidden on mobile) */}
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full"
                            onClick={() => handleZoom('out')}
                            disabled={scale <= 0.5}
                            title="Zoom out"
                        >
                            <ChevronRight className="h-4 w-4" style={{ transform: 'rotate(180deg)' }} />
                        </Button>

                        <div className="text-white font-mono text-xs px-2 min-w-[40px] text-center">
                            {Math.round(scale * 100)}%
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full"
                            onClick={() => handleZoom('in')}
                            disabled={scale >= 3}
                            title="Zoom in"
                        >
                            <ChevronLeft className="h-4 w-4" style={{ transform: 'rotate(180deg)' }} />
                        </Button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                'h-8 w-8 rounded-full transition-colors flex-shrink-0',
                                isBookmarked ? 'text-yellow-400 hover:bg-yellow-400/20' : 'text-white/70 hover:bg-white/10 hover:text-white'
                            )}
                            onClick={() => onBookmarkToggle?.(displayPage)}
                            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                            {isBookmarked ? (
                                <BookmarkCheck className="h-4 w-4" />
                            ) : (
                                <BookmarkPlus className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white rounded-full hidden sm:flex flex-shrink-0"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white rounded-full hidden sm:flex flex-shrink-0"
                            onClick={openExternal}
                            title="Open in new tab"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* PDF Container */}
            <div className="flex-1 w-full overflow-auto bg-gray-950 relative">
                {/* Error State */}
                {renderError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-4 text-center px-6">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <div>
                                <p className="text-white font-semibold mb-2">Failed to Load PDF</p>
                                <p className="text-gray-300 text-sm mb-4">{renderError}</p>
                                <Button
                                    onClick={openExternal}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    size="sm"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in New Tab
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && !renderError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                            <p className="text-sm text-gray-400">Loading PDF...</p>
                        </div>
                    </div>
                )}

                {/* PDF Document */}
                {!renderError && (
                    <div className="flex justify-center py-4">
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center py-20 text-red-500">
                                    <AlertCircle className="h-10 w-10 mb-2" />
                                    <p>Failed to load PDF</p>
                                </div>
                            }
                        >
                            {numPages &&
                                Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                                    <div
                                        key={pageNum}
                                        ref={(el) => {
                                            if (el) {
                                                pageRefs.current.set(pageNum, el);
                                            }
                                        }}
                                        className="mb-4 flex justify-center"
                                    >
                                        <Page
                                            pageNumber={pageNum}
                                            scale={scale}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                        />
                                    </div>
                                ))}
                        </Document>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Controls */}
            <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur border-0 shadow-lg text-xs text-gray-800"
                    onClick={openExternal}
                >
                    <ExternalLink className="h-3 w-3 mr-1" /> Open PDF
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur border-0 shadow-lg text-xs text-gray-800"
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </Button>
            </div>
        </div>
    );
}
