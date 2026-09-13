/**
 * Lightweight CSS/SVG décor for the Zed-style landing.
 * Pure decorative — aria-hidden, pointer-events none.
 */

import type { ReactNode } from "react";

type Tone = "indigo" | "yellow" | "white" | "soft";

/** Concentric purple rings + solid circles — sits behind content on hero/auth. */
export function PurpleCircles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-20 -start-16 h-[280px] w-[280px] rounded-full border-[1.5px] border-[#c4b5fd]/45 sm:h-[380px] sm:w-[380px]" />
      <div className="absolute -top-8 start-8 h-[180px] w-[180px] rounded-full border border-[#ede9fe]/30 sm:h-[240px] sm:w-[240px]" />
      <div className="absolute top-[6%] -end-24 h-[320px] w-[320px] rounded-full border-2 border-white/20 sm:h-[420px] sm:w-[420px]" />
      <div className="absolute top-[14%] end-[8%] h-[160px] w-[160px] rounded-full border border-[#a78bfa]/50 sm:h-[200px] sm:w-[200px]" />
      <div className="absolute bottom-[-70px] start-[-40px] h-[240px] w-[240px] rounded-full border-[1.5px] border-[#ede9fe]/25 sm:h-[340px] sm:w-[340px]" />
      <div className="absolute bottom-[10%] start-[12%] h-[110px] w-[110px] rounded-full border border-white/35" />
      <div className="absolute bottom-[-40px] end-[8%] h-[200px] w-[200px] rounded-full border border-[#c4b5fd]/40 sm:h-[280px] sm:w-[280px]" />

      <div className="absolute top-[22%] start-[10%] h-16 w-16 rounded-full bg-[#2e1065]/55 sm:h-24 sm:w-24" />
      <div className="absolute top-[38%] end-[6%] h-12 w-12 rounded-full bg-[#7c3aed]/45 sm:h-16 sm:w-16" />
      <div className="absolute bottom-[22%] end-[18%] h-20 w-20 rounded-full bg-[#4c1d95]/70" />
      <div className="absolute bottom-[16%] start-[28%] h-8 w-8 rounded-full bg-[#ede9fe]/25" />
      <div className="absolute top-[58%] start-[4%] h-10 w-10 rounded-full bg-[#a78bfa]/30" />
    </div>
  );
}

export function SoftOrb({
  className = "",
  tone = "indigo",
}: {
  className?: string;
  tone?: Tone;
}) {
  const toneClass =
    tone === "yellow"
      ? "bg-white/25"
      : tone === "white"
        ? "bg-white/20"
          : tone === "soft"
          ? "bg-primary/20"
          : "bg-primary/15";

  return (
    <div
      aria-hidden="true"
      className={`landing-orb pointer-events-none absolute rounded-full blur-3xl ${toneClass} ${className}`}
    />
  );
}

export function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`landing-dot-grid pointer-events-none absolute inset-0 opacity-[0.45] ${className}`}
    />
  );
}

export function LineGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`landing-line-grid pointer-events-none absolute inset-0 opacity-60 ${className}`}
    />
  );
}

/** Thin decorative rule with a glass pill in the center */
export function SectionDivider({ label }: { label?: string }) {
  return (
    <div
      aria-hidden={!label}
      className="landing-divider flex items-center gap-4 my-2"
      role={label ? "separator" : undefined}
    >
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--line)] to-transparent" />
      {label ? (
        <span className="glass-dark rounded-full px-3.5 py-1.5 text-xs font-bold text-primary-mid tracking-wide">
          {label}
        </span>
      ) : (
        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(91,33,182,0.18)]" />
      )}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--line)] to-transparent" />
    </div>
  );
}

/** Floating geometric accents — rings, squares, diamonds */
export function GeoAccents({ variant = "light" }: { variant?: "light" | "hero" | "dark" }) {
  const stroke =
    variant === "hero"
      ? "stroke-white/20"
      : variant === "dark"
        ? "stroke-white/25"
        : "stroke-primary/20";
  const fill =
    variant === "hero"
      ? "fill-white/40"
      : variant === "dark"
        ? "fill-white/50"
        : "fill-primary/40";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ring — top start */}
      <svg
        className={`landing-float-a absolute top-[12%] start-[6%] w-16 h-16 md:w-24 md:h-24 ${stroke}`}
        viewBox="0 0 96 96"
        fill="none"
      >
        <circle cx="48" cy="48" r="36" strokeWidth="1.5" />
        <circle cx="48" cy="48" r="18" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Soft square — bottom end */}
      <svg
        className={`landing-float-b absolute bottom-[18%] end-[8%] w-12 h-12 md:w-16 md:h-16 ${stroke}`}
        viewBox="0 0 64 64"
        fill="none"
      >
        <rect x="8" y="8" width="48" height="48" rx="10" strokeWidth="1.5" />
      </svg>

      {/* Small dots cluster */}
      <svg
        className="absolute bottom-[28%] start-[10%] w-20 h-10 opacity-40"
        viewBox="0 0 80 40"
        fill="none"
      >
        <circle cx="8" cy="20" r="2.5" className={fill} />
        <circle cx="24" cy="12" r="2" className={fill} />
        <circle cx="40" cy="24" r="2.5" className={fill} />
        <circle cx="56" cy="10" r="1.5" className={fill} />
        <circle cx="70" cy="22" r="2" className={fill} />
      </svg>

      <svg
        className={`landing-float-c absolute top-[38%] end-[12%] w-10 h-10 md:w-14 md:h-14 ${stroke}`}
        viewBox="0 0 56 56"
        fill="none"
      >
        <path d="M28 6 L50 28 L28 50 L6 28 Z" strokeWidth="1.5" />
      </svg>

      <svg
        className={`absolute top-[22%] end-[22%] w-8 h-8 opacity-50 ${stroke}`}
        viewBox="0 0 32 32"
        fill="none"
      >
        <path d="M16 4v24M4 16h24" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Glass status / trust pill shell */
export function GlassPill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full glass-pill px-4 py-2 ${className}`}>
      {children}
    </div>
  );
}
