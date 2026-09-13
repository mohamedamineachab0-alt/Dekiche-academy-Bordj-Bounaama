import { GeoAccents, PurpleCircles } from "@/components/landing/LandingDecor";

export function HeroArt() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-hero" />
      <PurpleCircles />
      <GeoAccents variant="hero" />
    </div>
  );
}
