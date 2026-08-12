import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
