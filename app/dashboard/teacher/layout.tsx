import { redirect } from "next/navigation";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";
import { getTeacherSession } from "@/lib/teacher";
import { TeacherImpersonationBanner } from "@/components/teacher/TeacherImpersonationBanner";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getTeacherSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayoutWrapper role="TEACHER">
      {session.isImpersonating && (
        <div className="mb-6">
          <TeacherImpersonationBanner
            teacherName={session.impersonatedTeacherName || session.teacher.name}
            teacherId={session.impersonatedTeacherId || session.teacher.id}
            adminName={session.realAdminUser?.fullName || "المدير"}
          />
        </div>
      )}
      {children}
    </DashboardLayoutWrapper>
  );
}

