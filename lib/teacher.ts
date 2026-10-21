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

  if (!user) return null;

  if (user.role === "ADMIN") {
    const impersonateTeacherId = cookieStore.get("impersonate_teacher_id")?.value;
    if (impersonateTeacherId) {
      const impersonatedTeacher = await prisma.teacher.findFirst({
        where: {
          OR: [{ id: impersonateTeacherId }, { userId: impersonateTeacherId }],
        },
        include: {
          user: true,
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
      });

      if (impersonatedTeacher) {
        let teacherUser = impersonatedTeacher.user;
        if (!teacherUser && impersonatedTeacher.userId) {
          teacherUser = await prisma.user.findUnique({
            where: { id: impersonatedTeacher.userId },
          });
        }
        if (!teacherUser) {
          teacherUser = await prisma.user.findUnique({
            where: { phoneNumber: impersonatedTeacher.phone },
          });
          if (teacherUser) {
            await prisma.teacher.update({
              where: { id: impersonatedTeacher.id },
              data: { userId: teacherUser.id },
            });
          } else {
            teacherUser = await prisma.user.create({
              data: {
                fullName: impersonatedTeacher.name,
                phoneNumber: impersonatedTeacher.phone,
                role: "TEACHER",
                passwordHash: "",
              },
            });
            await prisma.teacher.update({
              where: { id: impersonatedTeacher.id },
              data: { userId: teacherUser.id },
            });
          }
        }

        const cleanName = impersonatedTeacher.name.replace('الأستاذة ', '').replace('الأستاذ ', '').trim();
        const teacherSubjects = await prisma.subject.findMany({
          where: {
            OR: [
              { teacherId: impersonatedTeacher.id },
              { teacherName: impersonatedTeacher.name },
              { teacherName: { contains: cleanName } },
            ],
          },
          select: {
            id: true,
            title: true,
            teacherName: true,
            phase: true,
            levels: true,
            streams: true,
          },
        });

        type TeacherWithSubjects = NonNullable<NonNullable<typeof user>["teacherProfile"]>;
        return {
          user: teacherUser,
          teacher: {
            ...impersonatedTeacher,
            subjects: teacherSubjects,
          } as unknown as TeacherWithSubjects,
          subjectIds: teacherSubjects.map((s) => s.id),
          isImpersonating: true,
          realAdminUser: user,
          impersonatedTeacherName: impersonatedTeacher.name,
          impersonatedTeacherId: impersonatedTeacher.id,
        };
      }
    }

    const allSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        title: true,
        teacherName: true,
        phase: true,
        levels: true,
        streams: true,
      },
      take: 100,
    });
    type TeacherWithSubjects = NonNullable<NonNullable<typeof user>["teacherProfile"]>;
    return {
      user,
      teacher: {
        id: user.id,
        userId: user.id,
        name: user.fullName,
        phone: user.phoneNumber,
        subjects: allSubjects,
      } as unknown as TeacherWithSubjects,
      subjectIds: allSubjects.map((s) => s.id),
      isImpersonating: false,
      realAdminUser: user,
      impersonatedTeacherName: null,
      impersonatedTeacherId: null,
    };
  }

  if (user.role !== "TEACHER") return null;

  if (!user.teacherProfile) {
    await ensureTeacherProfile(user);
    user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: teacherInclude,
    });
  }

  if (!user?.teacherProfile) return null;

  const cleanName = user.teacherProfile.name.replace('الأستاذة ', '').replace('الأستاذ ', '').trim();
  const teacherSubjects = await prisma.subject.findMany({
    where: {
      OR: [
        { teacherId: user.teacherProfile.id },
        { teacherName: user.teacherProfile.name },
        { teacherName: { contains: cleanName } },
      ],
    },
    select: {
      id: true,
      title: true,
      teacherName: true,
      phase: true,
      levels: true,
      streams: true,
    },
  });

  const subjectIds = teacherSubjects.map((subject) => subject.id);
  type TeacherWithSubjects = NonNullable<NonNullable<typeof user>["teacherProfile"]>;
  return {
    user,
    teacher: {
      ...user.teacherProfile,
      subjects: teacherSubjects,
    } as unknown as TeacherWithSubjects,
    subjectIds,
    isImpersonating: false,
    realAdminUser: null,
    impersonatedTeacherName: null,
    impersonatedTeacherId: null,
  };
}

export function teacherMistakesWhere(subjectIds: string[]) {
  if (subjectIds.length === 0) return { id: "__none__" };
  return {
    OR: subjectIds.flatMap((subjectId) => mistakesForSubjectWhere(subjectId).OR),
  };
}
