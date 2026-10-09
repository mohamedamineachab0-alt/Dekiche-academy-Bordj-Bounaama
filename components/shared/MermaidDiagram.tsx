"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'Tajawal, sans-serif',
    primaryColor: '#7C3AED',
    primaryTextColor: '#fff',
    primaryBorderColor: '#5B21B6',
    lineColor: '#A78BFA',
    secondaryColor: '#F5F3FF',
    tertiaryColor: '#EDE9FE',
  },
  mindmap: {
    padding: 20
  }
});

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      try {
        if (!chart || !containerRef.current) return;
        const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (error) {
        console.error("Mermaid parsing error:", error);
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div 
      className="mermaid w-full overflow-x-auto flex justify-center py-4"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
