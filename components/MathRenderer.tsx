"use client";

import { useMemo } from "react";
import katex from "katex";
import { normalizeLatex } from "@/lib/math-text";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  math: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false }) => {
  const html = useMemo(() => {
    const source = normalizeLatex(math);
    if (!source) return "";
    try {
      return katex.renderToString(source, {
        throwOnError: false,
        errorColor: "#5B21B6",
        displayMode: block,
        strict: "ignore",
        trust: false,
        output: "html",
      });
    } catch {
      return "";
    }
  }, [math, block]);

  if (!html) {
    return <span className="text-[#4C1D95] font-mono text-sm">{math}</span>;
  }

  return (
    <span
      dir="ltr"
      className={`katex-host inline-block max-w-full ${block ? "block my-2 overflow-x-auto" : ""}`}
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
