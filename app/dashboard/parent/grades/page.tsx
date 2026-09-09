import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";
import Link from "next/link";
import { Star, UserMinus } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function GradesPage() {
  const profile = await getUserSessionProfile();
  if (!profile) {
    return <div className="p-8 text-center text-muted">يرجى تسجيل الدخول</div>;
  }

  const linked = await prisma.parentStudentLink.findMany({
    where: { parentId: profile.id },
    select: { studentId: true },
  });

  if (linked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="surface-card px-6 py-14 text-center max-w-lg w-full">
          <span className="icon-tile mx-auto mb-5">
            <UserMinus className="w-5 h-5" />
          </span>
          <p className="text-ink font-bold mb-5">لم يتم ربط أي تلاميذ بحسابك.</p>
          <Link href="/dashboard/parent" className="btn-primary">
            ربط حسابات أبنائي
          </Link>
        </div>
      </div>
    );
  }

  const studentIds = linked.map((l) => l.studentId);
  const submissions = await prisma.studentSubmission.findMany({
    where: { studentId: { in: studentIds } },
    include: {
      student: { select: { fullName: true } },
      exam: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="درجات أبنائي"
        description="نتائج الاختبارات والفروض المصحّحة."
        icon={Star}
      />

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-sm data-table">
            <thead>
              <tr>
                <th>اسم التلميذ</th>
                <th>المادة</th>
                <th>الاختبار</th>
                <th>النقطة</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-muted">
                    لا توجد نقاط مسجّلة حالياً
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold text-primary">{s.student?.fullName || "غير متوفر"}</td>
                    <td>{s.exam?.subject?.title || "غير متوفر"}</td>
                    <td>{s.exam?.title || "غير متوفر"}</td>
                    <td>
                      <span className="badge-soft tabular-nums">{s.score}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
