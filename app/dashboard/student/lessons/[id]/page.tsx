import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { LessonTabs } from "@/components/student/LessonTabs";
import { LessonWatchTracker } from "@/components/student/LessonWatchTracker";
import { MarkLessonWatchedButton } from "@/components/student/MarkLessonWatchedButton";

export default async function LessonStudyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subjects: true,
    },
  });

  if (!lesson) redirect("/dashboard/student/subjects");

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: sessionId,
      subjectId: { in: lesson.subjects.map((s) => s.id) },
    },
  });

  if (enrollments.length === 0) redirect("/dashboard/student/subjects");

  const isUnlocked = enrollments.some((e) => e.enrolledMonths.includes(lesson.month));
  const completion = await prisma.lessonCompletion.findUnique({
    where: {
      studentId_lessonId: {
        studentId: sessionId,
        lessonId: lesson.id,
      },
    },
    select: { id: true },
  });
  const primarySubjectId = lesson.subjects[0]?.id;
  const lessonsHref = primarySubjectId
    ? `/dashboard/student/subjects/${primarySubjectId}/lessons`
    : "/dashboard/student/subjects";

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-10 sm:py-16 px-1" dir="rtl">
        <div className="surface-card px-5 py-12 sm:px-6 text-center">
          <span className="icon-tile mx-auto mb-5">
            <Lock className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-bold text-ink mb-2">الدرس مغلق</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            هذا الدرس ينتمي إلى الشهر {lesson.month} وهو غير مُفعّل في اشتراكك الحالي.
          </p>
          <Link href={lessonsHref} className="btn-primary w-full sm:w-auto">
            العودة للدروس المسجّلة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans pb-12 min-w-0 overflow-x-hidden" dir="rtl">
      <LessonWatchTracker userId={sessionId} />

      <div className="flex items-center justify-between gap-3 min-w-0">
        <Link
          href={lessonsHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary min-w-0"
        >
          <ChevronLeft className="w-4 h-4 rotate-180 shrink-0" />
          <span className="truncate">الدروس المسجّلة</span>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <span className="badge-soft">الشهر {lesson.month}</span>
          {completion ? <span className="badge-soft">مكتمل</span> : null}
        </div>
      </div>

      <h1 className="text-lg sm:text-2xl font-bold text-ink tracking-tight leading-snug break-words">
        {lesson.title}
      </h1>

      <div className="-mx-3 sm:-mx-4 md:mx-0 rounded-none md:rounded-2xl overflow-hidden border-y md:border border-line bg-ink aspect-video relative">
        <iframe
          src={`https://player.vimeo.com/video/${lesson.vimeoVideoId}?title=0&byline=0&portrait=0&badge=0&vimeo_logo=0&share=0&like=0&watch_later=0`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={lesson.title}
        />
      </div>

      <MarkLessonWatchedButton lessonId={lesson.id} completed={Boolean(completion)} />

      <LessonTabs lesson={lesson} />
    </div>
  );
}
