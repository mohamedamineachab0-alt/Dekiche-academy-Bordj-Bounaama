import { LessonForm } from "@/components/admin/LessonForm";
import { CreateLessonForm } from "@/components/admin/CreateLessonForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Video, List, UploadCloud, Link as LinkIcon } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function NewLessonPage(props: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const searchParams = await props.searchParams;
  const mode = searchParams?.mode || "upload"; // default to direct Vimeo upload

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
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      subjects: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="space-y-8 font-sans pb-16" dir="rtl">
      <HeroBanner
        variant="hero"
        title="نشر درس جديد"
        description="ارفع ملفات الفيديو مباشرة إلى Vimeo مع التشفير والحماية التلقائية وحفظها في قاعدة البيانات."
        icon={Video}
        action={
          <Link href="/dashboard/admin/lessons" className="btn-primary">
            <ChevronRight className="w-4 h-4" />
            العودة للدروس
          </Link>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-purple-100/80 border border-purple-200">
          <Link
            href="/dashboard/admin/lessons/new?mode=upload"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              mode === "upload"
                ? "bg-purple-700 text-white shadow-md shadow-purple-700/20"
                : "text-purple-900 hover:text-purple-950"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>رفع ملف فيديو مباشر (Vimeo API)</span>
          </Link>

          <Link
            href="/dashboard/admin/lessons/new?mode=form"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              mode === "form"
                ? "bg-purple-700 text-white shadow-md shadow-purple-700/20"
                : "text-purple-900 hover:text-purple-950"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>إدخال معرف فيديو / رابط وكويز</span>
          </Link>
        </div>
      </div>

      {/* Active Form */}
      {mode === "upload" ? (
        <CreateLessonForm subjects={subjects.map((s) => ({ id: s.id, title: s.title }))} />
      ) : (
        <LessonForm subjects={subjects} />
      )}

      {/* Recent lessons feed */}
      <div className="surface-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="icon-tile">
            <List className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-ink">آخر الدروس المنشورة في المنصة</h2>
        </div>

        {recentLessons.length === 0 ? (
          <div className="text-center py-8 text-muted border border-dashed border-line rounded-xl">
            لا توجد دروس منشورة بعد
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <h3 className="font-bold text-ink truncate">{lesson.title}</h3>
                    <p className="text-xs text-muted mt-1">
                      المادة:{" "}
                      <span className="text-primary font-semibold">
                        {lesson.subjects?.map((s) => s.title).join(" | ")}
                      </span>{" "}
                      · الشهر: {lesson.month}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono badge-outline shrink-0">
                  Vimeo: {lesson.vimeoVideoId || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
