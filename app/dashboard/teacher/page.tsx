import { redirect } from "next/navigation";
import Link from "next/link";
import { HeroBanner } from "@/components/shared/HeroBanner";
import {
  Presentation,
  Video,
  AlertTriangle,
  Users,
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  PlayCircle,
  GraduationCap,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getTeacherSession } from "@/lib/teacher";
import { TeacherLessonsManager } from "@/components/teacher/TeacherLessonsManager";
import { levelMap, streamMap } from "@/lib/subject-formatter";

export const metadata = {
  title: "فضاء الأساتذة | منصة دقيش التعليمية",
  description: "لوحة تحكم الأستاذ لمتابعة إحصائيات التلاميذ وإدارة الدروس والكويزات وملفات PDF",
};

export default async function TeacherDashboardPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const { user, teacher, subjectIds } = session;

  // 1. Fetch teacher's subjects with counts
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    include: {
      _count: {
        select: {
          lessons: true,
          enrollments: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });

  // 2. Fetch total unique students enrolled in teacher's subjects
  const enrollments = await prisma.enrollment.findMany({
    where: { subjectId: { in: subjectIds } },
    select: { studentId: true },
  });
  const totalStudents = new Set(enrollments.map((e) => e.studentId)).size;

  // 3. Fetch all lessons of teacher's subjects
  const lessons = await prisma.lesson.findMany({
    where: { subjects: { some: { id: { in: subjectIds } } } },
    include: {
      subjects: { select: { id: true, title: true, levels: true } },
      materials: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, fileUrl: true, createdAt: true },
      },
      quiz: {
        select: {
          id: true,
          maxScore: true,
          questions: true,
          aiGenerated: true,
          _count: { select: { completions: true } },
        },
      },
      _count: {
        select: {
          completions: true,
          mistakes: true,
        },
      },
    },
    orderBy: [{ month: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  // 4. Aggregated stats
  const totalLessons = lessons.length;
  const totalCompletions = lessons.reduce((acc, l) => acc + l._count.completions, 0);
  const totalMistakes = lessons.reduce((acc, l) => acc + l._count.mistakes, 0);
  const totalQuizzesTaken = lessons.reduce((acc, l) => acc + (l.quiz?._count.completions || 0), 0);
  const lessonsWithQuiz = lessons.filter((l) => !!l.quiz).length;
  const totalMaterials = lessons.reduce((acc, l) => acc + l.materials.length, 0);

  // Serialize subjects for client component
  const clientSubjects = subjects.map((s) => ({
    id: s.id,
    title: s.title,
    levels: s.levels || [],
    streams: s.streams || [],
    _count: {
      lessons: s._count.lessons,
      enrollments: s._count.enrollments,
    },
  }));

  // Serialize lessons for client component
  const clientLessons = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    month: l.month,
    order: l.order,
    youtubeVideoId: l.youtubeVideoId,
    vimeoVideoId: l.vimeoVideoId,
    image: l.image,
    subjects: l.subjects.map((sub) => ({
      id: sub.id,
      title: sub.title,
      levels: sub.levels || [],
    })),
    materials: l.materials.map((m) => ({
      id: m.id,
      title: m.title,
      fileUrl: m.fileUrl,
      createdAt: m.createdAt,
    })),
    quiz: l.quiz
      ? {
          id: l.quiz.id,
          maxScore: l.quiz.maxScore,
          questions: l.quiz.questions,
          aiGenerated: l.quiz.aiGenerated,
          _count: l.quiz._count,
        }
      : null,
    _count: {
      completions: l._count.completions,
      mistakes: l._count.mistakes,
    },
  }));

  return (
    <div className="space-y-8 font-sans pb-16" dir="rtl">
      {/* Hero Welcome */}
      <HeroBanner
        variant="hero"
        title={`مرحباً بك ${teacher.name || user.fullName} في فضاء الأساتذة`}
        description="تابع إحصائيات تلاميذك في الوقت الحقيقي، أدر دروسك المسجلة، أضف كويزات تفاعلية، وارفع ملفات PDF والمرفقات التعليمية."
        icon={Presentation}
      />

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/dashboard/teacher/record"
          className="surface-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 transition-all text-center group border border-line"
        >
          <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Video className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-ink">استوديو التسجيل</h3>
            <p className="text-[11px] text-muted mt-0.5">تسجيل الدروس</p>
          </div>
        </Link>

        <Link
          href="/dashboard/teacher/analytics"
          className="surface-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 transition-all text-center group border border-line"
        >
          <span className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Presentation className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-ink">التحليل الأكاديمي</h3>
            <p className="text-[11px] text-muted mt-0.5">تتبع الإتمام</p>
          </div>
        </Link>

        <Link
          href="/dashboard/teacher/students"
          className="surface-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 transition-all text-center group border border-line"
        >
          <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-ink">قائمة التلاميذ</h3>
            <p className="text-[11px] text-muted mt-0.5">تفاصيل وتقدم الطلبة</p>
          </div>
        </Link>

        <Link
          href="/dashboard/teacher/mistakes"
          className="surface-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 transition-all text-center group border border-line"
        >
          <span className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-ink">أخطاء التلاميذ</h3>
            <p className="text-[11px] text-muted mt-0.5">مراجعة وتصحيح</p>
          </div>
        </Link>

        <Link
          href="/dashboard/teacher/contact"
          className="surface-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 transition-all text-center group border border-line col-span-2 sm:col-span-1"
        >
          <span className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-ink">مراسلة الإدارة</h3>
            <p className="text-[11px] text-muted mt-0.5">تواصل واستفسار</p>
          </div>
        </Link>
      </section>

      {/* ========================================================= */}
      {/* 1. Teacher Student Statistics Grid                         */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>إحصائيات التلاميذ والمحتوى</span>
          </h2>
          <span className="text-xs text-muted">تحديث مباشر</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Students */}
          <div className="surface-card p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs text-muted font-medium">التلاميذ المسجلين</span>
            <p className="text-2xl font-bold text-ink font-mono">{totalStudents}</p>
            <span className="text-[11px] text-primary block">تلميذ مشترك</span>
          </div>

          {/* Total Subjects */}
          <div className="surface-card p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs text-muted font-medium">المواد المسندة</span>
            <p className="text-2xl font-bold text-ink font-mono">{subjects.length}</p>
            <span className="text-[11px] text-purple-600 block">مادة دراسية</span>
          </div>

          {/* Total Lessons */}
          <div className="surface-card p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs text-muted font-medium">الدروس المنشورة</span>
            <p className="text-2xl font-bold text-ink font-mono">{totalLessons}</p>
            <span className="text-[11px] text-blue-600 block">درس تعليمي</span>
          </div>

          {/* Total Completions */}
          <div className="surface-card p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs text-muted font-medium">إتمام ومشاهدات</span>
            <p className="text-2xl font-bold text-ink font-mono">{totalCompletions}</p>
            <span className="text-[11px] text-emerald-600 block">إتمام من الطلبة</span>
          </div>

          {/* Quizzes Active */}
          <div className="surface-card p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs text-muted font-medium">الكويزات المفعّلة</span>
            <p className="text-2xl font-bold text-ink font-mono">
              {lessonsWithQuiz} <span className="text-xs text-muted font-normal">/ {totalLessons}</span>
            </p>
            <span className="text-[11px] text-amber-600 block">{totalQuizzesTaken} محاولة حل</span>
          </div>

          {/* Student Mistakes */}
          <div className="surface-card p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs text-muted font-medium">الأخطاء المسجلة</span>
            <p className="text-2xl font-bold text-red-600 font-mono">{totalMistakes}</p>
            <span className="text-[11px] text-red-500 block">خطأ بحاجة لمراجعة</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. Teacher's Subjects Section                              */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>المواد المشرف عليها الأستاذ</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((sub) => {
            const levelsFormatted = sub.levels?.map((l) => levelMap[l] || l).join("، ") || "عام";
            const streamsFormatted = sub.streams?.map((s) => streamMap[s] || s).filter(Boolean).join("، ");

            return (
              <div
                key={sub.id}
                className="surface-card p-5 rounded-2xl border border-line flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge-soft text-xs">{levelsFormatted}</span>
                    <span className="text-xs font-mono font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-md">
                      {sub._count.enrollments} طالب
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-ink">{sub.title}</h3>
                  {streamsFormatted && (
                    <p className="text-xs text-muted line-clamp-1">{streamsFormatted}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-line text-xs text-muted font-mono">
                  <span>{sub._count.lessons} درس منشور</span>
                  <span>{sub.phase === "MIDDLE" ? "طور متوسط" : sub.phase === "SECONDARY" ? "طور ثانوي" : "طور ابتدائي"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. Teacher's Lessons Hub: Upload PDF & Manage Quizzes      */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>إدارة الدروس، الكويزات، وملفات الـ PDF</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              يمكنك رفع ملخصات وتمارين بصيغة PDF لكل درس، وإنشاء أو تعديل الكويزات التفاعلية المنقطة على 20.
            </p>
          </div>
        </div>

        <TeacherLessonsManager subjects={clientSubjects} lessons={clientLessons} />
      </section>
    </div>
  );
}
