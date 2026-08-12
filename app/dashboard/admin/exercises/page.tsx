import { prisma } from "@/lib/prisma";
import { Plus, CheckCircle } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { DailyExerciseForm } from "@/components/admin/DailyExerciseForm";

export default async function AdminExercisesPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const exercises = await prisma.dailyExercise.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true, secondarySubject: true, quiz: true },
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إدارة التمارين اليومية"
        description="إضافة تحديات وتمارين يومية لرفع تفاعل الطلاب وزيادة رصيد نقاطهم"
        icon={CheckCircle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <DailyExerciseForm subjects={subjects} />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map(ex => (
              <div key={ex.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="h-40 w-full relative bg-slate-100 overflow-hidden">
                  <img src={ex.a4ImageUrl} alt={ex.title} className="w-full h-full object-cover object-top" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-purple-800">
                    {ex.maxScore} نقطة
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-purple-950 line-clamp-1">{ex.title}</h3>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-bold text-slate-600 bg-white px-2 py-1.5 rounded-md">
                      المادة: {ex.subject.title}
                    </p>
                    {ex.secondarySubject && (
                      <p className="text-xs font-bold text-slate-500 bg-white px-2 py-1.5 rounded-md">
                        ثانوي: {ex.secondarySubject.title}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      الاختبار الذكي: {ex.quiz ? "مربوط" : "غير مربوط"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {exercises.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                لا توجد تمارين يومية مضافة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
