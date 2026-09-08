import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, PlayCircle, Lock } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SubjectLessonsPage({
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
        orderBy: { createdAt: "asc" }
      },
    }
  });

  if (!subject) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: id,
      }
    }
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const enrolledMonths = enrollment.enrolledMonths;
  const allLessons = subject.lessons;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-arabic" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/student/subjects/${subject.id}`} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-800 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة إلى نظرة عامة على المادة
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-black text-purple-950 mb-3 tracking-tight">الدروس المسجلة - {subject.title}</h1>
        <p className="text-slate-500 font-medium text-lg max-w-3xl">تصفح جميع الدروس المتاحة ضمن هذا المقرر. الدروس المقفلة تتطلب الاشتراك في الشهر الخاص بها.</p>
      </div>

      {allLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-700">لا توجد دروس متاحة حالياً</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">لم يتم نشر أي دروس لهذا المقرر بعد.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLessons.map((lesson) => {
            const isAccessible = enrolledMonths.includes(lesson.month);
            
            if (!isAccessible) {
              return (
                <div 
                  key={lesson.id}
                  className="bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-200 opacity-75 flex flex-col cursor-not-allowed"
                >
                  <div className="aspect-video relative bg-slate-200 overflow-hidden border-b-2 border-slate-300 flex items-center justify-center grayscale">
                    {lesson.image && (
                      <img src={lesson.image} alt={lesson.title} className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
                    )}
                    <div className="w-16 h-16 bg-white/50 border-2 border-slate-400 rounded-full flex items-center justify-center text-slate-500 relative z-10 backdrop-blur-sm">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-600 text-white border-2 border-slate-700 text-xs font-black px-3 py-1 rounded-lg">
                      الشهر {lesson.month}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-slate-600 text-lg mb-2 line-clamp-2 leading-tight">{lesson.title}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        غير متاح (اشترك في الشهر {lesson.month})
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link 
                href={`/dashboard/student/lessons/${lesson.id}`} 
                key={lesson.id}
                className="bg-white rounded-3xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all group flex flex-col"
              >
                <div className="aspect-video relative bg-[#FACC15]/20 overflow-hidden border-b-2 border-black flex items-center justify-center group-hover:bg-[#FACC15]/40 transition-colors">
                  {lesson.image && (
                    <img src={lesson.image} alt={lesson.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                  )}
                  <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center text-black shadow-sm group-hover:scale-110 transition-transform relative z-10">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div className="absolute top-3 right-3 bg-[#FACC15] text-black border-2 border-black text-xs font-black px-3 py-1 rounded-lg shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    الشهر {lesson.month}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-black text-lg mb-2 line-clamp-2 leading-tight">{lesson.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                    <span className="text-purple-700 font-black flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      شاهد الدرس
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
