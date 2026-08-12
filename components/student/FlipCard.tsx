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
      className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer group font-sans"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`w-full h-full transition-transform duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front side (Question) */}
        <div className="absolute w-full h-full backface-hidden bg-[#FFFFFF] rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft paper-cut flex flex-col items-center justify-center text-center">
          <div className="absolute top-5 right-5 left-5 flex justify-between items-start z-10">
            <span className="bg-[#FACC15] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[2px] border-[#000000] flex items-center gap-1.5 shadow-sm transform -rotate-2">
              <BookOpen className="w-4 h-4" strokeWidth={2.5} />
              {card.subject.title}
            </span>
            {card.exerciseRef && (
              <span className="bg-[#EAE4D9] text-[#000000] text-[10px] font-black px-3 py-1.5 rounded-lg border-[2px] border-[#000000] transform rotate-2">
                {card.exerciseRef}
              </span>
            )}
          </div>
          
          <div className="mt-8 flex-1 flex flex-col items-center justify-center w-full relative z-10">
            <h3 className="font-black text-[#000000] text-xl mb-3">{card.title}</h3>
            <p className="text-gray-600 font-bold text-sm leading-relaxed">{card.question}</p>
          </div>
          
          <div className="absolute bottom-5 text-xs font-black text-[#000000] bg-[#EAE4D9] px-4 py-1.5 rounded-lg border-[2px] border-[#000000] group-hover:bg-[#FACC15] transition-colors shadow-sm transform rotate-1">
            اضغط للقلب
          </div>
        </div>

        {/* Back side (Answer) */}
        <div className="absolute w-full h-full backface-hidden bg-[#7E22CE] rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft flex flex-col items-center justify-center text-center rotate-y-180 paper-cut">
          <div className="absolute top-5 right-5 left-5 flex justify-between items-start z-10">
            <span className="bg-[#FACC15] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[2px] border-[#000000] shadow-sm transform rotate-2">
              الجواب
            </span>
          </div>
          
          <div className="mt-8 flex-1 flex flex-col items-center justify-center w-full relative z-10">
            <p className="text-white font-black text-xl leading-relaxed">{card.answer}</p>
          </div>
          
          <div className="absolute bottom-5 text-xs font-black text-[#000000] bg-white px-4 py-1.5 rounded-lg border-[2px] border-[#000000] group-hover:bg-gray-200 transition-colors shadow-sm transform -rotate-1">
            اضغط للعودة
          </div>
        </div>

      </div>
    </div>
  );
}
