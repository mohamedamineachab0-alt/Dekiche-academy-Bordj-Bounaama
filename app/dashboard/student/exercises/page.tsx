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
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="تماريني اليومية"
        description="تدرب يومياً من خلال حل التمارين المتجددة المخصصة لموادك و وارفع إجاباتك ليتم تقييمها"
        icon={CheckCircle}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.length === 0 ? (
          <div className="col-span-full p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
            <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-sm relative z-10">
              <CheckCircle className="w-10 h-10 text-[#000000]" />
            </div>
            <h3 className="font-black text-2xl text-[#000000] mb-3 relative z-10">لا توجد تمارين حالياً</h3>
            <p className="text-gray-600 font-bold mt-2 relative z-10">سيتم إضافة التمارين اليومية قريباً من قبل أساتذتك</p>
          </div>
        ) : (
          exercises.map((ex, idx) => (
            <div key={ex.id} className="bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] overflow-hidden flex flex-col paper-cut group transition-transform hover:-translate-y-1 hover:shadow-3d-hover relative">
              <div className="h-48 w-full relative bg-[#F8F9FA] border-b-[3px] border-[#000000] z-10">
                <img src={ex.a4ImageUrl} alt={ex.title} className="w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-[#FACC15] px-3 py-1.5 rounded-lg text-sm font-black text-[#000000] border-[2px] border-[#000000] shadow-sm transform rotate-2">
                  {ex.maxScore} نقطة
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative z-10 bg-white">
                <h3 className="text-xl font-black text-[#000000] line-clamp-2 leading-tight">{ex.title}</h3>
                <span className="inline-block mt-3 bg-[#EAE4D9] text-[#000000] border-[2px] border-[#000000] text-xs font-black px-3 py-1.5 rounded-lg shadow-sm w-fit transform -rotate-1">
                  المادة: {ex.subject.title}
                </span>
                
                <div className="mt-auto pt-6 flex">
                  <Link href={`/dashboard/student/exercises/${ex.id}`} className="flex-1 flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#FACC15] text-[#000000] font-black py-3 rounded-xl transition-all border-[3px] border-[#000000] shadow-sm hover:-translate-y-1 hover:shadow-3d-hover">
                    <Eye className="w-5 h-5" strokeWidth={2.5} />
                    الدخول إلى التمرين
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
