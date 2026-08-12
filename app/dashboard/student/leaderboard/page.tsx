import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { LEVELS, STREAMS } from "@/lib/constants";

export default async function StudentLeaderboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: sessionId },
    include: { studentProfile: true }
  });

  if (!currentUser || !currentUser.studentProfile) redirect("/login");

  // Get Top 3 Students
  const topStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { studentProfile: { totalPoints: "desc" } },
    take: 3,
  });

  // Calculate Rank
  let myRank = "غير مصنف";
  if (currentUser.studentProfile.totalPoints > 0) {
    const higherScoringStudents = await prisma.studentProfile.count({
      where: {
        totalPoints: { gt: currentUser.studentProfile.totalPoints }
      }
    });
    myRank = `#${higherScoringStudents + 1}`;
  }

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="الترتيب والنقاط"
        description="تنافس مع زملائك و حسن ترتيبك من خلال حل التمارين والاختبارات و وكن في صدارة الأكاديمية!"
        icon={Trophy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Personal Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-purple-700" />
            </div>
            <h3 className="text-slate-500 font-bold text-sm">مجموع نقاطك</h3>
            <p className="text-5xl font-black text-purple-950 mt-2">{currentUser.studentProfile.totalPoints}</p>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center px-4">
              <span className="font-bold text-slate-600">ترتيبك:</span>
              <span className="font-black text-2xl text-purple-800">{myRank}</span>
            </div>
          </div>
        </div>

        {/* Podium / Top 3 Leaderboard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-3">
              <Award className="w-6 h-6 text-purple-700" />
              <h3 className="font-black text-xl text-purple-950">لوحة الشرف - الأوائل</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {topStudents.length === 0 ? (
                <p className="text-center text-slate-500 font-bold py-8">لا يوجد تصنيف بعد</p>
              ) : (
                topStudents.map((student, index) => {
                  const isCurrentUser = student.id === currentUser.id;
                  const rank = index + 1;
                  
                  // Arabic rank name
                  const rankLabel = rank === 1 ? "الأول" : rank === 2 ? "الثاني" : "الثالث";
                  // Medal colors
                  const iconColor = rank === 1 ? "text-purple-700" : rank === 2 ? "text-slate-400" : "text-purple-800";
                  const bgColor = rank === 1 ? "bg-purple-100" : rank === 2 ? "bg-slate-100" : "bg-purple-100/50";
                  
                  const levelStr = LEVELS.find(l => l.value === student.studentProfile?.level)?.label || "";
                  const streamStr = STREAMS.find(s => s.value === student.studentProfile?.stream)?.label || "";

                  return (
                    <div 
                      key={student.id} 
                      className={`flex items-center gap-4 p-5 rounded-2xl border ${isCurrentUser ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-white'} transition-all`}
                    >
                      <div className={`w-14 h-14 ${bgColor} rounded-full flex items-center justify-center shrink-0`}>
                        <Medal className={`w-7 h-7 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-lg text-purple-950">{student.fullName}</h4>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                              أنت
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{levelStr} • {streamStr}</p>
                      </div>

                      <div className="text-center bg-white px-4 py-2 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400">المركز {rankLabel}</p>
                        <p className="font-black text-xl text-purple-900">{student.studentProfile?.totalPoints} <span className="text-xs font-bold">نقطة</span></p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
