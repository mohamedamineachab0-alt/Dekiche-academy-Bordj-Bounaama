import Link from "next/link";
import { getUserSessionProfile } from "@/actions/user";
import { AlertTriangle, UserMinus } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { INACTIVE_DAYS } from "@/lib/education-labels";
import { getLinkedParentChildren } from "@/lib/parent-children";

export default async function AbsencesPage() {
  const profile = await getUserSessionProfile();
  if (!profile) {
    return <div className="p-8 text-center text-muted">يرجى تسجيل الدخول</div>;
  }

  const students = await getLinkedParentChildren(profile.id);

  if (students.length === 0) {
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

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="غيابات الأبناء"
        description="متابعة آخر دخول لأبنائك على المنصة."
        icon={AlertTriangle}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => {
          const inactive = student.daysInactive >= INACTIVE_DAYS;
          return (
            <article
              key={student.id}
              className={`p-5 rounded-2xl border text-center ${
                inactive ? "border-red-200 bg-red-50" : "border-line bg-surface"
              }`}
            >
              <h3 className="font-bold text-lg text-ink mb-4">{student.fullName}</h3>
              <div className="bg-white w-full py-4 rounded-xl border border-line">
                <p
                  className={`text-4xl font-bold tabular-nums ${
                    inactive ? "text-red-600" : "text-primary"
                  }`}
                >
                  {Number.isFinite(student.daysInactive) ? student.daysInactive : "—"}
                </p>
                <p className="font-semibold text-muted mt-1 text-sm">أيام دون دخول</p>
              </div>
              <p className="text-xs text-muted mt-3">
                آخر ظهور: {new Date(student.lastLoginAt).toLocaleDateString("ar-DZ")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
