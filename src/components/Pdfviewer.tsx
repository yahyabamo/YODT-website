'use client';

/**
 * PDFViewer — Single file, zero import issues, works on every device.
 *
 * iOS strategy:
 *   Build a self-contained HTML page as a string, inject it into an
 *   <iframe srcdoc="...">. Inside that page we load pdf.js from the
 *   Mozilla CDN as a classic <script> (NOT an ES module / Worker).
 *   We set workerSrc = null so pdf.js runs entirely on the main thread
 *   of the iframe — no Worker is ever spawned, no WKWebView restriction
 *   is hit. We communicate with the parent via postMessage so the React
 *   shell has full page control (next, prev, jump, total pages).
 *
 * Desktop / Android strategy:
 *   react-pdf (pdfjs-dist) with windowed rendering, zoom, keyboard
 *   shortcuts, sidebar — all the features from the original viewer.
 *   This code path is completely skipped on iOS so pdfjs is never
 *   imported there.
 */

// ─── Shared imports (tiny, always loaded) ────────────────────────────────────
import {
    BookmarkPlus, BookmarkCheck, ExternalLink, Loader2, AlertCircle,
    ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Moon, Sun,
    SkipBack, SkipForward, Maximize2, Minimize2, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useState, useEffect, useRef, useCallback, useMemo,
    lazy, Suspense,
} from 'react';
import { supabase } from '@/integrations/supabase/client';

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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PDFViewer(props: PDFViewerProps) {
    const { isIOS, isMobile } = useDeviceInfo();
    if (isIOS) return <IOSPDFViewer {...props} />;
    return <DesktopLoader {...props} isMobile={isMobile} />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DESKTOP LOADER  (lazy — pdfjs never touches the iOS bundle)
═══════════════════════════════════════════════════════════════════════════════*/

// We define DesktopPDFViewer inline below and lazy-load it so the heavy
// pdfjs bundle is code-split away from iOS entirely.
const LazyDesktop = lazy(
    () => Promise.resolve({ default: DesktopPDFViewer })
);

function DesktopLoader(props: PDFViewerProps & { isMobile: boolean }) {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[82vh] bg-[#111318] rounded-2xl gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                <p className="text-sm text-white/60">جاري تحميل قارئ الكتب...</p>
            </div>
        }>
            <LazyDesktop {...props} />
        </Suspense>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   iOS VIEWER
   
   Architecture:
     React shell  ←─postMessage─→  iframe srcdoc (isolated JS context)
     
   The iframe srcdoc contains a complete standalone HTML page that:
     • Loads pdf.js 3.x from cdnjs (classic script, no ESM, no Worker)
     • Fetches the PDF as a Uint8Array passed in via postMessage
     • Renders the current page to a <canvas>
     • Reports numPages and pageRendered events back to React
     
   Why srcdoc instead of src?
     A blob: URL works but can be blocked by CSP on some hosts.
     srcdoc is always allowed and needs no URL at all.
     
   Why postMessage for PDF bytes?
     The iframe's JS cannot do a cross-origin fetch of a Supabase signed
     URL. We fetch in React (with auth) and transfer the ArrayBuffer into
     the iframe via postMessage with transferable ownership — zero copy.
═══════════════════════════════════════════════════════════════════════════════*/

/** Build the complete HTML document that runs inside the iframe */
function buildIframeHTML(): string {
    // We use pdf.js 3.11.174 — the last version with a reliable non-ESM CDN build.
    // 4.x and 5.x dropped the non-module UMD build which is what we need here.
    const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: #1a1a2e; overflow: hidden; }
  #canvas-wrap {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; touch-action: pan-x pan-y pinch-zoom;
  }
  canvas {
    display: block;
    max-width: 100%;
    height: auto;
    box-shadow: 0 4px 32px rgba(0,0,0,0.5);
  }
  #status {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.5); font-family: sans-serif; font-size: 14px;
  }
</style>
</head>
<body>
<div id="canvas-wrap"><canvas id="c"></canvas></div>
<div id="status">جاري التهيئة...</div>

<script src="${PDFJS_CDN}"></script>
<script>
(function() {
  // Disable Worker entirely — runs on main thread, no WKWebView restriction
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  var pdfDoc = null;
  var currentPage = 1;
  var rendering = false;
  var pendingPage = null;
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var status = document.getElementById('status');

  function setStatus(msg) { status.style.display = 'flex'; status.textContent = msg; }
  function hideStatus() { status.style.display = 'none'; }

  function renderPage(num) {
    if (rendering) { pendingPage = num; return; }
    rendering = true;
    currentPage = num;

    pdfDoc.getPage(num).then(function(page) {
      var vp = page.getViewport({ scale: 1 });
      var devicePx = window.devicePixelRatio || 1;
      var maxW = window.innerWidth * devicePx;
      var scale = maxW / (vp.width * devicePx);
      var scaled = page.getViewport({ scale: scale });

      canvas.width  = Math.floor(scaled.width  * devicePx);
      canvas.height = Math.floor(scaled.height * devicePx);
      canvas.style.width  = Math.floor(scaled.width)  + 'px';
      canvas.style.height = Math.floor(scaled.height) + 'px';

      page.render({ canvasContext: ctx, viewport: scaled, transform: [devicePx, 0, 0, devicePx, 0, 0] })
        .promise.then(function() {
          rendering = false;
          hideStatus();
          window.parent.postMessage({ type: 'pageRendered', page: num }, '*');
          if (pendingPage !== null && pendingPage !== num) {
            var next = pendingPage; pendingPage = null; renderPage(next);
          }
        });
    }).catch(function(e) {
      rendering = false;
      setStatus('خطأ في تحميل الصفحة');
      window.parent.postMessage({ type: 'error', message: String(e) }, '*');
    });
  }

  // Touch swipe detection
  var tx0 = 0, ty0 = 0, tt0 = 0;
  document.addEventListener('touchstart', function(e) {
    tx0 = e.touches[0].clientX;
    ty0 = e.touches[0].clientY;
    tt0 = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - tx0;
    var dy = e.changedTouches[0].clientY - ty0;
    var dt = Date.now() - tt0;
    if (dt > 500 || Math.abs(dx) < 40) return;
    if (Math.abs(dy) > Math.abs(dx) * 0.9) return;
    window.parent.postMessage({ type: dx < 0 ? 'swipeLeft' : 'swipeRight' }, '*');
  }, { passive: true });

  // Messages from React shell
  window.addEventListener('message', function(e) {
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'loadPDF') {
      setStatus('جاري تحميل الملف...');
      var loadingTask = pdfjsLib.getDocument({ data: d.data });
      loadingTask.promise.then(function(doc) {
        pdfDoc = doc;
        window.parent.postMessage({ type: 'numPages', count: doc.numPages }, '*');
        renderPage(d.startPage || 1);
      }).catch(function(e) {
        setStatus('فشل تحميل الملف: ' + e.message);
        window.parent.postMessage({ type: 'error', message: e.message }, '*');
      });
    }

    if (d.type === 'goToPage' && pdfDoc) {
      var p = Math.max(1, Math.min(d.page, pdfDoc.numPages));
      renderPage(p);
    }
  });

  // Tell parent we're ready
  window.parent.postMessage({ type: 'ready' }, '*');
})();
</script>
</body>
</html>`;
}

type IOSLoadState = 'fetching' | 'ready' | 'error';

function IOSPDFViewer({
    url,
    title = 'Document',
    currentPage: externalPage = 1,
    isBookmarked = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPagesChange,
}: PDFViewerProps) {
    const [loadState, setLoadState] = useState<IOSLoadState>('fetching');
    const [errorMsg, setErrorMsg] = useState('');
    const [numPages, setNumPages] = useState(0);
    const [displayPage, setDisplayPage] = useState(externalPage);
    const [isDark, setIsDark] = useState(true);
    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInputVal, setPageInputVal] = useState('');

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const pdfBytesRef = useRef<ArrayBuffer | null>(null);
    const iframeReadyRef = useRef(false);
    const displayPageRef = useRef(externalPage);
    const pageInputRef = useRef<HTMLInputElement>(null);

    // Lock viewport height once — never trust CSS dvh/vh on iOS
    const [viewH] = useState(() =>
        typeof window !== 'undefined' ? window.innerHeight : 700
    );

    // ── 1. Fetch PDF bytes (with Supabase auth fallback) ─────────────────────
    useEffect(() => {
        let cancelled = false;
        setLoadState('fetching');

        const fetchPDF = async () => {
            try {
                let buffer: ArrayBuffer | null = null;

                // Try direct fetch first (public URL)
                const res = await fetch(url, { cache: 'force-cache' }).catch(() => null);
                if (res && res.ok) {
                    buffer = await res.arrayBuffer();
                } else {
                    // Supabase authenticated download
                    const match = url.match(
                        /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^?]+)/
                    );
                    if (match) {
                        const fullPath = match[1];
                        const slashIdx = fullPath.indexOf('/');
                        const bucket = fullPath.slice(0, slashIdx);
                        const path = fullPath.slice(slashIdx + 1);
                        const { data, error } = await supabase.storage.from(bucket).download(path);
                        if (error || !data) throw new Error(error?.message ?? 'Download failed');
                        buffer = await data.arrayBuffer();
                    } else {
                        throw new Error(res ? `HTTP ${res.status}` : 'Network error');
                    }
                }

                if (cancelled) return;
                pdfBytesRef.current = buffer;
                setLoadState('ready');
            } catch (e: any) {
                if (!cancelled) { setErrorMsg(e?.message ?? 'Unknown error'); setLoadState('error'); }
            }
        };

        fetchPDF();
        return () => { cancelled = true; };
    }, [url]);

    // ── 2. Send PDF to iframe once both are ready ────────────────────────────
    const sendPDFToIframe = useCallback(() => {
        if (!iframeReadyRef.current || !pdfBytesRef.current || !iframeRef.current?.contentWindow) return;
        // Transfer ownership of the ArrayBuffer — zero-copy, instant
        const copy = pdfBytesRef.current.slice(0);
        iframeRef.current.contentWindow.postMessage(
            { type: 'loadPDF', data: copy, startPage: displayPageRef.current },
            '*',
            [copy]
        );
    }, []);

    // ── 3. Listen for messages from iframe ───────────────────────────────────
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            const d = e.data;
            if (!d?.type) return;

            if (d.type === 'ready') {
                iframeReadyRef.current = true;
                sendPDFToIframe();
            }
            if (d.type === 'numPages') {
                setNumPages(d.count);
                onTotalPagesChange?.(d.count);
            }
            if (d.type === 'pageRendered') {
                setDisplayPage(d.page);
                displayPageRef.current = d.page;
                onPageChange?.(d.page);
            }
            if (d.type === 'swipeLeft') {
                // swipe left = next page
                goToPage(displayPageRef.current + 1);
            }
            if (d.type === 'swipeRight') {
                goToPage(displayPageRef.current - 1);
            }
            if (d.type === 'error') {
                console.error('[PDF iframe]', d.message);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [sendPDFToIframe, onTotalPagesChange, onPageChange]);

    // When PDF bytes arrive and iframe was already ready
    useEffect(() => {
        if (loadState === 'ready') sendPDFToIframe();
    }, [loadState, sendPDFToIframe]);

    // ── 4. Navigation ────────────────────────────────────────────────────────
    const goToPage = useCallback((page: number) => {
        if (!numPages && page < 1) return;
        const next = Math.max(1, numPages ? Math.min(page, numPages) : page);
        if (next === displayPageRef.current) return;
        displayPageRef.current = next;
        iframeRef.current?.contentWindow?.postMessage({ type: 'goToPage', page: next }, '*');
    }, [numPages]);

    // Sync external page prop changes
    useEffect(() => {
        if (externalPage !== displayPageRef.current) goToPage(externalPage);
    }, [externalPage, goToPage]);

    const submitPageInput = useCallback(() => {
        const p = parseInt(pageInputVal, 10);
        if (!isNaN(p)) goToPage(p);
        setShowPageInput(false);
        setPageInputVal('');
    }, [pageInputVal, goToPage]);

    useEffect(() => { if (showPageInput) pageInputRef.current?.focus(); }, [showPageInput]);

    const pageBg = isDark ? 'bg-[#111318]' : 'bg-[#f0ebe3]';
    const toolbarBg = isDark ? 'bg-[#1a1d24]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const mutedText = isDark ? 'text-white/50' : 'text-gray-400';
    const borderCol = isDark ? 'border-white/8' : 'border-black/10';
    const progressPct = numPages > 1 ? ((displayPage - 1) / (numPages - 1)) * 100 : 0;

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loadState === 'fetching') {
        return (
            <div className="flex flex-col items-center justify-center bg-[#111318] rounded-2xl shadow-2xl gap-4"
                style={{ height: viewH }}>
                <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                <p className="text-sm text-white/60">جاري تحميل الكتاب...</p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (loadState === 'error') {
        return (
            <div className="flex flex-col items-center justify-center bg-[#111318] rounded-2xl shadow-2xl gap-5 px-8"
                style={{ height: viewH }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="text-white font-semibold mb-1">تعذّر تحميل الملف</p>
                    <p className="text-xs text-white/40 mb-5 max-w-xs leading-relaxed">{errorMsg}</p>
                    <button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-2 mx-auto px-5 py-3 bg-rose-600 text-white text-sm rounded-xl font-medium">
                        <ExternalLink className="h-4 w-4" /> فتح في المتصفح
                    </button>
                </div>
            </div>
        );
    }

    // ── Viewer ────────────────────────────────────────────────────────────────
    return (
        <div className={cn('flex flex-col rounded-2xl shadow-2xl overflow-hidden', pageBg)}
            style={{ height: viewH }}>

            {/* ── Top toolbar ── */}
            <div className={cn('flex items-center gap-2 px-4 py-3 border-b flex-shrink-0', toolbarBg, borderCol)}>
                {/* Title */}
                <span className={cn('text-sm font-medium truncate flex-1', isDark ? 'text-white/80' : 'text-gray-800')}>
                    {title}
                </span>

                {/* Page counter — tap to jump */}
                <button
                    onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }}
                    className={cn('px-3 py-1 rounded-lg font-mono text-sm flex items-center gap-1', isDark ? 'bg-white/8 text-white' : 'bg-black/5 text-gray-900')}
                >
                    <span className="font-bold">{displayPage}</span>
                    {numPages > 0 && <span className={cn('text-xs', mutedText)}>/ {numPages}</span>}
                </button>

                {/* Dark mode toggle */}
                <button onClick={() => setIsDark(d => !d)}
                    className={cn('p-2 rounded-xl transition-colors', isDark ? 'text-white/60 active:bg-white/10' : 'text-gray-500 active:bg-black/5')}>
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Bookmark */}
                <button onClick={() => onBookmarkToggle?.(displayPage)}
                    className={cn('p-2 rounded-xl transition-colors', isDark ? 'text-white/60 active:bg-white/10' : 'text-gray-500 active:bg-black/5')}
                    aria-label={isBookmarked ? 'إزالة الإشارة' : 'إضافة إشارة'}>
                    {isBookmarked
                        ? <BookmarkCheck className="h-4 w-4 text-amber-400" />
                        : <BookmarkPlus className="h-4 w-4" />}
                </button>

                {/* Open externally */}
                <button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                    className={cn('p-2 rounded-xl transition-colors', isDark ? 'text-white/60 active:bg-white/10' : 'text-gray-500 active:bg-black/5')}>
                    <ExternalLink className="h-4 w-4" />
                </button>
            </div>

            {/* Progress bar */}
            <div className={cn('h-0.5 flex-shrink-0', isDark ? 'bg-white/5' : 'bg-black/8')}>
                <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }} />
            </div>

            {/* ── PDF iframe ── */}
            <iframe
                ref={iframeRef}
                srcDoc={buildIframeHTML()}
                title={title}
                sandbox="allow-scripts"
                className="flex-1 w-full border-0"
                style={{ background: isDark ? '#1a1a2e' : '#f0ebe3' }}
            />

            {/* ── Bottom nav bar ── */}
            <div className={cn('flex-shrink-0 border-t', toolbarBg, borderCol)}>
                <div className="flex items-center px-4 py-3 gap-3">
                    {/* Next */}
                    <button
                        onClick={() => goToPage(displayPage + 1)}
                        disabled={numPages > 0 && displayPage >= numPages}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 select-none',
                            numPages > 0 && displayPage >= numPages
                                ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300'
                                : 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                        )}
                    >
                        التالية
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* First / Last page jump buttons */}
                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => goToPage(numPages)} disabled={!numPages || displayPage >= numPages}
                            className={cn('p-1.5 rounded-lg', (!numPages || displayPage >= numPages) ? 'opacity-20' : isDark ? 'text-white/50 active:bg-white/10' : 'text-gray-400 active:bg-black/5')}>
                            <SkipForward className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => goToPage(1)} disabled={displayPage <= 1}
                            className={cn('p-1.5 rounded-lg', displayPage <= 1 ? 'opacity-20' : isDark ? 'text-white/50 active:bg-white/10' : 'text-gray-400 active:bg-black/5')}>
                            <SkipBack className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Prev */}
                    <button
                        onClick={() => goToPage(displayPage - 1)}
                        disabled={displayPage <= 1}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 select-none',
                            displayPage <= 1
                                ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300'
                                : isDark ? 'bg-white/10 text-white' : 'bg-black/8 text-gray-900'
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                        السابقة
                    </button>
                </div>
            </div>

            {/* ── Page jump modal ── */}
            {showPageInput && (
                <div className="absolute inset-0 z-50 flex items-end"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                    onClick={() => { setShowPageInput(false); setPageInputVal(''); }}>
                    <div className={cn('w-full rounded-t-3xl p-6 pb-10', isDark ? 'bg-[#1a1d24]' : 'bg-white')}
                        onClick={e => e.stopPropagation()}>
                        <p className={cn('text-base font-semibold mb-4', textColor)}>انتقل إلى صفحة</p>
                        <input
                            ref={pageInputRef}
                            type="number" min={1} max={numPages || 9999}
                            value={pageInputVal}
                            onChange={e => setPageInputVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitPageInput()}
                            placeholder={`1 – ${numPages || '?'}`}
                            autoFocus
                            className={cn(
                                'w-full text-center text-xl font-mono rounded-2xl border py-4 mb-4 outline-none',
                                isDark ? 'bg-white/8 border-white/15 text-white' : 'bg-black/5 border-black/15 text-gray-900'
                            )}
                        />
                        <button onClick={submitPageInput}
                            className="w-full py-3.5 bg-rose-600 text-white rounded-2xl font-semibold text-base">
                            انتقل
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DESKTOP VIEWER  (react-pdf / pdfjs — never loaded on iOS)
═══════════════════════════════════════════════════════════════════════════════*/

// These imports only execute when DesktopPDFViewer is actually rendered
// (which only happens on non-iOS). On iOS the lazy() boundary prevents
// this module from being evaluated at all.
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PAGE_BUFFER = 3;

function DesktopPDFViewer({
    url,
    title = 'Document',
    currentPage: externalPage = 1,
    isBookmarked = false,
    isMobile = false,
    onPageChange,
    onBookmarkToggle,
    onTotalPagesChange,
}: PDFViewerProps & { isMobile?: boolean }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [displayPage, setDisplayPage] = useState(externalPage);
    const [isDocLoading, setIsDocLoading] = useState(true);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [showPageInput, setShowPageInput] = useState(false);
    const [pageInputVal, setPageInputVal] = useState('');
    const [containerWidth, setContainerWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 800
    );
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
        const s = new Set<number>();
        for (let i = Math.max(1, displayPage - PAGE_BUFFER); i <= Math.min(numPages, displayPage + PAGE_BUFFER); i++) s.add(i);
        return s;
    }, [displayPage, numPages]);

    useEffect(() => { displayPageRef.current = displayPage; }, [displayPage]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
        const ro = new ResizeObserver(entries => {
            for (const e of entries) if (e.contentRect.width > 0) setContainerWidth(e.contentRect.width);
        });
        ro.observe(el);
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
        const sc = scrollRef.current;
        if (el && sc) sc.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
    }, []);

    const goToPage = useCallback((page: number, dir?: 'left' | 'right') => {
        if (!numPages) return;
        const next = Math.max(1, Math.min(page, numPages));
        if (next === displayPageRef.current) return;
        if (dir && isMobile) { setSlideAnim(dir); setTimeout(() => setSlideAnim(null), 280); }
        isExternalNavRef.current = true;
        displayPageRef.current = next;
        setDisplayPage(next);
        onPageChange?.(next);
        setSwipeHintDismissed(true);
        if (!isMobile) { setTimeout(() => { scrollToPage(next); isExternalNavRef.current = false; }, 60); }
        else isExternalNavRef.current = false;
    }, [numPages, onPageChange, scrollToPage, isMobile]);

    const handleScroll = useCallback(() => {
        if (isExternalNavRef.current || isMobile) return;
        const sc = scrollRef.current;
        if (!sc || !numPages) return;
        if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
        scrollDebounceRef.current = setTimeout(() => {
            const s = scrollRef.current; if (!s) return;
            const mid = s.scrollTop + s.clientHeight / 2;
            let best = displayPageRef.current, bestD = Infinity;
            pageRefs.current.forEach((el, p) => {
                const d = Math.abs(el.offsetTop + el.offsetHeight / 2 - mid);
                if (d < bestD) { bestD = d; best = p; }
            });
            if (best !== displayPageRef.current) { displayPageRef.current = best; setDisplayPage(best); onPageChange?.(best); }
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
        setScale(prev => dir === 'reset' ? fitScale : Math.max(0.4, Math.min(dir === 'in' ? prev + 0.15 : prev - 0.15, 3)));
    }, [fitScale]);

    const supportsFullscreen = typeof document !== 'undefined' && !!(document.documentElement as any).requestFullscreen;

    const toggleFullscreen = useCallback(async () => {
        if (!supportsFullscreen || !containerRef.current) return;
        try {
            if (!isFullscreen) { await (containerRef.current as any).requestFullscreen(); setIsFullscreen(true); }
            else { await document.exitFullscreen(); setIsFullscreen(false); }
        } catch { }
    }, [isFullscreen, supportsFullscreen]);

    useEffect(() => {
        if (!supportsFullscreen) return;
        const h = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', h);
        return () => document.removeEventListener('fullscreenchange', h);
    }, [supportsFullscreen]);

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

    const setPageRef = useCallback((n: number) => (el: HTMLDivElement | null) => {
        if (el) pageRefs.current.set(n, el); else pageRefs.current.delete(n);
    }, []);

    const submitPageInput = useCallback(() => {
        const p = parseInt(pageInputVal, 10);
        if (!isNaN(p)) goToPage(p);
        setShowPageInput(false); setPageInputVal('');
    }, [pageInputVal, goToPage]);

    useEffect(() => { if (showPageInput) pageInputRef.current?.focus(); }, [showPageInput]);

    const toolbarBg = isDark ? 'bg-[#1a1d24] border-white/8' : 'bg-white border-black/10';
    const pageBg = isDark ? 'bg-[#111318]' : 'bg-[#f0ebe3]';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const mutedText = isDark ? 'text-white/50' : 'text-gray-500';
    const progressPct = numPages ? ((displayPage - 1) / Math.max(numPages - 1, 1)) * 100 : 0;

    return (
        <div ref={containerRef}
            className={cn('relative flex flex-col overflow-hidden transition-colors duration-300', pageBg, isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl shadow-2xl')}
            style={{ height: isMobile ? window.innerHeight : '82vh', fontFamily: "'Georgia','Times New Roman',serif" }}>

            {isDark && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/3 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-rose-600/6 rounded-full blur-3xl" />
                </div>
            )}

            {/* Toolbar */}
            <div className={cn('relative z-30 flex items-center gap-2 border-b flex-shrink-0', toolbarBg, isMobile ? 'px-3 py-2.5' : 'px-4 py-2')}>
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    {!isMobile && <TBtn onClick={() => setShowSidebar(s => !s)} dark={isDark}><Menu className="h-4 w-4" /></TBtn>}
                    <span className={cn('text-sm font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>{title}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!isMobile && <TBtn onClick={() => goToPage(1)} disabled={displayPage <= 1} dark={isDark}><SkipBack className="h-3.5 w-3.5" /></TBtn>}
                    <TBtn onClick={() => goToPage(displayPage - 1, 'right')} disabled={displayPage <= 1} dark={isDark}><ChevronRight className="h-4 w-4" /></TBtn>
                    {showPageInput ? (
                        <input ref={pageInputRef} type="number" min={1} max={numPages ?? 9999} value={pageInputVal}
                            onChange={e => setPageInputVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') submitPageInput(); if (e.key === 'Escape') { setShowPageInput(false); setPageInputVal(''); } }}
                            onBlur={submitPageInput}
                            className={cn('w-14 text-center text-sm rounded-lg border px-1 py-0.5 outline-none', isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/20 text-gray-900')} />
                    ) : (
                        <button onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }}
                            className={cn('px-2.5 py-1 rounded-lg text-sm font-mono whitespace-nowrap', isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-gray-900')}>
                            <span className="font-bold">{displayPage}</span>
                            {numPages && <span className={cn('text-xs ml-1', mutedText)}>/ {numPages}</span>}
                        </button>
                    )}
                    <TBtn onClick={() => goToPage(displayPage + 1, 'left')} disabled={!!numPages && displayPage >= numPages} dark={isDark}><ChevronLeft className="h-4 w-4" /></TBtn>
                    {!isMobile && <TBtn onClick={() => goToPage(numPages ?? 1)} disabled={!!numPages && displayPage >= numPages} dark={isDark}><SkipForward className="h-3.5 w-3.5" /></TBtn>}
                </div>
                <div className="flex-1 flex items-center justify-end gap-0.5">
                    {!isMobile && (
                        <div className={cn('hidden sm:flex items-center rounded-lg px-0.5 mr-1', isDark ? 'bg-white/5' : 'bg-black/5')}>
                            <TBtn onClick={() => handleZoom('out')} disabled={scale <= 0.4} dark={isDark}><ZoomOut className="h-3.5 w-3.5" /></TBtn>
                            <button onClick={() => handleZoom('reset')} className={cn('text-xs font-mono px-1 min-w-[40px] text-center', isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900')}>
                                {Math.round(effectiveScale * 100)}%
                            </button>
                            <TBtn onClick={() => handleZoom('in')} disabled={scale >= 3} dark={isDark}><ZoomIn className="h-3.5 w-3.5" /></TBtn>
                        </div>
                    )}
                    <TBtn onClick={() => onBookmarkToggle?.(displayPageRef.current)} dark={isDark}>
                        {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-400" /> : <BookmarkPlus className="h-4 w-4" />}
                    </TBtn>
                    <TBtn onClick={() => setIsDark(d => !d)} dark={isDark}>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</TBtn>
                    {!isMobile && supportsFullscreen && (
                        <TBtn onClick={toggleFullscreen} dark={isDark}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</TBtn>
                    )}
                    <TBtn onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} dark={isDark}><ExternalLink className="h-4 w-4" /></TBtn>
                </div>
            </div>

            {/* Progress */}
            <div className={cn('h-0.5 flex-shrink-0 relative z-20', isDark ? 'bg-white/5' : 'bg-black/8')}>
                <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Main area */}
            <div className="flex flex-1 min-h-0 relative">
                {!isMobile && showSidebar && (
                    <div className={cn('w-52 flex-shrink-0 border-r flex flex-col overflow-hidden', isDark ? 'bg-[#13161e] border-white/8' : 'bg-[#e8e2d9] border-black/8')}>
                        <div className={cn('flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-widest border-b flex-shrink-0', mutedText, isDark ? 'border-white/8' : 'border-black/8')}>
                            Pages <button onClick={() => setShowSidebar(false)}><X className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2">
                            {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => goToPage(p)}
                                    className={cn('w-full text-left px-4 py-1.5 text-sm transition-colors',
                                        p === displayPage
                                            ? isDark ? 'bg-white/10 text-white font-medium' : 'bg-black/10 text-gray-900 font-medium'
                                            : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                                    )}>Page {p}</button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={scrollRef}
                    className={cn('flex-1 relative', isMobile ? 'overflow-hidden' : 'overflow-auto')}
                    onScroll={!isMobile ? handleScroll : undefined}
                    onTouchStart={isMobile ? handleTouchStart : undefined}
                    onTouchEnd={isMobile ? handleTouchEnd : undefined}>

                    {isDocLoading && !renderError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                            <p className={cn('text-sm', mutedText)}>Loading document…</p>
                        </div>
                    )}

                    {renderError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5 px-8">
                            <AlertCircle className="h-8 w-8 text-rose-500" />
                            <p className={cn('font-semibold', textColor)}>Failed to load</p>
                            <p className={cn('text-xs text-center max-w-xs', mutedText)}>{renderError}</p>
                            <button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} className="flex items-center gap-2 px-5 py-3 bg-rose-600 text-white text-sm rounded-xl">
                                <ExternalLink className="h-4 w-4" /> Open externally
                            </button>
                        </div>
                    )}

                    {!renderError && (
                        <div className={cn('flex flex-col items-center', isMobile ? 'h-full justify-center' : 'py-10')}>
                            <Document file={url}
                                onLoadSuccess={({ numPages: p }) => { setNumPages(p); onTotalPagesChange?.(p); setIsDocLoading(false); setRenderError(null); }}
                                onLoadError={err => { setIsDocLoading(false); setRenderError(err.message); }}
                                loading={null} error={null}>
                                {isMobile ? (
                                    <div className="w-full flex justify-center" style={{
                                        transition: 'transform 0.25s ease, opacity 0.25s ease',
                                        transform: slideAnim === 'left' ? 'translateX(-40px)' : slideAnim === 'right' ? 'translateX(40px)' : 'translateX(0)',
                                        opacity: slideAnim ? 0 : 1,
                                    }}>
                                        {containerWidth > 0 && <Page pageNumber={displayPage} scale={fitScale} renderTextLayer={false} renderAnnotationLayer={false} />}
                                    </div>
                                ) : (
                                    numPages ? Array.from({ length: numPages }, (_, i) => i + 1).map(n => (
                                        <div key={n} ref={setPageRef(n)} className="mb-6 flex justify-center">
                                            {windowedPages.has(n)
                                                ? <div className="shadow-2xl"><Page pageNumber={n} scale={effectiveScale} renderTextLayer renderAnnotationLayer onRenderSuccess={n === 1 ? (pg: any) => setPageHeight(pg.height) : undefined} /></div>
                                                : <div style={{ width: 595 * effectiveScale, height: pageHeight * effectiveScale }} />}
                                        </div>
                                    )) : null
                                )}
                            </Document>
                        </div>
                    )}

                    {isMobile && !swipeHintDismissed && !isDocLoading && !renderError && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full text-xs', isDark ? 'bg-black/70 text-white/70' : 'bg-white/90 text-gray-600')}>
                                ← Swipe to turn pages →
                            </div>
                        </div>
                    )}

                    {isMobile && !isDocLoading && !renderError && (
                        <>
                            <button onClick={() => goToPage(displayPage - 1, 'right')} disabled={displayPage <= 1} className="absolute left-0 top-0 w-1/5 h-full z-10 disabled:pointer-events-none" aria-label="Previous page" />
                            <button onClick={() => goToPage(displayPage + 1, 'left')} disabled={!!numPages && displayPage >= numPages} className="absolute right-0 top-0 w-1/5 h-full z-10 disabled:pointer-events-none" aria-label="Next page" />
                        </>
                    )}
                </div>
            </div>

            {/* Mobile bottom bar */}
            {isMobile && (
                <div className={cn('flex-shrink-0 border-t relative z-30', toolbarBg)}>
                    <div className="flex items-center px-4 py-3 gap-3">
                        <button onClick={() => goToPage(displayPage + 1, 'left')} disabled={!!numPages && displayPage >= numPages}
                            className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold active:scale-95 select-none',
                                !!numPages && displayPage >= numPages ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300' : 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                            )}>
                            التالية <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setShowPageInput(true); setPageInputVal(String(displayPage)); }} className="flex flex-col items-center px-2 min-w-[56px]">
                            <span className={cn('text-xl font-bold font-mono', textColor)}>{displayPage}</span>
                            <span className={cn('text-[10px]', mutedText)}>{numPages ? `of ${numPages}` : '—'}</span>
                        </button>
                        <button onClick={() => goToPage(displayPage - 1, 'right')} disabled={displayPage <= 1}
                            className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold active:scale-95 select-none',
                                displayPage <= 1 ? isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-gray-300' : isDark ? 'bg-white/10 text-white' : 'bg-black/8 text-gray-900'
                            )}>
                            <ChevronRight className="h-4 w-4" /> السابقة
                        </button>
                    </div>
                </div>
            )}

            {isMobile && showPageInput && (
                <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.55)' }}
                    onClick={() => { setShowPageInput(false); setPageInputVal(''); }}>
                    <div className={cn('w-full rounded-t-3xl p-6 pb-10', isDark ? 'bg-[#1a1d24]' : 'bg-white')}
                        onClick={e => e.stopPropagation()}>
                        <p className={cn('text-base font-semibold mb-4', textColor)}>Jump to page</p>
                        <input ref={pageInputRef} type="number" min={1} max={numPages ?? 9999} value={pageInputVal}
                            onChange={e => setPageInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPageInput()}
                            placeholder={`1 – ${numPages ?? '?'}`} autoFocus
                            className={cn('w-full text-center text-xl font-mono rounded-2xl border py-4 mb-4 outline-none',
                                isDark ? 'bg-white/8 border-white/15 text-white' : 'bg-black/5 border-black/15 text-gray-900')} />
                        <button onClick={submitPageInput} className="w-full py-3.5 bg-rose-600 text-white rounded-2xl font-semibold text-base">Go to page</button>
                    </div>
                </div>
            )}

            {!isMobile && !isDocLoading && (
                <div className={cn('absolute bottom-3 right-4 text-xs pointer-events-none opacity-25 hidden lg:block', mutedText)}>
                    ←→ navigate · +− zoom · f fullscreen · b bookmark
                </div>
            )}
        </div>
    );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function TBtn({ onClick, disabled, dark, title, children }: {
    onClick?: () => void; disabled?: boolean; dark: boolean; title?: string; children: React.ReactNode;
}) {
    return (
        <button onClick={onClick} disabled={disabled} title={title}
            className={cn('p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center select-none',
                disabled
                    ? dark ? 'text-white/15 cursor-not-allowed' : 'text-gray-200 cursor-not-allowed'
                    : dark ? 'text-white/60 hover:text-white hover:bg-white/10 active:scale-90' : 'text-gray-500 hover:text-gray-900 hover:bg-black/8 active:scale-90'
            )}>
            {children}
        </button>
    );
}