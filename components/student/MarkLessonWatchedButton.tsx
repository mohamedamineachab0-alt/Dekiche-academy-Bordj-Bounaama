"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { markLessonWatched } from "@/actions/lesson-progress";

export function MarkLessonWatchedButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(completed);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="surface-card px-4 py-4 sm:px-5 flex items-center gap-3">
        <span className="icon-tile shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">اكتملت المشاهدة</p>
          <p className="text-xs text-muted mt-0.5">سُجّل إنهاء هذا الدرس في مسارك.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card px-4 py-4 sm:px-5 space-y-3">
      <p className="text-sm text-muted leading-relaxed">
        بعد مشاهدة الدرس، أكّد الإكمال ليظهر في قائمتك كدرس منتهٍ.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await markLessonWatched(lessonId);
            if (result.error) {
              setError(result.error);
              return;
            }
            setDone(true);
          });
        }}
        className="btn-primary w-full sm:w-auto"
      >
        <Eye className="w-4 h-4" />
        {pending ? "جاري التسجيل..." : "تمّت المشاهدة"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
