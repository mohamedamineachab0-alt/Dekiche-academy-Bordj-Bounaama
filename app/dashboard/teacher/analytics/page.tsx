import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  AlertTriangle,
  PlayCircle,
  Users,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Eye,
  FileText,
  ChevronLeft,
  Flame,
  Award,
  AlertCircle
} from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MathPreview } from "@/components/shared/MathPreview";
import { getTeacherSession } from "@/lib/teacher";
import { getTeacherAnalytics } from "@/lib/teacher-analytics";

export const metadata = {
  title: "التحليل الأكاديمي الشامل | فضاء الأساتذة",
  description: "إحصائيات تفصيلية لتفاعل التلاميذ، الدروس الأكثر مشاهدة، الدروس الأكثر إعادة، وأخطاء الطلبة",
};

export default async function TeacherAnalyticsPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const analytics = await getTeacherAnalytics(session.subjectIds);

  return (
    <div className="space-y-8 font-sans pb-16" dir="rtl">
      <HeroBanner
        variant="hero"
        title="التحليل الأكاديمي الشامل لأداء التلاميذ والدروس"
        description="تتبع مستوى تلاميذك، الدروس الأكثر مشاهدة، الدروس التي أعادها الطلبة بكثرة، وتفاصيل الأخطاء المسجلة لمعالجتها."
        icon={BarChart3}
      />

      {/* 1. Global KPI Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-card p-5 rounded-2xl border border-line flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">التلاميذ المسجلين</p>
            <p className="text-2xl font-bold text-ink font-mono mt-0.5">
              {analytics.totalStudents}
            </p>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-line flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">إجمالي المشاهدات والإتمام</p>
            <p className="text-2xl font-bold text-ink font-mono mt-0.5">
              {analytics.totalCompletions}
            </p>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-line flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">الكويزات المنجزة</p>
            <p className="text-2xl font-bold text-ink font-mono mt-0.5">
              {analytics.totalQuizAttempts}
            </p>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-line flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">الأخطاء المرصودة</p>
            <p className="text-2xl font-bold text-red-600 font-mono mt-0.5">
              {analytics.totalMistakes}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Key Insights: Most Viewed vs Most Repeated */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Lessons */}
        <div className="surface-card p-6 rounded-3xl border border-line space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-ink">
                  الدروس الأكثر مشاهدة وإتماماً
                </h3>
                <p className="text-xs text-muted">
                  الدروس التي شهدت أكبر إقبال وتفاعل من التلاميذ
                </p>
              </div>
            </div>
            <span className="badge-soft text-xs font-mono">Top 5</span>
          </div>

          {analytics.mostViewedLessons.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              لا توجد بيانات مشاهدات مسجلة بعد.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.mostViewedLessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-2xl bg-surface border border-line/60 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-surface-muted border border-line flex items-center justify-center font-mono font-bold text-xs text-ink shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-ink truncate">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-muted font-mono">
                        {lesson.subjectTitle} · الشهر {lesson.month}
                      </p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="font-mono text-sm font-bold text-primary block">
                      {lesson.completions} مشاهدة
                    </span>
                    <span className="text-[11px] text-muted font-mono">
                      نسبة الإتمام: {lesson.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Repeated / Re-attempted Lessons */}
        <div className="surface-card p-6 rounded-3xl border border-line space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-ink">
                  الدروس الأكثر إعادة وتكراراً
                </h3>
                <p className="text-xs text-muted">
                  الدروس التي أعادها التلاميذ أو ارتكبوا فيها أخطاء متعددة
                </p>
              </div>
            </div>
            <span className="badge-soft text-xs font-mono">يحتاج تركيز</span>
          </div>

          {analytics.mostRepeatedLessons.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              لا توجد مؤشرات إعادة مسجلة بعد.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.mostRepeatedLessons.map((lesson, idx) => {
                const isHighMistakes = lesson.mistakesCount > 5;
                return (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-2xl bg-surface border border-line/60 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-ink truncate">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-muted font-mono">
                          {lesson.subjectTitle} · الشهر {lesson.month}
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="font-mono text-sm font-bold text-amber-700 block">
                        {lesson.mistakesCount} خطأ مرصود
                      </span>
                      <span className="text-[11px] text-muted">
                        {isHighMistakes ? "صعوبة مرتفعة" : "صعوبة متوسطة"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. Recent Student Mistakes Section */}
      <section className="surface-card p-6 rounded-3xl border border-line space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-4">
          <div>
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>أحدث أخطاء التلاميذ المرصودة في دروسك</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              اطّلع على إجابات التلاميذ الخاطئة ومقارنتها بالحل النموذجي لتوجيههم
              في الحصص القادمة
            </p>
          </div>
          <Link
            href="/dashboard/teacher/mistakes"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>عرض كل الأخطاء ({analytics.totalMistakes})</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analytics.recentMistakes.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-sm text-muted">
              لا توجد أخطاء مرصودة حالياً. أداء التلاميذ ممتاز.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.recentMistakes.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-surface border border-line space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-ink">{m.studentName}</span>
                  <span className="text-muted font-mono">{m.lessonTitle}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="font-bold text-red-700 block mb-1">
                      إجابة التلميذ الخاطئة:
                    </span>
                    <MathPreview text={m.mistakeContent} className="text-ink" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-emerald-700 block mb-1">
                      الحل والتفسير الصحيح:
                    </span>
                    <MathPreview text={m.correctSolution} className="text-ink" />
                  </div>
                </div>

                <div className="text-[11px] text-muted text-left font-mono pt-1">
                  {new Date(m.createdAt).toLocaleDateString("ar-DZ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Active Students Performance Table */}
      <section className="surface-card p-6 rounded-3xl border border-line space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>إحصائيات تفاعل التلاميذ</span>
            </h3>
            <p className="text-xs text-muted">
              قائمة التلاميذ الأكثر نشاطاً ونسب إتمامهم للدروس والكويزات
            </p>
          </div>
          <Link
            href="/dashboard/teacher/students"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>كل التلاميذ ({analytics.totalStudents})</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analytics.studentStats.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            لا توجد بيانات تلاميذ مسجلين بعد.
          </p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full data-table min-w-162.5 text-xs">
              <thead>
                <tr>
                  <th>اسم التلميذ</th>
                  <th>رقم الهاتف</th>
                  <th className="text-center">الدروس المكتملة</th>
                  <th className="text-center">الكويزات المنجزة</th>
                  <th className="text-center">الأخطاء المسجلة</th>
                  <th className="text-left">الحالة الأكاديمية</th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentStats.map((st) => {
                  const status =
                    st.mistakesCount > 10
                      ? "بحاجة لمرافقة وتصحيح"
                      : st.completedLessons > 5
                      ? "نشط ومتقدم"
                      : "في البداية";

                  const statusColor =
                    status === "بحاجة لمرافقة وتصحيح"
                      ? "text-red-600 bg-red-500/10"
                      : status === "نشط ومتقدم"
                      ? "text-emerald-700 bg-emerald-500/10"
                      : "text-muted bg-surface-muted";

                  return (
                    <tr key={st.id}>
                      <td className="font-bold text-ink">
                        <Link
                          href={`/dashboard/teacher/students/${st.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {st.fullName}
                        </Link>
                      </td>
                      <td dir="ltr" className="text-right font-mono text-muted">
                        {st.phoneNumber}
                      </td>
                      <td className="text-center font-mono font-bold">
                        {st.completedLessons}
                      </td>
                      <td className="text-center font-mono font-bold">
                        {st.completedQuizzes}
                      </td>
                      <td className="text-center font-mono font-bold text-red-600">
                        {st.mistakesCount}
                      </td>
                      <td className="text-left">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-semibold ${statusColor}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. Comprehensive Lessons Analysis Table */}
      <section className="surface-card p-6 rounded-3xl border border-line space-y-4">
        <div>
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>جدول تحليل وتفاعل كافة الدروس ({analytics.totalLessons})</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            تحليل مستوى كل درس من حيث عدد المشاهدات، نسبة الإتمام، ومعدل
            الأخطاء
          </p>
        </div>

        {analytics.lessonStats.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            لا توجد دروس مضافة بعد.
          </p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full data-table min-w-175 text-xs">
              <thead>
                <tr>
                  <th>عنوان الدرس</th>
                  <th>المادة</th>
                  <th className="text-center">المشاهدات / الإتمام</th>
                  <th className="text-center">نسبة الإتمام</th>
                  <th className="text-center">الكويزات المكتملة</th>
                  <th className="text-center">الأخطاء</th>
                  <th className="text-left">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {analytics.lessonStats.map((lesson) => {
                  const difficulty =
                    lesson.mistakesCount > 10 || lesson.completionRate < 30
                      ? "صعب (يحتاج مراجعة)"
                      : lesson.mistakesCount > 3 || lesson.completionRate < 60
                      ? "متوسط الصعوبة"
                      : "مستوعب جيداً";

                  const badgeClass =
                    difficulty === "صعب (يحتاج مراجعة)"
                      ? "text-red-600 bg-red-500/10"
                      : difficulty === "متوسط الصعوبة"
                      ? "text-amber-700 bg-amber-500/10"
                      : "text-emerald-700 bg-emerald-500/10";

                  return (
                    <tr key={lesson.id}>
                      <td className="font-bold text-ink">{lesson.title}</td>
                      <td className="text-muted font-mono">{lesson.subjectTitle}</td>
                      <td className="text-center font-mono font-bold">
                        {lesson.completions}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono">{lesson.completionRate}%</span>
                          <div className="w-16 h-1.5 bg-line rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${lesson.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-center font-mono font-bold">
                        {lesson.quizCompletions}
                      </td>
                      <td className="text-center font-mono font-bold text-red-600">
                        {lesson.mistakesCount}
                      </td>
                      <td className="text-left">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-semibold ${badgeClass}`}
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
      </section>
    </div>
  );
}
