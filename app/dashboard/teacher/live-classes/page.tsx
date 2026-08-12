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
        gradientClass="bg-gradient-to-r from-purple-600 to-pink-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-purple-950 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-800" />
              برمجة حصة جديدة
            </h2>
            
            <form action={async (formData) => { "use server"; await createLiveClass(formData); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">عنوان الحصة</label>
                <input type="text" name="title" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-700" placeholder="مثال: مراجعة شاملة" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">المادة الدراسية (موادك فقط)</label>
                <select name="subjectId" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-700">
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

              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">رابط الزوم</label>
                <input type="url" name="zoomLink" required dir="ltr" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-700" placeholder="https://zoom.us/j/..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-purple-800">التاريخ والوقت</label>
                  <input type="datetime-local" name="date" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-700" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-purple-800">الشهر</label>
                  <input type="number" min="1" max="12" name="month" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-700" placeholder="9" />
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                <Calendar className="w-4 h-4" />
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
                <div key={liveClass.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 shrink-0">
                      <Video className="w-6 h-6" />
                    </div>
                    <form action={async () => { "use server"; await deleteLiveClass(liveClass.id); }}>
                      <button type="submit" className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  <h3 className="font-black text-purple-950 text-lg mb-2">{liveClass.title}</h3>
                  <div className="bg-white text-purple-800 text-xs font-bold px-3 py-1.5 rounded-lg inline-block mb-4 border border-slate-200">
                    {liveClass.subject.title} • {levelStr}
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formattedDate}
                    </div>
                  </div>

                  <a 
                    href={liveClass.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold rounded-xl transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    دخول الحصة (الزوم)
                  </a>
                </div>
              )
            })}
            {liveClasses.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                لم تقم ببرمجة أي حصة مباشرة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
