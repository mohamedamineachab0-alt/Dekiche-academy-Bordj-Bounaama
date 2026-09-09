import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Presentation, BookOpen, Users, AlertTriangle, ChevronLeft } from "lucide-react";
import { getWilayaName } from "@/lib/constants";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { formatTeacherName } from "@/lib/education-labels";
import { getTeacherSession, teacherMistakesWhere } from "@/lib/teacher";
import { mistakeQuizInclude } from "@/lib/mistake-source";
import { getStudentWorkFile, workCounts } from "@/lib/student-work";

export default async function TeacherDashboardPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const { teacher, subjectIds } = session;

  const enrolledStudents = await prisma.studentProfile.findMany({
    where: {
      user: {
        enrollments: {
          some: { subjectId: { in: subjectIds } },
        },
      },
    },
    include: {
      user: {
        include: {
          enrollments: {
            where: { subjectId: { in: subjectIds } },
            include: { subject: true },
          },
          mistakes: {
            where: teacherMistakesWhere(subjectIds),
            include: {
              lesson: { include: { subjects: { select: { title: true } } } },
              quiz: { include: mistakeQuizInclude },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  const workByStudent = new Map(
    await Promise.all(
      enrolledStudents.map(async (student) => {
        const file = await getStudentWorkFile(student.user.id, subjectIds);
        return [
          student.user.id,
          file
            ? workCounts(file)
            : { unwatchedLessons: 0, unsolvedExercises: 0, unsolvedLessonQuizzes: 0 },
        ] as const;
      }),
    ),
  );

  const totalMistakes = enrolledStudents.reduce(
    (acc, student) => acc + student.user.mistakes.length,
    0,
  );

  const STATS = [
    { label: "المواد المسندة", value: teacher.subjects.length, icon: BookOpen },
    { label: "تلاميذك", value: enrolledStudents.length, icon: Users },
    { label: "أخطاء في موادك", value: totalMistakes, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title={`مرحباً ${formatTeacherName(teacher.name)}`}
        description="تابع تلاميذك، أخطاءهم، تقدّمهم، وأولياء أمورهم في موادك."
        icon={Presentation}
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="surface-card p-5 flex items-center gap-4">
              <span className="icon-tile">
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-ink tabular-nums leading-tight">
                  {stat.value}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {teacher.subjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {teacher.subjects.map((subject) => (
            <span key={subject.id} className="badge-soft">
              {subject.title}
            </span>
          ))}
        </div>
      )}

      <section className="surface-panel">
        <div className="px-4 sm:px-6 py-4 border-b border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-primary-mid" />
            <h2 className="text-base font-bold text-ink">تلاميذك</h2>
          </div>
          <Link href="/dashboard/teacher/mistakes" className="text-sm font-semibold text-primary">
            كل الأخطاء
          </Link>
        </div>

        <div className="md:hidden divide-y divide-line">
          {enrolledStudents.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted">
              لا يوجد تلاميذ مسجّلون في موادك حالياً.
            </p>
          ) : (
            enrolledStudents.map((student) => {
              const levelStr = labelLevel(student.level);
              const streamStr = labelStream(student.stream);
              const work = workByStudent.get(student.user.id);
              return (
                <article key={student.id} className="px-4 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{student.user.fullName}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {levelStr} · {streamStr}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{getWilayaName(student.wilaya)}</p>
                    </div>
                    <Link
                      href={`/dashboard/teacher/students/${student.user.id}`}
                      className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                    >
                      الملف
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-surface-muted px-3 py-2">
                      <p className="text-[11px] text-muted">الأخطاء</p>
                      <p className="text-sm font-bold tabular-nums text-ink">{student.user.mistakes.length}</p>
                    </div>
                    <div className="rounded-xl bg-surface-muted px-3 py-2">
                      <p className="text-[11px] text-muted">بلا مشاهدة</p>
                      <p className="text-sm font-bold tabular-nums text-ink">{work?.unwatchedLessons ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-surface-muted px-3 py-2">
                      <p className="text-[11px] text-muted">تمارين معلّقة</p>
                      <p className="text-sm font-bold tabular-nums text-ink">{work?.unsolvedExercises ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-surface-muted px-3 py-2">
                      <p className="text-[11px] text-muted">كويز معلّق</p>
                      <p className="text-sm font-bold tabular-nums text-ink">{work?.unsolvedLessonQuizzes ?? 0}</p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full data-table min-w-[980px]">
            <thead>
              <tr>
                <th>التلميذ</th>
                <th>المستوى والشعبة</th>
                <th className="text-center">الأخطاء</th>
                <th className="text-center">دروس بلا مشاهدة</th>
                <th className="text-center">تمارين معلّقة</th>
                <th className="text-center">كويز معلّق</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted">
                    لا يوجد تلاميذ مسجّلون في موادك حالياً.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((student) => {
                  const levelStr = labelLevel(student.level);
                  const streamStr = labelStream(student.stream);
                  const work = workByStudent.get(student.user.id);

                  return (
                    <tr key={student.id}>
                      <td>
                        <p className="font-semibold text-ink">{student.user.fullName}</p>
                        <p className="text-xs text-muted mt-0.5">{getWilayaName(student.wilaya)}</p>
                      </td>
                      <td>
                        <p className="text-sm text-ink">{levelStr}</p>
                        <p className="text-xs text-muted mt-0.5">{streamStr}</p>
                      </td>
                      <td className="text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                            student.user.mistakes.length > 0
                              ? "bg-red-50 text-red-700"
                              : "bg-surface-muted text-muted"
                          }`}
                        >
                          {student.user.mistakes.length}
                        </span>
                      </td>
                      <td className="text-center tabular-nums font-semibold">
                        {work?.unwatchedLessons ?? 0}
                      </td>
                      <td className="text-center tabular-nums font-semibold">
                        {work?.unsolvedExercises ?? 0}
                      </td>
                      <td className="text-center tabular-nums font-semibold">
                        {work?.unsolvedLessonQuizzes ?? 0}
                      </td>
                      <td>
                        <Link
                          href={`/dashboard/teacher/students/${student.user.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                        >
                          الملف
                          <ChevronLeft className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
