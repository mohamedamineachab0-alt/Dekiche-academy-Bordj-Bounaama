import { redirect } from "next/navigation";
import { BarChart3, AlertTriangle, PlayCircle, Users, Percent } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getTeacherSession } from "@/lib/teacher";
import { getTeacherAnalytics } from "@/lib/teacher-analytics";

export default async function TeacherAnalyticsPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const analytics = await getTeacherAnalytics(session.subjectIds);

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <HeroBanner
        variant="hero"
        title="التحليل الأكاديمي الشامل"
        description="تتبع مستوى تلاميذك، أخطاءهم المتكررة، ونسب إتمام الدروس لتحسين جودة التعليم."
        icon={BarChart3}
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted">التلاميذ المسجلين</p>
            <p className="text-2xl font-bold text-ink">{analytics.totalStudents}</p>
          </div>
        </div>
        <div className="surface-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted">إجمالي الدروس</p>
            <p className="text-2xl font-bold text-ink">{analytics.totalLessons}</p>
          </div>
        </div>
        <div className="surface-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted">الأخطاء المسجلة</p>
            <p className="text-2xl font-bold text-ink">{analytics.totalMistakes}</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-ink">تحليل الدروس وتفاعل التلاميذ</h2>
        <p className="text-sm text-muted">قائمة الدروس مرتبة حسب الأكثر صعوبة (من حيث الأخطاء ونسبة عدم الإتمام).</p>

        <div className="surface-panel p-6 overflow-hidden mt-4">
          {analytics.lessonStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">لا توجد بيانات متاحة للدروس حتى الآن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full data-table min-w-[600px]">
                <thead>
                  <tr>
                    <th>عنوان الدرس</th>
                    <th className="text-center">عدد المشاهدات / الإتمام</th>
                    <th className="text-center">نسبة الإتمام</th>
                    <th className="text-center">الأخطاء المسجلة</th>
                    <th className="text-center">مستوى الصعوبة</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.lessonStats.map((lesson) => {
                    const difficulty =
                      lesson.mistakesCount > 10 || lesson.completionRate < 30
                        ? "صعب جداً (بحاجة لمراجعة)"
                        : lesson.mistakesCount > 3 || lesson.completionRate < 60
                        ? "متوسط (يحتاج انتباه)"
                        : "جيد";

                    const difficultyColor =
                      difficulty === "صعب جداً (بحاجة لمراجعة)"
                        ? "text-red-600 bg-red-50"
                        : difficulty === "متوسط (يحتاج انتباه)"
                        ? "text-amber-600 bg-amber-50"
                        : "text-emerald-600 bg-emerald-50";

                    return (
                      <tr key={lesson.id}>
                        <td className="font-semibold text-ink">{lesson.title}</td>
                        <td className="text-center font-mono">{lesson.completions}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono text-sm">{lesson.completionRate}%</span>
                            <div className="w-16 h-2 bg-line rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${lesson.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="text-center font-mono text-red-500 font-bold">
                          {lesson.mistakesCount}
                        </td>
                        <td className="text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}
                          >
                            {difficulty}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
