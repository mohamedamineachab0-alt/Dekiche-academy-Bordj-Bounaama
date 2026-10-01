import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { CodesPortalClient } from "@/components/codes/CodesPortalClient";
import { CodesPortalLogin } from "@/components/codes/CodesPortalLogin";

export const metadata = {
  title: "بوابة استخراج الرموز | أكاديمية دكيش",
  description: "منظومة توليد وتصدير بطاقات ورموز الاشتراك",
};

export default async function CodesPortalPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  let isAdmin = false;

  if (sessionId) {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });
    if (user && user.role === "ADMIN") {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return <CodesPortalLogin />;
  }

  // Fetch initial data for fast rendering
  const [subjects, recentCodes, usedCount, unusedCount] = await Promise.all([
    prisma.subject.findMany({
      select: {
        id: true,
        title: true,
        phase: true,
        accessType: true,
      },
      orderBy: { title: "asc" },
    }),
    prisma.accessCode.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, title: true } },
        user: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    }),
    prisma.accessCode.count({ where: { isUsed: true } }),
    prisma.accessCode.count({ where: { isUsed: false } }),
  ]);

  const serializedCodes = recentCodes.map((c) => ({
    id: c.id,
    code: c.code,
    accessType: c.accessType,
    validMonths: c.validMonths,
    isUsed: c.isUsed,
    createdAt: c.createdAt.toISOString(),
    subject: {
      id: c.subject.id,
      title: c.subject.title,
    },
    user: c.user
      ? {
          id: c.user.id,
          fullName: c.user.fullName,
          phoneNumber: c.user.phoneNumber,
        }
      : null,
  }));

  return (
    <CodesPortalClient
      initialSubjects={subjects}
      initialCodes={serializedCodes}
      initialUsedCount={usedCount}
      initialUnusedCount={unusedCount}
    />
  );
}
