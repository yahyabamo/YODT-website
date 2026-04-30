'use client';

/**
 * PDFViewer — Cross-platform PDF reader
 *
 * Strategy:
 *  - iOS  → fetch PDF as Blob (works with auth/signed URLs) → blob:// URL
 *           → <iframe> using WebKit's native PDFKit renderer.
 *           No pdfjs, no Worker, no canvas limits. Rock solid.
 *
 *  - Desktop / Android → react-pdf (pdfjs) with full custom UI,
 *           windowed rendering, zoom, keyboard shortcuts, etc.
 *
 * Why Blob URL?
 *   Supabase Storage URLs are often signed / require auth headers.
 *   A plain <iframe src="..."> would fail on those. By fetching with
 *   the Supabase client (which attaches the auth token automatically)
 *   and turning the response into a blob: URL, we get native rendering
 *   with zero authentication issues.
 */

import {
    BookmarkPlus, BookmarkCheck, ExternalLink,
    Loader2, AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';


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

// ─── Root: decides which viewer to render ────────────────────────────────────
export default function PDFViewer(props: PDFViewerProps) {
    const { isIOS, isMobile } = useDeviceInfo();

    if (isIOS) {
        return <IOSPDFViewer {...props} />;
    }

    return <DesktopPDFViewerLoader {...props} isMobile={isMobile} />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   iOS VIEWER — Native WebKit PDFKit via blob: URL
   
   How it works:
     1. Fetch the PDF file as an ArrayBuffer using plain fetch().
        If the URL is protected (401/403), fall back to supabase.storage.download()
        which automatically attaches the user's auth session.
     2. Wrap the bytes in a Blob and call URL.createObjectURL() to get a
        blob: URL (e.g. blob://uuid).
     3. Set that as the <iframe src>. WebKit's built-in PDFKit renderer
        takes over — the same engine used by Safari, Apple Books, and Mail.
        It gives you pinch-to-zoom, smooth scrolling, and page thumbnails
        for free, with zero JS, zero Workers, zero canvas context limits.
═══════════════════════════════════════════════════════════════════════════════*/

type LoadState = 'loading' | 'ready' | 'error';

function IOSPDFViewer({
    url,
    title = 'Document',
    currentPage = 1,
    isBookmarked = false,
    onBookmarkToggle,
}: PDFViewerProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadState, setLoadState] = useState<LoadState>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const blobRef = useRef<string | null>(null);

    // Capture viewport height once at mount.
    // Never use 100dvh / 100vh on iOS — the address bar resizing causes
    // an infinite layout loop that blanks the screen.
    const [viewH] = useState(() =>
        typeof window !== 'undefined' ? window.innerHeight : 700
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoadState('loading');
            setBlobUrl(null);

            try {
                // ── Step 1: Try a direct fetch (works for public URLs) ──────
                let blob: Blob | null = null;

                const res = await fetch(url, { cache: 'force-cache' }).catch(() => null);

                if (res && res.ok) {
                    const buffer = await res.arrayBuffer();
                    blob = new Blob([buffer], { type: 'application/pdf' });
                } else {
                    // ── Step 2: Supabase authenticated download ────────────
                    // Parse "bucket" and "path" from a Supabase storage URL:
                    // https://xxx.supabase.co/storage/v1/object/public/BUCKET/path/file.pdf
                    // https://xxx.supabase.co/storage/v1/object/sign/BUCKET/path/file.pdf
                    const match = url.match(
                        /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^?]+)/
                    );

                    if (match) {
                        const fullPath = match[1];          // "bucket/path/to/file.pdf"
                        const slashIdx = fullPath.indexOf('/');
                        const bucket = fullPath.slice(0, slashIdx);
                        const path = fullPath.slice(slashIdx + 1);

                        const { data, error } = await supabase.storage
                            .from(bucket)
                            .download(path);

                        if (error || !data) {
                            throw new Error(error?.message ?? 'Supabase download failed');
                        }
                        blob = new Blob([data], { type: 'application/pdf' });
                    } else {
                        // Unknown URL scheme — last resort: try fetch ignoring CORS errors
                        throw new Error(
                            res
                                ? `HTTP ${res.status} — cannot fetch PDF`
                                : 'Network error fetching PDF'
                        );
                    }
                }

                if (cancelled) return;

                // ── Step 3: Create blob URL and hand to <iframe> ──────────
                const objUrl = URL.createObjectURL(blob);
                blobRef.current = objUrl;
                setBlobUrl(objUrl);
                setLoadState('ready');

            } catch (e: any) {
                if (!cancelled) {
                    setErrorMsg(e?.message ?? 'Unknown error');
                    setLoadState('error');
                }
            }
        };

        load();

        return () => {
            cancelled = true;
            if (blobRef.current) {
                URL.revokeObjectURL(blobRef.current);
                blobRef.current = null;
            }
        };
    }, [url]);

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loadState === 'loading') {
        return (
            <div
                className="flex flex-col items-center justify-center bg-[#111318] rounded-2xl shadow-2xl gap-4"
                style={{ height: viewH }}
            >
                <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                <p className="text-sm text-white/60">جاري تحميل الكتاب...</p>
            </div>
        );
    }

    // ── Error screen ─────────────────────────────────────────────────────────
    if (loadState === 'error') {
        return (
            <div
                className="flex flex-col items-center justify-center bg-[#111318] rounded-2xl shadow-2xl gap-5 px-8"
                style={{ height: viewH }}
            >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="text-white font-semibold mb-1">تعذّر تحميل الملف</p>
                    <p className="text-xs text-white/40 mb-5 max-w-xs leading-relaxed">{errorMsg}</p>
                    <button
                        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-2 mx-auto px-5 py-3 bg-rose-600 text-white text-sm rounded-xl font-medium"
                    >
                        <ExternalLink className="h-4 w-4" />
                        فتح في المتصفح
                    </button>
                </div>
            </div>
        );
    }

    // ── Native PDF reader ─────────────────────────────────────────────────────
    // WebKit's PDFKit takes over inside the iframe.
    // You get pinch-zoom, smooth scroll, page thumbnails — all native,
    // all free, zero JavaScript involved in the actual rendering.
    return (
        <div
            className="flex flex-col bg-[#111318] rounded-2xl shadow-2xl overflow-hidden"
            style={{ height: viewH }}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d24] border-b border-white/8 flex-shrink-0">
                <span className="text-sm font-medium text-white/80 truncate flex-1 ml-2">
                    {title}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onBookmarkToggle?.(currentPage)}
                        className="p-2 rounded-xl active:bg-white/10 transition-colors"
                        aria-label={isBookmarked ? 'إزالة الإشارة المرجعية' : 'إضافة إشارة مرجعية'}
                    >
                        {isBookmarked
                            ? <BookmarkCheck className="h-5 w-5 text-amber-400" />
                            : <BookmarkPlus className="h-5 w-5 text-white/60" />}
                    </button>
                    <button
                        onClick={() => window.open(blobUrl!, '_blank', 'noopener,noreferrer')}
                        className="p-2 rounded-xl active:bg-white/10 transition-colors"
                        aria-label="فتح في تطبيق خارجي"
                    >
                        <ExternalLink className="h-5 w-5 text-white/60" />
                    </button>
                </div>
            </div>

            {/* ── The iframe — hands the blob URL to WebKit PDFKit ── */}
            <iframe
                src={`${blobUrl!}#toolbar=0`}
                title={title}
                className="flex-1 w-full border-0 bg-white"
                allow="fullscreen"
                // Tells iOS not to intercept scroll events inside the iframe
                style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            />

            {/* Bottom hint */}
            <div className="flex-shrink-0 px-4 py-2 bg-[#1a1d24] border-t border-white/8">
                <p className="text-xs text-white/30 text-center">
                    ابسط إصبعيك للتكبير • مرر للتنقل بين الصفحات
                </p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DESKTOP LOADER
   Lazy-loads the heavy react-pdf/pdfjs viewer only on non-iOS devices.
   This keeps the iOS bundle lean and avoids importing pdfjs at all on iOS.
═══════════════════════════════════════════════════════════════════════════════*/

// This file must exist at the same path as this component.
// It should contain your existing full-featured DesktopPDFViewer
// (the UnifiedPDFViewer code from your previous Pdfviewer.tsx).
const DesktopPDFViewer = lazy(() => import('../components/Desktoppdfviewer'));

function DesktopPDFViewerLoader(props: PDFViewerProps & { isMobile: boolean }) {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center h-[82vh] bg-[#111318] rounded-2xl shadow-2xl gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                    <p className="text-sm text-white/60">جاري تحميل قارئ الكتب...</p>
                </div>
            }
        >
            <DesktopPDFViewer {...props} />
        </Suspense>
    );
}