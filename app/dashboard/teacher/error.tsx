"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function TeacherDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Teacher dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold text-ink">عذراً، حدث خطأ أثناء تحميل البيانات</h2>
        <p className="text-sm text-muted">
          قد يكون هناك ضغط على الخادم أو انقطاع في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-lg transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        إعادة المحاولة
      </button>
    </div>
  );
}
