"use client";

import { useSyncExternalStore, useCallback } from "react";

function dispatchStorageEvent(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

function getServerSnapshot<T>(initialValue: T): T {
  return initialValue;
}

/**
 * Syncs a value with localStorage. Safe for SSR/Next.js because it uses
 * useSyncExternalStore and only accesses `window` inside the subscribers.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return JSON.stringify(initialValue);
    return window.localStorage.getItem(key);
  }, [key, initialValue]);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};

      const onStorage = (event: StorageEvent) => {
        if (event.key === key) callback();
      };

      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
    [key]
  );

  const raw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => JSON.stringify(initialValue)
  );

  const value = (() => {
    if (raw === null) return initialValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  })();

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return;
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(value)
          : next;
      window.localStorage.setItem(key, JSON.stringify(resolved));
      dispatchStorageEvent(key);
    },
    [key, value]
  );

  return [value, setValue];
}
