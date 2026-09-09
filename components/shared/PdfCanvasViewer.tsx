"use client";

import { useEffect, useRef } from "react";

export function PdfCanvasViewer({
  data,
  onReady,
  onError,
}: {
  data: ArrayBuffer;
  onReady: () => void;
  onError: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    (async () => {
      const pdfjs = await import("pdfjs-dist/build/pdf.min.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdf = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
      if (cancelled) return;

      host.replaceChildren();
      const width = Math.max(host.clientWidth || 720, 280);

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const unscaled = page.getViewport({ scale: 1 });
        const scale = Math.min(2, Math.max(1, (width - 16) / unscaled.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "w-full h-auto bg-white mb-3 rounded-xl";
        const context = canvas.getContext("2d");
        if (!context) continue;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;
        if (cancelled) return;
        host.appendChild(canvas);
      }

      onReadyRef.current();
    })().catch(() => {
      if (!cancelled) onErrorRef.current();
    });

    return () => {
      cancelled = true;
      host.replaceChildren();
    };
  }, [data]);

  return <div ref={hostRef} className="min-h-full p-3 sm:p-4" />;
}
