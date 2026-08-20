import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Search } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MathPreview } from "@/components/shared/MathPreview";

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
        include: { subjects: true }
      },
      quiz: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="أخطائي"
        description="تتبع الأخطاء التي قمت بها أثناء حل التمارين والاختبارات و وراجع الحلول الصحيحة لتطوير مستواك"
        icon={AlertTriangle}
      />

      <div className="bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] p-6 md:p-8 overflow-hidden paper-cut relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FACC15] border-[3px] border-[#000000] rounded-xl flex items-center justify-center transform rotate-3 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-[#000000]" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-[#000000]">سجل الأخطاء</h2>
          </div>
          
          <div className="relative w-full md:w-72 group">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform group-focus-within:rotate-90">
              <Search className="w-5 h-5" strokeWidth={3} />
            </span>
            <input 
              type="text" 
              placeholder="ابحث في الأخطاء.."
              className="w-full pr-12 pl-4 py-3.5 rounded-xl border-[3px] border-[#000000] bg-white text-base font-bold text-[#000000] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {mistakes.length === 0 ? (
          <div className="text-center py-16 bg-[#F8F9FA] rounded-2xl border-[3px] border-[#000000] border-dashed relative z-10">
            <AlertTriangle className="w-14 h-14 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-[#000000] mb-2">لا توجد أخطاء مسجلة</h3>
            <p className="text-gray-500 font-bold">أنت تبلي بلاءً حسناً! واصل اجتهادك</p>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-6">
              {mistakes.map((mistake) => (
                <div key={mistake.id} className="bg-white border-[3px] border-[#000000] rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-3d-hover">
                  <div className="border-b-[3px] border-[#000000]/10 border-dashed pb-3">
                    <p className="font-black text-[#000000] text-lg">{mistake.lesson.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold bg-[#EAE4D9] px-2 py-1 rounded-md border-[2px] border-[#000000]">{mistake.lesson.subjects.map(s => s.title).join(" | ")}</span>
                      <span className="text-xs font-black text-gray-500">{mistake.createdAt.toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                  <div className="bg-[#FEE2E2] text-[#000000] p-4 rounded-xl border-[3px] border-[#000000] text-sm whitespace-pre-wrap relative">
                    <div className="absolute -top-3 right-4 bg-[#EF4444] text-white px-2 py-0.5 rounded-md border-[2px] border-[#000000] text-[10px] font-black transform rotate-3">الخطأ</div>
                    <div className="mt-1 font-bold"><MathPreview text={mistake.mistakeContent} className="" /></div>
                  </div>
                  <div className="bg-[#DCFCE7] text-[#000000] p-4 rounded-xl border-[3px] border-[#000000] text-sm whitespace-pre-wrap relative">
                    <div className="absolute -top-3 right-4 bg-[#22C55E] text-[#000000] px-2 py-0.5 rounded-md border-[2px] border-[#000000] text-[10px] font-black transform -rotate-2">الحل الصحيح</div>
                    <div className="mt-1 font-bold"><MathPreview text={mistake.correctSolution} className="" /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border-[3px] border-[#000000] shadow-sm">
              <table className="w-full text-right text-sm border-collapse">
                <thead className="bg-[#F8F9FA] text-[#000000] font-black border-b-[3px] border-[#000000]">
                  <tr>
                    <th className="px-6 py-5 w-1/4">اسم الدرس / المادة</th>
                    <th className="px-6 py-5 border-r-[3px] border-[#000000]">الخطأ</th>
                    <th className="px-6 py-5 border-r-[3px] border-[#000000]">الحل الصحيح</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[3px] divide-[#000000] font-bold text-[#000000] bg-white">
                  {mistakes.map((mistake) => (
                    <tr key={mistake.id} className="hover:bg-[#EAE4D9]/30 transition-colors group">
                      <td className="px-6 py-5 align-top">
                        <div className="font-black text-[#000000] text-base mb-2">{mistake.lesson.title}</div>
                        <div className="inline-block text-xs bg-[#FACC15] border-[2px] border-[#000000] px-2 py-1 rounded-md mb-2">{mistake.lesson.subjects.map(s => s.title).join(" | ")}</div>
                        <div className="text-xs text-gray-500 font-black mt-1" dir="ltr" style={{ textAlign: "right" }}>
                          {mistake.createdAt.toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top max-w-xs border-r-[3px] border-[#000000]">
                        <div className="bg-[#FEE2E2] text-[#000000] p-4 rounded-xl border-[2px] border-[#000000] whitespace-pre-wrap h-full group-hover:scale-[1.02] transition-transform shadow-sm">
                          <MathPreview text={mistake.mistakeContent} className="" />
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top max-w-xs border-r-[3px] border-[#000000]">
                        <div className="bg-[#DCFCE7] text-[#000000] p-4 rounded-xl border-[2px] border-[#000000] whitespace-pre-wrap h-full group-hover:scale-[1.02] transition-transform shadow-sm">
                          <MathPreview text={mistake.correctSolution} className="" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
