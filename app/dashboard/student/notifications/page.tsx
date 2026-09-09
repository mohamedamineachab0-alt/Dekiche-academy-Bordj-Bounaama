import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
        variant="hero"
        title="الإشعارات"
        description="تلقى أحدث التنبيهات و رسائل الأساتذة و ومستجدات المنصة الخاصة بك هنا"
        icon={Bell}
      />

      {notifications.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="icon-tile mx-auto mb-5">
            <Bell className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد إشعارات حالياً</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            ستظهر الإشعارات المهمة من الأساتذة أو الإدارة هنا
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notifications.map((notification) => {
            const formattedDate = new Date(notification.createdAt).toLocaleString('ar-DZ', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <article key={notification.id} className="surface-card p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <span className="icon-tile-solid shrink-0">
                    <Bell className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink text-lg mb-1">{notification.title}</h3>
                    <p className="text-xs font-medium text-muted badge-outline inline-flex">{formattedDate}</p>
                  </div>
                </div>

                <div className="bg-surface-muted p-5 rounded-2xl border border-line text-ink text-sm leading-relaxed flex-1">
                  {notification.content}
                </div>

                {notification.subject && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="badge-soft">
                      مادة: {notification.subject.title}
                    </span>
                    {notification.month && (
                      <span className="badge-outline">
                        شهر: {notification.month}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
