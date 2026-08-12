import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Search } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function StudentMistakesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const mistakes = await prisma.studentMistake.findMany({
    where: { studentId: sessionId },
    include: {
      lesson: {
        include: { subject: true }
      },
      quiz: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="أخطائي"
        description="تتبع الأخطاء التي قمت بها أثناء حل التمارين والاختبارات و وراجع الحلول الصحيحة لتطوير مستواك"
        icon={AlertTriangle}
        gradientClass="bg-gradient-to-r from-purple-700 to-purple-800"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-black text-purple-950">سجل الأخطاء</h2>
          
          <div className="relative w-full md:w-64">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="ابحث في الأخطاء.."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
          </div>
        </div>

        {mistakes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <AlertTriangle className="w-12 h-12 text-purple-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-purple-950 mb-1">لا توجد أخطاء مسجلة</h3>
            <p className="text-slate-500 font-medium">أنت تبلي بلاءً حسناً! واصل اجتهادك</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {mistakes.map((mistake) => (
                <div key={mistake.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div>
                    <p className="font-black text-purple-950 text-sm">{mistake.lesson.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{mistake.lesson.subject.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{mistake.createdAt.toLocaleDateString("en-GB")}</p>
                  </div>
                  <div className="bg-purple-50 text-purple-800 p-3 rounded-xl border border-purple-100 text-sm whitespace-pre-wrap">
                    <p className="text-xs font-black text-purple-500 mb-1">الخطأ</p>
                    {mistake.mistakeContent}
                  </div>
                  <div className="bg-purple-50 text-purple-800 p-3 rounded-xl border border-purple-100 text-sm whitespace-pre-wrap">
                    <p className="text-xs font-black text-purple-700 mb-1">الحل الصحيح</p>
                    {mistake.correctSolution}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-white text-purple-800 font-bold border-y border-slate-100">
                  <tr>
                    <th className="px-6 py-4 rounded-tr-xl">اسم الدرس / المادة</th>
                    <th className="px-6 py-4">الخطأ</th>
                    <th className="px-6 py-4 rounded-tl-xl">الحل الصحيح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-purple-900">
                  {mistakes.map((mistake) => (
                    <tr key={mistake.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-purple-950">{mistake.lesson.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{mistake.lesson.subject.title} - اختبار</div>
                        <div className="text-xs text-slate-400 mt-1" dir="ltr" style={{ textAlign: "right" }}>
                          {mistake.createdAt.toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="bg-purple-50 text-purple-800 p-3 rounded-xl border border-purple-100 whitespace-pre-wrap">
                          {mistake.mistakeContent}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="bg-purple-50 text-purple-800 p-3 rounded-xl border border-purple-100 whitespace-pre-wrap">
                          {mistake.correctSolution}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
