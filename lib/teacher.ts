import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { mistakesForSubjectWhere } from "@/lib/mistake-source";

const teacherInclude = {
  teacherProfile: {
    include: {
      subjects: {
        select: {
          id: true,
          title: true,
          teacherName: true,
          phase: true,
          levels: true,
          streams: true,
        },
      },
    },
  },
} as const;

async function ensureTeacherProfile(user: {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}) {
  if (user.role !== "TEACHER") return;

  const linked = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (linked) return;

  try {
    await prisma.teacher.create({
      data: {
        userId: user.id,
        name: user.fullName,
        phone: user.phoneNumber,
        phases: ["SECONDARY"],
        levels: ["SECONDARY_3"],
        streams: ["EXPERIMENTAL_SCIENCES", "MATHEMATICS"],
      },
    });
  } catch {
    const orphan = await prisma.teacher.findUnique({
      where: { phone: user.phoneNumber },
    });
    if (orphan && !orphan.userId) {
      await prisma.teacher.update({
        where: { id: orphan.id },
        data: { userId: user.id, name: user.fullName },
      });
    }
  }
}

export async function getTeacherSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return null;

  let user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: teacherInclude,
  });

  if (!user || user.role !== "TEACHER") return null;

  if (!user.teacherProfile) {
    await ensureTeacherProfile(user);
    user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: teacherInclude,
    });
  }

  if (!user?.teacherProfile) return null;
  const subjectIds = user.teacherProfile.subjects.map((subject) => subject.id);
  return { user, teacher: user.teacherProfile, subjectIds };
}

export function teacherMistakesWhere(subjectIds: string[]) {
  if (subjectIds.length === 0) return { id: "__none__" };
  return {
    OR: subjectIds.flatMap((subjectId) => mistakesForSubjectWhere(subjectId).OR),
  };
}
