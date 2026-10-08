import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { LessonTabs } from "@/components/student/LessonTabs";
import { LessonWatchTracker } from "@/components/student/LessonWatchTracker";
import { MarkLessonWatchedButton } from "@/components/student/MarkLessonWatchedButton";
import { UnlockLessonInline } from "@/components/student/UnlockLessonInline";

export default async function LessonStudyViewPage({
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
    select: { id: true, role: true },
  });

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subjects: true,
    },
  });

  if (!lesson) redirect("/dashboard/student/subjects");

  const isPrivileged = user?.role === "ADMIN" || user?.role === "TEACHER";

  const enrollments = isPrivileged
    ? []
    : await prisma.enrollment.findMany({
        where: {
          studentId: sessionId,
          subjectId: { in: lesson.subjects.map((s) => s.id) },
        },
      });

  if (!isPrivileged && enrollments.length === 0) {
    redirect("/dashboard/student/subjects");
  }

  const isUnlocked = isPrivileged || enrollments.some((e) => e.enrolledMonths.includes(lesson.month));
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
        <div className="surface-card p-6 sm:p-8 text-center space-y-5 border border-purple-500/20 shadow-2xl">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-7 h-7" />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-ink">هذا الدرس غير مفعّل</h2>
            <p className="text-xs text-muted leading-relaxed">
              ينتمي هذا المحتوى إلى <strong className="text-purple-400">الشهر {lesson.month}</strong>. بمجرد إدخال رمز هذا الشهر سيبقى مفتوحاً لك دائماً للمراجعة حتى نهاية العام الدراسي.
            </p>
          </div>

          <div className="pt-2">
            <UnlockLessonInline
              lessonId={lesson.id}
              monthNumber={lesson.month}
              subjectId={primarySubjectId}
            />
          </div>

          <div className="pt-3 border-t border-line">
            <Link href={lessonsHref} className="text-xs font-semibold text-muted hover:text-ink transition-colors">
              العودة لقائمة الدروس
            </Link>
          </div>
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
        {lesson.youtubeVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        ) : lesson.vimeoVideoId ? (
          lesson.vimeoVideoId.includes('-') ? (
            <iframe
              src={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || "vz-08fda30d-f55.b-cdn.net"}/play/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "773860"}/${lesson.vimeoVideoId}`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              title={lesson.title}
            />
          ) : (
            <iframe
              src={`https://player.vimeo.com/video/${lesson.vimeoVideoId}?title=0&byline=0&portrait=0&badge=0&vimeo_logo=0&share=0&like=0&watch_later=0`}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-bold bg-black/80">
            الفيديو غير متوفر
          </div>
        )}
      </div>

      <MarkLessonWatchedButton lessonId={lesson.id} completed={Boolean(completion)} />

      <LessonTabs lesson={lesson} />
    </div>
  );
}
