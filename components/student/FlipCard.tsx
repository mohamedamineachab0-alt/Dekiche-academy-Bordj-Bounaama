"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { ReviewCard, Subject } from "@/generated/prisma";

type FlipCardProps = {
  card: ReviewCard & { subject: Subject };
};

export function FlipCard({ card }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`w-full h-full transition-transform duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front side (Question) */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="absolute top-4 right-4 left-4 flex justify-between items-start">
            <span className="bg-purple-50 text-purple-800 text-[10px] font-black px-3 py-1.5 rounded-lg border border-purple-100 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              {card.subject.title}
            </span>
            {card.exerciseRef && (
              <span className="bg-white text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-100">
                {card.exerciseRef}
              </span>
            )}
          </div>
          
          <div className="mt-8 flex-1 flex flex-col items-center justify-center w-full">
            <h3 className="font-black text-purple-900 text-lg mb-2">{card.title}</h3>
            <p className="text-slate-600 font-bold text-sm leading-relaxed">{card.question}</p>
          </div>
          
          <div className="absolute bottom-4 text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full group-hover:bg-purple-100 transition-colors">
            اضغط للقلب
          </div>
        </div>

        {/* Back side (Answer) */}
        <div className="absolute w-full h-full backface-hidden bg-purple-800 rounded-3xl p-6 border border-purple-800 shadow-lg flex flex-col items-center justify-center text-center rotate-y-180">
          <div className="absolute top-4 right-4 left-4 flex justify-between items-start">
            <span className="bg-white/20 text-purple-950 text-[10px] font-black px-3 py-1.5 rounded-lg">
              الجواب
            </span>
          </div>
          
          <div className="mt-8 flex-1 flex flex-col items-center justify-center w-full">
            <p className="text-purple-950 font-black text-lg leading-relaxed">{card.answer}</p>
          </div>
          
          <div className="absolute bottom-4 text-xs font-bold text-purple-200 bg-black/10 px-3 py-1 rounded-full group-hover:bg-black/20 transition-colors">
            اضغط للعودة
          </div>
        </div>

      </div>
    </div>
  );
}
