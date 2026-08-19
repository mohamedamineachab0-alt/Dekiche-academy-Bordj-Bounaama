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
  const accessibleLessons = subject.lessons.filter(l => enrolledMonths.includes(l.month));

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
        <p className="text-slate-500 font-medium text-lg max-w-3xl">تصفح وشاهد جميع الدروس المتاحة ضمن اشتراكك الحالي.</p>
      </div>

      {accessibleLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-700">لا توجد دروس متاحة حالياً</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">لم يتم نشر أي دروس للأشهر التي تشترك بها حتى الآن، أو أن اشتراكك بحاجة إلى تحديث.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleLessons.map((lesson) => (
            <Link 
              href={`/dashboard/student/lessons/${lesson.id}`} 
              key={lesson.id}
              className="bg-white rounded-3xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all group flex flex-col"
            >
              <div className="aspect-video relative bg-slate-100 overflow-hidden border-b-2 border-black">
                <img 
                  src={lesson.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop"} 
                  alt={lesson.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center text-black">
                    <PlayCircle className="w-8 h-8" />
                  </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
