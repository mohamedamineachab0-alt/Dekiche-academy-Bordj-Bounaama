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
      onClick={handleCopy}
      className="w-full text-right bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between hover:bg-purple-100 transition-all duration-200 group relative"
      title="نسخ الرمز"
    >
      <div className="flex flex-col w-full max-w-full overflow-hidden min-w-0 flex-1 ml-2">
        <span className="text-xs font-bold text-purple-500 mb-1 transition-colors group-hover:text-purple-700">الرمز السري الخاص بك</span>
        <span className="text-xl font-black text-purple-800 font-mono tracking-widest select-all truncate">
          {parentCode || "لا يوجد رمز"}
        </span>
      </div>
      <div className="relative flex items-center justify-center shrink-0">
        {isCopied ? (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Check className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-500 group-hover:bg-purple-200 group-hover:text-purple-700 transition-colors">
            <Copy className="w-5 h-5" />
          </div>
        )}
        
        {/* Tooltip */}
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-purple-950 text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all duration-200 pointer-events-none ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
          تم النسخ
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
    </button>
  );
}
