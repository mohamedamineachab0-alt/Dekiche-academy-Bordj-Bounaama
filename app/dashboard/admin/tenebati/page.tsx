import { getAdminAlerts } from "@/actions/tenebati";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { BellRing, ShieldAlert, BookX, UserX } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TenebatiPage() {
  const { success, alerts, error } = await getAdminAlerts();

  if (!success) {
    if (error === "غير مصرح") redirect("/login");
    return (
      <div className="p-8 text-center">
        <p className="text-primary font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="تنبيهاتي"
        description="رصد أكاديمي وأمني لحسابات التلاميذ."
        icon={BellRing}
      />

      <div className="surface-panel overflow-hidden">
        <div className="p-6 border-b border-line bg-surface-muted">
          <h2 className="text-lg font-bold text-ink">قائمة التنبيهات النشطة</h2>
          <p className="text-sm text-muted mt-1">يتم تحديث هذه القائمة تلقائياً بناءً على نشاط التلاميذ.</p>
        </div>

        <div className="divide-y divide-line">
          {!alerts || alerts.length === 0 ? (
            <div className="p-12 text-center">
              <span className="icon-tile mx-auto mb-4">
                <BellRing className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-ink mb-1">لا توجد تنبيهات حالياً</h3>
              <p className="text-sm text-muted">جميع حسابات التلاميذ في وضع سليم.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6 flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <span className="font-bold text-lg">{alert.studentName.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-lg">{alert.studentName}</h3>
                      <p className="text-sm text-muted font-mono mt-0.5" dir="ltr">
                        {alert.studentPhone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-muted rounded-xl p-3 border border-line">
                    <p className="text-[11px] font-semibold text-muted mb-1">معلومات الولي</p>
                    <p className="text-sm font-semibold text-ink">{alert.parentName}</p>
                    <p className="text-xs text-muted font-mono" dir="ltr">
                      {alert.parentPhone}
                    </p>
                  </div>
                </div>

                <div className="flex-[2] flex flex-wrap gap-3 items-start content-start">
                  {alert.flags.map((flag) => {
                    const FlagIcon = flag.type === "SECURITY" ? ShieldAlert : flag.type === "ACCOUNT" ? UserX : BookX;
                    return (
                      <div
                        key={flag.id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm ${flag.color}`}
                      >
                        <FlagIcon className="w-4 h-4 shrink-0" />
                        <span>{flag.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
