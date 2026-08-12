import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MessageSquare, Lock, Unlock, ArrowLeft } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudentForums } from "@/actions/forums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StudentForumsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: sessionId },
  });

  if (!studentProfile) redirect("/login");

  const forums = await getStudentForums(studentProfile.phase, studentProfile.level, studentProfile.stream);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="منتدياتي (دردشة القسم)"
        description="شارك في نقاشات القسم و اطرح أسئلتك و وتفاعل مع زملائك في مساحة آمنة ومخصصة لمستواك"
        icon={MessageSquare}
      />

      {forums.length === 0 ? (
        <div className="p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
          <div className="w-20 h-20 bg-[#EC4899] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center transform -rotate-3 mx-auto mb-6 shadow-sm">
            <MessageSquare className="w-10 h-10 text-[#000000]" />
          </div>
          <h3 className="font-black text-2xl text-[#000000] mb-3">لا توجد منتديات متاحة حالياً</h3>
          <p className="text-gray-600 font-bold max-w-sm mx-auto leading-relaxed">ستظهر منتديات النقاش الخاصة بمستواك وشعبتك هنا قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forums.map((forum, index) => {
            const colors = ["bg-[#FACC15]", "bg-[#22C55E]", "bg-[#06B6D4]", "bg-[#EC4899]", "bg-[#7E22CE]", "bg-[#F97316]"];
            const cardBg = colors[index % colors.length];
            const isDark = cardBg === "bg-[#7E22CE]";
            const textColor = isDark ? "text-white" : "text-[#000000]";
            const subtleTextColor = isDark ? "text-white/80" : "text-[#000000]/70";

            return (
            <Link href={`/dashboard/student/forums/${forum.id}`} key={forum.id} className="block group">
              <div className={`${cardBg} rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft transition-all duration-300 shadow-3d-hover paper-cut relative overflow-hidden h-full flex flex-col`}>
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#000000] flex items-center justify-center text-white border-[3px] border-[#000000] shadow-sm transform group-hover:-rotate-6 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  {forum.isOpen ? (
                    <span className="inline-flex items-center gap-1 bg-[#22C55E] text-[#000000] text-xs font-black px-3 py-1.5 rounded-xl border-[2px] border-[#000000] shadow-sm transform rotate-2">
                      <Unlock className="w-4 h-4" /> مفتوح
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#FFFFFF] text-[#000000] text-xs font-black px-3 py-1.5 rounded-xl border-[2px] border-[#000000] shadow-sm transform -rotate-2">
                      <Lock className="w-4 h-4" /> مغلق
                    </span>
                  )}
                </div>

                <div className="mb-8 flex-1 relative z-10">
                  <h3 className={`text-xl font-black ${textColor} mb-2 line-clamp-1`}>{forum.title}</h3>
                  <p className={`text-sm font-bold ${subtleTextColor} bg-[#000000]/5 inline-block px-3 py-1 rounded-lg`}>{forum.subject.title}</p>
                </div>

                <div className={`flex items-center justify-between pt-5 border-t-[3px] border-[#000000]/10 relative z-10`}>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold ${subtleTextColor}`}>الشهر</span>
                      <span className={`text-base font-black ${textColor}`}>{forum.month}</span>
                    </div>
                    <div className="w-1 h-8 bg-[#000000]/10 rounded-full"></div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold ${subtleTextColor}`}>الرسائل</span>
                      <span className={`text-base font-black ${textColor}`}>{forum._count.messages}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#000000] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </div>
                </div>
                
              </div>
            </Link>
          )})}
        </div>
      )}
    </div>
  );
}
