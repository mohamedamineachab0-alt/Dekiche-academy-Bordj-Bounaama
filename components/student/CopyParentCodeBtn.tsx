"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyParentCodeBtn({ parentCode }: { parentCode: string | null }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!parentCode) return;
    try {
      await navigator.clipboard.writeText(parentCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full text-right bg-hero p-4 rounded-xl border border-line transition-all duration-300 group relative flex items-center justify-between overflow-hidden hover:-translate-y-0.5"
      title="نسخ الرمز"
    >
      <div className="flex flex-col w-full max-w-full overflow-hidden min-w-0 flex-1 ml-2 z-10 relative">
        <span className="text-xs font-semibold text-white/70 mb-1">الرمز السري الخاص بك</span>
        <span className="text-xl font-bold text-accent font-mono tracking-widest select-all truncate">
          {parentCode || "لا يوجد رمز"}
        </span>
      </div>
      <div className="relative flex items-center justify-center shrink-0 z-10">
        {isCopied ? (
          <div className="w-12 h-12 rounded-xl border border-white/20 bg-accent flex items-center justify-center text-accent-text">
            <Check className="w-6 h-6" strokeWidth={3} />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl border border-white/20 bg-white/15 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all duration-300">
            <Copy className="w-5 h-5" strokeWidth={2.5} />
          </div>
        )}

        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-ink text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all duration-200 pointer-events-none ${
            isCopied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          تم النسخ
        </div>
      </div>
    </button>
  );
}
