import { LessonForm } from "@/components/admin/LessonForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Video, List } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function NewLessonPage() {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      title: true,
      levels: true,
      streams: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const recentLessons = await prisma.lesson.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      subjects: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="نشر درس جديد"
        description="أضف درساً جديداً مع الملحقات والكويز."
        icon={Video}
        action={
          <Link href="/dashboard/admin/lessons" className="btn-primary">
            <ChevronRight className="w-4 h-4" />
            العودة للدروس
          </Link>
        }
      />

      <LessonForm subjects={subjects} />

      <div className="surface-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="icon-tile">
            <List className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-ink">آخر الدروس المنشورة</h2>
        </div>

        {recentLessons.length === 0 ? (
          <div className="text-center py-8 text-muted border border-dashed border-line rounded-xl">
            لا توجد دروس منشورة بعد
          </div>
        ) : (
          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 rounded-xl border border-line bg-surface hover:bg-primary-soft transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="icon-tile-solid shrink-0">
                    <Video className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink">{lesson.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      المادة:{" "}
                      <span className="text-primary">
                        {lesson.subjects?.map((s) => s.title).join(" | ")}
                      </span>{" "}
                      · الشهر: {lesson.month}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono badge-outline shrink-0">Vimeo: {lesson.vimeoVideoId}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
