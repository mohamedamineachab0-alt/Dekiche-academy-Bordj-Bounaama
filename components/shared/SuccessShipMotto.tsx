export const ACADEMY_MOTTO = "اركب معنا سفينة النجاح";

export function SuccessShipIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 31.5h34l-3.8 7.2H10.8L7 31.5Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M24 8.5v23"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M25.2 10.2 38 28.5H25.2V10.2Z" fill="currentColor" opacity="0.55" />
      <path d="M22.8 12.4 12.5 28.5h10.3V12.4Z" fill="currentColor" opacity="0.28" />
      <path
        d="M6 39.8h36"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function SuccessShipMotto({
  tone = "hero",
}: {
  tone?: "hero" | "light";
}) {
  const pill =
    tone === "hero"
      ? "glass-pill text-white"
      : "bg-primary-soft border border-line text-primary";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${pill}`}>
      <SuccessShipIcon className="w-4 h-4 shrink-0" />
      <span className="kufi text-xs tracking-wide">{ACADEMY_MOTTO}</span>
    </span>
  );
}

export function SuccessShipWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute end-4 bottom-3 sm:end-8 sm:bottom-4 opacity-[0.14] text-white ${className}`}
      aria-hidden="true"
    >
      <SuccessShipIcon className="w-24 h-24 sm:w-32 sm:h-32" />
    </div>
  );
}
