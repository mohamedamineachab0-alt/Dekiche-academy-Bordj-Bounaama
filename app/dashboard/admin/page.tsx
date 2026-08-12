import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Video, Calendar, Users, BookOpen, Key, Link as LinkIcon, BellRing, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const usersCount = await prisma.user.count();
  const subjectsCount = await prisma.subject.count();
  const codesCount = await prisma.accessCode.count({ where: { isUsed: false } });
  
  // Future live classes (e.g. from today onwards)
  const upcomingLiveClasses = await prisma.liveClass.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 3,
    include: { subject: true },
  });

  return (
    <div className="space-y-8">
      
      <HeroBanner 
        title="مرحباً بك في لوحة تحكم المدير"
        description="نظرة عامة على نشاط المنصة و الحصص المباشرة القادمة و وإحصائيات الطلاب والمواد"
        icon={Video}
        bgClass="bg-[#000000]"
        action={
          <Link href="/dashboard/admin/live-classes" className="bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#000000] border-[3px] border-[#000000] px-6 py-3.5 rounded-xl font-black transition-transform shadow-3d-soft shadow-3d-hover hover:-translate-y-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            إدارة الحصص المباشرة
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/admin/tenebati" className="bg-[#4C1D95] rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft flex flex-col justify-between group transition-transform shadow-3d-hover hover:-translate-y-1 paper-cut">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border-[3px] border-[#000000] flex items-center justify-center shrink-0 text-[#000000] transform -rotate-6 shadow-sm group-hover:rotate-0 transition-transform">
              <BellRing className="w-6 h-6" />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border-[2px] border-[#000000] flex items-center justify-center text-[#000000] opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[#FFFFFF]/80 text-sm font-bold mb-1">نظام المراقبة</p>
            <p className="text-xl font-black text-[#FFFFFF]">تنبيهاتي</p>
          </div>
        </Link>
        <div className="bg-[#FACC15] rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft flex items-center gap-4 transform rotate-1 hover:rotate-0 transition-transform paper-cut">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border-[3px] border-[#000000] flex items-center justify-center shrink-0 shadow-sm transform -rotate-3">
            <Users className="w-6 h-6 text-[#000000]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#000000]/80">إجمالي المستخدمين</p>
            <p className="text-3xl font-black text-[#000000]">{usersCount}</p>
          </div>
        </div>
        <div className="bg-[#06B6D4] rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft flex items-center gap-4 transform -rotate-1 hover:rotate-0 transition-transform paper-cut">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border-[3px] border-[#000000] flex items-center justify-center shrink-0 shadow-sm transform rotate-3">
            <BookOpen className="w-6 h-6 text-[#000000]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#000000]/80">المواد المنشورة</p>
            <p className="text-3xl font-black text-[#000000]">{subjectsCount}</p>
          </div>
        </div>
        <div className="bg-[#EC4899] rounded-3xl p-6 border-[3px] border-[#000000] shadow-3d-soft flex items-center gap-4 transform rotate-2 hover:rotate-0 transition-transform paper-cut">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border-[3px] border-[#000000] flex items-center justify-center shrink-0 shadow-sm transform -rotate-6">
            <Key className="w-6 h-6 text-[#000000]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#FFFFFF]">رموز غير مستخدمة</p>
            <p className="text-3xl font-black text-[#FFFFFF]">{codesCount}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#000000] mb-6 flex items-center gap-2">
          <div className="w-2 h-8 bg-[#22C55E] rounded-full border-[2px] border-[#000000]"></div>
          الحصص المباشرة القادمة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingLiveClasses.map(live => (
            <div key={live.id} className="bg-[#FFFFFF] border-[3px] border-[#000000] rounded-2xl p-5 shadow-3d-soft flex flex-col paper-cut transform transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E] border-[3px] border-[#000000] text-[#000000] flex items-center justify-center transform -rotate-6 shadow-sm">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-[#000000] text-lg">{live.title}</h3>
                  <p className="text-sm text-[#000000]/70 font-bold">{live.subject.title}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm font-bold bg-[#F8F9FA] p-3 rounded-xl border-[2px] border-[#000000] text-[#000000] mb-4">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#7E22CE]" /> {live.date.toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              
              <a href={live.zoomLink} target="_blank" rel="noreferrer" className="w-full mt-auto flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#7E22CE] hover:text-[#FFFFFF] text-[#000000] border-[3px] border-[#000000] font-black py-3 rounded-xl transition-colors text-sm shadow-sm">
                <LinkIcon className="w-4 h-4" />
                رابط المنصة
              </a>
            </div>
          ))}
          {upcomingLiveClasses.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#000000]/60 font-black bg-[#FFFFFF] rounded-2xl border-[3px] border-[#000000] border-dashed">
              لا توجد حصص مباشرة مجدولة قريباً
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
