import { prisma } from "@/lib/prisma";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { Bell, Trash2 } from "lucide-react";
import { createNotification, deleteNotification } from "@/actions/notifications";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { NotificationFormClient } from "@/components/admin/NotificationFormClient";

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
    },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, phase: true, levels: true, streams: true },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إرسال إشعار للتلاميذ"
        description="أرسل تنبيهات دقيقة حسب المستوى أو الشعبة أو المادة المحددة."
        icon={Bell}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NotificationFormClient
            subjects={subjects.map((s) => ({
              id: s.id,
              title: s.title,
              phase: s.phase,
              levels: s.levels,
              streams: s.streams,
            }))}
            action={async (formData: FormData) => {
              "use server";
              await createNotification(formData);
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {notifications.map((notification) => {
              const levelStr = notification.level
                ? labelLevel(notification.level)
                : "جميع المستويات";
              const streamStr = notification.stream
                ? labelStream(notification.stream)
                : "جميع الشعب";
              const formattedDate = new Date(notification.createdAt).toLocaleString("ar-DZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <article key={notification.id} className="surface-card p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="icon-tile">
                        <Bell className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-bold text-ink text-lg">{notification.title}</h3>
                        <p className="text-xs text-muted">{formattedDate}</p>
                      </div>
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await deleteNotification(notification.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 bg-surface-muted p-4 rounded-xl text-ink text-sm leading-relaxed">
                    {notification.content}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {notification.subject && (
                      <span className="badge-soft">مادة: {notification.subject.title}</span>
                    )}
                    <span className="badge-outline">{levelStr}</span>
                    <span className="badge-outline">{streamStr}</span>
                    {notification.month && <span className="badge-outline">شهر: {notification.month}</span>}
                  </div>
                </article>
              );
            })}
            {notifications.length === 0 && (
              <div className="surface-card px-6 py-16 text-center">
                <span className="icon-tile mx-auto mb-4">
                  <Bell className="w-5 h-5" />
                </span>
                <p className="text-sm text-muted">لا توجد إشعارات مرسلة بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
