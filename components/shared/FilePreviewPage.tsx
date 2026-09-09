"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { PdfCanvasViewer } from "@/components/shared/PdfCanvasViewer";
import { previewApi } from "@/components/shared/FilePreviewModal";

function isPdfBytes(bytes: ArrayBuffer) {
  if (bytes.byteLength < 5) return false;
  const head = new Uint8Array(bytes.slice(0, 5));
  return String.fromCharCode(head[0], head[1], head[2], head[3], head[4]) === "%PDF-";
}

export function FilePreviewPage() {
  const searchParams = useSearchParams();
  const src = searchParams.get("src") || "";
  const title = searchParams.get("name") || "معاينة الملف";
  const previewSrc = src ? previewApi(src, title) : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"pdf" | "image" | "html">("pdf");
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewSrc) {
      setError("لا يوجد ملف");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let createdUrl: string | null = null;

    (async () => {
      try {
        const response = await fetch(previewSrc, { signal: controller.signal, cache: "no-store" });
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
  }, [previewSrc]);

  return (
    <div className="min-h-[100dvh] bg-surface-muted flex flex-col" dir="rtl">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surface">
        <h1 className="font-bold text-ink text-sm sm:text-base truncate">{title}</h1>
        {src ? (
          <a href={src} download={title} className="btn-secondary !py-2 !px-3 !text-xs shrink-0">
            <Download className="w-3.5 h-3.5" />
            تحميل
          </a>
        ) : null}
      </header>

      <main className="flex-1 relative min-h-0 overflow-auto">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-semibold">جارٍ فتح الملف…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 h-[70dvh] p-6 text-center">
            <p className="font-bold text-ink">{error}</p>
            {src ? (
              <a href={src} target="_blank" rel="noreferrer" className="btn-primary !text-sm">
                فتح الرابط الأصلي
              </a>
            ) : null}
          </div>
        )}

        {kind === "pdf" && pdfData && (
          <div className="max-w-4xl mx-auto">
            <PdfCanvasViewer
              data={pdfData}
              onReady={() => setLoading(false)}
              onError={() => {
                setError("تعذّر عرض ملف PDF");
                setLoading(false);
              }}
            />
          </div>
        )}

        {kind === "image" && objectUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={objectUrl} alt={title} className="max-w-full mx-auto p-4" />
        )}

        {kind === "html" && objectUrl && !error && (
          <iframe src={objectUrl} className="w-full h-[calc(100dvh-3.5rem)] border-0 bg-white" title={title} />
        )}
      </main>
    </div>
  );
}
