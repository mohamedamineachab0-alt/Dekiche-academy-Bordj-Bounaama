import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Search } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MathPreview } from "@/components/shared/MathPreview";
import { describeMistake, mistakeQuizInclude } from "@/lib/mistake-source";

export default async function StudentMistakesPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const mistakes = await prisma.studentMistake.findMany({
    where: { studentId: sessionId },
    include: {
      lesson: {
        include: { subjects: true },
      },
      quiz: { include: mistakeQuizInclude },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="أخطائي"
        description="أخطاؤك في اختبارات الدروس، والتمارين اليومية، والفروض والاختبارات — مع الحل الصحيح."
        icon={AlertTriangle}
        action={
          mistakes.length > 0 ? (
            <span className="inline-flex items-center rounded-full glass-pill px-3 py-1.5 text-sm font-semibold text-white">
              <span className="tabular-nums">{mistakes.length}</span>
              خطأ مسجّل
            </span>
          ) : undefined
        }
      />

      <div className="surface-panel p-5 md:p-7">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="icon-tile">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-ink">سجل الأخطاء</h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              placeholder="ابحث في الأخطاء.."
              className="input-field h-11 pr-10"
            />
          </div>
        </div>

        {mistakes.length === 0 ? (
          <div className="text-center py-14 rounded-2xl bg-surface-muted border border-dashed border-line">
            <span className="icon-tile mx-auto mb-4">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-ink mb-1">لا توجد أخطاء مسجّلة</h3>
            <p className="text-sm text-muted">ستظهر هنا أخطاء اختبارات الدروس والتمارين والفروض.</p>
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-4">
              {mistakes.map((mistake) => {
                const source = describeMistake(mistake);
                return (
                  <article
                    key={mistake.id}
                    className="rounded-2xl border border-line bg-surface p-4 space-y-4"
                  >
                    <div className="pb-3 border-b border-line">
                      <p className="font-bold text-ink">{source.title}</p>
                      <div className="flex justify-between items-center mt-2 gap-2">
                        <span className="badge-soft text-[11px]">
                          {source.kind} · {source.subject}
                        </span>
                        <span className="text-xs font-medium text-muted tabular-nums">
                          {mistake.createdAt.toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                    <div className="relative rounded-xl bg-red-50 border border-red-100 p-4 text-sm">
                      <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500 text-white">
                        الخطأ
                      </span>
                      <div className="mt-1 font-medium text-ink">
                        <MathPreview text={mistake.mistakeContent} className="" />
                      </div>
                    </div>
                    <div className="relative rounded-xl bg-primary-soft border border-line p-4 text-sm">
                      <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary text-white">
                        الحل الصحيح
                      </span>
                      <div className="mt-1 font-medium text-ink">
                        <MathPreview text={mistake.correctSolution} className="" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden md:block overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-right text-sm border-collapse">
                <thead className="bg-surface-muted text-ink font-bold border-b border-line">
                  <tr>
                    <th className="px-5 py-4 w-1/4">المصدر / المادة</th>
                    <th className="px-5 py-4 border-r border-line">الخطأ</th>
                    <th className="px-5 py-4 border-r border-line">الحل الصحيح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {mistakes.map((mistake) => {
                    const source = describeMistake(mistake);
                    return (
                      <tr key={mistake.id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="px-5 py-4 align-top">
                          <div className="font-bold text-ink mb-2">{source.title}</div>
                          <div className="badge-soft mb-2 w-fit">
                            {source.kind} · {source.subject}
                          </div>
                          <div className="text-xs text-muted tabular-nums" dir="ltr">
                            {mistake.createdAt.toLocaleDateString("en-GB")}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top max-w-xs border-r border-line">
                          <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-ink">
                            <MathPreview text={mistake.mistakeContent} className="" />
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top max-w-xs border-r border-line">
                          <div className="rounded-xl bg-primary-soft border border-line p-3.5 text-ink">
                            <MathPreview text={mistake.correctSolution} className="" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
