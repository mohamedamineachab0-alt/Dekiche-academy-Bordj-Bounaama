import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Calendar, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { getAdminAnalyticsHub } from "@/lib/admin-analytics";
import { getCachedAdminInsights } from "@/actions/admin-insights";
import { AdminAnalyticsHub } from "@/components/admin/AdminAnalyticsHub";

export default async function AdminDashboardPage() {
  const [data, cachedAi, upcomingLiveClasses] = await Promise.all([
    getAdminAnalyticsHub(),
    getCachedAdminInsights(),
    prisma.liveClass.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      include: { subject: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="مركز التحليلات"
        description="إحصاءات المنصة، تنبيه الخمول خلال 5 أيام، ورؤى قابلة للتنفيذ للإدارة."
        icon={LayoutDashboard}
        action={
          <Link href="/dashboard/admin/students/monitoring" className="btn-primary w-full md:w-auto">
            <Sparkles className="w-4 h-4" />
            ملفات التلاميذ
          </Link>
        }
      />

      <AdminAnalyticsHub data={data} initialAi={cachedAi} />

      <section>
        <h2 className="text-lg font-bold text-ink mb-4">الحصص المباشرة القادمة</h2>
        {upcomingLiveClasses.length === 0 ? (
          <div className="surface-card px-6 py-10 text-center">
            <p className="text-sm text-muted">لا توجد حصص مباشرة مجدولة قريباً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingLiveClasses.map((live) => (
              <article key={live.id} className="surface-card p-5">
                <h3 className="font-bold text-ink">{live.title}</h3>
                <p className="text-sm text-muted mt-1">{live.subject.title}</p>
                <p className="flex items-center gap-2 text-sm text-muted mt-3">
                  <Calendar className="w-4 h-4 text-primary-mid shrink-0" />
                  {live.date.toLocaleDateString("ar-DZ", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
