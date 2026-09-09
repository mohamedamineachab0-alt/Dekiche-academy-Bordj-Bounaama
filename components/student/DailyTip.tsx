"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { DAILY_TIPS } from "@/lib/tips";

type DailyTipProps = {
  variant?: "sidebar" | "card";
  isCollapsed?: boolean;
};

export function DailyTip({ variant = "sidebar", isCollapsed = false }: DailyTipProps) {
  const [tip, setTip] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
    setTip(DAILY_TIPS[randomIndex]);
  }, []);

  if (!isClient || !tip) return null;

  if (variant === "sidebar") {
    if (isCollapsed) return null;

    return (
      <div className="rounded-xl bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-ink mb-1">نصيحة اليوم</h4>
            <p className="text-xs text-muted leading-relaxed">{tip}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="h-full rounded-[1.5rem] bg-surface border border-line p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgba(55,28,185,0.05)]">
      <span className="dash-card-accent" aria-hidden="true" />
      <span className="dash-glass-sheen absolute inset-0 rounded-[1.5rem]" aria-hidden="true" />
      <span className="relative z-[1] icon-tile-accent mb-4">
        <Lightbulb className="w-5 h-5" />
      </span>
      <h4 className="relative z-[1] text-base font-bold text-ink mb-2">نصيحة اليوم</h4>
      <p className="relative z-[1] text-sm text-muted leading-relaxed flex-1">{tip}</p>
    </article>
  );
}
