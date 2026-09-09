import { prisma } from "@/lib/prisma";
import { Key, Download } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { CodeGeneratorClient } from "@/components/admin/CodeGeneratorClient";
import Link from "next/link";

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
      include: { subject: true, user: true },
    }),
    prisma.accessCode.findMany({
      where: { isUsed: false },
      orderBy: { createdAt: "desc" },
      include: { subject: true },
    }),
    prisma.accessCode.count({ where: { isUsed: true } }),
    prisma.accessCode.count({ where: { isUsed: false } }),
  ]);

  const showUsed = status !== "unused";
  const showUnused = status !== "used";

  return (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
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
                  <table className="w-full data-table min-w-[720px]">
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
                          <td className="font-semibold text-primary">{code.subject.title}</td>
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
                  <table className="w-full data-table min-w-[640px]">
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
                          <td className="font-semibold text-primary">{code.subject.title}</td>
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
  );
}
