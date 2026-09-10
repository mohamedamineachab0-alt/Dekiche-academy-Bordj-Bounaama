import { GeoAccents, SoftOrb } from "@/components/landing/LandingDecor";

/**
 * Indigo/yellow atmosphere for the student dashboard.
 * Behind content only — no photos.
 */
export function StudentDashDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="dash-line-grid absolute inset-0 opacity-70" />
      <div className="dash-dot-grid absolute inset-0 opacity-60" />

      <SoftOrb
        tone="indigo"
        className="w-[22rem] h-[22rem] md:w-[30rem] md:h-[30rem] -top-40 -end-20 opacity-70"
      />
      <SoftOrb
        tone="white"
        className="w-40 h-40 md:w-52 md:h-52 top-[22%] -start-12 opacity-40"
      />
      <SoftOrb
        tone="soft"
        className="w-56 h-56 bottom-[6%] end-[10%] opacity-50"
      />

      <GeoAccents variant="light" />

      <svg
        className="landing-float-a absolute bottom-[14%] start-[24%] w-12 h-12 stroke-primary/15"
        viewBox="0 0 96 96"
        fill="none"
      >
        <circle cx="48" cy="48" r="36" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
