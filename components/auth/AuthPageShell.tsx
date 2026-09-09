import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { GeoAccents, SoftOrb } from "@/components/landing/LandingDecor";
import type { ReactNode } from "react";

export function AuthPageShell({
  children,
  maxWidthClass = "max-w-md",
}: {
  children: ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto font-sans flex items-start sm:items-center justify-center px-4 py-8 sm:py-12 safe-area-pt safe-area-pb"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-hero" aria-hidden="true">
        <div className="landing-line-grid absolute inset-0" />

        <div className="hero-orb w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] bg-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="hero-orb w-[400px] h-[400px] sm:w-[620px] sm:h-[620px] bg-white/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="hero-orb w-[520px] h-[520px] sm:w-[780px] sm:h-[780px] bg-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="hero-glow w-[360px] h-[360px] top-[-80px] end-[-50px]" />
        <div className="hero-glow w-[280px] h-[280px] bottom-[-50px] start-[-40px] opacity-70" />

        <SoftOrb tone="white" className="w-44 h-44 top-[10%] start-[5%] opacity-60" />
        <SoftOrb tone="white" className="w-24 h-24 top-[42%] end-[12%] opacity-40" />
        <SoftOrb tone="white" className="w-32 h-32 bottom-[12%] end-[8%] opacity-50" />
        <SoftOrb tone="indigo" className="w-52 h-52 bottom-[6%] start-[18%] opacity-35" />

        <GeoAccents variant="hero" />
      </div>

      <div className={`relative z-10 w-full ${maxWidthClass}`}>
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5" />
          </span>
          <span className="wordmark text-base text-white tracking-tight">أكاديمية دقيش</span>
        </Link>

        <div className="relative">
          <div className="auth-card-halo" aria-hidden="true" />
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
