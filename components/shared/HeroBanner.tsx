import React from "react";
import { GeoAccents, SoftOrb } from "@/components/landing/LandingDecor";

export function HeroBanner({
  title,
  description,
  action,
  icon: Icon,
  variant = "plain",
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  bgClass?: string;
  gradientClass?: string;
  showGridPattern?: boolean;
  variant?: "plain" | "hero";
}) {
  if (variant === "hero") {
    return (
      <header className="relative overflow-hidden rounded-[1.75rem] bg-hero text-white p-6 md:p-8 mb-2">
        <div className="landing-line-grid absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="hero-orb w-48 h-48 sm:w-72 sm:h-72 bg-white/12 -top-16 -end-10" aria-hidden="true" />
        <div className="hero-orb w-36 h-36 bg-white/20 bottom-[-2rem] start-[12%] blur-2xl" aria-hidden="true" />
        <SoftOrb tone="white" className="w-28 h-28 top-[20%] end-[18%] opacity-50" />
        <SoftOrb tone="white" className="w-20 h-20 bottom-[10%] end-[8%] opacity-40" />
        <GeoAccents variant="hero" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {Icon && (
              <span className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1.5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <Icon className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
              </span>
            )}
            <h1 className="kufi text-[clamp(1.5rem,2.6vw,2rem)] text-white">{title}</h1>
            <p className="text-[0.95rem] text-white/80 leading-[1.8] mt-3 max-w-[58ch]">
              {description}
            </p>
          </div>

          {action && <div className="shrink-0 relative z-10">{action}</div>}
        </div>
      </header>
    );
  }

  return (
    <header className="pb-7 mb-2 border-b border-line">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {Icon && (
            <p className="rule-label mb-4">
              <Icon className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
            </p>
          )}
          <h1 className="display-title text-[clamp(1.5rem,2.6vw,2rem)]">{title}</h1>
          <p className="text-[0.95rem] text-muted leading-[1.8] mt-3 max-w-[58ch]">
            {description}
          </p>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
