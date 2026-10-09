import { prisma } from "@/lib/prisma";

export async function getTeacherAnalytics(subjectIds: string[]) {
  if (subjectIds.length === 0) {
    return {
      totalStudents: 0,
      totalLessons: 0,
      totalMistakes: 0,
      lessonStats: [],
    };
  }

  // Get total unique students enrolled in these subjects
  const enrollments = await prisma.enrollment.findMany({
    where: { subjectId: { in: subjectIds } },
    select: { studentId: true },
  });
  const totalStudents = new Set(enrollments.map((e) => e.studentId)).size;

  // Get total lessons
  const totalLessons = await prisma.lesson.count({
    where: { subjects: { some: { id: { in: subjectIds } } } },
  });

  // Get total mistakes
  const totalMistakes = await prisma.studentMistake.count({
    where: { lesson: { subjects: { some: { id: { in: subjectIds } } } } },
  });

  // Get lesson completion and mistake stats
  const lessons = await prisma.lesson.findMany({
    where: { subjects: { some: { id: { in: subjectIds } } } },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          completions: true,
          mistakes: true,
        },
      },
    },
  });

  const lessonStats = lessons.map((l) => {
    // Completion rate is completions / totalStudents
    const completionRate = totalStudents > 0 ? (l._count.completions / totalStudents) * 100 : 0;
    return {
      id: l.id,
      title: l.title,
      completions: l._count.completions,
      completionRate: Math.min(Math.round(completionRate), 100),
      mistakesCount: l._count.mistakes,
    };
  });

  // Sort lessons by most mistakes to find "difficulties"
  lessonStats.sort((a, b) => b.mistakesCount - a.mistakesCount || a.completionRate - b.completionRate);

  return {
    totalStudents,
    totalLessons,
    totalMistakes,
    lessonStats,
  };
}
