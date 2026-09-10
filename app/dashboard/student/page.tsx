import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Map as MapIcon,
  MessageSquare,
  Library,
  CheckCircle,
  FileText,
  Bot,
  Bell,
  AlertTriangle,
  Video,
  Trophy,
  ChevronLeft,
  Swords,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { DailyTip } from "@/components/student/DailyTip";
import { StudentHomeMetrics } from "@/components/student/StudentHomeMetrics";
import {
  formatSubjectsCount,
  translateLevel,
  translateStream,
} from "@/lib/utils/translations";

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      studentProfile: true,
      enrollments: { select: { subjectId: true } },
      studentLinks: { select: { id: true }, take: 1 },
      _count: { select: { mistakes: true } },
    },
  });

  if (!user || !user.studentProfile) return null;

  const enrolledSubjectIds = user.enrollments.map((e) => e.subjectId);

  const weekStart = startOfDay(new Date());
  weekStart.setDate(weekStart.getDate() - 6);

  const [upcomingLiveClassesCount, availableSubjectsCount, enrolledSubjects, weekMistakes, weekSubmissions, watchedLessons] =
    await Promise.all([
      prisma.liveClass.count({
        where: {
          subjectId: { in: enrolledSubjectIds },
          date: { gte: new Date() },
        },
      }),
      prisma.subject.count({
        where: {
          isPublished: true,
          phase: user.studentProfile.phase,
          levels: { has: user.studentProfile.level },
          OR: [
            { streams: { has: user.studentProfile.stream } },
            { streams: { has: "NONE" } },
          ],
        },
      }),
      enrolledSubjectIds.length > 0
        ? prisma.subject.findMany({
            where: { id: { in: enrolledSubjectIds } },
            select: {
              id: true,
              title: true,
              lessons: { select: { id: true, title: true }, orderBy: { createdAt: "asc" } },
            },
            orderBy: { title: "asc" },
          })
        : Promise.resolve([]),
      prisma.studentMistake.findMany({
        where: { studentId: sessionId, createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
      prisma.studentSubmission.findMany({
        where: { studentId: sessionId, createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
      "lessonCompletion" in prisma
        ? prisma.lessonCompletion.findMany({
            where: { studentId: sessionId },
            select: { lessonId: true },
          })
        : Promise.resolve([]),
    ]);

  const watchedIds = new Set(watchedLessons.map((row) => row.lessonId));
  const subjectProgress = enrolledSubjects.map((subject) => {
    const completed = subject.lessons.filter((lesson) => watchedIds.has(lesson.id));
    const total = subject.lessons.length;
    return {
      subjectId: subject.id,
      subjectTitle: subject.title,
      total,
      completedCount: completed.length,
      percent: total > 0 ? Math.round((completed.length / total) * 100) : 0,
      completedLessons: completed.map((lesson) => ({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      })),
    };
  });

  const mistakesByDay = new Map<string, number>();
  const submissionsByDay = new Map<string, number>();
  for (const row of weekMistakes) {
    const key = dayKey(row.createdAt);
    mistakesByDay.set(key, (mistakesByDay.get(key) || 0) + 1);
  }
  for (const row of weekSubmissions) {
    const key = dayKey(row.createdAt);
    submissionsByDay.set(key, (submissionsByDay.get(key) || 0) + 1);
  }

  const weekday = new Intl.DateTimeFormat("ar-DZ", { weekday: "short" });
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = dayKey(date);
    return {
      day: weekday.format(date),
      mistakes: mistakesByDay.get(key) || 0,
      submissions: submissionsByDay.get(key) || 0,
    };
  });

  const { level, stream } = user.studentProfile;
  const enrolledCount = enrolledSubjectIds.length;
  const mistakesCount = user._count.mistakes;
  const isParentLinked = user.studentLinks.length > 0;

  const levelLabel = translateLevel(level);
  const streamLabel = translateStream(stream);
  const firstName = user.fullName?.split(" ")[0] || user.fullName;

  const CONTINUE_LEARNING = [
    {
      id: "subjects",
      title: "موادي",
      description: "الدروس والملحقات والفيديوهات",
      icon: BookOpen,
      badge: formatSubjectsCount(availableSubjectsCount),
      actionText: "تصفح المواد",
      route: "/dashboard/student/subjects",
      featured: true,
    },
    {
      id: "smart-map",
      title: "مسار الدراسة",
      description: "خطوتك التالية في كل مادة",
      icon: MapIcon,
      actionText: "افتح المسار",
      route: "/dashboard/student/roadmap",
    },
    {
      id: "review-cards",
      title: "مكتبة المراجعة",
      description: "بطاقات لمستواك وشعبتك",
      icon: Library,
      actionText: "بدء المراجعة",
      route: "/dashboard/student/review-cards",
    },
    {
      id: "daily-exercises",
      title: "تماريني اليومية",
      description: "تمارين جديدة كل يوم",
      icon: CheckCircle,
      actionText: "بدء التمارين",
      route: "/dashboard/student/exercises",
    },
    {
      id: "exams",
      title: "اختبارات وفروض",
      description: "اختبارات بتصحيح آلي",
      icon: FileText,
      actionText: "عرض الاختبارات",
      route: "/dashboard/student/exams",
    },
    {
      id: "mistakes",
      title: "أخطائي",
      description: "أخطاؤك مع الحلول الصحيحة",
      icon: AlertTriangle,
      badge: mistakesCount > 0 ? `${mistakesCount}` : undefined,
      actionText: "مراجعة الأخطاء",
      route: "/dashboard/student/mistakes",
    },
  ];

  const MORE_SECTIONS = [
    { id: "assistant", title: "مساعدي الذكي", icon: Bot, route: "/dashboard/student/ai-assistant" },
    { id: "forums", title: "دردشة القسم", icon: MessageSquare, route: "/dashboard/student/forums" },
    { id: "live", title: "حصص مباشرة", icon: Video, route: "/dashboard/student/live-classes" },
    { id: "ranking", title: "الترتيب", icon: Trophy, route: "/dashboard/student/leaderboard" },
    { id: "challenge", title: "منافسة صديق", icon: Swords, route: "/dashboard/student/friend-challenge" },
    { id: "notifications", title: "الإشعارات", icon: Bell, route: "/dashboard/student/notifications" },
  ];

  return (
    <div className="relative space-y-8 font-sans pb-12">
      <div className="paper-grid pointer-events-none absolute inset-0 -mx-4 md:-mx-8 rounded-[1.75rem] opacity-80" aria-hidden="true" />

      <div className="relative z-10 space-y-8">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-hero text-white px-4 py-6 sm:px-6 md:px-8 md:py-9">
          <div className="landing-line-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="hero-orb w-48 h-48 bg-white/10 -top-16 -end-10" aria-hidden="true" />

          <div className="relative z-10">
            {(levelLabel || streamLabel) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {levelLabel && (
                  <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
                    {levelLabel}
                  </span>
                )}
                {streamLabel && (
                  <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
                    {streamLabel}
                  </span>
                )}
              </div>
            )}

            <h1 className="kufi text-[clamp(1.6rem,3.4vw,2.2rem)] text-white">
              مرحباً، {firstName}
            </h1>
            <p className="mt-3 text-[0.95rem] text-white/75 leading-[1.8] max-w-[48ch]">
              دروسك وتمارينك واختباراتك في مكان واحد.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/dashboard/student/subjects" className="btn-primary">
                موادي
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link href="/dashboard/student/exercises" className="btn-hero-outline">
                تمارين اليوم
              </Link>
            </div>
          </div>
        </header>

        {!isParentLinked && (
          <Link
            href="/dashboard/student/settings"
            className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 px-4 py-3.5 hover:bg-red-100"
          >
            <Link2 className="w-4 h-4 text-red-700 shrink-0" />
            <span className="text-sm font-medium text-red-900 flex-1">
              حسابك غير مرتبط بوليّ أمر — اربطه الآن ليتابع تقدّمك.
            </span>
            <ChevronLeft className="w-4 h-4 text-red-700 shrink-0" />
          </Link>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <article className="surface-card p-6 lg:col-span-3">
            <h2 className="text-lg font-bold text-ink">تفعيل المواد</h2>
            <p className="text-sm text-muted mt-1 mb-5">
              {availableSubjectsCount > 0
                ? `فعّلت ${enrolledCount} من أصل ${availableSubjectsCount} مادة متاحة لمستواك.`
                : "لا توجد مواد منشورة لمستواك حالياً."}
            </p>

            <div className="progress-track mb-2">
              <div
                className="progress-bar"
                style={{
                  width: `${
                    availableSubjectsCount > 0
                      ? Math.round((enrolledCount / availableSubjectsCount) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium text-muted">نسبة التفعيل</span>
              <span className="text-xs font-bold text-primary tabular-nums" dir="ltr">
                {availableSubjectsCount > 0
                  ? Math.round((enrolledCount / availableSubjectsCount) * 100)
                  : 0}
                %
              </span>
            </div>

            <Link href="/dashboard/student/subjects" className="btn-secondary">
              تفعيل مادة
            </Link>
          </article>

          <div className="lg:col-span-2">
            <DailyTip variant="card" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-5">متابعة التعلّم</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {CONTINUE_LEARNING.map((section) => {
              const Icon = section.icon;
              const featured = section.featured;
              return (
                <Link
                  key={section.id}
                  href={section.route}
                  className={`group feature-card flex flex-col min-h-[10.5rem] ${
                    featured ? "feature-card-solid" : "feature-card-soft"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        featured ? "bg-white/20 text-white" : "bg-primary text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </span>
                    {section.badge && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          featured ? "bg-accent text-accent-text" : "bg-white/80 text-primary"
                        }`}
                      >
                        {section.badge}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold mb-1 ${featured ? "text-white" : "text-ink"}`}>
                    {section.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed flex-1 mb-4 ${
                      featured ? "text-white/80" : "text-muted"
                    }`}
                  >
                    {section.description}
                  </p>

                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                      featured ? "text-accent" : "text-primary"
                    }`}
                  >
                    {section.actionText}
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-surface-muted/80 border border-line px-5 py-6 md:px-7">
          <h2 className="text-lg font-bold text-ink mb-4">أدوات أخرى</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
            {MORE_SECTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.route}
                  className="flex flex-col items-center gap-2.5 rounded-2xl px-3 py-4 text-center hover:bg-surface"
                >
                  <span className="icon-tile !w-11 !h-11">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[0.8rem] font-semibold text-ink leading-tight">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <StudentHomeMetrics
          userId={user.id}
          subjectProgress={subjectProgress}
          mistakesCount={mistakesCount}
          weeklyActivity={weeklyActivity}
        />
      </div>
    </div>
  );
}
