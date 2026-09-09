"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, Loader2, X } from "lucide-react";
import { PdfCanvasViewer } from "@/components/shared/PdfCanvasViewer";

function extensionOf(url: string, title?: string) {
  const haystack = `${title || ""} ${url}`.toLowerCase();
  const match = haystack.match(/\.([a-z0-9]{2,5})(?:$|\?|#|[^a-z0-9])/);
  return match?.[1] || "";
}

export function previewApi(url: string, title?: string) {
  const params = new URLSearchParams({ src: url });
  if (title) params.set("name", title);
  return `/api/file-preview?${params.toString()}`;
}

function isPdfBytes(bytes: ArrayBuffer) {
  if (bytes.byteLength < 5) return false;
  const head = new Uint8Array(bytes.slice(0, 5));
  return String.fromCharCode(head[0], head[1], head[2], head[3], head[4]) === "%PDF-";
}

export function FilePreviewModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const src = previewApi(url, title);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"pdf" | "image" | "video" | "html">("html");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    let createdUrl: string | null = null;

    (async () => {
      try {
        const response = await fetch(src, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("missing");
        const mime = (response.headers.get("content-type") || "").split(";")[0].trim();
        const buffer = await response.arrayBuffer();
        const ext = extensionOf(url, title);

        if (mime.includes("pdf") || ext === "pdf" || isPdfBytes(buffer)) {
          setPdfData(buffer.slice(0));
          setKind("pdf");
          return;
        }

        const blob = new Blob([buffer], { type: mime || "application/octet-stream" });
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);

        if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
          setKind("image");
        } else if (mime.startsWith("video/") || ["mp4", "webm", "ogg", "mov"].includes(ext)) {
          setKind("video");
        } else {
          setKind("html");
        }
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("تعذّر تحميل الملف");
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src, title, url]);

  if (!mounted) return null;

  const dialog = (
    <div className="fixed inset-0 z-[300] flex flex-col bg-ink/80 p-0 sm:p-6" role="dialog" aria-modal="true">
      <div className="bg-surface w-full h-full sm:h-[min(92dvh,56rem)] sm:max-w-5xl sm:mx-auto sm:rounded-[1.5rem] overflow-hidden flex flex-col border-0 sm:border border-line">
        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-line bg-surface-muted">
          <h3 className="font-bold text-ink text-sm sm:text-base truncate">
            {title || "معاينة الملف"}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <a href={src} target="_blank" rel="noreferrer" className="btn-secondary !py-2 !px-3 !text-xs">
              <ExternalLink className="w-3.5 h-3.5" />
              تبويب جديد
            </a>
            <a href={src} download={title || "file"} className="btn-secondary !py-2 !px-3 !text-xs">
              <Download className="w-3.5 h-3.5" />
              تحميل
            </a>
            <button type="button" onClick={onClose} className="btn-secondary !py-2 !px-3 !text-xs">
              <X className="w-3.5 h-3.5" />
              إغلاق
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-surface-muted min-h-0 overflow-auto">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-semibold">جارٍ فتح الملف…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 h-full p-6 text-center">
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
            <img src={objectUrl} alt={title || "معاينة"} className="w-full h-full object-contain p-4" />
          )}

          {kind === "video" && objectUrl && (
            <video src={objectUrl} controls className="absolute inset-0 w-full h-full bg-ink" />
          )}

          {kind === "html" && objectUrl && !error && (
            <iframe
              src={objectUrl}
              className="absolute inset-0 w-full h-full border-0 bg-white"
              title={title || "معاينة الملف"}
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
