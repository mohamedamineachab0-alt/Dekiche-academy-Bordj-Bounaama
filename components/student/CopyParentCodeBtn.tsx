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
      className="w-full text-right bg-[#7E22CE] p-4 rounded-xl border-[3px] border-[#000000] shadow-3d-hover transition-all duration-300 group relative flex items-center justify-between overflow-hidden paper-cut"
      title="نسخ الرمز"
    >
      <div className="flex flex-col w-full max-w-full overflow-hidden min-w-0 flex-1 ml-2 z-10 relative">
        <span className="text-xs font-bold text-white mb-1 transition-colors group-hover:text-purple-100">الرمز السري الخاص بك</span>
        <span className="text-xl font-black text-[#FACC15] font-mono tracking-widest select-all truncate drop-shadow-md">
          {parentCode || "لا يوجد رمز"}
        </span>
      </div>
      <div className="relative flex items-center justify-center shrink-0 z-10">
        {isCopied ? (
          <div className="w-12 h-12 rounded-xl border-[3px] border-[#000000] bg-[#22C55E] flex items-center justify-center text-[#000000] shadow-sm transform rotate-3 transition-all">
            <Check className="w-6 h-6" strokeWidth={3} />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl border-[3px] border-[#000000] bg-[#000000] flex items-center justify-center text-white group-hover:bg-[#FFFFFF] group-hover:text-[#000000] shadow-sm transform -rotate-3 transition-all duration-300">
            <Copy className="w-5 h-5" strokeWidth={2.5} />
          </div>
        )}
        
        {/* Tooltip */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-[#000000] text-white border-[2px] border-[#000000] shadow-3d-soft text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all duration-200 pointer-events-none ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
          تم النسخ
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#000000]"></div>
        </div>
      </div>
    </button>
  );
}
