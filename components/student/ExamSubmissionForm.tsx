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

export function ExamSubmissionForm({ examId, studentId, hasSubmitted, previousScore, previousFeedback }: ExamSubmissionFormProps) {
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
      <div className="p-6 bg-[#F8F9FA] border-[3px] border-[#000000] rounded-2xl space-y-6 shadow-sm paper-cut relative">
        <div className="flex items-center gap-4 text-[#000000] font-black relative z-10">
          <div className="w-12 h-12 bg-[#22C55E] border-[3px] border-[#000000] rounded-xl flex items-center justify-center shrink-0 transform -rotate-3 shadow-sm">
            <CheckCircle className="w-7 h-7 text-[#000000]" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl">تم استلام حلك وتصحيحه بنجاح!</h3>
        </div>
        
        {score !== undefined && score !== null && (
          <div className="mt-4 flex items-center justify-between bg-[#FFFFFF] p-5 rounded-xl border-[3px] border-[#000000] shadow-sm relative z-10">
            <span className="font-black text-[#000000]">العلامة الممنوحة من الذكاء الاصطناعي:</span>
            <span className="text-3xl font-mono font-black text-[#7E22CE] bg-[#FACC15] px-3 py-1 rounded-lg border-[3px] border-[#000000] transform rotate-2">{score}/20</span>
          </div>
        )}

        {feedback && (
          <div className="bg-[#FFFFFF] p-5 rounded-xl border-[3px] border-[#000000] text-sm font-bold text-[#000000] leading-relaxed shadow-sm relative z-10 whitespace-pre-wrap">
            {feedback}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
      {error && (
        <div className="p-4 bg-[#FEE2E2] text-[#EF4444] rounded-xl border-[3px] border-[#000000] font-black text-sm shadow-sm">
          {error}
        </div>
      )}

      <div className="p-8 bg-[#FFFFFF] border-[3px] border-[#000000] rounded-2xl space-y-6 text-center shadow-sm relative group">
        <div className="absolute inset-0 bg-notebook-grid opacity-20 pointer-events-none rounded-2xl" />
        <div className="w-16 h-16 bg-[#EAE4D9] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mx-auto transform group-hover:rotate-6 transition-transform shadow-sm relative z-10">
          <Upload className="w-8 h-8 text-[#000000]" strokeWidth={2.5} />
        </div>
        <div className="relative z-10">
          <h4 className="font-black text-xl text-[#000000] mb-2">ارفع صورة حلك بخط اليد</h4>
          <p className="text-sm text-gray-600 font-bold">سيقوم المساعد الذكي بقراءة خطك وتصحيح الإجابة آلياً بناءً على الأسئلة</p>
        </div>
        
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="w-full text-base text-gray-500 font-bold file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-[3px] file:border-[#000000] file:text-sm file:font-black file:bg-[#FACC15] file:text-[#000000] hover:file:bg-[#FDE047] cursor-pointer shadow-sm relative z-10 file:shadow-sm file:transition-all hover:file:-translate-y-0.5"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#7E22CE] hover:bg-[#6B21A8] text-white border-[3px] border-[#000000] rounded-xl font-black text-lg shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-sm hover:-translate-y-1 hover:shadow-3d-hover"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            جاري رفع الحل والتصحيح بالذكاء الاصطناعي..
          </>
        ) : (
          "إرسال الحل للتصحيح"
        )}
      </button>
    </form>
  );
}
