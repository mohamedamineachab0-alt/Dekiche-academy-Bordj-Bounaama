import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { MessageSquare, Plus, Lock, Unlock } from "lucide-react";
import { createForum, toggleForumStatus } from "@/actions/forums";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MonthSelect } from "@/components/shared/MonthSelect";

export default async function AdminForumsPage() {
  const forums = await prisma.classForum.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      subject: true,
      _count: {
        select: { messages: true }
      }
    }
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, level: true, stream: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="دردشة القسم (Class Forums)"
        description="إدارة منتديات الأقسام و إنشاء غرف نقاش جديدة و والتحكم في فتح أو إغلاق الدردشة"
        icon={MessageSquare}
        gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-purple-950 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-700" />
              إنشاء منتدى جديد
            </h2>
            
            <form action={async (formData) => { "use server"; await createForum(formData); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">إسم المنتدى</label>
                <input type="text" name="title" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="مثال: نقاشات الوحدة الأولى" />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-purple-800">المادة الدراسية</label>
                  <select name="subjectId" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
                    <option value="">اختر المادة</option>
                    {subjects.map(s => {
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-purple-800">المستوى</label>
                    <select name="level" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
                      <option value="">اختر المستوى</option>
                      {LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-purple-800">الشعبة</label>
                    <select name="stream" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
                      <option value="">اختر الشعبة</option>
                      {STREAMS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-purple-800">الشهر</label>
                  <MonthSelect name="month" required className="!p-2.5 !text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-bold py-3 rounded-xl transition-colors mt-2">
                <Plus className="w-4 h-4" />
                إنشاء المنتدى
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-black text-purple-800">المنتدى</th>
                    <th className="px-6 py-4 text-sm font-black text-purple-800">المادة / القسم</th>
                    <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">الرسائل</th>
                    <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">حالة المنتدى (خيار الغلق / الفتح)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {forums.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold">
                        لا توجد منتديات مسجلة بعد
                      </td>
                    </tr>
                  ) : (
                    forums.map(forum => {
                      const levelStr = LEVELS.find(l => l.value === forum.level)?.label;
                      const streamStr = STREAMS.find(s => s.value === forum.stream)?.label;

                      return (
                        <tr key={forum.id} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-black text-purple-950">{forum.title}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">الشهر {forum.month}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-purple-800 text-sm">{forum.subject.title}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1">{levelStr} • {streamStr}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 font-black text-xs px-2.5 py-1 rounded-lg">
                              {forum._count.messages}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <form action={async () => {
                              "use server";
                              await toggleForumStatus(forum.id, !forum.isOpen);
                            }}>
                              <button 
                                type="submit" 
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                  forum.isOpen 
                                  ? 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200' 
                                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                                }`}
                              >
                                {forum.isOpen ? (
                                  <>
                                    <Unlock className="w-4 h-4" />
                                    مفتوح
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    مغلق
                                  </>
                                )}
                              </button>
                            </form>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
