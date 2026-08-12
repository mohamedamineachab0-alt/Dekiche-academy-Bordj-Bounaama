import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Users, Plus, Phone, BookOpen } from "lucide-react";
import { createTeacher } from "@/actions/admin";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      subjects: true,
    }
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إدارة الأساتذة"
        description="تسجيل أساتذة جدد وتعيين مستويات وشعب التدريس الخاصة بهم"
        icon={Users}
        bgClass="bg-[#06B6D4]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-3d-soft border-[4px] border-[#000000] p-6 sticky top-6 paper-cut">
            <h2 className="text-xl font-black text-[#000000] mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FACC15] border-[2px] border-[#000000] flex items-center justify-center transform rotate-3 shadow-sm">
                <Plus className="w-5 h-5 text-[#000000]" />
              </div>
              إضافة أستاذ جديد
            </h2>
            
            <form action={async (formData) => { "use server"; await createTeacher(formData); }} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#000000]">الاسم الكامل</label>
                <input type="text" name="fullName" required className="w-full p-3 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] font-bold focus:outline-none focus:bg-[#FFFFFF] transition-all shadow-sm" placeholder="مثال: الأستاذ كمال" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-black text-[#000000]">رقم الهاتف (للدخول)</label>
                <input type="tel" name="phoneNumber" required dir="ltr" className="w-full p-3 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] font-bold focus:outline-none focus:bg-[#FFFFFF] transition-all shadow-sm" placeholder="05XXXXXXXX" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">الأطوار الدراسية الموكلة</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "PRIMARY", label: "ابتدائي" },
                    { value: "MIDDLE", label: "متوسط" },
                    { value: "SECONDARY", label: "ثانوي" }
                  ].map(p => (
                    <label key={p.value} className="flex items-center gap-2 bg-[#FFFFFF] border-[2px] border-[#000000] rounded-xl p-2 cursor-pointer hover:bg-[#FACC15]/20 transition-colors shadow-sm">
                      <input type="checkbox" name="phases" value={p.value} className="accent-[#7E22CE] w-4 h-4" />
                      <span className="text-xs font-black text-[#000000]">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">المستويات الدراسية الموكلة</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEVELS.map(l => (
                    <label key={l.value} className="flex items-center gap-2 bg-[#FFFFFF] border-[2px] border-[#000000] rounded-xl p-2 cursor-pointer hover:bg-[#FACC15]/20 transition-colors shadow-sm">
                      <input type="checkbox" name="levels" value={l.value} className="accent-[#7E22CE] w-4 h-4" />
                      <span className="text-xs font-black text-[#000000]">{l.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">الشعب الموكلة</label>
                <div className="grid grid-cols-2 gap-2">
                  {STREAMS.map(s => (
                    <label key={s.value} className="flex items-center gap-2 bg-[#FFFFFF] border-[2px] border-[#000000] rounded-xl p-2 cursor-pointer hover:bg-[#FACC15]/20 transition-colors shadow-sm">
                      <input type="checkbox" name="streams" value={s.value} className="accent-[#7E22CE] w-4 h-4" />
                      <span className="text-xs font-black text-[#000000]">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-[#000000]">المواد المسندة</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {subjects.length === 0 && <span className="text-xs font-bold text-[#000000]/50">لا توجد مواد بعد</span>}
                  {subjects.map(subj => (
                    <label key={subj.id} className="flex items-center gap-2 bg-[#FFFFFF] border-[2px] border-[#000000] rounded-xl p-2.5 cursor-pointer hover:bg-[#FACC15]/20 transition-colors shadow-sm">
                      <input type="checkbox" name="subjectIds" value={subj.id} className="accent-[#7E22CE] w-4 h-4" />
                      <span className="text-sm font-black text-[#000000]">{subj.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#7E22CE] hover:bg-[#4C1D95] text-[#FFFFFF] border-[3px] border-[#000000] font-black text-lg py-4 rounded-xl transition-transform shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1 mt-4">
                <Users className="w-5 h-5" />
                إنشاء حساب الأستاذ
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {teachers.map(teacher => (
              <div key={teacher.id} className="bg-[#FFFFFF] rounded-2xl shadow-3d-soft border-[3px] border-[#000000] p-6 flex flex-col paper-cut transform transition-transform hover:-translate-y-1 hover:rotate-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[#FACC15] border-[3px] border-[#000000] flex items-center justify-center text-[#000000] font-black text-2xl shrink-0 shadow-sm transform -rotate-6">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-[#000000] text-xl">{teacher.name}</h3>
                    <p className="text-sm text-[#000000]/70 font-mono font-bold flex items-center gap-1 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {teacher.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-2 flex-1">
                  <div>
                    <p className="text-xs font-black text-[#000000]/60 mb-2">الأطوار:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.phases.map(p => {
                        const phaseMap: Record<string, string> = { PRIMARY: "ابتدائي", MIDDLE: "متوسط", SECONDARY: "ثانوي" };
                        return (
                          <span key={p} className="bg-[#DBEAFE] border-[2px] border-[#000000] text-[#000000] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                            {phaseMap[p] || p}
                          </span>
                        )
                      })}
                      {teacher.phases.length === 0 && <span className="text-xs font-bold text-[#000000]/40">-</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000000]/60 mb-2">المستويات:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.levels.map(l => (
                        <span key={l} className="bg-[#EAE4D9] border-[2px] border-[#000000] text-[#000000] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                          {LEVELS.find(lvl => lvl.value === l)?.label || l}
                        </span>
                      ))}
                      {teacher.levels.length === 0 && <span className="text-xs font-bold text-[#000000]/40">-</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#000000]/60 mb-2">الشعب:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.streams.map(s => (
                        <span key={s} className="bg-[#F8F9FA] border-[2px] border-[#000000] text-[#000000] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                          {STREAMS.find(st => st.value === s)?.label || s}
                        </span>
                      ))}
                      {teacher.streams.length === 0 && <span className="text-xs font-bold text-[#000000]/40">-</span>}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t-[3px] border-[#000000] border-dashed flex items-center gap-2 text-sm font-black text-[#000000]">
                  <BookOpen className="w-5 h-5 text-[#3B82F6]" />
                  {teacher.subjects.length} مواد مسندة
                </div>
              </div>
            ))}
            {teachers.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#000000]/50 font-black bg-[#FFFFFF] border-[3px] border-[#000000] border-dashed rounded-2xl">
                لا يوجد أساتذة مضافين بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
