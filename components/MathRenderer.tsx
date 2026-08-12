import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false }) => {
  try {
    return (
      <span dir="ltr" className="inline-block" style={{ direction: 'ltr' }}>
        {block ? (
          <BlockMath math={math} errorColor="#cc0000" />
        ) : (
          <InlineMath math={math} errorColor="#cc0000" />
        )}
      </span>
    );
  } catch (error) {
    console.error("KaTeX rendering error:", error);
    return <span className="text-purple-700 font-mono text-sm">{math}</span>;
  }
};
