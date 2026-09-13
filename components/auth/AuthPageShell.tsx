import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { GeoAccents, PurpleCircles } from "@/components/landing/LandingDecor";
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
      className="relative isolate flex-1 min-h-full min-h-[100dvh] overflow-x-hidden overflow-y-auto font-sans flex items-start sm:items-center justify-center px-4 py-10 sm:py-14 safe-area-pt safe-area-pb bg-hero"
      dir="rtl"
    >
      <div className="fixed inset-0 z-0 bg-hero pointer-events-none" aria-hidden="true">
        <PurpleCircles />
        <GeoAccents variant="hero" />
      </div>

      <div className={`relative z-10 w-full ${maxWidthClass}`}>
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <GraduationCap className="w-6 h-6 text-white" />
          <span className="text-[1.05rem] font-bold text-white">أكاديمية دقيش</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
