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
        { OR: [{ phase: null }, { phase: student.phase }] },
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
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="الإشعارات"
        description="تلقى أحدث التنبيهات و رسائل الأساتذة و ومستجدات المنصة الخاصة بك هنا"
        icon={Bell}
      />

      {notifications.length === 0 ? (
        <div className="p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
          <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-sm relative z-10">
            <Bell className="w-10 h-10 text-[#000000]" />
          </div>
          <h3 className="font-black text-2xl text-[#000000] mb-3 relative z-10">لا توجد إشعارات حالياً</h3>
          <p className="text-gray-600 font-bold mt-2 relative z-10">ستظهر الإشعارات المهمة من الأساتذة أو الإدارة هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map((notification, idx) => {
            const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Alternate colors for notifications based on index to add visual flair
            const iconBg = idx % 2 === 0 ? "bg-[#06B6D4]" : "bg-[#EC4899]";

            return (
              <div key={notification.id} className="bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] p-6 flex flex-col relative overflow-hidden paper-cut group transition-transform hover:-translate-y-1 hover:shadow-3d-hover">
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${iconBg} border-[3px] border-[#000000] flex items-center justify-center text-[#000000] shrink-0 transform ${idx % 2 === 0 ? 'rotate-3' : '-rotate-3'} group-hover:scale-110 transition-transform shadow-sm`}>
                      <Bell className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#000000] text-xl mb-1">{notification.title}</h3>
                      <p className="text-xs font-bold text-gray-500 bg-[#000000]/5 inline-block px-2 py-1 rounded-md">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 bg-[#F8F9FA] p-5 rounded-2xl border-[3px] border-[#000000] text-[#000000] text-sm font-bold leading-relaxed flex-1 shadow-sm relative z-10">
                  {notification.content}
                </div>

                {notification.subject && (
                  <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                    <span className="bg-[#FACC15] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[3px] border-[#000000] shadow-sm transform -rotate-1">
                      مادة: {notification.subject.title}
                    </span>
                    {notification.month && (
                      <span className="bg-[#EAE4D9] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[3px] border-[#000000] shadow-sm transform rotate-1">
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
