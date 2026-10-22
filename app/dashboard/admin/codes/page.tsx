import { prisma } from "@/lib/prisma";
import { Key, Download } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { CodeGeneratorClient } from "@/components/admin/CodeGeneratorClient";
import { CodesPageLock } from "@/components/admin/CodesPageLock";
import Link from "next/link";
import { SubjectName } from "@/components/shared/SubjectName";
import { BulkZipExportButton } from "@/components/admin/BulkZipExportButton";

export default async function AdminCodesPage(props: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const status = searchParams?.status;

  const [subjects, usedCodes, unusedCodes, usedCount, unusedCount] = await Promise.all([
    prisma.subject.findMany({ orderBy: { title: "asc" } }),
    prisma.accessCode.findMany({
      where: { isUsed: true },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { subject: true, user: true },
    }),
    prisma.accessCode.findMany({
      where: { isUsed: false },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { subject: true },
    }),
    prisma.accessCode.count({ where: { isUsed: true } }),
    prisma.accessCode.count({ where: { isUsed: false } }),
  ]);

  const showUsed = status !== "unused";
  const showUnused = status !== "used";

  return (
    <CodesPageLock>
      <div className="space-y-8 font-sans pb-12">
        <HeroBanner
          variant="hero"
          title="رموز الدخول"
          description="توليد الرموز وتتبع المستعمل منها وغير المستعمل."
          icon={Key}
        />

        <section className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/admin/codes?status=used" className="surface-card-interactive p-5">
            <p className="text-sm font-semibold text-muted mb-1">رموز مستعملة</p>
            <p className="text-3xl font-bold text-ink tabular-nums">{usedCount}</p>
          </Link>
          <Link href="/dashboard/admin/codes?status=unused" className="surface-card-interactive p-5">
            <p className="text-sm font-semibold text-muted mb-1">رموز غير مستخدمة</p>
            <p className="text-3xl font-bold text-ink tabular-nums">{unusedCount}</p>
          </Link>
        </section>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div>
            <h3 className="text-sm font-bold text-ink">بوابة استخراج وطباعة بطاقات الأكواد</h3>
            <p className="text-xs text-muted mt-0.5">واجهة مخصصة لتوليد دفعات الأكواد وتصديرها وطباعتها مباشرة للمكتبات ونقاط التوزيع.</p>
          </div>
          <Link
            href="/codes"
            className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold inline-flex items-center justify-center gap-2 shrink-0 shadow-md"
          >
            <Key className="w-4 h-4" />
            <span>فتح بوابة استخراج الرموز (/codes)</span>
          </Link>
        </div>

        {/* Quick Download Card for 2AS Science Codes */}
        <div className="surface-card p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink text-base">أكواد مادة علوم الطبيعة والحياة (2 ثانوي)</h3>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  100 كود جاهز
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                الأستاذة قمور آسيا • صالحة للفصل الأول (الأشهر 1، 2، 3) • جاهزة بدون عمود الترقيم للطباعة الفورية.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <a
              href="/codes_science_2as.csv"
              download="codes_science_2as.csv"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface hover:bg-surface-muted text-ink text-xs font-bold transition shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>تحميل CSV</span>
            </a>
            <a
              href="/codes_science_2as.zip"
              download="codes_science_2as.zip"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ZIP (ملف مضغوط)</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BulkZipExportButton />
            <CodeGeneratorClient subjects={subjects} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {showUsed && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 px-1">
                  <h2 className="text-lg font-bold text-ink">الرموز المستعملة</h2>
                  <Link href="/dashboard/admin/codes" className="text-sm font-semibold text-primary">
                    عرض الكل
                  </Link>
                </div>
                <div className="surface-panel overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full data-table min-w-180">
                      <thead>
                        <tr>
                          <th>الرمز</th>
                          <th>المادة</th>
                          <th>النوع</th>
                          <th>الشهور</th>
                          <th>التلميذ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usedCodes.map((code) => (
                          <tr key={code.id}>
                            <td>
                              <span className="font-mono font-bold text-ink bg-surface-muted px-2 py-1 rounded">
                                {code.code}
                              </span>
                            </td>
                            <td className="font-semibold text-primary">
                              <SubjectName subject={code.subject} />
                            </td>
                            <td className="text-muted">{code.accessType === "YEARLY" ? "سنوي" : "شهري"}</td>
                            <td className="text-muted" dir="ltr">
                              {code.validMonths.join(", ") || "—"}
                            </td>
                            <td>
                              {code.user ? (
                                <Link
                                  href={`/dashboard/admin/students/${code.user.id}`}
                                  className="font-semibold text-ink hover:text-primary"
                                >
                                  {code.user.fullName}
                                </Link>
                              ) : (
                                <span className="text-muted">مستعمل</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {usedCodes.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-muted">
                              لا توجد رموز مستعملة بعد
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {showUnused && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 px-1">
                  <h2 className="text-lg font-bold text-ink">رموز غير مستخدمة</h2>
                  <a href="/api/admin/export-codes" className="btn-ghost">
                    <Download className="w-4 h-4" />
                    تصدير غير المستخدمة
                  </a>
                </div>
                <div className="surface-panel overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full data-table min-w-160">
                      <thead>
                        <tr>
                          <th>الرمز</th>
                          <th>المادة</th>
                          <th>النوع</th>
                          <th>الشهور</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unusedCodes.map((code) => (
                          <tr key={code.id}>
                            <td>
                              <span className="font-mono font-bold text-ink bg-surface-muted px-2 py-1 rounded">
                                {code.code}
                              </span>
                            </td>
                            <td className="font-semibold text-primary">
                              <SubjectName subject={code.subject} />
                            </td>
                            <td className="text-muted">{code.accessType === "YEARLY" ? "سنوي" : "شهري"}</td>
                            <td className="text-muted" dir="ltr">
                              {code.validMonths.join(", ") || "—"}
                            </td>
                          </tr>
                        ))}
                        {unusedCodes.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-muted">
                              لا توجد رموز غير مستخدمة
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CodesPageLock>
  );
}
