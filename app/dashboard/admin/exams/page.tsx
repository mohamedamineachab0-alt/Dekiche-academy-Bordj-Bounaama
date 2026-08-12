import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { FileText } from "lucide-react";
import { ExamUploadForm } from "@/components/admin/ExamUploadForm";

export default async function AdminExamsPage() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" }
  });

  const recentExams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      subject: true,
      quiz: true,
      _count: {
        select: { submissions: true }
      }
    }
  });

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="إدارة الاختبارات والفروض"
        description="ارفع صور الاختبارات ليقوم الذكاء الاصطناعي باستخراج الأسئلة وتصحيح إجابات التلاميذ آلياً"
        icon={FileText}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Upload Form - Takes up 2 columns on large screens */}
        <div className="xl:col-span-2">
          <ExamUploadForm subjects={subjects} />
        </div>

        {/* Recent Exams List */}
        <div className="space-y-6">
          <h3 className="font-black text-xl text-purple-950">أحدث الاختبارات المرفوعة</h3>
          
          <div className="space-y-4">
            {recentExams.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-bold">لم يتم رفع أي اختبارات بعد</p>
              </div>
            ) : (
              recentExams.map(exam => (
                <div key={exam.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-purple-950">{exam.title}</h4>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                      {exam.subject.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                      {exam.quiz ? "تم استخراج الذكاء الاصطناعي بنجاح" : "بدون كويز آلي"}
                    </span>
                    <span className="font-bold text-purple-700">
                      {exam._count.submissions} إجابة
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
