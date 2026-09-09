"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { saveQuizMistakes, saveQuizResult } from "@/actions/quiz";
import { MathPreview } from "@/components/shared/MathPreview";
import { sanitizeQuizField } from "@/lib/math-text";

type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
};

type Props = {
  lessonId?: string;
  lessonTitle: string;
  quizId: string;
  questions: Question[];
  contextType?: "lesson" | "exam" | "exercise";
};

const MAX_SCORE = 20;

function backHref(contextType: Props["contextType"], lessonId?: string) {
  if (contextType === "lesson" && lessonId) return `/dashboard/student/lessons/${lessonId}`;
  if (contextType === "exam") return "/dashboard/student/exams";
  if (contextType === "exercise") return "/dashboard/student/exercises";
  return "/dashboard/student";
}

export function QuizClient({
  lessonId,
  lessonTitle,
  quizId,
  questions,
  contextType = "lesson",
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const normalizedQuestions = useMemo(
    () =>
      questions.map((question) => ({
        ...question,
        question: sanitizeQuizField(question.question),
        options: question.options.map((option) => sanitizeQuizField(option)),
      })),
    [questions]
  );

  const handleSelectOption = (optionIndex: number) => {
    if (isFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < normalizedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    setIsFinished(true);

    const mistakesToSave: { mistakeContent: string; correctSolution: string }[] = [];
    normalizedQuestions.forEach((q, i) => {
      const studentChoice = selectedAnswers[i];
      if (studentChoice !== q.correctAnswerIndex) {
        mistakesToSave.push({
          mistakeContent: `السؤال: ${q.question}\nإجابتك: ${q.options[studentChoice] || "لم يتم اختيار إجابة"}`,
          correctSolution: `الإجابة الصحيحة هي: ${q.options[q.correctAnswerIndex]}`,
        });
      }
    });

    const correctCount = normalizedQuestions.length - mistakesToSave.length;
    const score = normalizedQuestions.length
      ? Math.round((correctCount / normalizedQuestions.length) * MAX_SCORE)
      : 0;

    try {
      await saveQuizResult(quizId, score);
      if (mistakesToSave.length > 0) {
        await saveQuizMistakes(quizId, mistakesToSave, lessonId);
      }
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const restart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsFinished(false);
  };

  const result = useMemo(() => {
    const correctCount = normalizedQuestions.filter(
      (q, i) => selectedAnswers[i] === q.correctAnswerIndex
    ).length;
    const unanswered = normalizedQuestions.filter((_, i) => selectedAnswers[i] === undefined).length;
    const wrongCount = normalizedQuestions.length - correctCount;
    const finalScore =
      normalizedQuestions.length > 0
        ? Math.round((correctCount / normalizedQuestions.length) * MAX_SCORE)
        : 0;
    const percentage = (finalScore / MAX_SCORE) * 100;
    return { correctCount, wrongCount, unanswered, finalScore, percentage };
  }, [normalizedQuestions, selectedAnswers]);

  if (normalizedQuestions.length === 0) {
    return (
      <div className="surface-card px-5 py-12 text-center font-sans">
        <h2 className="text-xl font-bold text-ink mb-2">لا توجد أسئلة</h2>
        <p className="text-sm text-muted mb-6">هذا الاختبار لا يحتوي على أسئلة حالياً.</p>
        <Link href={backHref(contextType, lessonId)} className="btn-primary">
          العودة
        </Link>
      </div>
    );
  }

  if (isFinished) {
    const feedback =
      result.percentage < 50
        ? "راجع الدرس ثم أعد المحاولة."
        : result.percentage < 75
          ? "نتيجة جيدة. واصل المراجعة للتحسين."
          : "نتيجة ممتازة. أحسنت.";

    return (
      <div className="space-y-5 sm:space-y-6 font-sans pb-8 min-w-0" dir="rtl">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-hero text-white p-5 sm:p-7">
          <div className="landing-line-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative z-10">
            <p className="text-xs font-semibold text-white/70 mb-2">النتيجة</p>
            <h1 className="kufi text-[clamp(1.25rem,3vw,1.75rem)] text-white leading-snug break-words">
              {lessonTitle}
            </h1>
            <p className="mt-3 text-sm text-white/80">{feedback}</p>
          </div>
        </header>

        <section className="surface-card p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div>
              <p className="text-sm text-muted mb-1">العلامة من 20</p>
              <p className="text-4xl sm:text-5xl font-bold text-primary tabular-nums leading-none">
                {result.finalScore}
                <span className="text-xl sm:text-2xl text-muted font-semibold"> / {MAX_SCORE}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge-soft">صحيح {result.correctCount}</span>
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                خطأ {result.wrongCount}
              </span>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${result.percentage}%` }} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-ink px-1">مراجعة الإجابات</h2>
          {normalizedQuestions.map((q, index) => {
            const chosen = selectedAnswers[index];
            const isCorrect = chosen === q.correctAnswerIndex;
            return (
              <article key={index} className="surface-card p-4 sm:p-5 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCorrect ? "bg-primary text-white" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted mb-1">السؤال {index + 1}</p>
                    <MathPreview text={q.question} className="text-sm sm:text-base font-semibold text-ink leading-relaxed" />
                  </div>
                </div>

                <ul className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isChosen = chosen === optIndex;
                    const isAnswer = optIndex === q.correctAnswerIndex;
                    return (
                      <li
                        key={optIndex}
                        className={`rounded-xl border px-3 py-2.5 text-sm leading-relaxed ${
                          isAnswer
                            ? "border-primary bg-primary-soft text-ink"
                            : isChosen
                              ? "border-red-200 bg-red-50 text-red-900"
                              : "border-line text-muted"
                        }`}
                      >
                        <MathPreview text={opt} />
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </section>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button type="button" onClick={restart} className="btn-primary flex-1">
            <RotateCcw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <Link href={backHref(contextType, lessonId)} className="btn-secondary flex-1 justify-center">
            العودة
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = normalizedQuestions[currentQuestionIndex];
  const hasSelectedCurrent = selectedAnswers[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / normalizedQuestions.length) * 100;

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans min-w-0" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-base sm:text-lg font-bold text-ink truncate">{lessonTitle}</h1>
        <span className="badge-soft shrink-0 tabular-nums">
          {currentQuestionIndex + 1} / {normalizedQuestions.length}
        </span>
      </div>

      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="surface-card p-5 sm:p-8">
        <MathPreview
          text={currentQuestion.question}
          className="text-lg sm:text-xl font-bold text-ink leading-relaxed mb-6"
        />

        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-right p-4 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-primary-soft border-primary"
                    : "bg-surface-muted border-line hover:bg-white"
                }`}
              >
                <div className="font-semibold text-ink flex-1 min-w-0">
                  <MathPreview text={opt} />
                </div>
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-primary border-primary text-white" : "bg-white border-line"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:opacity-50"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasSelectedCurrent}
          className="btn-primary disabled:opacity-50"
        >
          {currentQuestionIndex === normalizedQuestions.length - 1 ? "إنهاء الاختبار" : "التالي"}
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
