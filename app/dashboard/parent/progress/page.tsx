import { getUserSessionProfile } from "@/actions/user";
import Link from "next/link";
import { Activity, TrendingUp, Target, Award, UserMinus } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { getLinkedParentChildren } from "@/lib/parent-children";

export default async function ParentProgressPage() {
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
        title="تقدم الأبناء"
        description="تابع مؤشرات أبنائك ونشاطهم في المنصة."
        icon={Activity}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {students.map((student) => (
          <article key={student.id} className="surface-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xl">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-lg text-ink">{student.fullName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="badge-soft">{labelLevel(student.level)}</span>
                  <span className="badge-outline">{labelStream(student.stream)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl bg-surface-muted border border-line p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted">
                  <Award className="w-4 h-4 text-primary" />
                  النقاط
                </div>
                <p className="font-bold text-2xl text-ink tabular-nums">{student.points}</p>
              </div>
              <div className="rounded-2xl bg-surface border border-line p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted">
                  <Target className="w-4 h-4 text-primary" />
                  الترتيب
                </div>
                <p className="font-bold text-2xl text-ink tabular-nums">
                  {student.rank ? `#${student.rank}` : "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-ink flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                إكمال الدروس
              </span>
              <span className="text-sm font-bold text-primary tabular-nums">{student.completion}%</span>
            </div>
            <div className="progress-track mb-6">
              <div className="progress-bar" style={{ width: `${student.completion}%` }} />
            </div>

            <div className="pt-5 border-t border-line grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-muted mb-1">التمارين المحلولة</p>
                <p className="font-bold text-lg text-ink tabular-nums">{student.exercisesSolved}</p>
              </div>
              <div className="text-center border-r border-line">
                <p className="text-xs font-semibold text-muted mb-1">المعدل العام</p>
                <p className="font-bold text-lg text-ink tabular-nums">
                  {student.averageScore != null ? student.averageScore : "—"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
