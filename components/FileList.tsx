"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { FilePreviewModal, previewApi } from "@/components/shared/FilePreviewModal";

export function FileList({ files }: { files: any[] }) {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  if (files.length === 0) {
    return (
      <div className="text-center p-8 border border-line rounded-lg text-muted bg-surface-muted">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => {
          const url = `/api/files/${file.id}`;
          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-surface border border-line rounded-lg hover:border-line transition-colors"
            >
              <div className="overflow-hidden mr-4">
                <p className="text-sm font-medium text-ink truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-muted mt-1 uppercase tracking-wider">
                  {(file.size / 1024).toFixed(1)} KB • {file.mimeType.split("/")[1] || file.mimeType}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreview({ url, title: file.originalName })}
                  className="p-2 text-muted hover:text-primary hover:bg-surface-muted rounded-md transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <a
                  href={previewApi(url, file.originalName)}
                  download
                  className="p-2 text-muted hover:text-primary hover:bg-surface-muted rounded-md transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {preview && (
        <FilePreviewModal
          url={preview.url}
          title={preview.title}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
