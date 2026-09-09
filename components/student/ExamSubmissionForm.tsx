"use client";

import { useState } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { gradeStudentSubmission } from "@/actions/exams";

interface ExamSubmissionFormProps {
  examId: string;
  studentId: string;
  hasSubmitted: boolean;
  previousScore?: number | null;
  previousFeedback?: string | null;
}

export function ExamSubmissionForm({
  examId,
  studentId,
  hasSubmitted,
  previousScore,
  previousFeedback,
}: ExamSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(hasSubmitted);
  const [score, setScore] = useState(previousScore);
  const [feedback, setFeedback] = useState(previousFeedback);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("examId", examId);
    formData.append("studentId", studentId);

    const result = await gradeStudentSubmission(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setScore(result.score);
      setFeedback(result.feedback);
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 text-ink font-bold">
          <span className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </span>
          <h3 className="text-base">تم استلام حلك وتصحيحه بنجاح</h3>
        </div>

        {score !== undefined && score !== null && (
          <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-line">
            <span className="font-semibold text-sm text-ink">العلامة</span>
            <span className="text-2xl font-bold text-primary tabular-nums badge-soft">
              {score}/20
            </span>
          </div>
        )}

        {feedback && (
          <div className="bg-surface p-4 rounded-xl border border-line text-sm font-medium text-ink leading-relaxed whitespace-pre-wrap">
            {feedback}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold text-sm">
          {error}
        </div>
      )}

      <div className="p-6 bg-surface border border-line rounded-2xl space-y-5 text-center">
        <span className="icon-tile mx-auto">
          <Upload className="w-5 h-5" />
        </span>
        <div>
          <h4 className="font-bold text-base text-ink mb-1.5">ارفع صورة حلك بخط اليد</h4>
          <p className="text-sm text-muted leading-relaxed">
            سيقوم المساعد بقراءة خطك وتصحيح الإجابة آلياً.
          </p>
        </div>

        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="w-full text-sm text-muted file:me-3 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-soft file:text-primary hover:file:bg-indigo-100 cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري التصحيح..
          </>
        ) : (
          "إرسال الحل للتصحيح"
        )}
      </button>
    </form>
  );
}
