'use client';

/**
 * PDFViewer — Professional cross-platform PDF reader
 *
 * iOS FIX (pdfjs-dist 5.x / react-pdf 10.x):
 *   iOS Safari / WKWebView blocks Web Workers. pdfjs tries to spawn one,
 *   fails silently, and returns a blank canvas.
 *
 *   The CORRECT fix for pdfjs 5.x is the "fake worker" pattern:
 *     globalThis.pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs')
 *   This sets globalThis.pdfjsWorker.WorkerMessageHandler which pdfjs checks
 *   in PDFWorker.#mainThreadWorkerMessageHandler → calls #setupFakeWorker()
 *   → runs entirely on the main thread. No Worker() is ever spawned.
 *
 *   `disableWorker: true` does NOT exist in pdfjs 5.x — silently ignored.
 *
 * Verified against: react-pdf@10.4.1, pdfjs-dist@5.4.296
 */

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
    Moon,
    Sun,
    SkipBack,
    SkipForward,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ─── Worker setup ─────────────────────────────────────────────────────────────
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Injects the pdfjs worker on the main thread for iOS WKWebView.
 * Call this before any PDF renders on iOS.
 *
 * How it works:
 *   pdfjs checks `globalThis.pdfjsWorker?.WorkerMessageHandler` before
 *   spawning a Worker. If found, it uses it on the main thread (fake worker
 *   mode) — no Worker() call is ever made, so WKWebView's restriction is bypassed.
 */
export async function initIOSWorker(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!(globalThis as any).pdfjsWorker) {
        const worker = await import('pdfjs-dist/build/pdf.worker.mjs');
        (globalThis as any).pdfjsWorker = worker;
    }
}

// ─── Device detection ─────────────────────────────────────────────────────────
function useDeviceInfo() {
    return useMemo(() => {
        if (typeof navigator === 'undefined') return { isIOS: false, isMobile: false };
        const ua = navigator.userAgent;
        const isIOS = /iphone|ipad|ipod/i.test(ua);
        const isMobile = isIOS || /android|mobile|blackberry|opera mini|iemobile/i.test(ua);
        return { isIOS, isMobile };
    }, []);
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

// ─── Root export ──────────────────────────────────────────────────────────────
export default function PDFViewer(props: PDFViewerProps) {
    const { isIOS, isMobile } = useDeviceInfo();
    const [workerReady, setWorkerReady] = useState(!isIOS);

    useEffect(() => {
        if (!isIOS) return;
        initIOSWorker().then(() => setWorkerReady(true));
    }, [isIOS]);

    if (!workerReady) {
        return (
            <div className="flex items-center justify-center h-[100dvh] bg-[#111318]">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
        );
    }

    return <UnifiedPDFViewer {...props} isIOS={isIOS} isMobile={isMobile} />;
}

const PAGE_BUFFER = 3;

/* ═══════════════════════════════════════════════════════════════════════════════
   UNIFIED VIEWER
═══════════════════════════════════════════════════════════════════════════════*/
function UnifiedPDFViewer({
    url,
    title = 'Document',
    currentPage: externalPage = 1,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPagesChange,
    isIOS,
    isMobile,
}: PDFViewerProps & { isIOS: boolean; isMobile: boolean }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [displayPage, setDisplayPage] = useState(externalPage);
    const [isDocLoading, setIsDocLoading] = useState(true);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInputVal, setPageInputVal] = useState('');
    const [containerWidth, setContainerWidth] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [pageHeight, setPageHeight] = useState(842);
    const [scale, setScale] = useState(1);
    const [swipeHintDismissed, setSwipeHintDismissed] = useState(false);
    const [slideAnim, setSlideAnim] = useState<'left' | 'right' | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isExternalNavRef = useRef(false);
    const displayPageRef = useRef(externalPage);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const pageInputRef = useRef<HTMLInputElement>(null);

    const fitScale = useMemo(() => {
        if (!containerWidth) return 1;
        return Math.max(0.3, Math.min(containerWidth / 595, 2.5));
    }, [containerWidth]);

    const effectiveScale = isMobile ? fitScale : scale;

    const windowedPages = useMemo<Set<number>>(() => {
        if (!numPages) return new Set();
        const start = Math.max(1, displayPage - PAGE_BUFFER);
        const end = Math.min(numPages, displayPage + PAGE_BUFFER);
        const set = new Set<number>();
        for (let i = start; i <= end; i++) set.add(i);
        return set;
    }, [displayPage, numPages]);

    useEffect(() => { displayPageRef.current = displayPage; }, [displayPage]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) setContainerWidth(e.contentRect.width);
        });
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (externalPage === displayPageRef.current) return;
        isExternalNavRef.current = true;
        displayPageRef.current = externalPage;
        setDisplayPage(externalPage);
        setTimeout(() => { scrollToPage(externalPage); isExternalNavRef.current = false; }, 60);
    }, [externalPage]);

    const scrollToPage = useCallback((page: number) => {
        const el = pageRefs.current.get(page);
        const scroller = scrollRef.current;
        if (el && scroller) scroller.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
    }, []);

    const goToPage = useCallback((page: number, direction?: 'left' | 'right') => {
        if (!numPages) return;
        const next = Math.max(1, Math.min(page, numPages));
        if (next === displayPageRef.current) return;

        if (direction && isMobile) {
            setSlideAnim(direction);
            setTimeout(() => setSlideAnim(null), 280);
        }

        isExternalNavRef.current = true;
        displayPageRef.current = next;
        setDisplayPage(next);
        onPageChange?.(next);
        setSwipeHintDismissed(true);

        if (!isMobile) {
            setTimeout(() => { scrollToPage(next); isExternalNavRef.current = false; }, 60);
        } else {
            isExternalNavRef.current = false;
        }
    }, [numPages, onPageChange, scrollToPage, isMobile]);

    const handleScroll = useCallback(() => {
        if (isExternalNavRef.current || isMobile) return;
        const scroller = scrollRef.current;
        if (!scroller || !numPages) return;
        if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
        scrollDebounceRef.current = setTimeout(() => {
            const s = scrollRef.current;
            if (!s) return;
            const viewMid = s.scrollTop + s.clientHeight / 2;
            let bestPage = displayPageRef.current, bestDist = Infinity;
            pageRefs.current.forEach((el, p) => {
                const dist = Math.abs(el.offsetTop + el.offsetHeight / 2 - viewMid);
                if (dist < bestDist) { bestDist = dist; bestPage = p; }
            });
            if (bestPage !== displayPageRef.current) {
                displayPageRef.current = bestPage;
                setDisplayPage(bestPage);
                onPageChange?.(bestPage);
            }
        }, 120);
    }, [numPages, onPageChange, isMobile]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        const dt = Date.now() - touchStartTime.current;
        if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.8 || dt > 500) return;
        if (dx < 0) goToPage(displayPageRef.current + 1, 'left');
        else goToPage(displayPageRef.current - 1, 'right');
    }, [goToPage]);

    const handleZoom = useCallback((dir: 'in' | 'out' | 'reset') => {
        setScale(prev => {
            if (dir === 'reset') return fitScale;
            return Math.max(0.4, Math.min(dir === 'in' ? prev + 0.15 : prev - 0.15, 3));
        });
    }, [fitScale]);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!isFullscreen) { await (containerRef.current as any).requestFullscreen?.(); setIsFullscreen(true); }
            else { await (document as any).exitFullscreen?.(); setIsFullscreen(false); }
        } catch { }
    }, [isFullscreen]);

    useEffect(() => {
        const h = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', h);
        return () => document.removeEventListener('fullscreenchange', h);
    }, []);

    useEffect(() => {
        if (isMobile) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === 'ArrowRight') goToPage(displayPageRef.current + 1);
            else if (e.key === 'ArrowLeft') goToPage(displayPageRef.current - 1);
            else if (e.key === '+' || e.key === '=') handleZoom('in');
            else if (e.key === '-') handleZoom('out');
            else if (e.key === '0') handleZoom('reset');
            else if (e.key === 'f') toggleFullscreen();
            else if (e.key === 'b') onBookmarkToggle?.(displayPageRef.current);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isMobile, goToPage, handleZoom, toggleFullscreen, onBookmarkToggle]);

    useEffect(() => () => { if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current); }, []);

    const setPageRef = useCallback((pageNum: number) => (el: HTMLDivElement | null) => {
        if (el) pageRefs.current.set(pageNum, el);
        else pageRefs.current.delete(pageNum);
    }, []);

    const submitPageInput = useCallback(() => {
        const p = parseInt(pageInputVal, 10);
        if (!isNaN(p)) goToPage(p);
        setShowPageInput(false);
        setPageInputVal('');
    }, [pageInputVal, goToPage]);

    useEffect(() => { if (showPageInput) pageInputRef.current?.focus(); }, [showPageInput]);

    const toolbarBg = isDark ? 'bg-[#1a1d24]/95 border-white/8' : 'bg-white/95 border-black/10';
    const pageBg = isDark ? 'bg-[#111318]' : 'bg-[#f0ebe3]';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const mutedText = isDark ? 'text-white/50' : 'text-gray-500';
    const progressPct = numPages ? ((displayPage - 1) / Math.max(numPages - 1, 1)) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex flex-col overflow-hidden transition-colors duration-300',
                pageBg,
                isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl shadow-2xl',
                isMobile ? 'h-[100dvh]' : 'h-[82vh]'
            )}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
            {/* Ambient glow */}
            {isDark && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/3 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-rose-600/6 rounded-full blur-3xl" />
                </div>
            )}

            {/* ══ TOP TOOLBAR ═══════════════════════════════════════════════ */}
            <div className={cn(
                'relative z-30 flex items-center gap-2 border-b backdrop-blur-xl flex-shrink-0',
                toolbarBg,
                isMobile ? 'px-3 py-2.5' : 'px-4 py-2'
            )}>
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    {!isMobile && (
                        <TBtn onClick={() => setShowSidebar(s => !s)} dark={isDark} title="Pages panel">
                            <Menu className="h-4 w-4" />
                        </TBtn>
                    )}
                    <span className={cn('text-sm font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!isMobile && (
                        <TBtn onClick={() => goToPage(1)} disabled={displayPage <= 1} dark={isDark} title="First page">
                            <SkipBack className="h-3.5 w-3.5" />
                        </TBtn>
                    )}
                    <TBtn onClick={() => goToPage(displayPage - 1, 'right')} disabled={displayPage <= 1} dark={isDark} title="Previous (←)">
                        <ChevronRight className="h-4 w-4" />
                    </TBtn>

                    {showPageInput ? (
                        <input
                            ref={pageInputRef}
                            type="number" min={1} max={numPages ?? 9999}
                            value={pageInputVal}
                            onChange={e => setPageInputVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') submitPageInput(); if (e.key === 'Escape') { setShowPageInput(false); setPageInputVal(''); } }}
                            onBlur={submitPageInput}
                            className={cn('w-14 text-center text-sm rounded-lg border px-1 py-0.5 outline-none', isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/20 text-gray-900')}
                        />
                    ) : (
                        <button
                            onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }}
                            className={cn('px-2.5 py-1 rounded-lg text-sm font-mono transition-colors whitespace-nowrap', isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-900')}
                            title="Click to jump to page"
                        >
                            <span className="font-bold">{displayPage}</span>
                            {numPages && <span className={cn('text-xs ml-1', mutedText)}>/ {numPages}</span>}
                        </button>
                    )}

                    <TBtn onClick={() => goToPage(displayPage + 1, 'left')} disabled={!!numPages && displayPage >= numPages} dark={isDark} title="Next (→)">
                        <ChevronLeft className="h-4 w-4" />
                    </TBtn>
                    {!isMobile && (
                        <TBtn onClick={() => goToPage(numPages ?? 1)} disabled={!!numPages && displayPage >= numPages} dark={isDark} title="Last page">
                            <SkipForward className="h-3.5 w-3.5" />
                        </TBtn>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-end gap-0.5">
                    {!isMobile && (
                        <div className={cn('hidden sm:flex items-center rounded-lg px-0.5 mr-1', isDark ? 'bg-white/5' : 'bg-black/5')}>
                            <TBtn onClick={() => handleZoom('out')} disabled={scale <= 0.4} dark={isDark} title="Zoom out (-)">
                                <ZoomOut className="h-3.5 w-3.5" />
                            </TBtn>
                            <button
                                onClick={() => handleZoom('reset')}
                                className={cn('text-xs font-mono px-1 min-w-[40px] text-center', isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900')}
                                title="Reset zoom (0)"
                            >
                                {Math.round(effectiveScale * 100)}%
                            </button>
                            <TBtn onClick={() => handleZoom('in')} disabled={scale >= 3} dark={isDark} title="Zoom in (+)">
                                <ZoomIn className="h-3.5 w-3.5" />
                            </TBtn>
                        </div>
                    )}
                    <TBtn onClick={() => onBookmarkToggle?.(displayPageRef.current)} dark={isDark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark page'}>
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-400" /> : <BookmarkPlus className="h-4 w-4" />}
                    </TBtn>
                    <TBtn onClick={() => setIsDark(d => !d)} dark={isDark} title="Toggle reading mode">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </TBtn>
                    {!isMobile && (
                        <TBtn onClick={toggleFullscreen} dark={isDark} title="Fullscreen (f)">
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </TBtn>
                    )}
                    <TBtn onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} dark={isDark} title="Open in new tab">
                        <ExternalLink className="h-4 w-4" />
                    </TBtn>
                </div>
            </div>

            {/* Progress bar */}
            <div className={cn('h-0.5 flex-shrink-0 relative z-20', isDark ? 'bg-white/5' : 'bg-black/8')}>
                <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300 ease-out" style={{ width: `${progressPct}%` }} />
            </div>

            {/* ══ MAIN AREA ══════════════════════════════════════════════════ */}
            <div className="flex flex-1 min-h-0 relative">

                {/* Sidebar (desktop) */}
                {!isMobile && showSidebar && (
                    <div className={cn('w-52 flex-shrink-0 border-r flex flex-col overflow-hidden', isDark ? 'bg-[#13161e] border-white/8' : 'bg-[#e8e2d9] border-black/8')}>
                        <div className={cn('flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-widest border-b flex-shrink-0', mutedText, isDark ? 'border-white/8' : 'border-black/8')}>
                            Pages
                            <button onClick={() => setShowSidebar(false)}><X className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2">
                            {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => goToPage(p)}
                                    className={cn('w-full text-left px-4 py-1.5 text-sm transition-colors',
                                        p === displayPage
                                            ? isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/10 text-gray-900 font-medium'
                                            : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                                    )}>
                                    Page {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scroll / swipe area */}
                <div
                    ref={scrollRef}
                    className={cn('flex-1 relative', isMobile ? 'overflow-hidden' : 'overflow-auto')}
                    onScroll={!isMobile ? handleScroll : undefined}
                    onTouchStart={isMobile ? handleTouchStart : undefined}
                    onTouchEnd={isMobile ? handleTouchEnd : undefined}
                >
                    {/* Loading */}
                    {isDocLoading && !renderError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                            <p className={cn('text-sm', mutedText)}>Loading document…</p>
                        </div>
                    )}

                    {/* Error */}
                    {renderError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5 px-8">
                            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', isDark ? 'bg-rose-500/10' : 'bg-rose-50')}>
                                <AlertCircle className="h-8 w-8 text-rose-500" />
                            </div>
                            <div className="text-center">
                                <p className={cn('font-semibold mb-1', textColor)}>Failed to load document</p>
                                <p className={cn('text-xs mb-5 max-w-xs leading-relaxed', mutedText)}>{renderError}</p>
                                <button
                                    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-2 mx-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm rounded-xl font-medium"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Open externally
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PDF pages */}
                    {!renderError && (
                        <div className={cn('flex flex-col items-center', isMobile ? 'h-full justify-center' : 'py-10')}>
                            <Document
                                file={url}
                                onLoadSuccess={({ numPages: p }) => { setNumPages(p); onTotalPagesChange?.(p); setIsDocLoading(false); setRenderError(null); }}
                                onLoadError={err => { setIsDocLoading(false); setRenderError(err.message); }}
                                loading={null}
                                error={null}
                            >
                                {isMobile ? (
                                    /* Single page view with slide animation */
                                    <div
                                        className="w-full flex justify-center"
                                        style={{
                                            transition: 'transform 0.25s ease, opacity 0.25s ease',
                                            transform: slideAnim === 'left' ? 'translateX(-40px)' : slideAnim === 'right' ? 'translateX(40px)' : 'translateX(0)',
                                            opacity: slideAnim ? 0 : 1,
                                        }}
                                    >
                                        {containerWidth > 0 && !isDocLoading && (
                                            <Page
                                                pageNumber={displayPage}
                                                scale={fitScale}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    /* Windowed multi-page scroll */
                                    numPages
                                        ? Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                                            <div key={pageNum} ref={setPageRef(pageNum)} className="mb-6 flex justify-center">
                                                {windowedPages.has(pageNum) ? (
                                                    <div className="shadow-2xl">
                                                        <Page
                                                            pageNumber={pageNum}
                                                            scale={effectiveScale}
                                                            renderTextLayer
                                                            renderAnnotationLayer
                                                            onRenderSuccess={pageNum === 1 ? pg => setPageHeight(pg.height) : undefined}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ width: 595 * effectiveScale, height: pageHeight * effectiveScale }} />
                                                )}
                                            </div>
                                        ))
                                        : null
                                )}
                            </Document>
                        </div>
                    )}

                    {/* Swipe hint */}
                    {isMobile && !swipeHintDismissed && !isDocLoading && !renderError && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full text-xs backdrop-blur-md', isDark ? 'bg-black/60 text-white/70' : 'bg-white/80 text-gray-600')}>
                                <span>←</span><span>Swipe to turn pages</span><span>→</span>
                            </div>
                        </div>
                    )}

                    {/* Invisible edge tap zones */}
                    {isMobile && !isDocLoading && !renderError && (
                        <>
                            <button onClick={() => goToPage(displayPage - 1, 'right')} disabled={displayPage <= 1} className="absolute left-0 top-0 w-1/5 h-full z-10 disabled:pointer-events-none" aria-label="Previous page" />
                            <button onClick={() => goToPage(displayPage + 1, 'left')} disabled={!!numPages && displayPage >= numPages} className="absolute right-0 top-0 w-1/5 h-full z-10 disabled:pointer-events-none" aria-label="Next page" />
                        </>
                    )}
                </div>
            </div>

            {/* ══ MOBILE BOTTOM BAR ════════════════════════════════════════ */}
            {isMobile && (
                <div className={cn('flex-shrink-0 border-t backdrop-blur-xl relative z-30', toolbarBg)}>
                    {!swipeHintDismissed && !isDocLoading && (
                        <div className={cn('flex items-center justify-between px-4 py-2 text-xs border-b', isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700')}>
                            <span>← Swipe or tap the buttons below to navigate →</span>
                            <button onClick={() => setSwipeHintDismissed(true)} className="ml-2 flex-shrink-0"><X className="h-3.5 w-3.5 opacity-60" /></button>
                        </div>
                    )}
                    <div className="flex items-center px-4 py-3 gap-3">
                        <button
                            onClick={() => goToPage(displayPage - 1, 'right')}
                            disabled={displayPage <= 1}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 select-none',
                                displayPage <= 1
                                    ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300'
                                    : isDark ? 'bg-white/10 text-white active:bg-white/15' : 'bg-black/8 text-gray-900'
                            )}
                        >
                            <ChevronRight className="h-4 w-4" /> Prev
                        </button>

                        <button
                            onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }}
                            className="flex flex-col items-center justify-center px-2 min-w-[56px]"
                        >
                            <span className={cn('text-xl font-bold font-mono leading-tight', textColor)}>{displayPage}</span>
                            <span className={cn('text-[10px] leading-none', mutedText)}>{numPages ? `of ${numPages}` : '—'}</span>
                        </button>

                        <button
                            onClick={() => goToPage(displayPage + 1, 'left')}
                            disabled={!!numPages && displayPage >= numPages}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 select-none',
                                !!numPages && displayPage >= numPages
                                    ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300'
                                    : 'bg-rose-600 text-white active:bg-rose-700 shadow-lg shadow-rose-900/30'
                            )}
                        >
                            Next <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile page jump sheet */}
            {isMobile && showPageInput && (
                <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => { setShowPageInput(false); setPageInputVal(''); }}>
                    <div className={cn('w-full rounded-t-3xl p-6 pb-10', isDark ? 'bg-[#1a1d24]' : 'bg-white')} onClick={e => e.stopPropagation()}>
                        <p className={cn('text-base font-semibold mb-4', textColor)}>Jump to page</p>
                        <input
                            ref={pageInputRef} type="number" min={1} max={numPages ?? 9999}
                            value={pageInputVal} onChange={e => setPageInputVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitPageInput()}
                            placeholder={`1 – ${numPages ?? '?'}`} autoFocus
                            className={cn('w-full text-center text-xl font-mono rounded-2xl border py-4 mb-4 outline-none', isDark ? 'bg-white/8 border-white/15 text-white' : 'bg-black/5 border-black/15 text-gray-900')}
                        />
                        <button onClick={submitPageInput} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-semibold text-base transition-colors">
                            Go to page
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop keyboard hint */}
            {!isMobile && !isDocLoading && (
                <div className={cn('absolute bottom-3 right-4 text-xs pointer-events-none opacity-25 hidden lg:block', mutedText)}>
                    ←→ navigate · +− zoom · f fullscreen · b bookmark
                </div>
            )}
        </div>
    );
}

function TBtn({ onClick, disabled, dark, title, children }: {
    onClick?: () => void; disabled?: boolean; dark: boolean; title?: string; children: React.ReactNode;
}) {
    return (
        <button onClick={onClick} disabled={disabled} title={title}
            className={cn(
                'p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center select-none',
                disabled
                    ? dark ? 'text-white/15 cursor-not-allowed' : 'text-gray-200 cursor-not-allowed'
                    : dark
                        ? 'text-white/60 hover:text-white hover:bg-white/10 active:scale-90 active:bg-white/15'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-black/8 active:scale-90'
            )}
        >
            {children}
        </button>
    );
}