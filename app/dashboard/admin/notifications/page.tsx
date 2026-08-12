import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Bell, Send, Trash2 } from "lucide-react";
import { createNotification, deleteNotification } from "@/actions/notifications";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
    }
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, level: true, stream: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إرسال إشعار للتلاميذ"
        description="نظام الإشعارات الذكي قم بإرسال تنبيهات دقيقة للتلاميذ حسب المستوى و الشعبة أو المادة المحددة"
        icon={Bell}
        gradientClass="bg-gradient-to-r from-violet-600 to-fuchsia-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-purple-950 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-violet-600" />
              إرسال إشعار جديد
            </h2>
            
            <form action={async (formData) => { "use server"; await createNotification(formData); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">عنوان الإشعار</label>
                <input type="text" name="title" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="مثال: إضافة ملخص جديد" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">نص الإشعار</label>
                <textarea name="content" rows={3} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" placeholder="اكتب رسالتك هنا.." />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-3">تحديد الفئة المستهدفة (اتركها فارغة للإرسال للجميع)</p>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-purple-800">المادة الدراسية</label>
                    <select name="subjectId" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500">
                      <option value="">جميع المواد</option>
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
                      <select name="level" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500">
                        <option value="">جميع المستويات</option>
                        {LEVELS.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-purple-800">الشعبة</label>
                      <select name="stream" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500">
                        <option value="">جميع الشعب</option>
                        {STREAMS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-purple-800">الشهر</label>
                    <input type="number" min="1" max="12" name="month" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="رقم الشهر (اختياري)" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-purple-950 font-bold py-3 rounded-xl transition-colors mt-2">
                <Send className="w-4 h-4" />
                إرسال الإشعار
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {notifications.map(notification => {
              const levelStr = notification.level ? LEVELS.find(l => l.value === notification.level)?.label : 'جميع المستويات';
              const streamStr = notification.stream ? STREAMS.find(s => s.value === notification.stream)?.label : 'جميع الشعب';
              const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={notification.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-purple-950 text-lg">{notification.title}</h3>
                        <p className="text-xs font-bold text-slate-400">{formattedDate}</p>
                      </div>
                    </div>
                    
                    <form action={async () => { "use server"; await deleteNotification(notification.id); }}>
                      <button type="submit" className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 bg-white p-4 rounded-xl text-purple-800 text-sm font-medium leading-relaxed">
                    {notification.content}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {notification.subject && (
                      <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-md border border-violet-100">
                        مادة: {notification.subject.title}
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">
                      {levelStr}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">
                      {streamStr}
                    </span>
                    {notification.month && (
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">
                        شهر: {notification.month}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {notifications.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                لا توجد إشعارات مرسلة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
