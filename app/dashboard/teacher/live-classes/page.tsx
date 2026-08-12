import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Video, Calendar, Plus, Link as LinkIcon, Trash2 } from "lucide-react";
import { createLiveClass, deleteLiveClass } from "@/actions/live";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function TeacherLiveClassesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      teacherProfile: {
        include: { subjects: true }
      }
    }
  });

  if (!user || !user.teacherProfile) redirect("/login");

  const teacher = user.teacherProfile;
  const subjectIds = teacher.subjects.map(s => s.id);

  const liveClasses = await prisma.liveClass.findMany({
    where: {
      subjectId: { in: subjectIds }
    },
    orderBy: { date: "asc" },
    include: {
      subject: true,
    }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="حصصي المباشرة"
        description="قم ببرمجة حصص البث المباشر لتلاميذك وتوفير روابط الزوم الخاصة بالدروس"
        icon={Video}
        bgClass="bg-[#EC4899]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-3d-soft border-[4px] border-[#000000] paper-cut p-6 sticky top-6 border-dashed">
            <h2 className="text-xl font-black text-[#000000] mb-6 flex items-center gap-2 border-b-[3px] border-[#000000] pb-4 border-dashed">
              <div className="w-8 h-8 rounded-lg bg-[#22C55E] border-[2px] border-[#000000] flex items-center justify-center transform -rotate-3">
                <Plus className="w-5 h-5 text-[#000000]" />
              </div>
              برمجة حصة جديدة
            </h2>
            
            <form action={async (formData) => { "use server"; await createLiveClass(formData); }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">عنوان الحصة <span className="text-[#EF4444]">*</span></label>
                <input type="text" name="title" required className="w-full p-3.5 rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#000000]/10 shadow-sm" placeholder="مثال: مراجعة شاملة" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">المادة الدراسية <span className="text-[#EF4444]">*</span></label>
                <select name="subjectId" required className="w-full p-3.5 rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#000000]/10 shadow-sm cursor-pointer appearance-none">
                  <option value="">اختر المادة</option>
                  {teacher.subjects.map(s => {
                    const levelStr = LEVELS.find(l => l.value === s.level)?.label || s.level;
                    const streamStr = STREAMS.find(st => st.value === s.stream)?.label || s.stream;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.title} ({levelStr} - {streamStr})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">رابط الزوم <span className="text-[#EF4444]">*</span></label>
                <input type="url" name="zoomLink" required dir="ltr" className="w-full p-3.5 rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#000000]/10 shadow-sm text-left" placeholder="https://zoom.us/j/..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#000000]">التاريخ والوقت <span className="text-[#EF4444]">*</span></label>
                  <input type="datetime-local" name="date" required className="w-full p-3.5 rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#000000]/10 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#000000]">الشهر <span className="text-[#EF4444]">*</span></label>
                  <input type="number" min="1" max="12" name="month" required className="w-full p-3.5 rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#000000]/10 shadow-sm" placeholder="9" />
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#000000] text-[#FFFFFF] font-black py-4 rounded-xl border-[3px] border-[#000000] shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1 transition-transform mt-4">
                <Calendar className="w-5 h-5" />
                برمجة الحصة
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liveClasses.map(liveClass => {
              const levelStr = LEVELS.find(l => l.value === liveClass.subject.level)?.label || liveClass.subject.level;
              const formattedDate = new Date(liveClass.date).toLocaleString('ar-DZ', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={liveClass.id} className="bg-[#FFFFFF] rounded-2xl shadow-3d-soft border-[4px] border-[#000000] paper-cut p-6 flex flex-col hover:-translate-y-1 hover:shadow-3d-hover transition-transform">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-[#EC4899] border-[3px] border-[#000000] shadow-sm flex items-center justify-center text-[#FFFFFF] shrink-0 transform -rotate-3">
                      <Video className="w-7 h-7" />
                    </div>
                    <form action={async () => { "use server"; await deleteLiveClass(liveClass.id); }}>
                      <button type="submit" className="p-2.5 text-[#EF4444] border-[3px] border-[#EF4444] bg-[#FFFFFF] hover:bg-[#EF4444] hover:text-[#FFFFFF] rounded-xl transition-colors shadow-sm transform rotate-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </div>

                  <h3 className="font-black text-[#000000] text-2xl mb-3 leading-tight">{liveClass.title}</h3>
                  <div className="bg-[#FFFFFF] border-[3px] border-[#000000] text-[#000000] text-sm font-black px-4 py-2 rounded-xl inline-block mb-6 shadow-sm transform -rotate-1 self-start">
                    {liveClass.subject.title} • {levelStr}
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 text-base font-bold text-[#000000]/70">
                      <Calendar className="w-5 h-5 text-[#000000]" />
                      {formattedDate}
                    </div>
                  </div>

                  <a 
                    href={liveClass.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-[#7E22CE] text-[#FFFFFF] font-black rounded-xl border-[3px] border-[#000000] shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1 transition-transform"
                  >
                    <LinkIcon className="w-5 h-5" />
                    دخول الحصة (الزوم)
                  </a>
                </div>
              )
            })}
            {liveClasses.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#000000]/50 font-black text-xl border-[4px] border-[#000000] border-dashed rounded-2xl bg-[#FFFFFF] paper-cut">
                لم تقم ببرمجة أي حصة مباشرة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
