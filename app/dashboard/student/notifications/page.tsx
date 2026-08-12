import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Bell } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function StudentNotificationsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      studentProfile: true,
      enrollments: true
    }
  });

  if (!user || !user.studentProfile) redirect("/login");

  const student = user.studentProfile;
  const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);

  // Fetch notifications targeting:
  // 1. Everyone (level, stream, subjectId all null)
  // 2. OR matching student level
  // 3. OR matching student stream
  // 4. OR matching enrolled subject
  // We need to carefully construct the logic so it targets precisely.
  // Actually, the admin form uses "AND" implicitly if multiple are filled, but let's query where any of the matching conditions apply or are null.
  
  const notifications = await prisma.notification.findMany({
    where: {
      AND: [
        { OR: [{ level: null }, { level: student.level }] },
        { OR: [{ stream: null }, { stream: student.stream }] },
        { OR: [{ subjectId: null }, { subjectId: { in: enrolledSubjectIds } }] }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
    }
  });

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="الإشعارات"
        description="تلقى أحدث التنبيهات و رسائل الأساتذة و ومستجدات المنصة الخاصة بك هنا"
        icon={Bell}
        gradientClass="bg-gradient-to-r from-violet-600 to-fuchsia-600"
      />

      {notifications.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Bell className="w-16 h-16 text-purple-800 mx-auto mb-4" />
          <h3 className="font-black text-xl text-purple-900">لا توجد إشعارات حالياً</h3>
          <p className="text-slate-500 font-medium mt-2">ستظهر الإشعارات المهمة من الأساتذة أو الإدارة هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map(notification => {
            const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={notification.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-purple-950 text-lg">{notification.title}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 bg-white p-5 rounded-xl text-purple-800 text-sm font-medium leading-relaxed flex-1">
                  {notification.content}
                </div>

                {notification.subject && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-violet-100">
                      مادة: {notification.subject.title}
                    </span>
                    {notification.month && (
                      <span className="bg-white text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                        شهر: {notification.month}
                      </span>
                    )}
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
