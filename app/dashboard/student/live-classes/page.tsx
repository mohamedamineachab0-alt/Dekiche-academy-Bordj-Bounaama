import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Video, Calendar, Link as LinkIcon, Clock } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function StudentLiveClassesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      enrollments: true,
      studentProfile: true
    }
  });

  if (!user || !user.studentProfile) redirect("/login");

  const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);

  // Fetch only upcoming or recent live classes for enrolled subjects
  const liveClasses = await prisma.liveClass.findMany({
    where: {
      subjectId: { in: enrolledSubjectIds }
    },
    orderBy: { date: "asc" },
    include: {
      subject: true,
    }
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="حصصي المباشرة"
        description="تابع حصص البث المباشر مع أساتذتك و المراجعات والتطبيقات التفاعلية لجميع المواد المسجل بها"
        icon={Video}
      />

      {liveClasses.length === 0 ? (
        <div className="p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
          <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-sm relative z-10">
            <Video className="w-10 h-10 text-[#000000]" />
          </div>
          <h3 className="font-black text-2xl text-[#000000] mb-3 relative z-10">لا توجد حصص مبرمجة حالياً</h3>
          <p className="text-gray-600 font-bold mt-2 relative z-10">ستظهر هنا الحصص الخاصة بالمواد التي سجلت فيها فور برمجتها من طرف أساتذتك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map(liveClass => {
            const levelStr = LEVELS.find(l => l.value === liveClass.subject.level)?.label || liveClass.subject.level;
            const formattedDate = new Date(liveClass.date).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const formattedTime = new Date(liveClass.date).toLocaleString('ar-DZ', { 
              hour: '2-digit', minute: '2-digit'
            });

            const startTime = new Date(liveClass.date);
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration assumed
            const currentTime = new Date();

            let status = 'upcoming';
            if (currentTime >= startTime && currentTime <= endTime) {
              status = 'live';
            } else if (currentTime > endTime) {
              status = 'ended';
            }

            return (
              <div key={liveClass.id} className="bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] p-6 flex flex-col relative overflow-hidden paper-cut group transition-transform hover:-translate-y-1 hover:shadow-3d-hover">
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#EC4899] border-[3px] border-[#000000] flex items-center justify-center text-white shrink-0 group-hover:-rotate-6 transition-transform duration-300 shadow-sm transform rotate-3">
                    <Video className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  {status === 'upcoming' && (
                    <span className="bg-[#06B6D4] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[3px] border-[#000000] shadow-sm transform -rotate-3">
                      قادمة
                    </span>
                  )}
                  {status === 'live' && (
                    <span className="bg-[#22C55E] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[3px] border-[#000000] animate-pulse shadow-sm transform rotate-3">
                      جارية الآن
                    </span>
                  )}
                  {status === 'ended' && (
                    <span className="bg-gray-200 text-gray-500 text-xs font-black px-3 py-1.5 rounded-lg border-[3px] border-gray-300 shadow-sm">
                      منتهية
                    </span>
                  )}
                </div>

                <h3 className="font-black text-[#000000] text-xl mb-3 relative z-10">{liveClass.title}</h3>
                <div className="bg-[#FACC15] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg inline-block mb-6 border-[2px] border-[#000000] w-fit shadow-sm relative z-10 transform -rotate-1">
                  {liveClass.subject.title}
                </div>

                <div className="space-y-4 flex-1 bg-white p-5 rounded-2xl border-[3px] border-[#000000] shadow-sm relative z-10 mb-2">
                  <div className="flex items-center gap-3 text-sm font-bold text-[#000000]">
                    <div className="w-8 h-8 rounded-lg bg-[#EAE4D9] border-[2px] border-[#000000] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-[#000000]" />
                    </div>
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-[#000000]">
                    <div className="w-8 h-8 rounded-lg bg-[#EAE4D9] border-[2px] border-[#000000] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#000000]" />
                    </div>
                    الساعة {formattedTime}
                  </div>
                </div>

                {status !== 'ended' ? (
                  <a 
                    href={liveClass.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 relative z-10 flex items-center justify-center gap-2 w-full py-4 bg-[#7E22CE] text-white hover:bg-[#FACC15] hover:text-[#000000] shadow-sm border-[3px] border-[#000000] font-black rounded-xl transition-all hover:-translate-y-1 hover:shadow-3d-hover group-hover:rotate-1"
                  >
                    <LinkIcon className="w-5 h-5" strokeWidth={3} />
                    دخول الحصة
                  </a>
                ) : (
                  <div className="mt-6 relative z-10 flex items-center justify-center gap-2 w-full py-4 bg-gray-100 text-gray-400 font-black rounded-xl border-[3px] border-gray-300">
                    الحصة منتهية
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
