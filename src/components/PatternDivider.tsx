// src/components/PatternDivider.tsx
// Drop this file anywhere in your components folder, then import it in Navbar and Footer.

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

// Which SVG to use:
//  - "diamonds"  → yemen-pattern.svg  (rounded diamond / coin grid — like image 2)
//  - "chevrons"  → yemen-pattern3.svg (zigzag / arrow-head weave — like image 1)
type PatternVariant = 'diamonds' | 'chevrons';

interface PatternDividerProps {
    /** Visual height of the band in pixels (default 36) */
    height?: number;
    /** Which pattern file to use (default 'chevrons') */
    variant?: PatternVariant;
    /** Override the background color behind the pattern (default: auto dark/light) */
    bg?: string;
    /** 0–1 opacity of the whole band (default 1) */
    opacity?: number;
    /** Extra inline styles on the wrapper */
    style?: React.CSSProperties;
}

/**
 * A full-width decorative band that tiles a Yemeni geometric SVG pattern.
 *
 * Usage in Navbar — place it as the LAST child inside <nav>, after the main content:
 *
 *   <PatternDivider height={28} variant="chevrons" />
 *
 * Usage in Footer — place it as the FIRST child inside <footer>, before .footer-grid:
 *
 *   <PatternDivider height={36} variant="diamonds" />
 */
export const PatternDivider: React.FC<PatternDividerProps> = ({
    height = 36,
    variant = 'chevrons',
    bg,
    opacity = 1,
    style,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // ── resolve SVG path ──────────────────────────────────────────────────────
    // Adjust the import paths to wherever you store your assets.
    const svgUrl =
        variant === 'diamonds'
            ? new URL('@/assets/yemen-pattern3.svg', import.meta.url).href
            : new URL('@/assets/yemen-pattern3.svg', import.meta.url).href;

    // ── background color of the band ──────────────────────────────────────────
    // Dark mode  → very dark near-black (matches your navbar bg)
    // Light mode → near-white (matches your light navbar bg)
    const defaultBg = isDark ? '#0a0a0f' : '#f8f5f0';
    const backgroundColor = bg ?? defaultBg;

    // ── tile size — this is the key fix for the "size looks bad" problem ──────
    // The SVGs have a built-in repeating pattern cell.
    // We set backgroundSize to a small fixed px value so it tiles crisply
    // at the correct scale regardless of the SVG's own width/height attributes.
    const tileSize = variant === 'diamonds' ? `${height * 1.6}px ${height}px` : `${height * 2.2}px ${height}px`;

    return (
        <div
            aria-hidden="true"
            style={{
                width: '100%',
                height: `${height}px`,
                flexShrink: 0,
                backgroundColor,
                backgroundImage: `url("${svgUrl}")`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: tileSize,
                backgroundPosition: 'center center',
                opacity,
                // smooth appearance on theme toggle
                transition: 'background-color 0.4s cubic-bezier(0.4,0,0.2,1)',
                ...style,
            }}
        />
    );
};