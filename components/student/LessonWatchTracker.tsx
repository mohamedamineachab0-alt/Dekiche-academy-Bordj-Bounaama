"use client";

import { useEffect } from "react";
import { watchSecondsStorageKey } from "@/lib/watch-time";

const TICK_SECONDS = 15;

export function LessonWatchTracker({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    const key = watchSecondsStorageKey(userId);

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const raw = window.localStorage.getItem(key);
      let current = 0;
      if (raw) {
        try {
          current = Number(JSON.parse(raw));
        } catch {
          current = Number(raw);
        }
      }
      const next = (Number.isFinite(current) ? current : 0) + TICK_SECONDS;
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    };

    const interval = window.setInterval(tick, TICK_SECONDS * 1000);
    return () => window.clearInterval(interval);
  }, [userId]);

  return null;
}
