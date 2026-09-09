import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { GraduationCap, ChevronLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function StudentExamsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      enrollments: true,
    },
  });

  if (!user) redirect("/login");

  const enrolledSubjectIds = user.enrollments.map((e) => e.subjectId);

  const studentSubmissions = await prisma.studentSubmission.findMany({
    where: { studentId: user.id },
  });

  const exams = await prisma.exam.findMany({
    where: {
      subjectId: { in: enrolledSubjectIds },
    },
    include: {
      subject: true,
      quiz: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="الاختبارات والفروض"
        description="استعرض اختباراتك وحمل الحل بخط يدك ليقوم الذكاء الاصطناعي بتصحيحه فوراً وتوجيهك"
        icon={GraduationCap}
      />

      {exams.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="icon-tile mx-auto mb-5">
            <GraduationCap className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد اختبارات متاحة حالياً</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            ستظهر هنا الاختبارات الخاصة بالمواد التي سجلت فيها
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {exams.map((exam) => {
            const submission = studentSubmissions.find((sub) => sub.examId === exam.id);
            const hasSubmitted = !!submission;

            return (
              <article key={exam.id} className="surface-panel flex flex-col">
                <div className="p-5 md:p-6 border-b border-line bg-primary-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="badge-soft">{exam.subject.title}</span>
                        {hasSubmitted && (
                          <span className="badge-accent">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تم التسليم
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-ink leading-snug">{exam.title}</h3>
                    </div>
                    <div className="shrink-0 text-center surface-card px-4 py-2.5">
                      <p className="text-[0.7rem] font-semibold text-muted mb-0.5">العلامة الكلية</p>
                      <p className="font-bold text-xl text-ink tabular-nums" dir="ltr">{exam.maxScore}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6 flex-1 flex flex-col justify-end">
                  <Link
                    href={`/dashboard/student/exams/${exam.id}`}
                    className="btn-secondary w-full"
                  >
                    الدخول إلى الاختبار
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
