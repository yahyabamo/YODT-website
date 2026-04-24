import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useAnimationControls } from "framer-motion";

// ─── Configuration ────────────────────────────────────────────────────────────
const SCREENSHOTS: string[] = [
  "/Screenshot-one.png",
  "/Screenshot-two.png",
  "/Screenshot-three.png",
];

const PAUSE_PER_SLIDE_MS = 2800;
const TRANSITION_MS = 900;

// ─── IPhoneScreenScroller ──────────────────────────────────────────────────
interface IPhoneScreenScrollerProps {
  screenshots: string[];
  pauseMs: number;
  transitionMs: number;
}

function IPhoneScreenScroller({ screenshots, pauseMs, transitionMs }: IPhoneScreenScrollerProps) {
  const controls = useAnimationControls();
  const currentIndex = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideH, setSlideH] = useState(0);
  const loopRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const measureHeight = useCallback(() => {
    if (!containerRef.current) return;
    const h = containerRef.current.getBoundingClientRect().height;
    if (h > 0) setSlideH(h);
  }, []);

  useEffect(() => {
    measureHeight();
    const raf = requestAnimationFrame(measureHeight);
    const ro = new ResizeObserver(() => measureHeight());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [measureHeight]);

  useEffect(() => {
    if (slideH === 0) return;
    loopRef.current = { cancelled: false };
    const lref = loopRef.current;

    async function runLoop() {
      currentIndex.current = 0;
      setActiveIdx(0);
      await controls.start({ y: 0, transition: { duration: 0 } });

      while (!lref.cancelled) {
        await new Promise<void>((r) => setTimeout(r, pauseMs));
        if (lref.cancelled) break;

        const next = (currentIndex.current + 1) % screenshots.length;
        await controls.start({
          y: -(next * slideH),
          transition: { duration: transitionMs / 1000, ease: [0.76, 0, 0.24, 1] },
        });

        if (lref.cancelled) break;
        currentIndex.current = next;
        setActiveIdx(next);

        if (next === screenshots.length - 1) {
          await new Promise<void>((r) => setTimeout(r, pauseMs));
          if (lref.cancelled) break;
          await controls.start({ y: 0, transition: { duration: 0 } });
          currentIndex.current = 0;
          setActiveIdx(0);
        }
      }
    }

    runLoop();
    return () => { lref.cancelled = true; };
  }, [controls, screenshots.length, pauseMs, transitionMs, slideH]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <motion.div
        animate={controls}
        style={{ display: "flex", flexDirection: "column", width: "100%", willChange: "transform" }}
      >
        {screenshots.map((src, i) => (
          <div
            key={src}
            style={{ width: "100%", flexShrink: 0, height: slideH > 0 ? slideH : "100%", overflow: "hidden" }}
          >
            <img
              src={src}
              alt={`App screenshot ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </div>
        ))}
      </motion.div>

      {/* Dot indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "5px",
          zIndex: 10,
        }}
      >
        {screenshots.map((_, i) => (
          <span
            key={i}
            style={{
              display: "block",
              borderRadius: "9999px",
              height: "5px",
              width: i === activeIdx ? "14px" : "5px",
              background: i === activeIdx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Pure CSS iPhone Frame ─────────────────────────────────────────────────
export function IPhoneMockup() {
  return (
    <motion.div
      style={{ position: "relative", width: "100%", maxWidth: "300px" }}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Outer phone shell — uses paddingBottom trick for aspect ratio */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "216%",
          borderRadius: "52px",
          background: "linear-gradient(145deg, #3a3a3a 0%, #1c1c1e 50%, #111 100%)",
          boxShadow: `
            0 0 0 1.5px rgba(255,255,255,0.14),
            0 0 0 3px rgba(0,0,0,0.9),
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 50px 100px -20px rgba(0,0,0,0.7),
            0 25px 50px -10px rgba(0,0,0,0.5)
          `,
        }}
      >
        {/* Hardware buttons — mute/volume */}
        <div style={{ position: "absolute", left: "-3.5px", top: "15%", width: "3.5px", height: "5%", background: "#2c2c2e", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: "-3.5px", top: "22%", width: "3.5px", height: "8%", background: "#2c2c2e", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: "-3.5px", top: "32%", width: "3.5px", height: "8%", background: "#2c2c2e", borderRadius: "2px 0 0 2px" }} />
        {/* Power button */}
        <div style={{ position: "absolute", right: "-3.5px", top: "22%", width: "3.5px", height: "12%", background: "#2c2c2e", borderRadius: "0 2px 2px 0" }} />

        {/* Inner screen bezel */}
        <div
          style={{
            position: "absolute",
            top: "1.8%",
            left: "2.2%",
            right: "2.2%",
            bottom: "1.8%",
            borderRadius: "44px",
            background: "#000",
            overflow: "hidden",
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "76px",
              height: "24px",
              background: "#000",
              borderRadius: "18px",
              zIndex: 20,
              boxShadow: "0 0 0 1.5px #1a1a1a",
            }}
          />

          {/* Status bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "52px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: "0 22px 8px",
              zIndex: 15,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: "-0.4px",
              }}
            >
              9:41
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Signal */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
                <rect x="0" y="8" width="3" height="4" rx="0.5" />
                <rect x="4.7" y="5.5" width="3" height="6.5" rx="0.5" />
                <rect x="9.4" y="3" width="3" height="9" rx="0.5" />
                <rect x="14" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
              </svg>
              {/* WiFi */}
              <svg width="15" height="11" viewBox="0 0 15 11" fill="white">
                <path d="M7.5 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" opacity="1" />
                <path d="M3.5 5.5C4.8 4.2 6.1 3.5 7.5 3.5s2.7.7 4 2l1.2-1.3C11 2.6 9.3 2 7.5 2S4 2.6 2.3 4.2z" opacity="0.6" />
                <path d="M.5 3C2.3 1.2 4.8 0 7.5 0S12.7 1.2 14.5 3l-1.3 1.3C11.7 2.5 9.7 1.5 7.5 1.5S3.3 2.5 1.8 4.3z" opacity="0.3" />
              </svg>
              {/* Battery */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "24px",
                    height: "12px",
                    borderRadius: "3px",
                    border: "1.5px solid rgba(255,255,255,0.45)",
                    padding: "2px",
                    display: "flex",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ width: "65%", height: "100%", background: "#4CD964", borderRadius: "1px" }} />
                </div>
                <div style={{ width: "2px", height: "5px", background: "rgba(255,255,255,0.4)", borderRadius: "0 1px 1px 0", marginLeft: "1px" }} />
              </div>
            </div>
          </div>

          {/* Screenshot content area — below status bar */}
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <IPhoneScreenScroller
              screenshots={SCREENSHOTS}
              pauseMs={PAUSE_PER_SLIDE_MS}
              transitionMs={TRANSITION_MS}
            />
          </div>

          {/* Glass reflection */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 50%)",
              pointerEvents: "none",
              zIndex: 25,
              borderRadius: "inherit",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}