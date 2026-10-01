"use client";

import React, { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { redeemAccessCode } from "@/actions/subjects";
import { useRouter } from "next/navigation";

interface UnlockLessonInlineProps {
  lessonId: string;
  monthNumber: number;
  subjectId?: string;
}

export function UnlockLessonInline({
  lessonId,
  monthNumber,
  subjectId,
}: UnlockLessonInlineProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("يرجى إدخال رمز الاشتراك");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("code", code.trim());
      if (subjectId) {
        formData.append("subjectId", subjectId);
      }

      const res = await redeemAccessCode(formData);

      if (res && res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء تفعيل الرمز");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-center gap-2 animate-in fade-in">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span>تم تفعيل الشهر {monthNumber} بنجاح! جاري فتح الدرس...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleUnlock} className="space-y-3 w-full max-w-sm mx-auto text-right">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink block text-center">
          أدخل رمز تفعيل الشهر {monthNumber} لفتح الدرس فوراً:
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-purple-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="مثال: MATH-2026-XXXX"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface border border-line focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-center font-mono text-sm tracking-wider text-ink transition-all"
            dir="ltr"
          />
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري التحقق من الرمز...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>تفعيل الرمز وفتح الدرس دائماً</span>
          </>
        )}
      </button>

      <p className="text-[11px] text-muted text-center leading-relaxed">
        * بمجرد تفعيل هذا الشهر، ستبقى دروسه مفتوحة في حسابك بشكل دائم طوال العام الدراسي.
      </p>
    </form>
  );
}
