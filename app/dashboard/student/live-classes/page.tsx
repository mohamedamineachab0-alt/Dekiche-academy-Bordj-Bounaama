import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Video, Calendar, Link as LinkIcon, Clock } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { labelLevel } from "@/lib/education-labels";

export default async function StudentLiveClassesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      enrollments: true,
      studentProfile: true
    }
  });

  if (!user || !user.studentProfile) redirect("/login");

  const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);

  // Fetch only upcoming or recent live classes for enrolled subjects
  const liveClasses = await prisma.liveClass.findMany({
    where: {
      subjectId: { in: enrolledSubjectIds }
    },
    orderBy: { date: "asc" },
    include: {
      subject: true,
    }
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="حصصي المباشرة"
        description="تابع حصص البث المباشر مع أساتذتك و المراجعات والتطبيقات التفاعلية لجميع المواد المسجل بها"
        icon={Video}
      />

      {liveClasses.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="icon-tile mx-auto mb-5 !w-16 !h-16">
            <Video className="w-7 h-7" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد حصص مبرمجة حالياً</h3>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            ستظهر هنا الحصص الخاصة بالمواد التي سجلت فيها فور برمجتها من طرف أساتذتك
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveClasses.map(liveClass => {
            const levelStr = labelLevel(liveClass.subject.levels?.[0]);
            const formattedDate = new Date(liveClass.date).toLocaleString('ar-DZ', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const formattedTime = new Date(liveClass.date).toLocaleString('ar-DZ', { 
              hour: '2-digit', minute: '2-digit'
            });

            const startTime = new Date(liveClass.date);
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration assumed
            const currentTime = new Date();

            let status = 'upcoming';
            if (currentTime >= startTime && currentTime <= endTime) {
              status = 'live';
            } else if (currentTime > endTime) {
              status = 'ended';
            }

            return (
              <article key={liveClass.id} className="surface-card-interactive p-6 flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <span className="icon-tile-solid !w-12 !h-12">
                    <Video className="w-5 h-5" strokeWidth={2} />
                  </span>
                  {status === 'upcoming' && (
                    <span className="badge-soft">قادمة</span>
                  )}
                  {status === 'live' && (
                    <span className="badge-accent animate-pulse">جارية الآن</span>
                  )}
                  {status === 'ended' && (
                    <span className="badge-outline">منتهية</span>
                  )}
                </div>

                <h3 className="font-bold text-ink text-lg mb-2">{liveClass.title}</h3>
                <span className="badge-soft w-fit mb-5">{liveClass.subject.title}</span>

                <div className="space-y-3 flex-1 rounded-xl bg-surface-muted/60 border border-line p-4 mb-2">
                  <div className="flex items-center gap-3 text-sm font-semibold text-ink">
                    <span className="icon-tile !w-8 !h-8">
                      <Calendar className="w-4 h-4" />
                    </span>
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-ink">
                    <span className="icon-tile !w-8 !h-8">
                      <Clock className="w-4 h-4" />
                    </span>
                    الساعة {formattedTime}
                  </div>
                </div>

                {status !== 'ended' ? (
                  <a
                    href={liveClass.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full mt-4"
                  >
                    <LinkIcon className="w-5 h-5" strokeWidth={2.5} />
                    دخول الحصة
                  </a>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-surface-muted text-muted font-semibold text-sm border border-line">
                    الحصة منتهية
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  );
}
