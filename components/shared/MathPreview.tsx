import React from "react";
import { MathRenderer } from "@/components/MathRenderer";
import { splitMathSegments } from "@/lib/math-text";

export const MathPreview: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  if (!text) return null;

  const segments = splitMathSegments(text);

  return (
    <div className={className || "text-sm text-muted leading-relaxed min-h-[1.5rem] mt-1"} dir="rtl">
      {segments.map((segment, index) => {
        if (segment.type === "math") {
          return <MathRenderer key={index} math={segment.value} block={segment.block} />;
        }
        return <span key={index}>{segment.value}</span>;
      })}
    </div>
  );
};
