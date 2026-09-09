import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { HelpCircle, Eye } from "lucide-react";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      lesson: {
        include: {
          subjects: true,
        },
      },
      dailyExercise: {
        include: {
          subject: true,
        },
      },
      exam: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة الاختبارات"
        description="عرض جميع الاختبارات المرتبطة بالدروس والتمارين اليومية والامتحانات."
        icon={HelpCircle}
      />

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full data-table min-w-[800px]">
            <thead>
              <tr>
                <th>النوع</th>
                <th>العنوان / المادة</th>
                <th>توليد بالذكاء الاصطناعي</th>
                <th>عدد الأسئلة</th>
                <th>العلامة الكاملة</th>
                <th>تاريخ الإنشاء</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => {
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
                  <tr key={quiz.id}>
                    <td>
                      <span className="badge-soft">{type}</span>
                    </td>
                    <td>
                      <div className="font-semibold text-ink">{title}</div>
                      <div className="text-xs text-muted">{subject}</div>
                    </td>
                    <td>
                      {quiz.aiGenerated ? (
                        <span className="badge-soft">نعم</span>
                      ) : (
                        <span className="badge-outline">لا</span>
                      )}
                    </td>
                    <td className="font-semibold text-ink tabular-nums">{questions.length} أسئلة</td>
                    <td className="font-semibold text-ink tabular-nums">{quiz.maxScore}</td>
                    <td className="text-muted font-mono text-xs">
                      {new Date(quiz.createdAt).toLocaleDateString("ar-DZ")}
                    </td>
                    <td>
                      <button className="p-2 text-primary hover:bg-primary-soft rounded-xl" title="عرض الأسئلة (قريباً)">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {quizzes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">
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
