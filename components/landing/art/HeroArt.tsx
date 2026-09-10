import { GeoAccents } from "@/components/landing/LandingDecor";

export function HeroArt() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-hero" />
      <div className="landing-line-grid absolute inset-0" />
      <div className="hero-orb hidden md:block w-[600px] h-[600px] lg:w-[700px] lg:h-[700px] bg-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="hero-glow hidden md:block w-[360px] h-[360px] top-[-80px] right-[-60px]" />
      <GeoAccents variant="hero" />
    </div>
  );
}
