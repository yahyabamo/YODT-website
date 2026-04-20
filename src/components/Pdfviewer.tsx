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
    ZoomIn,
    ZoomOut,
    Home,
    Menu,
    X,
    Moon,
    Sun,
    SkipBack,
    SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_BUFFER = 3;
const SCROLL_DEBOUNCE = 120;

// ─── Device Detection ─────────────────────────────────────────────────────────
function getDeviceInfo() {
    if (typeof window === 'undefined') return { isMobile: false, isIOS: false };
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isIOS || /android|mobile|blackberry|opera mini|iemobile/i.test(ua);
    return { isMobile, isIOS };
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PDFViewerProps {
    url: string;
    title?: string;
    currentPage?: number;
    isBookmarked?: boolean;
    onPageChange?: (page: number) => void;
    onBookmarkToggle?: (page: number) => void;
    onTotalPagesChange?: (pages: number) => void;
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function PDFViewer(props: PDFViewerProps) {
    const { isMobile } = useMemo(() => getDeviceInfo(), []);
    return <UnifiedPDFViewer {...props} isMobile={isMobile} />;
}

// ─── Unified Viewer ───────────────────────────────────────────────────────────
function UnifiedPDFViewer({
    url,
    title = 'Document',
    currentPage: externalPage = 1,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPagesChange,
    isMobile,
}: PDFViewerProps & { isMobile: boolean }) {
    const { isIOS } = useMemo(() => getDeviceInfo(), []);

    // ── State ─────────────────────────────────────────────────────────────────
    const [numPages, setNumPages] = useState<number | null>(null);
    const [displayPage, setDisplayPage] = useState(externalPage);
    const [isDocLoading, setIsDocLoading] = useState(true);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInputVal, setPageInputVal] = useState('');
    const [containerWidth, setContainerWidth] = useState(0);
    const [showTOC, setShowTOC] = useState(false);
    const [pageHeight, setPageHeight] = useState(842);
    const [scale, setScale] = useState(1);
    const [swipeHintDismissed, setSwipeHintDismissed] = useState(false);
    const [pageFlipAnim, setPageFlipAnim] = useState<'left' | 'right' | null>(null);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isExternalNavRef = useRef(false);
    const displayPageRef = useRef(externalPage);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const pageInputRef = useRef<HTMLInputElement>(null);

    // ── Computed scale to fit width ───────────────────────────────────────────
    const fitScale = useMemo(() => {
        if (!containerWidth) return 1;
        // A4 width at 1x = 595px. Fit to container with padding.
        const padding = isMobile ? 8 : 32;
        const targetWidth = containerWidth - padding;
        const baseWidth = 595;
        return Math.max(0.4, Math.min(targetWidth / baseWidth, isMobile ? 2 : 2.5));
    }, [containerWidth, isMobile]);

    const effectiveScale = isMobile ? fitScale : scale;

    // ── Windowed pages ────────────────────────────────────────────────────────
    const windowedPages = useMemo<Set<number>>(() => {
        if (!numPages) return new Set();
        const start = Math.max(1, displayPage - PAGE_BUFFER);
        const end = Math.min(numPages, displayPage + PAGE_BUFFER);
        const set = new Set<number>();
        for (let i = start; i <= end; i++) set.add(i);
        return set;
    }, [displayPage, numPages]);

    // ── Sync displayPageRef ───────────────────────────────────────────────────
    useEffect(() => {
        displayPageRef.current = displayPage;
    }, [displayPage]);

    // ── ResizeObserver for responsive scaling ─────────────────────────────────
    useEffect(() => {
        if (!scrollRef.current) return;
        resizeObserverRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserverRef.current.observe(scrollRef.current);
        setContainerWidth(scrollRef.current.clientWidth);
        return () => resizeObserverRef.current?.disconnect();
    }, []);

    // ── External page sync ────────────────────────────────────────────────────
    useEffect(() => {
        if (externalPage === displayPageRef.current) return;
        isExternalNavRef.current = true;
        displayPageRef.current = externalPage;
        setDisplayPage(externalPage);
        setTimeout(() => {
            scrollToPage(externalPage);
            isExternalNavRef.current = false;
        }, 60);
    }, [externalPage]);

    // ── Scroll to page ────────────────────────────────────────────────────────
    const scrollToPage = useCallback((page: number) => {
        const el = pageRefs.current.get(page);
        const scroller = scrollRef.current;
        if (el && scroller) {
            scroller.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
        }
    }, []);

    // ── Navigate to page ──────────────────────────────────────────────────────
    const goToPage = useCallback(
        (page: number, direction?: 'left' | 'right') => {
            if (!numPages) return;
            const next = Math.max(1, Math.min(page, numPages));
            if (next === displayPageRef.current) return;

            // Animate page flip
            if (direction) {
                setPageFlipAnim(direction);
                setTimeout(() => setPageFlipAnim(null), 300);
            }

            isExternalNavRef.current = true;
            displayPageRef.current = next;
            setDisplayPage(next);
            onPageChange?.(next);

            setTimeout(() => {
                scrollToPage(next);
                isExternalNavRef.current = false;
            }, 60);
        },
        [numPages, onPageChange, scrollToPage]
    );

    // ── Scroll handler ────────────────────────────────────────────────────────
    const handleScroll = useCallback(() => {
        if (isExternalNavRef.current) return;
        const scroller = scrollRef.current;
        if (!scroller || !numPages) return;

        if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
        scrollDebounceRef.current = setTimeout(() => {
            const scroller = scrollRef.current;
            if (!scroller) return;
            const viewMid = scroller.scrollTop + scroller.clientHeight / 2;
            let bestPage = displayPageRef.current;
            let bestDist = Infinity;

            pageRefs.current.forEach((el, pageNum) => {
                const elMid = el.offsetTop + el.offsetHeight / 2;
                const dist = Math.abs(elMid - viewMid);
                if (dist < bestDist) { bestDist = dist; bestPage = pageNum; }
            });

            if (bestPage !== displayPageRef.current) {
                displayPageRef.current = bestPage;
                setDisplayPage(bestPage);
                onPageChange?.(bestPage);
            }
        }, SCROLL_DEBOUNCE);
    }, [numPages, onPageChange]);

    // ── Touch / Swipe (mobile) ────────────────────────────────────────────────
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            const dy = e.changedTouches[0].clientY - touchStartY.current;
            const dt = Date.now() - touchStartTime.current;

            // Quick swipe: fast, horizontal, short
            if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.2 || dt > 600) return;

            if (dx < 0) {
                goToPage(displayPageRef.current + 1, 'left');
            } else {
                goToPage(displayPageRef.current - 1, 'right');
            }
            setSwipeHintDismissed(true);
        },
        [goToPage]
    );

    // ── PDF load ──────────────────────────────────────────────────────────────
    const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
        setNumPages(pages);
        onTotalPagesChange?.(pages);
        setIsDocLoading(false);
        setRenderError(null);
    }, [onTotalPagesChange]);

    const onDocumentLoadError = useCallback((error: Error) => {
        setIsDocLoading(false);
        setRenderError(error.message);
    }, []);

    // ── Zoom (desktop) ────────────────────────────────────────────────────────
    const handleZoom = useCallback((dir: 'in' | 'out' | 'reset') => {
        setScale(prev => {
            if (dir === 'reset') return fitScale;
            const next = dir === 'in' ? prev + 0.15 : prev - 0.15;
            return Math.max(0.4, Math.min(next, 3.0));
        });
    }, [fitScale]);

    // ── Fullscreen ────────────────────────────────────────────────────────────
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!isFullscreen) {
                await (containerRef.current as any).requestFullscreen?.();
                setIsFullscreen(true);
            } else {
                await (document as any).exitFullscreen?.();
                setIsFullscreen(false);
            }
        } catch { }
    }, [isFullscreen]);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        if (isMobile) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(displayPageRef.current + 1, 'left');
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(displayPageRef.current - 1, 'right');
            else if (e.key === '+' || e.key === '=') handleZoom('in');
            else if (e.key === '-') handleZoom('out');
            else if (e.key === '0') handleZoom('reset');
            else if (e.key === 'f') toggleFullscreen();
            else if (e.key === 'b') onBookmarkToggle?.(displayPageRef.current);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isMobile, goToPage, handleZoom, toggleFullscreen, onBookmarkToggle]);

    // ── Page input ────────────────────────────────────────────────────────────
    const submitPageInput = useCallback(() => {
        const p = parseInt(pageInputVal, 10);
        if (!isNaN(p)) goToPage(p);
        setShowPageInput(false);
        setPageInputVal('');
    }, [pageInputVal, goToPage]);

    useEffect(() => {
        if (showPageInput) pageInputRef.current?.focus();
    }, [showPageInput]);

    // ── Ref callback ──────────────────────────────────────────────────────────
    const setPageRef = useCallback((pageNum: number) => (el: HTMLDivElement | null) => {
        if (el) pageRefs.current.set(pageNum, el);
        else pageRefs.current.delete(pageNum);
    }, []);

    // ── Colors ────────────────────────────────────────────────────────────────
    const bg = isDark
        ? 'bg-[#111318]'
        : 'bg-[#f0ebe3]';
    const toolbarBg = isDark
        ? 'bg-[#1a1d24]/90 border-white/8'
        : 'bg-white/90 border-black/8';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const mutedText = isDark ? 'text-white/50' : 'text-gray-500';

    const progressPct = numPages ? ((displayPage - 1) / (numPages - 1)) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex flex-col overflow-hidden transition-colors duration-300',
                bg,
                isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl shadow-2xl',
                isMobile ? 'h-[100dvh] max-h-[100dvh]' : 'h-[82vh]'
            )}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
            {/* ── Ambient background ── */}
            <div className={cn(
                'absolute inset-0 pointer-events-none transition-opacity duration-500',
                isDark ? 'opacity-100' : 'opacity-0'
            )}>
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-600/6 rounded-full blur-3xl" />
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                TOP TOOLBAR
            ══════════════════════════════════════════════════════════════════ */}
            <div className={cn(
                'relative z-30 flex items-center gap-2 px-3 py-2 border-b backdrop-blur-xl flex-shrink-0',
                toolbarBg,
                isMobile ? 'px-3 py-2.5' : 'px-4 py-2'
            )}>

                {/* Left: Title */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    {!isMobile && (
                        <button
                            onClick={() => setShowTOC(!showTOC)}
                            className={cn('p-1.5 rounded-lg transition-colors', isDark ? 'hover:bg-white/10' : 'hover:bg-black/10', mutedText)}
                            title="Table of contents"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                    )}
                    <span className={cn('text-sm font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>
                        {title}
                    </span>
                </div>

                {/* Center: Page navigation */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* First page */}
                    {!isMobile && (
                        <ToolbarBtn onClick={() => goToPage(1, 'right')} disabled={displayPage <= 1} dark={isDark} title="First page">
                            <SkipBack className="h-3.5 w-3.5" />
                        </ToolbarBtn>
                    )}

                    <ToolbarBtn onClick={() => goToPage(displayPage - 1, 'right')} disabled={displayPage <= 1} dark={isDark} title="Previous page (←)">
                        <ChevronRight className="h-4 w-4" />
                    </ToolbarBtn>

                    {/* Page number — click to jump */}
                    {showPageInput ? (
                        <div className="flex items-center">
                            <input
                                ref={pageInputRef}
                                type="number"
                                min={1}
                                max={numPages ?? 9999}
                                value={pageInputVal}
                                onChange={e => setPageInputVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') submitPageInput(); if (e.key === 'Escape') { setShowPageInput(false); setPageInputVal(''); } }}
                                onBlur={submitPageInput}
                                className={cn(
                                    'w-14 text-center text-sm rounded-lg border px-1 py-0.5 outline-none',
                                    isDark
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-black/5 border-black/20 text-gray-900'
                                )}
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }}
                            className={cn(
                                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-mono transition-colors',
                                isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-900'
                            )}
                            title="Click to jump to page"
                        >
                            <span className="font-bold">{displayPage}</span>
                            {numPages && <span className={cn('text-xs', mutedText)}>/ {numPages}</span>}
                        </button>
                    )}

                    <ToolbarBtn onClick={() => goToPage(displayPage + 1, 'left')} disabled={!!numPages && displayPage >= numPages} dark={isDark} title="Next page (→)">
                        <ChevronLeft className="h-4 w-4" />
                    </ToolbarBtn>

                    {!isMobile && (
                        <ToolbarBtn onClick={() => goToPage(numPages ?? 1, 'left')} disabled={!!numPages && displayPage >= numPages} dark={isDark} title="Last page">
                            <SkipForward className="h-3.5 w-3.5" />
                        </ToolbarBtn>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex-1 flex items-center justify-end gap-1">
                    {/* Zoom — desktop only */}
                    {!isMobile && (
                        <div className={cn(
                            'hidden sm:flex items-center gap-1 rounded-lg px-1 mr-1',
                            isDark ? 'bg-white/5' : 'bg-black/5'
                        )}>
                            <ToolbarBtn onClick={() => handleZoom('out')} disabled={scale <= 0.4} dark={isDark} title="Zoom out (-)">
                                <ZoomOut className="h-3.5 w-3.5" />
                            </ToolbarBtn>
                            <button
                                onClick={() => handleZoom('reset')}
                                className={cn('text-xs font-mono px-1 min-w-[38px] transition-colors', isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900')}
                                title="Reset zoom (0)"
                            >
                                {Math.round(effectiveScale * 100)}%
                            </button>
                            <ToolbarBtn onClick={() => handleZoom('in')} disabled={scale >= 3} dark={isDark} title="Zoom in (+)">
                                <ZoomIn className="h-3.5 w-3.5" />
                            </ToolbarBtn>
                        </div>
                    )}

                    {/* Bookmark */}
                    <ToolbarBtn
                        onClick={() => onBookmarkToggle?.(displayPageRef.current)}
                        dark={isDark}
                        title={isBookmarked ? 'Remove bookmark (b)' : 'Bookmark this page (b)'}
                        active={isBookmarked}
                        activeClass="text-amber-400"
                    >
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                    </ToolbarBtn>

                    {/* Dark mode */}
                    <ToolbarBtn onClick={() => setIsDark(d => !d)} dark={isDark} title="Toggle reading mode">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </ToolbarBtn>

                    {/* Fullscreen — desktop */}
                    {!isMobile && (
                        <ToolbarBtn onClick={toggleFullscreen} dark={isDark} title="Fullscreen (f)">
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </ToolbarBtn>
                    )}

                    {/* External link */}
                    <ToolbarBtn onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} dark={isDark} title="Open in new tab">
                        <ExternalLink className="h-4 w-4" />
                    </ToolbarBtn>
                </div>
            </div>

            {/* ── Reading progress bar ── */}
            <div className={cn('h-0.5 flex-shrink-0 relative z-20', isDark ? 'bg-white/5' : 'bg-black/8')}>
                <div
                    className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MAIN AREA
            ══════════════════════════════════════════════════════════════════ */}
            <div className="flex flex-1 min-h-0 relative">

                {/* ── Sidebar / TOC ── */}
                {!isMobile && showTOC && (
                    <div className={cn(
                        'w-56 flex-shrink-0 border-r overflow-y-auto flex flex-col',
                        isDark ? 'bg-[#13161e] border-white/8' : 'bg-[#e8e2d9] border-black/8'
                    )}>
                        <div className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-widest border-b', mutedText, isDark ? 'border-white/8' : 'border-black/8')}>
                            Pages
                        </div>
                        <div className="flex-1 overflow-y-auto py-2">
                            {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => goToPage(p)}
                                    className={cn(
                                        'w-full text-left px-4 py-1.5 text-sm transition-colors',
                                        p === displayPage
                                            ? isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/10 text-gray-900 font-medium'
                                            : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                                    )}
                                >
                                    Page {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PDF Scroll Area ── */}
                <div
                    ref={scrollRef}
                    className={cn(
                        'flex-1 overflow-auto relative',
                        isMobile ? 'overflow-hidden' : ''
                    )}
                    onScroll={!isMobile ? handleScroll : undefined}
                    onTouchStart={isMobile ? handleTouchStart : undefined}
                    onTouchEnd={isMobile ? handleTouchEnd : undefined}
                >
                    {/* Loading overlay */}
                    {isDocLoading && !renderError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-2 border-rose-500/20 animate-pulse" />
                                <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-rose-500" />
                            </div>
                            <p className={cn('text-sm', mutedText)}>Loading document…</p>
                        </div>
                    )}

                    {/* Error overlay */}
                    {renderError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-6 px-8">
                            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', isDark ? 'bg-rose-500/10' : 'bg-rose-50')}>
                                <AlertCircle className="h-8 w-8 text-rose-500" />
                            </div>
                            <div className="text-center">
                                <p className={cn('font-semibold mb-1', textColor)}>Failed to load document</p>
                                <p className={cn('text-xs mb-4 max-w-xs', mutedText)}>{renderError}</p>
                                <button
                                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm rounded-xl transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Open in browser
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Pages ── */}
                    {!renderError && (
                        <div className={cn(
                            'flex flex-col items-center',
                            isMobile ? 'py-0 min-h-full justify-center' : 'py-8'
                        )}>
                            <Document
                                file={url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={null}
                                error={null}
                            >
                                {isMobile ? (
                                    /* Mobile: single page display, no scroll */
                                    <div
                                        className={cn(
                                            'transition-transform duration-300 ease-out w-full flex justify-center',
                                            pageFlipAnim === 'left' ? '-translate-x-4 opacity-0' :
                                                pageFlipAnim === 'right' ? 'translate-x-4 opacity-0' :
                                                    'translate-x-0 opacity-100'
                                        )}
                                    >
                                        {containerWidth > 0 && (
                                            <Page
                                                pageNumber={displayPage}
                                                scale={fitScale}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                className="shadow-2xl"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    /* Desktop: scrollable multi-page */
                                    numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                                        <div
                                            key={pageNum}
                                            ref={setPageRef(pageNum)}
                                            className="mb-6 flex justify-center"
                                        >
                                            {windowedPages.has(pageNum) ? (
                                                <div className="shadow-2xl">
                                                    <Page
                                                        pageNumber={pageNum}
                                                        scale={effectiveScale}
                                                        renderTextLayer
                                                        renderAnnotationLayer
                                                        onRenderSuccess={pageNum === 1 ? (pg) => setPageHeight(pg.height) : undefined}
                                                        className={isDark ? '' : 'rounded-sm'}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: 595 * effectiveScale,
                                                    height: pageHeight * effectiveScale,
                                                    background: 'transparent',
                                                }} />
                                            )}
                                        </div>
                                    ))
                                )}
                            </Document>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                MOBILE: BOTTOM NAV BAR
            ══════════════════════════════════════════════════════════════════ */}
            {isMobile && (
                <div className={cn(
                    'flex-shrink-0 z-30 border-t backdrop-blur-xl',
                    toolbarBg
                )}>
                    {/* Swipe hint */}
                    {!swipeHintDismissed && !isDocLoading && (
                        <div className={cn(
                            'flex items-center justify-between px-4 py-2 text-xs border-b',
                            isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        )}>
                            <span>← Swipe left/right to turn pages →</span>
                            <button onClick={() => setSwipeHintDismissed(true)}>
                                <X className="h-3.5 w-3.5 opacity-60" />
                            </button>
                        </div>
                    )}

                    {/* Bottom navigation row */}
                    <div className="flex items-center px-4 py-3 gap-3">
                        {/* Prev */}
                        <button
                            onClick={() => goToPage(displayPage - 1, 'right')}
                            disabled={displayPage <= 1}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95',
                                displayPage <= 1
                                    ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300'
                                    : isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/8 text-gray-800 hover:bg-black/12'
                            )}
                        >
                            <ChevronRight className="h-4 w-4" />
                            Previous
                        </button>

                        {/* Page indicator */}
                        <button
                            onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }}
                            className={cn(
                                'flex flex-col items-center justify-center px-3 min-w-[60px]',
                                mutedText
                            )}
                        >
                            <span className={cn('text-base font-bold font-mono', textColor)}>{displayPage}</span>
                            {numPages && <span className="text-xs">{numPages}</span>}
                        </button>

                        {/* Next */}
                        <button
                            onClick={() => goToPage(displayPage + 1, 'left')}
                            disabled={!!numPages && displayPage >= numPages}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95',
                                !!numPages && displayPage >= numPages
                                    ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300'
                                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/30'
                            )}
                        >
                            Next
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Mobile page jump modal ── */}
            {isMobile && showPageInput && (
                <div
                    className="absolute inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                    onClick={() => { setShowPageInput(false); setPageInputVal(''); }}
                >
                    <div
                        className={cn(
                            'w-full rounded-t-3xl p-6 pb-10',
                            isDark ? 'bg-[#1a1d24]' : 'bg-white'
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                        <p className={cn('text-base font-semibold mb-4', textColor)}>Go to page</p>
                        <input
                            ref={pageInputRef}
                            type="number"
                            min={1}
                            max={numPages ?? 9999}
                            value={pageInputVal}
                            onChange={e => setPageInputVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') submitPageInput(); }}
                            placeholder={`1 – ${numPages ?? '?'}`}
                            className={cn(
                                'w-full text-center text-lg font-mono rounded-xl border py-3 mb-4 outline-none',
                                isDark ? 'bg-white/8 border-white/15 text-white' : 'bg-black/5 border-black/15 text-gray-900'
                            )}
                        />
                        <button
                            onClick={submitPageInput}
                            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Go
                        </button>
                    </div>
                </div>
            )}

            {/* ── Keyboard shortcut hint (desktop) ── */}
            {!isMobile && !isDocLoading && (
                <div className={cn(
                    'absolute bottom-3 right-3 text-xs pointer-events-none opacity-30 hidden lg:block',
                    mutedText
                )}>
                    ←→ navigate · +− zoom · f fullscreen · b bookmark
                </div>
            )}
        </div>
    );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
    onClick,
    disabled,
    dark,
    title,
    active,
    activeClass = 'text-white',
    children,
}: {
    onClick?: () => void;
    disabled?: boolean;
    dark: boolean;
    title?: string;
    active?: boolean;
    activeClass?: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center',
                disabled
                    ? dark ? 'text-white/15 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                    : active
                        ? activeClass
                        : dark
                            ? 'text-white/60 hover:text-white hover:bg-white/10 active:scale-90'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-black/8 active:scale-90'
            )}
        >
            {children}
        </button>
    );
}