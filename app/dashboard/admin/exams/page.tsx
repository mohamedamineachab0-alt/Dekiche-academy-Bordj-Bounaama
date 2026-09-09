import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { FileText } from "lucide-react";
import { ExamUploadForm } from "@/components/admin/ExamUploadForm";

export default async function AdminExamsPage() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, phase: true, levels: true, streams: true },
    orderBy: { createdAt: "desc" },
  });

  const recentExams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      subject: true,
      quiz: true,
      _count: {
        select: { submissions: true },
      },
    },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة الاختبارات والفروض"
        description="ارفع صور الاختبارات ليستخرج الذكاء الاصطناعي الأسئلة ويصحّح إجابات التلاميذ."
        icon={FileText}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ExamUploadForm subjects={subjects} />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-ink">أحدث الاختبارات المرفوعة</h3>

          <div className="space-y-4">
            {recentExams.length === 0 ? (
              <div className="surface-card px-6 py-12 text-center">
                <p className="text-sm text-muted">لم يتم رفع أي اختبارات بعد.</p>
              </div>
            ) : (
              recentExams.map((exam) => (
                <article key={exam.id} className="surface-card p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="font-bold text-ink">{exam.title}</h4>
                    <span className="badge-soft shrink-0">{exam.subject.title}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {exam.quiz ? "تم استخراج الأسئلة بنجاح" : "بدون كويز آلي"}
                    </span>
                    <span className="font-semibold text-primary tabular-nums">
                      {exam._count.submissions} إجابة
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
