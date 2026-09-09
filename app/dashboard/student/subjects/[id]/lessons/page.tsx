import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, PlayCircle, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { HeroBanner } from "@/components/shared/HeroBanner";

export const dynamic = "force-dynamic";

export default async function SubjectLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: [{ month: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!subject) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: id,
      },
    },
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const allLessons = subject.lessons;
  const completedRows = await prisma.lessonCompletion.findMany({
    where: {
      studentId: sessionId,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  });
  const completedIds = new Set(completedRows.map((row) => row.lessonId));
  const unlockedCount = allLessons.filter((l) =>
    enrollment.enrolledMonths.includes(l.month)
  ).length;

  const months = [...new Set(allLessons.map((l) => l.month))].sort((a, b) => a - b);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans pb-12 min-w-0" dir="rtl">
      <Link
        href={`/dashboard/student/subjects/${subject.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"
      >
        <ChevronLeft className="w-4 h-4 rotate-180 shrink-0" />
        نظرة عامة على المادة
      </Link>

      <HeroBanner
        variant="hero"
        title="الدروس المسجّلة"
        description={`${subject.title} — ${unlockedCount} من ${allLessons.length} درس مفتوح في اشتراكك.`}
        icon={PlayCircle}
      />

      {allLessons.length === 0 ? (
        <div className="surface-card px-5 py-14 sm:px-6 sm:py-16 text-center">
          <span className="icon-tile mx-auto mb-5">
            <PlayCircle className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-ink mb-2">لا توجد دروس متاحة</h2>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            لم تُنشر أي دروس لهذا المقرّر بعد.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {months.map((month) => {
            const monthLessons = allLessons.filter((l) => l.month === month);
            const monthUnlocked = enrollment.enrolledMonths.includes(month);

            return (
              <section key={month} className="min-w-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-ink">الشهر {month}</h2>
                  <span className={monthUnlocked ? "badge-soft" : "badge-outline"}>
                    {monthUnlocked ? "مفتوح" : "مغلق"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
                  {monthLessons.map((lesson) => {
                    const unlocked = enrollment.enrolledMonths.includes(lesson.month);
                    const completed = completedIds.has(lesson.id);

                    return (
                      <Link
                        href={`/dashboard/student/lessons/${lesson.id}`}
                        key={lesson.id}
                        className="group surface-card-interactive flex flex-col overflow-hidden min-w-0"
                      >
                        <div className="relative aspect-video bg-primary-soft flex items-center justify-center overflow-hidden">
                          {lesson.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={lesson.image}
                              alt=""
                              className={`absolute inset-0 w-full h-full object-cover ${unlocked ? "" : "opacity-40"}`}
                            />
                          ) : null}
                          {completed ? (
                            <span className="absolute top-3 start-3 z-10 badge-soft">مكتمل</span>
                          ) : null}
                          <span
                            className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                              unlocked
                                ? "bg-white/95 text-primary group-hover:scale-105 transition-transform"
                                : "bg-white/90 text-muted"
                            }`}
                          >
                            {unlocked ? (
                              completed ? (
                                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                              ) : (
                                <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                              )
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
                          <h3 className="text-sm sm:text-[0.9375rem] font-semibold text-ink leading-relaxed line-clamp-2 mb-3">
                            {lesson.title}
                          </h3>
                          <span
                            className={`mt-auto inline-flex items-center gap-1.5 text-sm font-semibold ${
                              unlocked ? "text-primary" : "text-muted"
                            }`}
                          >
                            {!unlocked
                              ? "غير مفعّل في اشتراكك"
                              : completed
                                ? "مكتمل — إعادة المشاهدة"
                                : "شاهد الدرس"}
                            {unlocked && <ChevronLeft className="w-4 h-4 shrink-0" />}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
