import { prisma } from "@/lib/prisma";
import { EDUCATION_LEVELS } from "@/lib/constants/education";
import { Activity, ShieldAlert, AlertTriangle, UserCheck, Smartphone, Trophy, FileText } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudentMonitoringMetrics } from "@/actions/admin-monitoring";
import { Level, Stream } from "@/generated/prisma";
import Link from "next/link";
import { INACTIVE_DAYS, daysSince, labelLevel, labelStream, STREAM_ARABIC } from "@/lib/education-labels";

export default async function AdminStudentMonitoringPage(props: {
  searchParams?: Promise<{ level?: string; stream?: string; subjectId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const level = searchParams?.level as Level | undefined;
  const stream = searchParams?.stream as Stream | undefined;
  const subjectId = searchParams?.subjectId;

  const metrics = await getStudentMonitoringMetrics({ level, stream, subjectId });
  const subjects = await prisma.subject.findMany({ select: { id: true, title: true } });

  const studentsWithMultipleDevices = metrics.filter((m) => m.deviceFingerprints.length > 2).length;
  const inactiveStudents = metrics.filter((m) => daysSince(m.lastLoginAt) >= INACTIVE_DAYS).length;

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="مراقبة نشاط التلاميذ"
        description={`كل التلاميذ المسجّلين (${metrics.length}). تتبع الحضور والأداء ومتابعة الأولياء.`}
        icon={Activity}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="surface-card p-5 flex items-center justify-between border-red-200 bg-red-50">
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">تنبيهات أمنية (دخول من عدة أجهزة)</p>
            <p className="text-3xl font-bold text-red-700 tabular-nums">{studentsWithMultipleDevices}</p>
          </div>
          <ShieldAlert className="w-10 h-10 text-red-400 shrink-0" />
        </article>
        <article className="surface-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted mb-1">خمول (لم يسجّل دخولاً منذ {INACTIVE_DAYS} أيام)</p>
            <p className="text-3xl font-bold text-ink tabular-nums">{inactiveStudents}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-primary-mid shrink-0" />
        </article>
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="p-4 bg-surface-muted border-b border-line flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-ink">تصفية النتائج:</span>
          <form className="flex flex-wrap gap-3 flex-1" action="/dashboard/admin/students/monitoring">
            <select name="level" defaultValue={level || ""} className="input-field w-auto min-w-[10rem]">
              <option value="">جميع المستويات</option>
              {Object.values(EDUCATION_LEVELS).flat().map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            <select name="stream" defaultValue={stream || ""} className="input-field w-auto min-w-[10rem]">
              <option value="">جميع الشعب</option>
              {Object.entries(STREAM_ARABIC).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select name="subjectId" defaultValue={subjectId || ""} className="input-field w-auto min-w-[10rem]">
              <option value="">جميع المواد</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-primary">
              تطبيق
            </button>
            <Link href="/dashboard/admin/students/monitoring" className="btn-ghost">
              إلغاء التصفية
            </Link>
          </form>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full data-table min-w-[960px]">
            <thead>
              <tr>
                <th>التلميذ</th>
                <th>حساب غياب</th>
                <th className="text-center">الترتيب والنقاط</th>
                <th className="text-center">الأخطاء</th>
                <th className="text-center">الملفات</th>
                <th className="text-center">الأجهزة</th>
                <th className="text-center">متابعة الولي</th>
              </tr>
            </thead>
            <tbody>
              {metrics.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-muted">
                    لا توجد بيانات مطابقة
                  </td>
                </tr>
              ) : (
                metrics.map((m, index) => {
                  const levelStr = labelLevel(m.level);
                  const streamStr = labelStream(m.stream);
                  const hasManyDevices = m.deviceFingerprints.length > 2;

                  let isAbsent = true;
                  let lastLoginStr = "لم يسجّل دخولاً";
                  if (m.lastLoginAt) {
                    const days = daysSince(m.lastLoginAt);
                    isAbsent = days >= INACTIVE_DAYS;
                    lastLoginStr = m.lastLoginAt.toLocaleDateString("ar-DZ");
                  }

                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold tabular-nums">
                            {index + 1}
                          </div>
                          <div>
                            <Link href={`/dashboard/admin/students/${m.id}`} className="font-semibold text-ink hover:text-primary">
                              {m.fullName}
                            </Link>
                            <p className="text-xs text-muted">
                              {levelStr} · {streamStr}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                              isAbsent ? "bg-red-50 text-red-700" : "badge-soft"
                            }`}
                          >
                            {isAbsent ? "غائب / غير نشط" : "نشط مؤخراً"} ({lastLoginStr})
                          </span>
                          <p className="text-xs text-muted">{m.enrolledSubjects.length} مواد مشتركة</p>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge-soft inline-flex items-center gap-1.5 tabular-nums">
                          <Trophy className="w-4 h-4" />
                          {m.totalPoints}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="badge-outline inline-flex items-center gap-1.5 tabular-nums">
                            <AlertTriangle
                              className={`w-4 h-4 ${m.mistakesCount >= 3 ? "text-red-600" : "text-primary"}`}
                            />
                            {m.mistakesCount}
                          </span>
                          {m.mistakesCount >= 3 && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              يحتاج معالجة
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <Link
                          href={`/dashboard/admin/students/${m.id}#files`}
                          className="badge-outline inline-flex items-center gap-1.5 tabular-nums"
                        >
                          <FileText className="w-4 h-4" />
                          {m.filesCount}
                        </Link>
                      </td>
                      <td className="text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 font-semibold text-sm tabular-nums ${
                            hasManyDevices ? "bg-red-50 text-red-700" : "badge-outline"
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          {m.deviceFingerprints.length}
                        </span>
                      </td>
                      <td className="text-center">
                        {m.isParentLinked ? (
                          <span className="badge-soft inline-flex items-center gap-1">
                            <UserCheck className="w-4 h-4" />
                            مربوط بالولي
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-xl text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4" />
                            غير مربوط بولي
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
