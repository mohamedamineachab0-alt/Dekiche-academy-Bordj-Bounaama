"use client";

import { useState } from "react";
import { BookOpen, RotateCcw } from "lucide-react";
import { ReviewCard, Subject } from "@/generated/prisma";
import { MathPreview } from "@/components/shared/MathPreview";

type FlipCardProps = {
  card: ReviewCard & {
    subject: Subject;
    lesson?: { id: string; title: string } | null;
  };
};

export function FlipCard({ card }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full min-h-[22rem] sm:min-h-[24rem] aspect-[4/3] perspective-1000 cursor-pointer group font-sans"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`w-full h-full transition-transform duration-500 preserve-3d relative ${isFlipped ? "rotate-y-180" : ""}`}
      >
        {/* Question */}
        <div className="absolute w-full h-full backface-hidden surface-card p-6 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-5">
            <span className="badge-soft">
              <BookOpen className="w-3.5 h-3.5" />
              {card.subject.title}
            </span>
            {card.lesson?.title && (
              <span className="badge-outline line-clamp-1">{card.lesson.title}</span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center text-center px-1">
            <MathPreview
              text={card.question}
              className="text-[1.45rem] sm:text-[1.75rem] font-bold text-ink leading-snug [&_.katex]:text-[1.15em]"
            />
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-muted transition-colors group-hover:text-primary">
            <RotateCcw className="w-3.5 h-3.5" />
            اضغط لكشف الإجابة
          </p>
        </div>

        {/* Answer */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-primary text-white p-6 flex flex-col">
          <span className="inline-flex self-start items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
            الإجابة
          </span>

          <div className="flex-1 flex items-center justify-center text-center">
            <MathPreview text={card.answer} className="text-xl sm:text-2xl font-semibold leading-snug text-white" />
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-white/70">
            <RotateCcw className="w-3.5 h-3.5" />
            اضغط للعودة
          </p>
        </div>
      </div>
    </div>
  );
}
