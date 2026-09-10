import { prisma } from "@/lib/prisma";
import { daysSince } from "@/lib/education-labels";
import { getRankedStudents, rankOf } from "@/lib/ranking";
import type { Level, Stream } from "@/generated/prisma";

export type ParentChildSubjectProgress = {
  subjectId: string;
  title: string;
  percent: number;
  completedCount: number;
  total: number;
};

export type ParentChildStats = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  lastLoginAt: Date;
  level: string | null;
  stream: string | null;
  points: number;
  rank: number | null;
  completion: number;
  exercisesSolved: number;
  averageScore: number | null;
  daysInactive: number;
  subjects: ParentChildSubjectProgress[];
};

export async function getLinkedParentChildren(parentId: string): Promise<ParentChildStats[]> {
  const links = await prisma.parentStudentLink.findMany({
    where: { parentId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          lastLoginAt: true,
          studentProfile: { select: { level: true, stream: true, totalPoints: true } },
          enrollments: {
            select: {
              subject: { select: { id: true, title: true } },
            },
          },
          _count: { select: { quizCompletions: true } },
        },
      },
    },
  });

  if (links.length === 0) return [];

  const studentIds = links.map((link) => link.student.id);
  const subjectIds = [
    ...new Set(links.flatMap((link) => link.student.enrollments.map((row) => row.subject.id))),
  ];

  const [lessons, completions, scoredSubmissions] = await Promise.all([
    subjectIds.length > 0
      ? prisma.lesson.findMany({
          where: { subjects: { some: { id: { in: subjectIds } } } },
          select: { id: true, subjects: { select: { id: true } } },
        })
      : Promise.resolve([]),
    prisma.lessonCompletion.findMany({
      where: { studentId: { in: studentIds } },
      select: { studentId: true, lessonId: true },
    }),
    prisma.studentSubmission.findMany({
      where: { studentId: { in: studentIds }, score: { not: null } },
      select: { studentId: true, score: true },
    }),
  ]);

  const lessonsBySubject = new Map<string, string[]>();
  for (const lesson of lessons) {
    for (const subject of lesson.subjects) {
      const list = lessonsBySubject.get(subject.id) ?? [];
      list.push(lesson.id);
      lessonsBySubject.set(subject.id, list);
    }
  }

  const completedByStudent = new Map<string, Set<string>>();
  for (const row of completions) {
    const set = completedByStudent.get(row.studentId) ?? new Set<string>();
    set.add(row.lessonId);
    completedByStudent.set(row.studentId, set);
  }

  const scoresByStudent = new Map<string, number[]>();
  for (const row of scoredSubmissions) {
    if (row.score == null) continue;
    const list = scoresByStudent.get(row.studentId) ?? [];
    list.push(row.score);
    scoresByStudent.set(row.studentId, list);
  }

  const rankCache = new Map<string, Awaited<ReturnType<typeof getRankedStudents>>>();
  const uniqueClasses = [
    ...new Map(
      links
        .filter((link) => link.student.studentProfile)
        .map((link) => {
          const profile = link.student.studentProfile!;
          return [`${profile.level}:${profile.stream}`, profile] as const;
        })
    ).values(),
  ];

  await Promise.all(
    uniqueClasses.map(async (profile) => {
      const key = `${profile.level}:${profile.stream}`;
      rankCache.set(
        key,
        await getRankedStudents({
          level: profile.level as Level,
          stream: profile.stream as Stream,
        })
      );
    })
  );

  return links.map((link) => {
    const student = link.student;
    const watched = completedByStudent.get(student.id) ?? new Set<string>();
    const subjects: ParentChildSubjectProgress[] = student.enrollments.map((enrollment) => {
      const lessonIds = lessonsBySubject.get(enrollment.subject.id) ?? [];
      const completedCount = lessonIds.filter((id) => watched.has(id)).length;
      const total = lessonIds.length;
      return {
        subjectId: enrollment.subject.id,
        title: enrollment.subject.title,
        completedCount,
        total,
        percent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      };
    });

    const totalLessons = subjects.reduce((sum, row) => sum + row.total, 0);
    const totalCompleted = subjects.reduce((sum, row) => sum + row.completedCount, 0);
    const scores = scoresByStudent.get(student.id) ?? [];
    const averageScore =
      scores.length > 0
        ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10
        : null;

    const profile = student.studentProfile;
    const ranked = profile ? rankCache.get(`${profile.level}:${profile.stream}`) : undefined;

    return {
      id: student.id,
      fullName: student.fullName,
      avatarUrl: student.avatarUrl,
      lastLoginAt: student.lastLoginAt,
      level: profile?.level ?? null,
      stream: profile?.stream ?? null,
      points: profile?.totalPoints ?? 0,
      rank: ranked ? rankOf(student.id, ranked) : null,
      completion: totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0,
      exercisesSolved: student._count.quizCompletions,
      averageScore,
      daysInactive: daysSince(student.lastLoginAt),
      subjects,
    };
  });
}
