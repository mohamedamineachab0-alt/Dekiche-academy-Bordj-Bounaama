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
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="الترتيب والنقاط"
        description="تنافس مع زملائك و حسن ترتيبك من خلال حل التمارين والاختبارات و وكن في صدارة الأكاديمية!"
        icon={Trophy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Personal Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#FFFFFF] p-8 md:p-10 rounded-3xl border-[3px] border-[#000000] shadow-3d-soft text-center paper-cut relative overflow-hidden">
            <div className="w-24 h-24 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 shadow-sm relative z-10">
              <Star className="w-12 h-12 text-[#000000]" fill="currentColor" />
            </div>
            <h3 className="text-gray-600 font-black text-lg mb-2 relative z-10">مجموع نقاطك</h3>
            <p className="text-6xl font-black text-[#000000] drop-shadow-sm relative z-10">{currentUser.studentProfile.totalPoints}</p>
            <div className="mt-8 pt-6 border-t-[3px] border-[#000000]/10 border-dashed flex justify-between items-center relative z-10">
              <span className="font-black text-gray-500 bg-[#000000]/5 px-3 py-1.5 rounded-lg text-sm">ترتيبك:</span>
              <span className="font-black text-3xl text-[#7E22CE]">{myRank}</span>
            </div>
          </div>
        </div>

        {/* Podium / Top 3 Leaderboard */}
        <div className="lg:col-span-2">
          <div className="bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft overflow-hidden paper-cut relative">
            <div className="p-6 md:p-8 border-b-[3px] border-[#000000] bg-[#F8F9FA] flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#06B6D4] text-[#000000] rounded-xl border-[3px] border-[#000000] flex items-center justify-center shadow-sm transform rotate-3">
                <Award className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="font-black text-2xl text-[#000000]">لوحة الشرف - الأوائل</h3>
            </div>
            
            <div className="p-6 md:p-8 space-y-4 relative z-10">
              {topStudents.length === 0 ? (
                <p className="text-center text-gray-500 font-bold py-12 bg-white rounded-2xl border-[3px] border-[#000000] border-dashed">لا يوجد تصنيف بعد</p>
              ) : (
                topStudents.map((student, index) => {
                  const isCurrentUser = student.id === currentUser.id;
                  const rank = index + 1;
                  
                  // Arabic rank name
                  const rankLabel = rank === 1 ? "الأول" : rank === 2 ? "الثاني" : "الثالث";
                  // Medal colors
                  const iconColor = rank === 1 ? "text-[#000000]" : rank === 2 ? "text-[#000000]" : "text-white";
                  const bgColor = rank === 1 ? "bg-[#FACC15]" : rank === 2 ? "bg-[#EAE4D9]" : "bg-[#F97316]";
                  const rowBg = isCurrentUser ? "bg-[#7E22CE] text-white" : "bg-white text-[#000000]";
                  const rankTextColor = isCurrentUser ? "text-[#FACC15]" : "text-[#7E22CE]";
                  const subtitleColor = isCurrentUser ? "text-purple-200" : "text-gray-500";
                  
                  const levelStr = LEVELS.find(l => l.value === student.studentProfile?.level)?.label || "";
                  const streamStr = STREAMS.find(s => s.value === student.studentProfile?.stream)?.label || "";

                  return (
                    <div 
                      key={student.id} 
                      className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border-[3px] border-[#000000] ${rowBg} shadow-sm transition-transform hover:-translate-y-1 hover:shadow-3d-hover group`}
                    >
                      <div className={`w-14 h-14 ${bgColor} rounded-xl border-[3px] border-[#000000] flex items-center justify-center shrink-0 shadow-sm transform transition-transform group-hover:scale-110 ${rank === 1 ? '-rotate-6' : rank === 2 ? 'rotate-3' : '-rotate-3'}`}>
                        <Medal className={`w-7 h-7 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-right">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 justify-center sm:justify-start">
                          <h4 className="font-black text-xl">{student.fullName}</h4>
                          {isCurrentUser && (
                            <span className="text-[10px] font-black bg-[#FACC15] text-[#000000] border-[2px] border-[#000000] px-2 py-0.5 rounded-md transform rotate-3">
                              أنت
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-bold mt-1 ${subtitleColor}`}>{levelStr} • {streamStr}</p>
                      </div>

                      <div className={`text-center px-5 py-3 rounded-xl border-[3px] border-[#000000] w-full sm:w-auto shadow-sm ${isCurrentUser ? 'bg-[#000000] text-white' : 'bg-[#F8F9FA]'}`}>
                        <p className={`text-[10px] font-black mb-1 ${isCurrentUser ? 'text-gray-300' : 'text-gray-500'}`}>المركز {rankLabel}</p>
                        <p className={`font-mono font-black text-2xl ${isCurrentUser ? 'text-[#FACC15]' : 'text-[#7E22CE]'}`}>
                          {student.studentProfile?.totalPoints} <span className={`text-xs font-black ${isCurrentUser ? 'text-white' : 'text-[#000000]'}`}>نقطة</span>
                        </p>
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
