import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MathPreview } from "@/components/shared/MathPreview";
import { describeMistake, mistakeQuizInclude } from "@/lib/mistake-source";
import { getTeacherSession, teacherMistakesWhere } from "@/lib/teacher";

export default async function TeacherMistakesPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const mistakes = await prisma.studentMistake.findMany({
    where: teacherMistakesWhere(session.subjectIds),
    include: {
      user: { select: { id: true, fullName: true, phoneNumber: true } },
      lesson: { include: { subjects: { select: { title: true } } } },
      quiz: { include: mistakeQuizInclude },
    },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="أخطاء تلاميذك"
        description="أخطاء الدروس والتمارين والفروض في موادك، مع الحل الصحيح."
        icon={AlertTriangle}
      />

      <div className="surface-panel p-6 overflow-hidden">
        {mistakes.length === 0 ? (
          <div className="text-center py-16">
            <span className="icon-tile mx-auto mb-4">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-ink mb-1">لا توجد أخطاء حالياً</h3>
            <p className="text-sm text-muted">لم يُسجَّل أي خطأ في موادك بعد.</p>
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
                {mistakes.map((mistake) => {
                  const source = describeMistake(mistake);
                  return (
                    <tr key={mistake.id}>
                      <td className="align-top">
                        <Link
                          href={`/dashboard/teacher/students/${mistake.user.id}`}
                          className="font-semibold text-primary"
                        >
                          {mistake.user.fullName}
                        </Link>
                        <div className="text-xs text-muted mt-1" dir="ltr">
                          {mistake.user.phoneNumber}
                        </div>
                      </td>
                      <td className="align-top">
                        <div className="font-semibold text-ink">{source.title}</div>
                        <div className="text-xs text-muted mt-1">
                          {source.kind} · {source.subject}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {mistake.createdAt.toLocaleDateString("ar-DZ")}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
