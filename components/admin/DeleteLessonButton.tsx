"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteLesson } from "@/actions/lessons";

export function DeleteLessonButton({
  lessonId,
  lessonTitle,
  redirectTo,
  variant = "icon",
}: {
  lessonId: string;
  lessonTitle: string;
  redirectTo?: string;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `هل تريد حذف الدرس «${lessonTitle}»؟ سيتم حذف الكويز وتقدّم التلاميذ المرتبطين به، ولا يمكن التراجع.`
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await deleteLesson(lessonId);
    setLoading(false);

    if (result.error) {
      window.alert(result.error);
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    router.refresh();
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {loading ? "جاري الحذف..." : "حذف الدرس"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
      title="حذف الدرس"
      aria-label={`حذف الدرس ${lessonTitle}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
