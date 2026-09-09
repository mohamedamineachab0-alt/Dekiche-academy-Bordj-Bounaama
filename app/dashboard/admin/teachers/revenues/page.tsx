import { HeroBanner } from "@/components/shared/HeroBanner";
import { getTeacherRevenues } from "@/actions/admin-financial";
import { ExportTableButton } from "@/components/admin/ExportTableButton";
import { Wallet, BookOpen, Users, TrendingUp } from "lucide-react";

export default async function AdminRevenuesPage() {
  const ledger = await getTeacherRevenues();

  const platformTotalRevenue = ledger.reduce((acc, t) => acc + t.totalGrossRevenue, 0);
  const platformTotalStudents = ledger.reduce((acc, t) => acc + t.totalStudents, 0);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة المداخيل ومستحقات الأساتذة"
        description="تتبع مداخيل الأكاديمية والمستحقات الخاصة بكل أستاذ حسب الاشتراكات المفعّلة."
        icon={Wallet}
        action={<ExportTableButton targetId="revenue-table-container" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="surface-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1">إجمالي المداخيل</p>
            <p className="text-3xl font-bold text-ink tabular-nums">
              {platformTotalRevenue.toLocaleString("ar-DZ")} دج
            </p>
          </div>
          <span className="icon-tile">
            <TrendingUp className="w-5 h-5" />
          </span>
        </article>

        <article className="surface-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1">إجمالي الاشتراكات المفعّلة</p>
            <p className="text-3xl font-bold text-ink tabular-nums">
              {platformTotalStudents.toLocaleString("ar-DZ")}
            </p>
          </div>
          <span className="icon-tile">
            <Users className="w-5 h-5" />
          </span>
        </article>
      </div>

      <div id="revenue-table-container" className="surface-panel overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-ink flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            سجل الأساتذة المالي
          </h2>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full data-table min-w-[640px]">
            <thead>
              <tr>
                <th>الأستاذ</th>
                <th>المواد</th>
                <th>التلاميذ</th>
                <th>الدخل الإجمالي (دج)</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-muted">
                    لا توجد بيانات مالية للعرض حالياً
                  </td>
                </tr>
              ) : (
                ledger.map((teacher) => (
                  <tr key={teacher.teacherId}>
                    <td>
                      <p className="font-semibold text-ink">{teacher.teacherName}</p>
                      <p className="text-xs text-muted mt-1" dir="ltr">
                        {teacher.phone}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-primary font-semibold text-sm tabular-nums">
                        <BookOpen className="w-4 h-4" />
                        {teacher.subjectsCount}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-primary font-semibold text-sm tabular-nums">
                        <Users className="w-4 h-4" />
                        {teacher.totalStudents}
                      </div>
                    </td>
                    <td>
                      <span className="badge-soft tabular-nums">
                        {teacher.totalGrossRevenue.toLocaleString("ar-DZ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-4 border-t border-line flex justify-between items-center text-muted text-xs px-1">
          <span>تم التوليد تلقائياً من نظام منصة دقيش</span>
          <span dir="ltr">{new Date().toLocaleString("ar-DZ")}</span>
        </div>
      </div>
    </div>
  );
}
