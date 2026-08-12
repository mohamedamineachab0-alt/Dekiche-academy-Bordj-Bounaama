import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { MessageSquare, Plus, Lock, Unlock } from "lucide-react";
import { createForum, toggleForumStatus } from "@/actions/forums";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { ForumCreationClient } from "@/components/admin/ForumCreationClient";

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
    select: { id: true, title: true, phase: true, level: true, stream: true }
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
          <ForumCreationClient 
            subjects={subjects.map(s => ({
              id: s.id,
              title: s.title,
              phase: s.phase,
              level: s.level,
              stream: s.stream
            }))}
            action={async (formData: FormData) => { 
              "use server"; 
              await createForum(formData); 
            }} 
          />
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
