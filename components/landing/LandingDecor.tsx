/**
 * Lightweight CSS/SVG décor for the Zed-style landing.
 * Pure decorative — aria-hidden, pointer-events none.
 */

import type { ReactNode } from "react";

type Tone = "indigo" | "yellow" | "white" | "soft";

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
