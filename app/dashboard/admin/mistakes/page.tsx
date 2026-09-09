import { prisma } from "@/lib/prisma";
import { AlertTriangle, Filter } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MathPreview } from "@/components/shared/MathPreview";
import { describeMistake, mistakeQuizInclude, mistakesForSubjectWhere } from "@/lib/mistake-source";

export default async function AdminMistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; level?: string; stream?: string }>;
}) {
  const params = await searchParams;
  const { subject, level, stream } = params;

  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const mistakes = await prisma.studentMistake.findMany({
    where: subject ? mistakesForSubjectWhere(subject) : {},
    include: {
      user: true,
      lesson: {
        include: { subjects: true },
      },
      quiz: { include: mistakeQuizInclude },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="أخطاء التلاميذ"
        description="مراقبة أخطاء التلاميذ في الاختبارات والتمارين لتوجيههم نحو الحلول الصحيحة."
        icon={AlertTriangle}
      />

      <div className="surface-panel p-6 overflow-hidden">
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h2 className="text-lg font-bold text-ink hidden md:block">سجل الأخطاء</h2>

          <form className="flex flex-wrap gap-3 w-full md:w-auto">
            <select name="subject" defaultValue={subject || ""} className="input-field w-auto min-w-[12rem]">
              <option value="">كل المواد</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-ghost">
              <Filter className="w-4 h-4" />
              تصفية
            </button>
          </form>
        </div>

        {mistakes.length === 0 ? (
          <div className="text-center py-16">
            <span className="icon-tile mx-auto mb-4">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-ink mb-1">لا توجد أخطاء حالياً</h3>
            <p className="text-sm text-muted">لم يتم تسجيل أي أخطاء تتطابق مع معايير البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full data-table min-w-[800px]">
              <thead>
                <tr>
                  <th>التلميذ</th>
                  <th>المصدر والمادة</th>
                  <th>الخطأ المسجّل</th>
                  <th>الحل الصحيح</th>
                </tr>
              </thead>
              <tbody>
                {mistakes.map((mistake) => (
                  <tr key={mistake.id}>
                    <td className="align-top">
                      <div className="font-semibold text-primary">{mistake.user.fullName}</div>
                      <div className="text-xs text-muted mt-1" dir="ltr">
                        {mistake.user.phoneNumber}
                      </div>
                    </td>
                    <td className="align-top">
                      {(() => {
                        const source = describeMistake(mistake);
                        return (
                          <>
                            <div className="font-semibold text-ink">{source.title}</div>
                            <div className="text-xs text-muted mt-1">
                              {source.kind} · {source.subject}
                            </div>
                          </>
                        );
                      })()}
                      <div className="text-xs text-muted mt-1">
                        {mistake.createdAt.toLocaleDateString("en-GB")}
                      </div>
                    </td>
                    <td className="align-top max-w-[250px]">
                      <div className="bg-red-50 text-ink p-3 rounded-xl border border-red-100 whitespace-pre-wrap">
                        <MathPreview text={mistake.mistakeContent} className="" />
                      </div>
                    </td>
                    <td className="align-top max-w-[250px]">
                      <div className="bg-primary-soft text-primary p-3 rounded-xl border border-line whitespace-pre-wrap">
                        <MathPreview text={mistake.correctSolution} className="" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
