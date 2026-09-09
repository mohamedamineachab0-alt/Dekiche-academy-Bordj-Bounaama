import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";
import { AlertTriangle, UserMinus } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function AbsencesPage() {
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
  const students = await prisma.user.findMany({
    where: { id: { in: studentIds } },
    select: { fullName: true, lastLoginAt: true },
  });

  const now = new Date();
  const absences = students.map((s) => {
    const daysInactive = Math.floor(
      (now.getTime() - new Date(s.lastLoginAt ?? now).getTime()) / (1000 * 60 * 60 * 24)
    );
    const count = Math.floor(daysInactive / 5);
    return { name: s.fullName, count };
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="غيابات الأبناء"
        description="متابعة حضور أبنائك وانضباطهم على المنصة."
        icon={AlertTriangle}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {absences.map((a) => (
          <article
            key={a.name}
            className={`p-5 rounded-2xl border text-center ${
              a.count > 0 ? "border-red-200 bg-red-50" : "border-line bg-surface"
            }`}
          >
            <h3 className="font-bold text-lg text-ink mb-4">{a.name}</h3>
            <div className="bg-white w-full py-4 rounded-xl border border-line">
              <p
                className={`text-4xl font-bold tabular-nums ${
                  a.count > 0 ? "text-red-600" : "text-primary"
                }`}
              >
                {a.count}
              </p>
              <p className="font-semibold text-muted mt-1 text-sm">غيابات مسجّلة</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
