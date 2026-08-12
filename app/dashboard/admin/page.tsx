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
        action={
          <Link href="/dashboard/admin/live" className="bg-white hover:bg-black text-purple-950 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            إدارة الحصص المباشرة
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/admin/tenebati" className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 border border-purple-800 shadow-sm flex flex-col justify-between group transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 text-purple-950">
              <BellRing className="w-6 h-6" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-purple-950 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-purple-950/80 text-sm font-bold mb-1">نظام المراقبة</p>
            <p className="text-xl font-black text-purple-950">تنبيهاتي</p>
          </div>
        </Link>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">إجمالي المستخدمين</p>
            <p className="text-2xl font-black text-purple-950">{usersCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">المواد المنشورة</p>
            <p className="text-2xl font-black text-purple-950">{subjectsCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <Key className="w-6 h-6 text-purple-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">رموز غير مستخدمة</p>
            <p className="text-2xl font-black text-purple-950">{codesCount}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-purple-950 mb-6">الحصص المباشرة القادمة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingLiveClasses.map(live => (
            <div key={live.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-950">{live.title}</h3>
                  <p className="text-xs text-slate-500 font-bold">{live.subject.title}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-bold bg-white p-3 rounded-xl border border-slate-100 text-slate-600">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {live.date.toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              
              <a href={live.zoomLink} target="_blank" rel="noreferrer" className="w-full mt-auto flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold py-2.5 rounded-xl transition-colors text-sm">
                <LinkIcon className="w-4 h-4" />
                رابط المنصة
              </a>
            </div>
          ))}
          {upcomingLiveClasses.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-100">
              لا توجد حصص مباشرة مجدولة قريباً
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
