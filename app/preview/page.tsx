import { Suspense } from "react";
import { FilePreviewPage } from "@/components/shared/FilePreviewPage";

export default function PreviewRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center text-muted font-semibold">
          جارٍ التحميل…
        </div>
      }
    >
      <FilePreviewPage />
    </Suspense>
  );
}
