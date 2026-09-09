"use client";

import { GeoAccents } from "@/components/landing/LandingDecor";

export function HeroArt() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-hero" />

      {/* Subtle hero grid */}
      <div className="landing-line-grid absolute inset-0" />

      {/* Concentric soft orbs — Zed-style atmosphere */}
      <div className="hero-orb w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="hero-orb w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[700px] lg:h-[700px] bg-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="hero-orb w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] lg:w-[850px] lg:h-[850px] bg-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Accent orbs */}
      <div className="hero-glow w-[420px] h-[420px] top-[-80px] right-[-60px]" />
      <div className="hero-glow w-[360px] h-[360px] bottom-[-60px] left-[-40px] opacity-70" />
      <div className="hero-orb w-40 h-40 bg-accent/20 top-[18%] left-[12%] blur-2xl" />
      <div className="hero-orb w-28 h-28 bg-white/25 bottom-[22%] right-[16%] blur-xl" />

      <GeoAccents variant="hero" />
    </div>
  );
}
