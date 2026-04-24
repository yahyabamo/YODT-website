import { motion } from "framer-motion";
import { IPhoneMockup } from "./IPhoneMockup";


// ─── Animation Variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};



// ─── Component ─────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-background"
    >
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Top-left blob */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "hsl(var(--primary))" }}
        />
        {/* Bottom-right blob */}
        <div
          className="absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: "hsl(var(--accent))" }}
        />
        {/* Center subtle radial */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full opacity-5 blur-[160px]"
          style={{ background: "hsl(var(--primary))" }}
        />
      </div>

      {/* Fine grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content wrapper */}
      <div className="container relative z-10 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* ── Left: Text content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start gap-6 text-center lg:text-start items-center lg:items-start"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 backdrop-blur-sm px-4 py-1.5 text-small text-muted-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Now available on iOS & Android
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-foreground"
            >
              Your student life,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                }}
              >
                simplified.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-body text-muted-foreground max-w-md leading-relaxed"
            >
              YUAT Connect brings together elections, services, announcements,
              and community — all in one beautifully designed app built for
              university students.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                App Store
              </a>

              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold border border-border bg-muted/50 backdrop-blur-sm text-foreground transition-all duration-200 hover:bg-muted hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.18 23.76C3.43 24 3.79 24.06 4.21 23.84L13.77 18.36L10.93 15.5L3.18 23.76ZM20.41 10.58L17.43 8.87L14.23 12L17.44 15.21L20.44 13.5C21.28 13 21.28 11.07 20.41 10.58ZM2.29 1.04C2.1 1.28 2 1.62 2 2.07V22C2 22.45 2.1 22.8 2.29 23.04L2.37 23.12L13.04 12.44V12.19L2.37 1.04H2.29ZM13.77 5.71L4.21 0.23C3.79 0 3.43 0.06 3.18 0.31L10.93 8.57L13.77 5.71Z" />
                </svg>
                Google Play
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 pt-2"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {[
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-rose-500",
                  "bg-amber-500",
                ].map((c, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-full ${c} ring-2 ring-background flex items-center justify-center text-white text-[10px] font-bold`}
                  >
                    {["Y", "A", "M", "T"][i]}
                  </span>
                ))}
              </div>
              <p className="text-small text-muted-foreground">
                <strong className="text-foreground font-semibold">1,200+</strong>{" "}
                students already connected
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right: iPhone Mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            {/* Decorative ring behind phone */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-20 blur-2xl pointer-events-none"
                style={{ background: "hsl(var(--primary))" }}
              />
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/20 pointer-events-none"
              />
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-primary/10 pointer-events-none"
              />

              <IPhoneMockup />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(var(--background)))",
        }}
      />
    </section>
  );
}

export default HeroSection;
