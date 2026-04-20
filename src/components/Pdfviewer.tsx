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
    Smartphone,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

// Correct CSS imports for react-pdf v9+
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ─── PDF.js Worker ────────────────────────────────────────────────────────────
// IMPORTANT: react-pdf bundles its own pdfjs-dist version internally.
// We must point the worker to react-pdf's OWN copy to avoid API/Worker version mismatch.
// Using the root pdfjs-dist (a different version) causes:
//   "The API version X does not match the Worker version Y"
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        // This resolves to react-pdf's nested pdfjs-dist, not the root package
        'react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();
}

// ─── Windowed Rendering Constants ─────────────────────────────────────────────
/** How many pages to render above and below the current page */
const PAGE_BUFFER = 4;

/** Estimated A4 page height in pixels at scale=1 (used for placeholder sizing) */
const A4_PAGE_HEIGHT_PX = 842;

// ─── Device Detection ─────────────────────────────────────────────────────────
function getDeviceInfo(): { isMobile: boolean; isIOS: boolean } {
    if (typeof window === 'undefined') return { isMobile: false, isIOS: false };
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isIOS || /android|mobile|blackberry|opera mini|iemobile/i.test(ua);
    return { isMobile, isIOS };
}

// ─── Shared Props Interface ────────────────────────────────────────────────────
export interface PDFViewerProps {
    url: string;
    currentPage: number;
    totalPages?: number;
    isBookmarked?: boolean;
    onPageChange?: (page: number) => void;
    onBookmarkToggle?: (page: number) => void;
    onTotalPagesChange?: (pages: number) => void;
}

// ─── ROOT EXPORT: Hybrid Dispatcher ─────────────────────────────────────────────
// Automatically routes mobile users to the native viewer and desktop to react-pdf
export default function PDFViewer(props: PDFViewerProps) {
    const { isMobile } = useMemo(() => getDeviceInfo(), []);

    if (isMobile) {
        return <MobilePDFViewer {...props} />;
    }
    return <DesktopPDFViewer {...props} />;
}

// ─── MOBILE VIEWER ────────────────────────────────────────────────────────────
// Uses an iframe for native rendering (iOS WKWebView renders PDFs natively).
// Falls back to an "Open PDF" button when the iframe cannot load the file.
function MobilePDFViewer({
    url,
    isBookmarked = false,
    onBookmarkToggle,
    currentPage,
}: PDFViewerProps) {
    const [iframeState, setIframeState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const { isIOS } = useMemo(() => getDeviceInfo(), []);

    const openExternal = useCallback(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [url]);

    return (
        <div className="relative flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl h-[72vh]">

            {/* ── Mobile Toolbar ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-white/60" />
                    <span className="text-white/70 text-xs font-medium">قارئ الكتب</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Bookmark toggle — synced with parent state */}
                    <button
                        className={cn(
                            'p-2 rounded-full transition-colors',
                            isBookmarked
                                ? 'text-yellow-400 bg-yellow-400/10'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                        )}
                        onClick={() => onBookmarkToggle?.(currentPage)}
                        title={isBookmarked ? 'إزالة الإشارة المرجعية' : 'إضافة إشارة مرجعية'}
                    >
                        {isBookmarked
                            ? <BookmarkCheck className="h-4 w-4" />
                            : <BookmarkPlus className="h-4 w-4" />
                        }
                    </button>

                    {/* Primary CTA — always visible on mobile */}
                    <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 gap-1.5 px-3"
                        onClick={openExternal}
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        فتح PDF
                    </Button>
                </div>
            </div>

            {/* ── iOS Hint Banner ── */}
            {isIOS && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-950/60 border-b border-blue-500/20 flex-shrink-0">
                    <Smartphone className="h-3 w-3 text-blue-300 flex-shrink-0" />
                    <p className="text-blue-200 text-xs">
                        اضغط <strong>فتح PDF</strong> لعرض الكتاب في تطبيق القراءة على iOS
                    </p>
                </div>
            )}

            {/* ── Content Area ── */}
            <div className="flex-1 relative overflow-hidden">

                {/* Loading overlay */}
                {iframeState === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-10 gap-3">
                        <Loader2 className="h-9 w-9 animate-spin text-red-500" />
                        <p className="text-gray-400 text-sm">جاري تحميل الكتاب...</p>
                    </div>
                )}

                {/* iframe — native PDF rendering (works on iOS & Android) */}
                {iframeState !== 'error' ? (
                    <iframe
                        src={url}
                        className={cn(
                            'w-full h-full border-0 transition-opacity duration-300',
                            iframeState === 'loaded' ? 'opacity-100' : 'opacity-0'
                        )}
                        onLoad={() => setIframeState('loaded')}
                        onError={() => setIframeState('error')}
                        title="PDF Viewer"
                        allow="fullscreen"
                        // Prevent iframe from navigating the parent page
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                ) : (
                    /* ── iframe Failed — Fallback CTA ── */
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 gap-6 px-8">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="h-8 w-8 text-red-400" />
                            </div>
                            <p className="text-white font-semibold text-base">تعذّر عرض الكتاب</p>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                اضغط على الزر أدناه لفتح الكتاب في تطبيق القراءة الافتراضي على جهازك
                            </p>
                        </div>
                        <Button
                            onClick={openExternal}
                            className="bg-red-600 hover:bg-red-700 text-white gap-2 px-8 py-3 text-base rounded-xl shadow-lg"
                        >
                            <ExternalLink className="h-5 w-5" />
                            فتح الكتاب
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── DESKTOP VIEWER ───────────────────────────────────────────────────────────
// Uses react-pdf with windowed virtualization: only renders PAGE_BUFFER pages
// above and below the current page. Placeholder divs maintain scroll position
// for all other pages. A lightweight debounced scroll handler tracks which page
// is in view and dynamically shifts the render window.
function DesktopPDFViewer({
    url,
    currentPage,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPagesChange,
}: PDFViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isDocLoading, setIsDocLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const [displayPage, setDisplayPage] = useState(currentPage);
    const [renderError, setRenderError] = useState<string | null>(null);

    // Track actual rendered page height dynamically (updated after first page renders)
    const [pageHeight, setPageHeight] = useState(A4_PAGE_HEIGHT_PX);

    const containerRef = useRef<HTMLDivElement>(null);      // outer wrapper — used for fullscreen
    const scrollRef = useRef<HTMLDivElement>(null);           // inner overflow-auto div — ACTUALLY scrolls
    // Maps pageNumber → its wrapper div (includes placeholder divs)
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isExternalNavRef = useRef(false); // flag: navigation came from buttons, not scroll
    // Ref mirror of displayPage — avoids stale closures in debounced scroll handler
    const displayPageRef = useRef(currentPage);

    const openExternal = useCallback(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [url]);

    // ── Windowed page range ───────────────────────────────────────────────────
    const windowedPages = useMemo<Set<number>>(() => {
        if (!numPages) return new Set();
        const start = Math.max(1, displayPage - PAGE_BUFFER);
        const end = Math.min(numPages, displayPage + PAGE_BUFFER);
        const set = new Set<number>();
        for (let i = start; i <= end; i++) set.add(i);
        return set;
    }, [displayPage, numPages]);

    // ── Keep displayPageRef in sync with displayPage state ──────────────────────
    useEffect(() => {
        displayPageRef.current = displayPage;
    }, [displayPage]);

    // ── Sync ext. currentPage → displayPage + scroll ──────────────────────────
    useEffect(() => {
        if (currentPage === displayPageRef.current) return;
        isExternalNavRef.current = true;
        setDisplayPage(currentPage);
        displayPageRef.current = currentPage;
        // Scroll after state update + React render
        setTimeout(() => {
            const el = pageRefs.current.get(currentPage);
            const scroller = scrollRef.current;
            if (el && scroller) {
                // Use scrollTop directly to avoid re-triggering scroll detection
                scroller.scrollTop = el.offsetTop - 12;
            }
            isExternalNavRef.current = false;
        }, 60);
    }, [currentPage]);

    // ── PDF load handlers ─────────────────────────────────────────────────────
    const onDocumentLoadSuccess = useCallback(
        ({ numPages: pages }: { numPages: number }) => {
            setNumPages(pages);
            onTotalPagesChange?.(pages);
            setIsDocLoading(false);
            setRenderError(null);
        },
        [onTotalPagesChange]
    );

    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('❌ PDF load error:', error);
        setIsDocLoading(false);
        setRenderError(`فشل تحميل الملف: ${error.message}`);
    }, []);

    // ── Scroll-based page tracker ─────────────────────────────────────────────
    // NOTE: We read from scrollRef (the actual scrollable div), not containerRef
    // (the outer wrapper which has scrollTop = 0 always).
    // We use displayPageRef to avoid stale closures in the debounce callback.
    const handleScroll = useCallback(() => {
        if (isExternalNavRef.current) return;
        const scroller = scrollRef.current;
        if (!scroller || !numPages) return;

        if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);

        scrollDebounceRef.current = setTimeout(() => {
            const scroller = scrollRef.current;
            if (!scroller) return;

            // Midpoint of the visible viewport (in content-space coords)
            const viewMid = scroller.scrollTop + scroller.clientHeight / 2;
            let bestPage = displayPageRef.current;
            let bestDist = Infinity;

            pageRefs.current.forEach((el, pageNum) => {
                // offsetTop is relative to the inner scrollable container
                // (it has position:relative, making it the offset parent)
                const elMid = el.offsetTop + el.offsetHeight / 2;
                const dist = Math.abs(elMid - viewMid);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestPage = pageNum;
                }
            });

            if (bestPage !== displayPageRef.current) {
                displayPageRef.current = bestPage;
                setDisplayPage(bestPage);
                onPageChange?.(bestPage);
            }
        }, 150);
    }, [numPages, onPageChange]);

    // ── Button-driven navigation ──────────────────────────────────────────────
    const goToPage = useCallback(
        (page: number) => {
            const next = Math.max(1, Math.min(page, numPages ?? page));
            isExternalNavRef.current = true;
            displayPageRef.current = next;
            setDisplayPage(next);
            onPageChange?.(next);
            setTimeout(() => {
                const el = pageRefs.current.get(next);
                const scroller = scrollRef.current;
                if (el && scroller) {
                    scroller.scrollTop = el.offsetTop - 12;
                }
                isExternalNavRef.current = false;
            }, 60);
        },
        [numPages, onPageChange]
    );

    // ── Zoom ──────────────────────────────────────────────────────────────────
    const handleZoom = useCallback((direction: 'in' | 'out') => {
        setScale((prev) => {
            const next = direction === 'in' ? prev + 0.15 : prev - 0.15;
            return Math.max(0.5, Math.min(next, 3.0));
        });
    }, []);

    // ── Fullscreen (Desktop only; iOS Safari doesn't support this API) ─────────
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!isFullscreen) {
                const el = containerRef.current as any;
                if (el.requestFullscreen) await el.requestFullscreen();
                else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
                setIsFullscreen(true);
            } else {
                const doc = document as any;
                if (doc.exitFullscreen) await doc.exitFullscreen();
                else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.warn('Fullscreen error:', err);
        }
    }, [isFullscreen]);

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPage(displayPage + 1);
            else if (e.key === 'ArrowRight') goToPage(displayPage - 1);
            else if (e.key === '+' || e.key === '=') handleZoom('in');
            else if (e.key === '-') handleZoom('out');
            else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [displayPage, goToPage, handleZoom, toggleFullscreen]);

    // ── Cleanup debounce on unmount ───────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
        };
    }, []);

    // ── Height of a placeholder (approximated, reflects current scale) ────────
    const placeholderHeight = Math.round(pageHeight * scale);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300',
                isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[65vh] md:h-[75vh]'
            )}
        >
            {/* ── Decorative Background Orbs ── */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── Floating Glassmorphism Toolbar ── */}
            <div className="absolute top-3 inset-x-3 z-20 mx-auto max-w-2xl pointer-events-none">
                <div className="flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-lg rounded-full border border-white/10 shadow-lg pointer-events-auto">

                    {/* Left: Page Navigation */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full flex-shrink-0"
                            onClick={() => goToPage(displayPage - 1)}
                            disabled={displayPage <= 1}
                            title="الصفحة السابقة"
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
                            disabled={numPages != null ? displayPage >= numPages : false}
                            title="الصفحة التالية"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Center: Zoom Controls (hidden on small screens) */}
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full"
                            onClick={() => handleZoom('out')}
                            disabled={scale <= 0.5}
                            title="تصغير"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                        </Button>
                        <div className="text-white font-mono text-xs px-2 min-w-[42px] text-center">
                            {Math.round(scale * 100)}%
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white rounded-full"
                            onClick={() => handleZoom('in')}
                            disabled={scale >= 3}
                            title="تكبير"
                        >
                            <ChevronLeft className="h-4 w-4 rotate-180" />
                        </Button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Bookmark */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                'h-8 w-8 rounded-full transition-colors flex-shrink-0',
                                isBookmarked
                                    ? 'text-yellow-400 hover:bg-yellow-400/20'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                            )}
                            onClick={() => onBookmarkToggle?.(displayPage)}
                            title={isBookmarked ? 'إزالة الإشارة المرجعية' : 'إضافة إشارة مرجعية'}
                        >
                            {isBookmarked
                                ? <BookmarkCheck className="h-4 w-4" />
                                : <BookmarkPlus className="h-4 w-4" />
                            }
                        </Button>

                        {/* Fullscreen */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white rounded-full hidden sm:flex flex-shrink-0"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>

                        {/* Open External */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white rounded-full hidden sm:flex flex-shrink-0"
                            onClick={openExternal}
                            title="فتح في تبويب جديد"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── PDF Scrollable Container ── */}
            {/* ref={scrollRef} — this is the ACTUAL scrolling element, used for scrollTop reads/writes */}
            <div
                ref={scrollRef}
                className="flex-1 w-full overflow-auto bg-gray-950 relative"
                onScroll={handleScroll}
            >
                {/* Error Overlay */}
                {renderError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90 z-10">
                        <div className="flex flex-col items-center gap-4 text-center px-8">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <div>
                                <p className="text-white font-semibold mb-2">فشل تحميل الكتاب</p>
                                <p className="text-gray-300 text-sm mb-5 max-w-xs">{renderError}</p>
                                <Button
                                    onClick={openExternal}
                                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                                    size="sm"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    فتح في تبويب جديد
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Initial Loading Overlay */}
                {isDocLoading && !renderError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                            <p className="text-sm text-gray-400">جاري تحميل الكتاب...</p>
                        </div>
                    </div>
                )}

                {/* ── PDF Document ── */}
                {!renderError && (
                    <div className="flex justify-center py-14">
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="flex items-center justify-center py-24">
                                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center py-24 text-red-400">
                                    <AlertCircle className="h-10 w-10 mb-2" />
                                    <p>فشل تحميل الملف</p>
                                </div>
                            }
                        >
                            {numPages &&
                                Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                                    const isInWindow = windowedPages.has(pageNum);
                                    return (
                                        <div
                                            key={pageNum}
                                            data-page={pageNum}
                                            ref={(el) => {
                                                if (el) pageRefs.current.set(pageNum, el);
                                                else pageRefs.current.delete(pageNum);
                                            }}
                                            className="mb-4 flex justify-center"
                                        >
                                            {isInWindow ? (
                                                /* Rendered Page */
                                                <Page
                                                    pageNumber={pageNum}
                                                    scale={scale}
                                                    renderTextLayer
                                                    renderAnnotationLayer
                                                    onRenderSuccess={
                                                        // Capture actual page height after first render
                                                        pageNum === 1
                                                            ? (page) => {
                                                                  const h = page.height ?? A4_PAGE_HEIGHT_PX;
                                                                  setPageHeight(h);
                                                              }
                                                            : undefined
                                                    }
                                                />
                                            ) : (
                                                /* Placeholder — maintains scroll position for out-of-window pages */
                                                <div
                                                    style={{
                                                        width: `${Math.round(595 * scale)}px`,
                                                        height: `${placeholderHeight}px`,
                                                        backgroundColor: 'rgb(7, 11, 22)',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <span className="text-gray-700 text-xs font-mono select-none">
                                                        {pageNum}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </Document>
                    </div>
                )}
            </div>

            {/* ── Small-screen bottom bar (sm breakpoint edge case) ── */}
            <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 border-0 shadow-lg text-xs text-gray-800"
                    onClick={openExternal}
                >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open PDF
                </Button>
            </div>
        </div>
    );
}
