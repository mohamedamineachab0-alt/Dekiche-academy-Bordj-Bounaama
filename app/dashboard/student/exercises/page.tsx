import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Eye, UploadCloud, BrainCircuit } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";

export default async function StudentExercisesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  // Get enrolled subjects
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: sessionId },
    select: { subjectId: true }
  });
  
  const enrolledSubjectIds = enrollments.map(e => e.subjectId);

  // Get daily exercises for those subjects
  const exercises = await prisma.dailyExercise.findMany({
    where: {
      OR: [
        { subjectId: { in: enrolledSubjectIds } },
        { secondarySubjectId: { in: enrolledSubjectIds } }
      ]
    },
    include: {
      subject: true,
      quiz: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="تماريني اليومية"
        description="تدرب يومياً من خلال حل التمارين المتجددة المخصصة لموادك و وارفع إجاباتك ليتم تقييمها"
        icon={CheckCircle}
        gradientClass="bg-gradient-to-r from-purple-700 to-cyan-700"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <CheckCircle className="w-12 h-12 text-purple-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-purple-950 mb-1">لا توجد تمارين حالياً</h3>
            <p className="text-slate-500 font-medium">سيتم إضافة التمارين اليومية قريباً من قبل أساتذتك</p>
          </div>
        ) : (
          exercises.map(ex => (
            <div key={ex.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-48 w-full relative bg-slate-100 border-b border-slate-100">
                <img src={ex.a4ImageUrl} alt={ex.title} className="w-full h-full object-cover object-top opacity-90" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-black text-purple-800 shadow-sm">
                  {ex.maxScore} نقطة
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-purple-950 line-clamp-2">{ex.title}</h3>
                <p className="text-sm font-bold text-slate-500 mt-2">المادة: {ex.subject.title}</p>
                
                <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                  <a href={ex.a4ImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-purple-800 font-bold py-2.5 rounded-xl transition-colors border border-slate-200">
                    <Eye className="w-4 h-4" />
                    عرض
                  </a>
                  {ex.quiz ? (
                    <Link href={`/dashboard/student/exercises/${ex.id}/quiz`} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-bold py-2.5 rounded-xl transition-colors shadow-md hover:shadow-lg shadow-purple-600/20">
                      بدأ التمرين اليومي
                    </Link>
                  ) : (
                    <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-bold py-2.5 rounded-xl transition-colors shadow-md hover:shadow-lg shadow-purple-600/20">
                      <UploadCloud className="w-4 h-4" />
                      إرسال الحل
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
