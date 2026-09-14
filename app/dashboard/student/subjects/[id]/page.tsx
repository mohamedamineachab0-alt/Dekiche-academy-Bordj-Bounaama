import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  Library,
  FileText,
  BrainCircuit,
  AlertCircle,
  Video,
  Play,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { SoftOrb, GeoAccents } from "@/components/landing/LandingDecor";
import { mistakesForSubjectWhere } from "@/lib/mistake-source";
import { teacherHonorific } from "@/lib/education-labels";

export default async function SubjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!subject) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: id,
      },
    },
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const enrolledMonths = enrollment.enrolledMonths;
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: sessionId },
    select: { stream: true },
  });
  const streamFilter = studentProfile
    ? { OR: [{ stream: studentProfile.stream }, { stream: "NONE" as const }] }
    : {};

  const [reviewCards, dailyExercises, exams, liveClasses, mistakes] =
    await Promise.all([
      prisma.reviewCard.findMany({
        where: { subjectId: id, month: { in: enrolledMonths }, ...streamFilter },
        orderBy: { createdAt: "desc" },
      }),
      prisma.dailyExercise.findMany({
        where: {
          OR: [{ subjectId: id }, { secondarySubjectId: id }],
          month: { in: enrolledMonths },
          ...streamFilter,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.exam.findMany({
        where: {
          OR: [{ subjectId: id }, { secondarySubjectId: id }],
          month: { in: enrolledMonths },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.liveClass.findMany({
        where: { subjectId: id, month: { in: enrolledMonths } },
        orderBy: { date: "asc" },
      }),
      prisma.studentMistake.findMany({
        where: {
          studentId: sessionId,
          ...mistakesForSubjectWhere(id, enrolledMonths),
        },
      }),
    ]);

  const accessibleLessons = subject.lessons.filter((l) =>
    enrolledMonths.includes(l.month)
  );

  const RESOURCES = [
    {
      title: "التمارين اليومية",
      description: "اختبار 20 سؤالاً لكل درس",
      icon: FileText,
      count: dailyExercises.length,
      href: "/dashboard/student/exercises",
    },
    {
      title: "بطاقات المراجعة",
      description: "بطاقات مرتبطة بدروس المادة",
      icon: Library,
      count: reviewCards.length,
      href: "/dashboard/student/review-cards",
    },
    {
      title: "الحصص المباشرة",
      description: `تفاعل مباشر مع ${teacherHonorific(subject.teacherName)}`,
      icon: Video,
      count: liveClasses.length,
      href: "/dashboard/student/live-classes",
    },
    {
      title: "الاختبارات والفروض",
      description: "اختبر جاهزيتك وقيّم مستواك",
      icon: BrainCircuit,
      count: exams.length,
      href: "/dashboard/student/exams",
    },
    {
      title: "أخطائي",
      description: "أخطاء الدروس والتمارين والفروض",
      icon: AlertCircle,
      count: mistakes.length,
      href: "/dashboard/student/mistakes",
    },
  ];

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <Link
        href="/dashboard/student/subjects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4 rotate-180" />
        كل المواد
      </Link>

      <header className="relative overflow-hidden rounded-[1.75rem] bg-hero text-white px-6 py-8 md:px-10 md:py-10">
        <div className="landing-line-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="hero-orb w-56 h-56 bg-white/10 -top-16 -end-10"
          aria-hidden="true"
        />
        <SoftOrb tone="white" className="w-28 h-28 top-[20%] end-[12%] opacity-45" />
        <GeoAccents variant="hero" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1.5 text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{subject.title}</span>
            </span>
            <h1 className="kufi text-[clamp(1.4rem,3vw,2.35rem)] text-white mb-3">
              الدروس المسجّلة
            </h1>
            <p className="text-white/75 leading-[1.85] max-w-xl text-sm sm:text-[0.95rem]">
              شرح مفصّل للمقرّر — شاهد الدروس في أي وقت وعد إليها وقتما تشاء.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums leading-none text-accent">
                {accessibleLessons.length}
              </span>
              <span className="text-white/70 text-sm">درس متاح</span>
            </div>
            <Link
              href={`/dashboard/student/subjects/${id}/lessons`}
              className="btn-primary w-full md:w-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              بدء التعلّم
            </Link>
          </div>
        </div>
      </header>

      <section>
        <p className="rule-label mb-3">
          <span>موارد المادة</span>
        </p>
        <h2 className="kufi text-[clamp(1.25rem,2.2vw,1.55rem)] text-ink mb-5">
          كل ما تحتاجه في مكان واحد
        </h2>

        <div className="surface-panel divide-y divide-line">
          {RESOURCES.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link
                key={resource.title}
                href={resource.href}
                className="group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 min-w-0 hover:bg-surface-muted"
              >
                <span className="icon-tile !w-10 !h-10 sm:!w-12 sm:!h-12 shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-[0.9375rem] font-semibold text-ink">
                    {resource.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted mt-0.5 line-clamp-1">
                    {resource.description}
                  </p>
                </div>

                <span className="badge-outline tabular-nums shrink-0 text-[11px] sm:text-xs">
                  {resource.count}
                </span>

                <ChevronLeft className="w-4 h-4 text-muted shrink-0 hidden sm:block" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
