import { prisma } from "@/lib/prisma";

export interface TeacherLessonStat {
  id: string;
  title: string;
  month: number;
  order: number;
  subjectTitle: string;
  completions: number;
  completionRate: number;
  mistakesCount: number;
  quizCompletions: number;
  repetitionCount: number;
}

export interface TeacherStudentStat {
  id: string;
  fullName: string;
  phoneNumber: string;
  completedLessons: number;
  completedQuizzes: number;
  mistakesCount: number;
}

export interface TeacherRecentMistake {
  id: string;
  studentName: string;
  studentPhone: string;
  lessonTitle: string;
  subjectTitle: string;
  mistakeContent: string;
  correctSolution: string;
  createdAt: Date;
}

export async function getTeacherAnalytics(subjectIds: string[]) {
  if (subjectIds.length === 0) {
    return {
      totalStudents: 0,
      totalLessons: 0,
      totalMistakes: 0,
      totalCompletions: 0,
      totalQuizAttempts: 0,
      lessonStats: [],
      mostViewedLessons: [],
      mostRepeatedLessons: [],
      recentMistakes: [],
      studentStats: [],
    };
  }

  // 1. Get total unique students enrolled in these subjects
  const enrollments = await prisma.enrollment.findMany({
    where: { subjectId: { in: subjectIds } },
    select: { studentId: true },
  });
  const totalStudents = new Set(enrollments.map((e) => e.studentId)).size;

  // 2. Get all lessons with subjects, completions, mistakes, and quiz info
  const lessons = await prisma.lesson.findMany({
    where: { subjects: { some: { id: { in: subjectIds } } } },
    select: {
      id: true,
      title: true,
      month: true,
      order: true,
      subjects: { select: { title: true } },
      quiz: {
        select: {
          id: true,
          _count: { select: { completions: true } },
        },
      },
      _count: {
        select: {
          completions: true,
          mistakes: true,
        },
      },
    },
  });

  const totalLessons = lessons.length;
  let totalCompletions = 0;
  let totalMistakes = 0;
  let totalQuizAttempts = 0;

  const lessonStats: TeacherLessonStat[] = lessons.map((l) => {
    const completions = l._count.completions;
    const mistakes = l._count.mistakes;
    const quizAttempts = l.quiz?._count.completions || 0;

    totalCompletions += completions;
    totalMistakes += mistakes;
    totalQuizAttempts += quizAttempts;

    const completionRate =
      totalStudents > 0 ? (completions / totalStudents) * 100 : 0;

    // Repetition index: lessons where students had repeated attempts or multiple mistakes
    const repetitionCount = Math.max(mistakes, quizAttempts > completions ? quizAttempts - completions : 0);

    return {
      id: l.id,
      title: l.title,
      month: l.month,
      order: l.order,
      subjectTitle: l.subjects[0]?.title || "المادة",
      completions,
      completionRate: Math.min(Math.round(completionRate), 100),
      mistakesCount: mistakes,
      quizCompletions: quizAttempts,
      repetitionCount,
    };
  });

  // 3. Most viewed lessons (ach mn dars fih mochahadat bzzf)
  const mostViewedLessons = [...lessonStats]
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5);

  // 4. Most repeated lessons (wwach mn dars 3awdoh - based on repetition and mistake density)
  const mostRepeatedLessons = [...lessonStats]
    .sort((a, b) => b.mistakesCount - a.mistakesCount || b.repetitionCount - a.repetitionCount)
    .slice(0, 5);

  // Default lessonStats sorted by difficulty/mistakes
  lessonStats.sort(
    (a, b) => b.mistakesCount - a.mistakesCount || b.completions - a.completions
  );

  // 5. Recent student mistakes with details
  const rawMistakes = await prisma.studentMistake.findMany({
    where: {
      lesson: { subjects: { some: { id: { in: subjectIds } } } },
    },
    include: {
      user: { select: { fullName: true, phoneNumber: true } },
      lesson: { include: { subjects: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const recentMistakes: TeacherRecentMistake[] = rawMistakes.map((m) => ({
    id: m.id,
    studentName: m.user?.fullName || "تلميذ",
    studentPhone: m.user?.phoneNumber || "",
    lessonTitle: m.lesson?.title || "درس",
    subjectTitle: m.lesson?.subjects[0]?.title || "المادة",
    mistakeContent: m.mistakeContent,
    correctSolution: m.correctSolution,
    createdAt: m.createdAt,
  }));

  // 6. Detailed student stats
  const students = await prisma.user.findMany({
    where: {
      enrollments: { some: { subjectId: { in: subjectIds } } },
    },
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      _count: {
        select: {
          lessonCompletions: true,
          quizCompletions: true,
          mistakes: true,
        },
      },
    },
    orderBy: {
      lessonCompletions: { _count: "desc" },
    },
    take: 15,
  });

  const studentStats: TeacherStudentStat[] = students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    phoneNumber: s.phoneNumber,
    completedLessons: s._count.lessonCompletions,
    completedQuizzes: s._count.quizCompletions,
    mistakesCount: s._count.mistakes,
  }));

  return {
    totalStudents,
    totalLessons,
    totalMistakes,
    totalCompletions,
    totalQuizAttempts,
    lessonStats,
    mostViewedLessons,
    mostRepeatedLessons,
    recentMistakes,
    studentStats,
  };
}
