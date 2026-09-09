import { prisma } from "@/lib/prisma";
import { CheckCircle } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { DailyExerciseForm } from "@/components/admin/DailyExerciseForm";

export default async function AdminExercisesPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const exercises = await prisma.dailyExercise.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true, secondarySubject: true, quiz: true },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة التمارين اليومية"
        description="أضف تحديات وتمارين يومية لرفع تفاعل التلاميذ وزيادة رصيد نقاطهم."
        icon={CheckCircle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DailyExerciseForm subjects={subjects} />
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex) => (
              <article key={ex.id} className="surface-card overflow-hidden flex flex-col">
                <div className="h-40 w-full relative bg-surface-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.a4ImageUrl} alt={ex.title} className="w-full h-full object-cover object-top" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    {ex.maxScore} نقطة
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-ink line-clamp-1">{ex.title}</h3>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted badge-outline w-fit">المادة: {ex.subject.title}</p>
                    {ex.secondarySubject && (
                      <p className="text-xs font-semibold text-muted badge-outline w-fit">
                        ثانوي: {ex.secondarySubject.title}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4">
                    <span className="text-xs font-semibold text-muted">
                      الاختبار الذكي: {ex.quiz ? "مربوط" : "غير مربوط"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
            {exercises.length === 0 && (
              <div className="col-span-full surface-card px-6 py-16 text-center">
                <span className="icon-tile mx-auto mb-4">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <p className="text-sm text-muted">لا توجد تمارين يومية مضافة بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
