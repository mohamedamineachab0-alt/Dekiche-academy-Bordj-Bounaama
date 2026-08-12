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
    if (isCollapsed) return null; // Don't show in collapsed mode to save space

    return (
      <div className="bg-[#FACC15] rounded-2xl p-4 border-[3px] border-[#000000] relative overflow-hidden group shadow-3d-soft paper-cut">
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-[#000000] flex items-center justify-center shrink-0 border-[2px] border-[#000000] shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform">
            <Lightbulb className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#000000] mb-1">نصيحة اليوم</h4>
            <p className="text-xs font-bold text-gray-800 leading-relaxed">
              {tip}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className="bg-[#FACC15] rounded-2xl p-6 border-[3px] border-[#000000] shadow-3d-soft flex items-center gap-5 paper-cut relative overflow-hidden group">
      <div className="w-14 h-14 rounded-2xl bg-[#000000] flex items-center justify-center shrink-0 border-[3px] border-[#000000] shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform relative z-10">
        <Lightbulb className="w-7 h-7 text-[#FACC15] animate-pulse" />
      </div>
      <div className="relative z-10">
        <h4 className="text-lg font-black text-[#000000] mb-1">نصيحة اليوم للنجاح</h4>
        <p className="text-sm font-bold text-gray-800 leading-relaxed">
          {tip}
        </p>
      </div>
    </div>
  );
}
