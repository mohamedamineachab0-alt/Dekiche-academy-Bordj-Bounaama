import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Trophy, Medal, MapPin, Award, Search, ChevronLeft, Phone } from "lucide-react";
import { getWilayaName, LEVELS, STREAMS } from "@/lib/constants";

export default async function AdminLeaderboardPage() {
  // Fetch top students (we can show top 10 for admins)
  const topStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { studentProfile: { totalPoints: "desc" } },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="ترتيب الأوائل"
        description="استعرض قائمة التلاميذ المتفوقين والأكثر نشاطاً في الأكاديمية بناءً على مجموع النقاط"
        icon={Trophy}
        gradientClass="bg-gradient-to-r from-purple-600 to-orange-600"
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-black text-purple-800">الترتيب</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">التلميذ</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">النقاط</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">المستوى والشعبة</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">معلومات الاتصال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">
                    لا يوجد تلاميذ مسجلين بعد
                  </td>
                </tr>
              ) : (
                topStudents.map((student, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const iconColor = rank === 1 ? "text-purple-700" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-purple-800" : "text-purple-800";
                  
                  const levelStr = LEVELS.find(l => l.value === student.studentProfile?.level)?.label || "";
                  const streamStr = STREAMS.find(s => s.value === student.studentProfile?.stream)?.label || "";

                  return (
                    <tr key={student.id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isTop3 ? (
                            <Medal className={`w-6 h-6 ${iconColor}`} />
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 text-sm">
                              #{rank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-purple-950">{student.fullName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-100 text-purple-800 font-black px-3 py-1 rounded-full text-sm">
                          {student.studentProfile?.totalPoints} نقطة
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-purple-900">{levelStr}</p>
                        <p className="text-xs font-medium text-slate-500">{streamStr}</p>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span dir="ltr" className="font-medium text-right">{student.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{getWilayaName(student.studentProfile?.wilaya)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
