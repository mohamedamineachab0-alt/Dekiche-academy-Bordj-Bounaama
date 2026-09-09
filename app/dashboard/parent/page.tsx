import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, Link as LinkIcon } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { linkStudentToParent } from "@/actions/parents";
import { ParentDashboardClient } from "@/components/parent/ParentDashboardClient";

export default async function ParentDashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  await prisma.parentProfile.updateMany({
    where: { userId: sessionId },
    data: {
      lastReviewedAt: new Date(),
      reviewCount: { increment: 1 },
    },
  });

  const links = await prisma.parentStudentLink.findMany({
    where: { parentId: sessionId },
    include: {
      student: {
        include: {
          studentProfile: true,
          enrollments: {
            include: { subject: true },
          },
          mistakes: {
            orderBy: { createdAt: "desc" },
            take: 3,
            include: { lesson: { include: { subjects: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="بوابة الولي"
        description="اربط حسابات أبنائك وتابع تقدّمهم ونقاطهم وموادهم."
        icon={Users}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="surface-card p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="icon-tile">
                <LinkIcon className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-ink">ربط حسابات أبنائي</h2>
            </div>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              أدخل الرمز الذي يظهر في حساب ابنك لإضافته إلى قائمة المتابعة.
            </p>

            <form
              action={async (formData) => {
                "use server";
                await linkStudentToParent(formData);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                name="parentCode"
                required
                className="input-field text-center uppercase tracking-[0.2em] font-mono font-bold"
                placeholder="أدخل الرمز هنا"
              />
              <button type="submit" className="btn-primary w-full">
                <LinkIcon className="w-4 h-4" />
                ربط الحساب
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {links.length === 0 ? (
            <div className="surface-card px-6 py-16 text-center">
              <span className="icon-tile mx-auto mb-5">
                <Users className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-ink mb-2">لا يوجد أبناء مربوطون</h3>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                استخدم الرمز السري لإضافة ابنك وبدء المتابعة.
              </p>
            </div>
          ) : (
            <ParentDashboardClient
              students={links.map((l) => l.student as any)}
              parentId={sessionId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
