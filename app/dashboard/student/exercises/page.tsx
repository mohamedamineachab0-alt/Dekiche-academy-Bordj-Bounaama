import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, PlayCircle } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";

function quizCount(questions: unknown) {
  return Array.isArray(questions) ? questions.length : 0;
}

export default async function StudentExercisesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const [enrollments, studentProfile] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: sessionId },
      select: { subjectId: true, enrolledMonths: true },
    }),
    prisma.studentProfile.findUnique({
      where: { userId: sessionId },
      select: { stream: true },
    }),
  ]);

  const enrolledSubjectIds = enrollments.map((e) => e.subjectId);
  const enrolledMonths = Array.from(new Set(enrollments.flatMap((e) => e.enrolledMonths)));

  const exercises = await prisma.dailyExercise.findMany({
    where: {
      lessonId: { not: null },
      month: { in: enrolledMonths },
      AND: [
        {
          OR: [
            { subjectId: { in: enrolledSubjectIds } },
            { secondarySubjectId: { in: enrolledSubjectIds } },
          ],
        },
        studentProfile
          ? { OR: [{ stream: studentProfile.stream }, { stream: "NONE" }] }
          : {},
      ],
    },
    include: {
      subject: true,
      quiz: true,
      lesson: { select: { id: true, title: true } },
    },
    orderBy: [{ month: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <HeroBanner
        variant="hero"
        title="تماريني اليومية"
        description="اختبار من 20 سؤالاً لكل درس — مرتبط بالدرس الذي شاهدته، بلا فيديو أو ملحقات."
        icon={CheckCircle}
      />

      {exercises.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="icon-tile mx-auto mb-5">
            <CheckCircle className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد تمارين حالياً</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            ستظهر التمارين اليومية بعد تفعيل المادة ومشاهدة دروسها.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exercises.map((ex) => {
            const count = quizCount(ex.quiz?.questions);
            return (
              <article key={ex.id} className="surface-panel flex flex-col p-5">
                <span className="badge-soft w-fit">{ex.subject.title}</span>
                <h3 className="text-base font-bold text-ink mt-4 leading-snug">
                  {ex.lesson?.title || ex.title}
                </h3>
                <p className="text-sm text-muted mt-2">
                  اختبار يومي من {count || 20} سؤالاً مرتبط بهذا الدرس.
                </p>
                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                  <span className="badge-outline tabular-nums">{ex.maxScore} نقطة</span>
                  {ex.quiz ? (
                    <Link
                      href={`/dashboard/student/exercises/${ex.id}/quiz`}
                      className="btn-primary"
                    >
                      <PlayCircle className="w-4 h-4" />
                      بدء الاختبار
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">لا يوجد اختبار</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
