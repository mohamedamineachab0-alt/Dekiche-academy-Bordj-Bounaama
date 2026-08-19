import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, Lock, FileText, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ExerciseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const exercise = await prisma.dailyExercise.findUnique({
    where: { id },
    include: {
      materials: true,
      quiz: true,
      subject: true
    }
  });

  if (!exercise) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: exercise.subjectId,
      }
    }
  });

  // If user is not enrolled in the subject, block access.
  if (!enrollment) redirect("/dashboard/student/subjects");

  const isUnlocked = enrollment.enrolledMonths.includes(exercise.month);
  
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 dark:bg-white rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <Lock className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-purple-950 dark:text-purple-950">التمرين مغلق</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">هذا التمرين ينتمي إلى الشهر {exercise.month} وهو غير مفعل في اشتراكك الحالي</p>
        </div>
        <Link 
          href={`/dashboard/student/subjects/${exercise.subjectId}`}
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
          href={`/dashboard/student/subjects/${exercise.subjectId}`} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-800 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة إلى المادة
        </Link>
        <span className="bg-purple-100 text-purple-800 dark:bg-white/30 dark:text-purple-500 px-4 py-1.5 rounded-lg text-sm font-bold">
          الشهر {exercise.month}
        </span>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* Title */}
        <div className="text-center md:text-right px-4">
          <h1 className="text-4xl font-black text-black mb-3 tracking-tight">{exercise.title}</h1>
        </div>

        {/* Image Display */}
        {exercise.a4ImageUrl && (
          <div className="relative w-full rounded-[1.5rem] p-[3px] bg-gradient-to-br from-white via-purple-500 to-slate-950 shadow-[0_10px_40px_rgba(14,165,233,0.3)] mb-8">
            <div className="relative rounded-[1.3rem] overflow-hidden bg-black/5 backdrop-blur-sm w-full min-h-[50vh] flex items-center justify-center p-4">
              <img 
                src={exercise.a4ImageUrl} 
                alt={exercise.title}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Right Card (Quiz) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col items-start w-full transition-all">
            <div className="w-14 h-14 bg-[#FACC15] border-[3px] border-black text-black rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div className="relative z-10 w-full flex flex-col h-full">
              <h3 className="text-xl font-black text-black mb-2">اختبر معلوماتك</h3>
              <p className="text-slate-600 text-sm font-bold mb-6">قم بإجراء الاختبار الخاص بهذا التمرين لتقييم استيعابك للمحتوى</p>
              
              <div className="mt-auto w-full">
                {exercise.quiz ? (
                  <Link 
                    href={`/dashboard/student/exercises/${exercise.id}/quiz`}
                    className="inline-flex w-full items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-[3px] border-black hover:translate-y-1 hover:shadow-none transition-all duration-300"
                  >
                    بدء الاختبار الآن
                  </Link>
                ) : (
                  <div className="w-full text-center bg-[#F8F9FA] text-slate-500 py-4 rounded-xl font-bold border-2 border-dashed border-slate-300">
                    لا يوجد كويز متاح
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Card (Attachments) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col items-start w-full transition-all">
            <div className="w-14 h-14 bg-purple-100 border-[3px] border-black text-purple-700 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
              <FileText className="w-7 h-7" />
            </div>
            
            <div className="relative z-10 w-full flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-black">ملحقات التمرين</h3>
                {exercise.materials.length > 0 && (
                  <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full border-[3px] border-black">
                    {exercise.materials.length} ملفات
                  </span>
                )}
              </div>
              
              <p className="text-slate-600 text-sm font-bold mb-6">حمل الملفات والملخصات الخاصة بهذا التمرين</p>
              
              <div className="mt-auto space-y-4 w-full">
                {exercise.materials.length > 0 ? (
                  exercise.materials.map((mat: any) => (
                    <div key={mat.id} className="flex items-center justify-between p-4 rounded-xl border-[3px] border-black bg-[#FCFBF9] hover:-translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all">
                      <span className="font-black text-sm text-black line-clamp-1 flex-1 pl-2">
                        {mat.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <a 
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 bg-purple-100 border-2 border-black text-purple-900 hover:bg-purple-200 px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2"
                        >
                          عرض
                        </a>
                        <a 
                          href={`${mat.fileUrl}?download=`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 bg-white border-2 border-black text-black hover:bg-purple-100 px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          تحميل
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center bg-[#F8F9FA] text-slate-500 py-6 rounded-xl font-bold border-2 border-dashed border-slate-300">
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
