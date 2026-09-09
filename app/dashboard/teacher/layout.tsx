import { redirect } from "next/navigation";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";
import { getTeacherSession } from "@/lib/teacher";

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
    <DashboardLayoutWrapper role={session.user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
