"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle2, XCircle, Trophy, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { saveQuizMistakes } from "@/actions/quiz";

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

export function QuizClient({ lessonId, lessonTitle, quizId, questions, contextType = "lesson" }: Props) {
  const maxScore = 20; // Enforce max score to 20
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (optionIndex: number) => {
    if (isFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      
      // Calculate and save mistakes
      const mistakesToSave: { mistakeContent: string; correctSolution: string; }[] = [];
      questions.forEach((q, i) => {
        const studentChoice = selectedAnswers[i];
        if (studentChoice !== q.correctAnswerIndex) {
          mistakesToSave.push({
            mistakeContent: `السؤال: ${q.question}\nإجابتك: ${q.options[studentChoice] || "لم يتم اختيار إجابة"}`,
            correctSolution: `الإجابة الصحيحة هي: ${q.options[q.correctAnswerIndex]}`
          });
        }
      });
      
      if (mistakesToSave.length > 0 && contextType === "lesson" && lessonId) {
        try {
          await saveQuizMistakes(lessonId, quizId, mistakesToSave);
        } catch (error) {
          console.error("Failed to save mistakes:", error);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-white rounded-3xl border border-slate-100 dark:border-purple-200">
        <h2 className="text-2xl font-black text-purple-950 dark:text-purple-950 mb-2">لا توجد أسئلة</h2>
        <p className="text-slate-500 mb-6">هذا الكويز لا يحتوي على أي أسئلة حاليا</p>
        {contextType === "lesson" && lessonId ? (
          <Link href={`/dashboard/student/lessons/${lessonId}`} className="bg-purple-800 text-white px-6 py-3 rounded-xl font-bold">العودة للدرس</Link>
        ) : (
          <Link href={`/dashboard/student/${contextType === "exam" ? "exams" : "exercises"}`} className="bg-purple-800 text-white px-6 py-3 rounded-xl font-bold">العودة</Link>
        )}
      </div>
    );
  }

  if (isFinished) {
    let score = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswerIndex) {
        score += 1;
      }
    });

    const finalScore = Math.round((score / questions.length) * maxScore);
    const percentage = (finalScore / maxScore) * 100;

    let uiColor = "";
    let IconComponent = Trophy;
    let feedbackMessage = "";

    if (percentage < 50) {
      uiColor = "red";
      IconComponent = RotateCcw;
      feedbackMessage = "عليك التركيز أكثر، راجع الدرس وحاول مجدداً!";
    } else if (percentage >= 50 && percentage < 75) {
      uiColor = "orange";
      IconComponent = Trophy; 
      feedbackMessage = "جيد، استمر في المراجعة لتحقيق الأفضل";
    } else {
      uiColor = "emerald";
      IconComponent = Trophy;
      feedbackMessage = "ممتاز يا بطل نحن نفتخر بك";
    }

    // Map UI color to tailwind classes
    const colorClasses = {
      red: {
        text: "text-purple-800",
        bg: "bg-purple-100 dark:bg-purple-950/30",
        gradient: "bg-gradient-to-br from-purple-600 to-purple-800 shadow-purple-600/30",
        scoreText: "text-purple-800"
      },
      orange: {
        text: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        gradient: "bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-500/30",
        scoreText: "text-orange-500"
      },
      emerald: {
        text: "text-purple-800",
        bg: "bg-purple-100 dark:bg-purple-950/30",
        gradient: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-600/30",
        scoreText: "text-purple-700"
      }
    };

    const currentColors = colorClasses[uiColor as keyof typeof colorClasses];

    return (
      <div className="bg-white dark:bg-white rounded-3xl p-10 md:p-16 text-center border border-slate-100 dark:border-purple-200 shadow-sm max-w-2xl mx-auto">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg text-purple-950 ${currentColors.gradient}`}>
          <IconComponent className="w-12 h-12" />
        </div>
        
        <h2 className="text-3xl font-black text-purple-950 dark:text-purple-950 mb-2">النتيجة النهائية</h2>
        <p className="text-slate-500 font-medium mb-8">لقد أكملت اختبار درس {lessonTitle}</p>
        
        <div className={`text-6xl font-black mb-6 flex justify-center items-baseline gap-2 ${currentColors.scoreText}`}>
          <span>{finalScore}</span>
          <span className="text-2xl text-slate-400">/ {maxScore}</span>
        </div>

        <div className={`text-lg font-bold mb-8 px-6 py-4 rounded-xl inline-block ${currentColors.text} ${currentColors.bg}`}>
          {feedbackMessage}
        </div>

        <div>
          <Link 
            href="/dashboard/student"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-purple-950 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-sm"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasSelectedCurrent = selectedAnswers[currentQuestionIndex] !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-end">
        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-1.5 rounded-lg text-sm font-bold">
          السؤال {currentQuestionIndex + 1} من {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-white rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-purple-200">
        <h2 className="text-2xl font-black text-purple-950 dark:text-purple-950 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-right p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                    : 'border-slate-100 dark:border-purple-200 hover:border-green-200 dark:hover:border-green-800 hover:bg-white dark:hover:bg-white/50'
                }`}
              >
                <span className={`font-bold text-lg ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-purple-800 dark:text-purple-800'}`}>
                  {opt}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected 
                    ? 'border-green-600 bg-green-600 text-purple-950' 
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-green-300'
                }`}>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          السابق
        </button>
        
        <button
          onClick={handleNext}
          disabled={!hasSelectedCurrent}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white dark:disabled:text-slate-600 text-purple-950 px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm"
        >
          {currentQuestionIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
