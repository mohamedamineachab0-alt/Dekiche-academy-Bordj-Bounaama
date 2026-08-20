import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { LessonTabs } from "@/components/student/LessonTabs";

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
      subjects: true
    }
  });

  if (!lesson) redirect("/dashboard/student/subjects");

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: sessionId,
      subjectId: { in: lesson.subjects.map((s) => s.id) },
    }
  });

  if (enrollments.length === 0) redirect("/dashboard/student/subjects");

  const isUnlocked = enrollments.some((e) => e.enrolledMonths.includes(lesson.month));
  const primarySubjectId = lesson.subjects[0]?.id;
  
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 dark:bg-white rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <Lock className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-purple-950 dark:text-purple-950">الدرس مغلق</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">هذا الدرس ينتمي إلى الشهر {lesson.month} وهو غير مفعل في اشتراكك الحالي</p>
        </div>
        <Link 
          href={`/dashboard/student/subjects/${primarySubjectId}`}
          className="bg-purple-600 hover:bg-purple-700 text-slate-950 font-black px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
        >
          العودة للمادة
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-arabic" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/student/subjects/${primarySubjectId}`} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-800 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة إلى دروس المادة
        </Link>
        <span className="bg-purple-100 text-purple-800 dark:bg-white/30 dark:text-purple-500 px-4 py-1.5 rounded-lg text-sm font-bold">
          الشهر {lesson.month}
        </span>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* 1. Full-Width Video Player */}
        <div className="relative w-full rounded-[1.5rem] p-[3px] bg-gradient-to-br from-white via-purple-500 to-slate-950 shadow-[0_10px_40px_rgba(14,165,233,0.3)] mb-8">
          <div className="relative rounded-[1.3rem] overflow-hidden bg-black/5 backdrop-blur-sm w-full aspect-video flex items-center justify-center">
            <iframe 
              src={`https://player.vimeo.com/video/${lesson.vimeoVideoId}?title=0&byline=0&portrait=0&badge=0&vimeo_logo=0&share=0&like=0&watch_later=0`}
              className="w-full h-full absolute top-0 left-0"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        
        {/* Interactive Tabs for Lesson Details, Attachments, and Quiz */}
        <LessonTabs lesson={lesson} />
      </div>
    </div>
  );
}
