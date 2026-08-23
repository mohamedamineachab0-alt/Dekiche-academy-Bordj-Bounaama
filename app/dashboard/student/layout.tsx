import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayoutWrapper } from "@/components/shared/DashboardLayoutWrapper";
import { requireUser } from "@/lib/authz";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = (await requireUser(["STUDENT"])).id;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <DashboardLayoutWrapper role={user.role}>
      {children}
    </DashboardLayoutWrapper>
  );
}
