import { Download } from "lucide-react";

export function MaterialFileActions({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const previewHref = `/preview?${new URLSearchParams({ src: url, name: title }).toString()}`;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <a
        href={previewHref}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary flex-1 sm:flex-none !py-2 !px-4 !text-xs inline-flex items-center justify-center"
      >
        عرض
      </a>
      <a
        href={url}
        download={title}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost flex-1 sm:flex-none !py-2 !px-4 !text-xs inline-flex items-center justify-center gap-1.5"
      >
        <Download className="w-4 h-4" />
        تحميل
      </a>
    </div>
  );
}
