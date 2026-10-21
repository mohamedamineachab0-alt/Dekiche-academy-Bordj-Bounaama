"use client";

import { useTransition } from "react";
import { ShieldAlert, ArrowLeft, Users, RefreshCw } from "lucide-react";
import Link from "next/link";
import { exitTeacherSpaceAction } from "@/actions/teachers";

export function TeacherImpersonationBanner({
  teacherName,
  teacherId,
  adminName = "المدير",
}: {
  teacherName: string;
  teacherId?: string;
  adminName?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleExit = () => {
    startTransition(async () => {
      await exitTeacherSpaceAction();
    });
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-500/15 via-primary/10 to-amber-500/10 border-2 border-amber-400/40 p-4 sm:p-5 shadow-sm"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                وضع تصفح فضاء الأستاذ
              </span>
              <span className="text-xs text-muted">
                بصلاحيات الإدارة الكاملة ({adminName})
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-ink mt-1">
              أنت تتصفح حالياً حساب وفضاء الأستاذ(ة):{" "}
              <span className="text-primary underline decoration-2 underline-offset-4">
                {teacherName}
              </span>
            </p>
            <p className="text-xs text-muted mt-0.5">
              يمكنك معاينة الدروس، رفع المرفقات، إضافة الكويزات، وتفقد إحصائيات التلاميذ كما يراها هذا الأستاذ تماماً.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/dashboard/admin/teachers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-surface border border-line hover:border-primary text-ink transition-all shadow-sm"
          >
            <Users className="w-4 h-4 text-primary" />
            <span>تغيير الأستاذ</span>
          </Link>

          <button
            onClick={handleExit}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جارٍ العودة...</span>
              </>
            ) : (
              <>
                <span>العودة للوحة الإدارة</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
