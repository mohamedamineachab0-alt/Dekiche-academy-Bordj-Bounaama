"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // When route or search params change, simulate a quick top loading bar
    setIsVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 150);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 350);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    // Custom events so any action or form in admin can trigger the loading bar
    const handleStart = () => {
      setIsVisible(true);
      setProgress(40);
    };

    const handleProgress = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === "number") {
        setProgress(customEvent.detail);
      }
    };

    const handleStop = () => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
    };

    window.addEventListener("app:loading:start", handleStart);
    window.addEventListener("app:loading:progress", handleProgress);
    window.addEventListener("app:loading:stop", handleStop);

    return () => {
      window.removeEventListener("app:loading:start", handleStart);
      window.removeEventListener("app:loading:progress", handleProgress);
      window.removeEventListener("app:loading:stop", handleStop);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.75 z-9999 pointer-events-none transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="h-full bg-linear-to-r from-purple-600 via-indigo-500 to-amber-400 transition-all duration-300 ease-out relative shadow-[0_0_12px_rgba(147,51,234,0.6)]"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-r from-transparent to-white/60 animate-pulse" />
      </div>
    </div>
  );
}
