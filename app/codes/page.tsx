import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { CodesPortalClient } from "@/components/codes/CodesPortalClient";
import { CodesPortalLogin } from "@/components/codes/CodesPortalLogin";

export const metadata = {
  title: "بوابة استخراج الرموز | أكاديمية دكيش",
  description: "منظومة توليد وتصدير بطاقات ورموز الاشتراك",
};

export const dynamic = "force-dynamic";

export default async function CodesPortalPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  let isAdmin = false;

  if (sessionId) {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });
    if (user && (user.role === "ADMIN" || user.role === "EMPLOYEE")) {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return <CodesPortalLogin />;
  }

  // Fetch subjects for instant fast rendering
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      title: true,
      phase: true,
      levels: true,
      streams: true,
      teacherName: true,
      accessType: true,
    },
    orderBy: { title: "asc" },
  });

  return <CodesPortalClient initialSubjects={subjects} />;
}
