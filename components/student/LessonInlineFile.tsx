"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { PdfCanvasViewer } from "@/components/shared/PdfCanvasViewer";
import { previewApi } from "@/components/shared/FilePreviewModal";

function isPdfBytes(bytes: ArrayBuffer) {
  if (bytes.byteLength < 5) return false;
  const head = new Uint8Array(bytes.slice(0, 5));
  return String.fromCharCode(head[0], head[1], head[2], head[3], head[4]) === "%PDF-";
}

export function LessonInlineFile({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const src = previewApi(url, title);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"pdf" | "image" | "html">("pdf");
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let createdUrl: string | null = null;

    (async () => {
      try {
        const response = await fetch(src, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("missing");
        const mime = (response.headers.get("content-type") || "").split(";")[0].trim();
        const buffer = await response.arrayBuffer();

        if (mime.includes("pdf") || isPdfBytes(buffer)) {
          setPdfData(buffer.slice(0));
          setKind("pdf");
          return;
        }

        const blob = new Blob([buffer], { type: mime || "application/octet-stream" });
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
        setKind(mime.startsWith("image/") ? "image" : "html");
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("تعذّر عرض الملف");
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surface-muted">
        <h4 className="font-bold text-ink text-sm sm:text-base min-w-0 break-words">{title}</h4>
        <a
          href={url}
          download={`${title}.pdf`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary !py-2 !px-3 !text-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          تحميل
        </a>
      </div>

      <div className="relative min-h-[28rem] bg-surface-muted">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-semibold">جارٍ فتح ملف الدرس…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 min-h-[20rem] p-6 text-center">
            <p className="font-bold text-ink">{error}</p>
            <a href={src} target="_blank" rel="noreferrer" className="btn-primary !text-sm">
              فتح في تبويب جديد
            </a>
          </div>
        )}

        {kind === "pdf" && pdfData && (
          <PdfCanvasViewer
            data={pdfData}
            onReady={() => setLoading(false)}
            onError={() => {
              setError("تعذّر عرض ملف PDF");
              setLoading(false);
            }}
          />
        )}

        {kind === "image" && objectUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={objectUrl} alt={title} className="w-full h-auto p-4" />
        )}

        {kind === "html" && objectUrl && !error && (
          <iframe src={objectUrl} className="w-full min-h-[70vh] border-0 bg-white" title={title} />
        )}
      </div>
    </article>
  );
}
