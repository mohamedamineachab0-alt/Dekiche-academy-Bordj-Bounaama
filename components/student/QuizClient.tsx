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
      <div className="text-center p-8 md:p-12 bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative font-sans">
        <h2 className="text-2xl font-black text-[#000000] mb-3 relative z-10">لا توجد أسئلة</h2>
        <p className="text-gray-600 font-bold mb-8 relative z-10">هذا الكويز لا يحتوي على أي أسئلة حاليا</p>
        {contextType === "lesson" && lessonId ? (
          <Link href={`/dashboard/student/lessons/${lessonId}`} className="bg-[#7E22CE] hover:bg-[#6B21A8] text-white px-8 py-4 rounded-xl font-black border-[3px] border-[#000000] shadow-sm transition-transform hover:-translate-y-1 hover:shadow-3d-hover relative z-10 inline-block">العودة للدرس</Link>
        ) : (
          <Link href={`/dashboard/student/${contextType === "exam" ? "exams" : "exercises"}`} className="bg-[#7E22CE] hover:bg-[#6B21A8] text-white px-8 py-4 rounded-xl font-black border-[3px] border-[#000000] shadow-sm transition-transform hover:-translate-y-1 hover:shadow-3d-hover relative z-10 inline-block">العودة</Link>
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
        text: "text-[#000000]",
        bg: "bg-[#FEE2E2]",
        gradient: "bg-[#EF4444]",
        scoreText: "text-[#EF4444]"
      },
      orange: {
        text: "text-[#000000]",
        bg: "bg-[#FFEDD5]",
        gradient: "bg-[#F97316]",
        scoreText: "text-[#F97316]"
      },
      emerald: {
        text: "text-[#000000]",
        bg: "bg-[#DCFCE7]",
        gradient: "bg-[#22C55E]",
        scoreText: "text-[#22C55E]"
      }
    };

    const currentColors = colorClasses[uiColor as keyof typeof colorClasses];

    return (
      <div className="bg-[#FFFFFF] rounded-3xl p-10 md:p-16 text-center border-[3px] border-[#000000] shadow-3d-soft max-w-2xl mx-auto paper-cut relative font-sans">
        <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-8 border-[3px] border-[#000000] shadow-sm text-[#000000] transform rotate-3 relative z-10 ${currentColors.gradient}`}>
          <IconComponent className="w-12 h-12" strokeWidth={2.5} />
        </div>
        
        <h2 className="text-3xl font-black text-[#000000] mb-3 relative z-10">النتيجة النهائية</h2>
        <p className="text-gray-600 font-bold mb-8 relative z-10">لقد أكملت اختبار درس {lessonTitle}</p>
        
        <div className={`text-6xl font-mono font-black mb-8 flex justify-center items-baseline gap-3 relative z-10 ${currentColors.scoreText}`}>
          <span className="bg-[#EAE4D9] px-4 py-2 rounded-xl border-[3px] border-[#000000] shadow-sm transform -rotate-2">{finalScore}</span>
          <span className="text-3xl text-gray-400">/ {maxScore}</span>
        </div>

        <div className={`text-lg font-black mb-10 px-6 py-4 rounded-xl inline-block border-[3px] border-[#000000] shadow-sm relative z-10 ${currentColors.text} ${currentColors.bg}`}>
          {feedbackMessage}
        </div>

        <div className="relative z-10">
          <Link 
            href="/dashboard/student"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#FACC15] hover:bg-[#FDE047] text-[#000000] border-[3px] border-[#000000] px-10 py-4 rounded-xl font-black text-lg transition-transform shadow-sm hover:-translate-y-1 hover:shadow-3d-hover"
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
    <div className="space-y-8 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-end">
        <span className="bg-[#22C55E] text-[#000000] border-[3px] border-[#000000] px-4 py-2 rounded-lg text-sm font-black shadow-sm transform rotate-1">
          السؤال {currentQuestionIndex + 1} من {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-4 w-full bg-[#EAE4D9] border-[3px] border-[#000000] rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-[#7E22CE] border-r-[3px] border-[#000000] transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-[#FFFFFF] rounded-3xl p-8 md:p-12 shadow-3d-soft border-[3px] border-[#000000] paper-cut relative z-10">
        <h2 className="text-2xl font-black text-[#000000] mb-8 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-right p-5 rounded-2xl border-[3px] transition-transform flex items-center justify-between group hover:-translate-y-1 hover:shadow-3d-hover ${
                  isSelected 
                    ? 'border-[#000000] bg-[#FACC15] shadow-3d-soft' 
                    : 'border-[#000000] bg-[#F8F9FA] hover:bg-[#EAE4D9] shadow-sm'
                }`}
              >
                <span className={`font-black text-lg text-[#000000]`}>
                  {opt}
                </span>
                <div className={`w-8 h-8 rounded-xl border-[3px] border-[#000000] flex items-center justify-center shrink-0 transition-colors shadow-sm transform ${
                  isSelected 
                    ? 'bg-[#22C55E] text-[#000000] rotate-3' 
                    : 'bg-white group-hover:bg-[#FFFFFF]'
                }`}>
                  {isSelected && <CheckCircle2 className="w-5 h-5" strokeWidth={3} />}
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
          className="px-8 py-4 rounded-xl font-black text-[#000000] border-[3px] border-[#000000] bg-[#EAE4D9] hover:bg-[#D6CEBC] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all shadow-sm hover:-translate-y-1 hover:shadow-3d-hover"
        >
          السابق
        </button>
        
        <button
          onClick={handleNext}
          disabled={!hasSelectedCurrent}
          className="flex items-center gap-2 bg-[#7E22CE] hover:bg-[#6B21A8] disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 text-white border-[3px] border-[#000000] px-10 py-4 rounded-xl font-black transition-all shadow-sm hover:-translate-y-1 hover:shadow-3d-hover disabled:hover:translate-y-0 disabled:shadow-none"
        >
          {currentQuestionIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
          <ArrowLeft className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>

    </div>
  );
}
