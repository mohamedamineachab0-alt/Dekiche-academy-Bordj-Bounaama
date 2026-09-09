import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Lock, FileText, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { ExamSubmissionForm } from "@/components/student/ExamSubmissionForm";
import { MaterialFileActions } from "@/components/shared/MaterialFileActions";

export default async function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      enrollments: true,
    },
  });

  if (!user) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subject: true,
    },
  });

  if (!exam) redirect("/dashboard/student/exams");

  const enrollment = user.enrollments.find(
    (e) => e.subjectId === exam.subjectId || e.subjectId === exam.secondarySubjectId
  );

  if (!enrollment) redirect("/dashboard/student/exams");

  const isUnlocked = enrollment.enrolledMonths.includes(exam.month);

  if (!isUnlocked) {
    return (
      <div className="surface-card px-6 py-16 text-center max-w-lg mx-auto">
        <span className="icon-tile mx-auto mb-5">
          <Lock className="w-5 h-5" />
        </span>
        <h2 className="text-lg font-bold text-ink mb-2">الاختبار مغلق</h2>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          هذا الاختبار ينتمي إلى الشهر {exam.month} وهو غير مفعّل في اشتراكك الحالي.
        </p>
        <Link
          href={`/dashboard/student/subjects/${exam.subjectId}`}
          className="btn-primary"
        >
          العودة للمادة
        </Link>
      </div>
    );
  }

  const submission = await prisma.studentSubmission.findUnique({
    where: {
      examId_studentId: {
        examId: exam.id,
        studentId: user.id,
      },
    },
  });
  const hasSubmitted = !!submission;

  return (
    <div className="space-y-8 pb-12 font-sans" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/student/exams"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          العودة إلى الاختبارات
        </Link>
        <span className="badge-soft">الشهر {exam.month}</span>
      </div>

      <header className="pb-6 border-b border-line">
        <p className="rule-label mb-3">
          <span>{exam.subject.title}</span>
        </p>
        <h1 className="kufi text-[clamp(1.45rem,2.8vw,2rem)] text-ink">{exam.title}</h1>
      </header>

      {exam.a4ImageUrl && (
        <div className="surface-panel overflow-hidden p-3 md:p-4">
          <img
            src={exam.a4ImageUrl}
            alt={exam.title}
            className="w-full h-auto rounded-xl"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article className="surface-card p-6 flex flex-col">
          <span className="icon-tile mb-5">
            <BrainCircuit className="w-5 h-5" />
          </span>
          <h3 className="text-base font-bold text-ink mb-1.5">تسليم الحل أو الكويز</h3>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            أجرِ الاختبار أو ارفع حلك لتقييم مستواك.
          </p>
          <div className="mt-auto w-full">
            {exam.quiz ? (
              <Link
                href={`/dashboard/student/exams/${exam.id}/quiz`}
                className="btn-primary w-full"
              >
                بدء الاختبار
              </Link>
            ) : (
              <ExamSubmissionForm
                examId={exam.id}
                studentId={user.id}
                hasSubmitted={hasSubmitted}
                previousScore={submission?.score}
                previousFeedback={submission?.feedback}
              />
            )}
          </div>
        </article>

        <article className="surface-card p-6 flex flex-col">
          <span className="icon-tile mb-5">
            <FileText className="w-5 h-5" />
          </span>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-base font-bold text-ink">ملحقات الاختبار</h3>
            {exam.materials.length > 0 && (
              <span className="badge-outline tabular-nums">
                {exam.materials.length}
              </span>
            )}
          </div>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            حمّل الملفات والملخصات الخاصة بهذا الاختبار.
          </p>

          <div className="mt-auto space-y-3 w-full">
            {exam.materials.length > 0 ? (
              exam.materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-surface"
                >
                  <span className="font-semibold text-sm text-ink line-clamp-1 flex-1">
                    {mat.title}
                  </span>
                  <MaterialFileActions url={mat.fileUrl} title={mat.title} />
                </div>
              ))
            ) : (
              <div className="w-full text-center bg-surface-muted text-muted py-6 rounded-xl text-sm font-semibold border border-dashed border-line">
                لا توجد ملحقات إضافية
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
