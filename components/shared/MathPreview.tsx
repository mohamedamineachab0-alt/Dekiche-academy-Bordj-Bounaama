import React from 'react';
import { MathRenderer } from '@/components/MathRenderer';

export const MathPreview: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Simple parser to separate text and math blocks
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <div className="text-sm text-slate-600 leading-relaxed min-h-[1.5rem] mt-1" dir="rtl">
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <MathRenderer key={i} math={math} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};
