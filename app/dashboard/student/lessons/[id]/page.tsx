import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Download, FileText, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

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
      subject: true
    }
  });

  if (!lesson) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: lesson.subjectId,
      }
    }
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const isUnlocked = enrollment.enrolledMonths.includes(lesson.month);
  
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
          href={`/dashboard/student/subjects/${lesson.subjectId}`}
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
          href={`/dashboard/student/subjects/${lesson.subjectId}`} 
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
              src={`https://player.vimeo.com/video/${lesson.vimeoVideoId}?title=0&byline=0&portrait=0`}
              className="w-full h-full absolute top-0 left-0"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        
        {/* 2. Lesson Header */}
        <div className="text-center md:text-right px-4">
          <h1 className="text-4xl font-black text-purple-950 dark:text-purple-950 mb-3 tracking-tight">{lesson.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-3xl">استمتع بمشاهدة الدرس ولا تتردد في تحميل الملحقات وحل الكويز لاختبار فهمك</p>
        </div>

        {/* 3. Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Right Card (Quiz) */}
          <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-sm hover:shadow-md hover:shadow-purple-600/10 hover:border-purple-300 dark:hover:border-purple-900/50 hover:shadow-md transition-all flex flex-col items-start relative overflow-hidden group">
            {/* Subtle glow effect on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-700/5 dark:bg-purple-700/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-700/10 dark:group-hover:bg-purple-700/20 transition-all"></div>
            
            <div className="w-14 h-14 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-500 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <h3 className="text-xl font-black text-purple-950 dark:text-purple-950 mb-2">اختبر معلوماتك</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">قم بإجراء الاختبار لتقييم استيعابك لهذا الدرس ومدى فهمك للمحتوى</p>
              
              <div className="mt-auto">
                {lesson.quiz ? (
                  <Link 
                    href={`/dashboard/student/lessons/${lesson.id}/quiz`}
                    className="inline-flex w-full items-center justify-center bg-purple-600 hover:bg-purple-700 text-slate-950 font-black py-3.5 rounded-xl font-bold shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.6)] transition-all duration-300"
                  >
                    بدء الاختبار الآن
                  </Link>
                ) : (
                  <div className="w-full text-center bg-white text-slate-400 dark:bg-white dark:text-slate-500 py-3.5 rounded-xl font-bold border border-slate-100 dark:border-purple-200">
                    لا يوجد كويز متاح
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Card (Attachments) */}
          <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-sm hover:shadow-md hover:shadow-purple-600/10 hover:border-purple-300 dark:hover:border-purple-900/50 hover:shadow-md transition-all flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-700/5 dark:bg-purple-700/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-700/10 dark:group-hover:bg-purple-700/20 transition-all"></div>

            <div className="w-14 h-14 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-500 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <FileText className="w-7 h-7" />
            </div>
            
            <div className="flex-1 relative z-10 w-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-purple-950 dark:text-purple-950">ملحقات الدرس</h3>
                {lesson.materials.length > 0 && (
                  <span className="bg-slate-100 text-slate-500 dark:bg-white dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
                    {lesson.materials.length} ملفات
                  </span>
                )}
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">حمل الملفات والملخصات الخاصة بهذا الدرس للمراجعة لاحقاً</p>
              
              <div className="mt-auto space-y-3">
                {lesson.materials.length > 0 ? (
                  lesson.materials.map(mat => (
                    <div key={mat.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-purple-200 bg-white/50 dark:bg-white/50">
                      <span className="font-bold text-sm text-purple-800 dark:text-purple-800 line-clamp-1 pl-4 flex-1">
                        {mat.title}
                      </span>
                      <a 
                        href={`${mat.fileUrl}?download=`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 bg-white border border-slate-200 text-slate-600 hover:text-purple-700 hover:border-purple-200 dark:bg-white dark:border-purple-200 dark:text-purple-800 dark:hover:text-purple-500 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        تحميل
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center bg-white text-slate-400 dark:bg-white dark:text-slate-500 py-3.5 rounded-xl font-bold border border-slate-100 dark:border-purple-200">
                    لا توجد ملحقات إضافية
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
