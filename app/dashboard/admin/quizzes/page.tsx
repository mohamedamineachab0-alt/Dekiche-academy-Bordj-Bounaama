import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { HelpCircle, Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      lesson: {
        include: {
          subjects: true,
        }
      },
      dailyExercise: {
        include: {
          subject: true,
        }
      },
      exam: {
        include: {
          subject: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إدارة الاختبارات (Quizzes)"
        description="عرض جميع الاختبارات المرتبطة بالدروس، التمارين اليومية، والامتحانات"
        icon={HelpCircle}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right rtl">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">العنوان / المادة</th>
                <th className="px-6 py-4">توليد بالذكاء الاصطناعي</th>
                <th className="px-6 py-4">عدد الأسئلة</th>
                <th className="px-6 py-4">العلامة الكاملة</th>
                <th className="px-6 py-4">تاريخ الإنشاء</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quizzes.map(quiz => {
                const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
                
                let type = "غير محدد";
                let title = "بدون عنوان";
                let subject = "بدون مادة";

                if (quiz.lesson) {
                  type = "درس";
                  title = quiz.lesson.title;
                  subject = quiz.lesson.subjects?.[0]?.title || "بدون مادة";
                } else if (quiz.dailyExercise) {
                  type = "تمرين يومي";
                  title = quiz.dailyExercise.title;
                  subject = quiz.dailyExercise.subject?.title || "بدون مادة";
                } else if (quiz.exam) {
                  type = "امتحان";
                  title = quiz.exam.title;
                  subject = quiz.exam.subject?.title || "بدون مادة";
                }

                return (
                  <tr key={quiz.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        {type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{title}</div>
                      <div className="text-xs text-slate-500">{subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      {quiz.aiGenerated ? (
                        <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">نعم</span>
                      ) : (
                        <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded-md">لا</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {questions.length} أسئلة
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {quiz.maxScore}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {new Date(quiz.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="عرض الأسئلة (قريباً)"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                    لا توجد اختبارات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
