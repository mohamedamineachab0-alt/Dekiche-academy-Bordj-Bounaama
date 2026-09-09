import { prisma } from "@/lib/prisma";

export type PendingWorkItem = {
  id: string;
  title: string;
  subjectTitle: string;
};

export type StudentWorkFile = {
  unwatchedLessons: PendingWorkItem[];
  unsolvedExercises: PendingWorkItem[];
  unsolvedLessonQuizzes: PendingWorkItem[];
  lessonCount: number;
  watchedCount: number;
  exerciseCount: number;
  solvedExerciseCount: number;
  lessonQuizCount: number;
  solvedLessonQuizCount: number;
};

export type StudentWorkCounts = {
  unwatchedLessons: number;
  unsolvedExercises: number;
  unsolvedLessonQuizzes: number;
};

function lessonVisibleTo(stream: string, streams: string[]) {
  return streams.length === 0 || streams.includes(stream) || streams.includes("NONE");
}

export async function getStudentWorkFile(
  studentId: string,
  subjectIds?: string[],
): Promise<StudentWorkFile | null> {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: { select: { stream: true } },
      enrollments: {
        where: subjectIds ? { subjectId: { in: subjectIds } } : undefined,
        select: { subjectId: true, enrolledMonths: true },
      },
    },
  });
  if (!user?.studentProfile) return null;

  const enrolledIds = user.enrollments.map((row) => row.subjectId);
  if (enrolledIds.length === 0) {
    return {
      unwatchedLessons: [],
      unsolvedExercises: [],
      unsolvedLessonQuizzes: [],
      lessonCount: 0,
      watchedCount: 0,
      exerciseCount: 0,
      solvedExerciseCount: 0,
      lessonQuizCount: 0,
      solvedLessonQuizCount: 0,
    };
  }

  const monthsBySubject = new Map(user.enrollments.map((row) => [row.subjectId, row.enrolledMonths]));
  const stream = user.studentProfile.stream;

  const [lessons, exercises, completions, quizCompletions] = await Promise.all([
    prisma.lesson.findMany({
      where: { subjects: { some: { id: { in: enrolledIds } } } },
      select: {
        id: true,
        title: true,
        month: true,
        streams: true,
        subjects: { select: { id: true, title: true } },
        quiz: { select: { id: true } },
      },
      orderBy: [{ month: "asc" }, { createdAt: "asc" }],
    }),
    prisma.dailyExercise.findMany({
      where: {
        OR: [{ subjectId: { in: enrolledIds } }, { secondarySubjectId: { in: enrolledIds } }],
      },
      select: {
        id: true,
        title: true,
        month: true,
        stream: true,
        subjectId: true,
        secondarySubjectId: true,
        subject: { select: { title: true } },
        lesson: { select: { title: true } },
        quiz: { select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lessonCompletion.findMany({
      where: { studentId },
      select: { lessonId: true },
    }),
    prisma.quizCompletion.findMany({
      where: { studentId },
      select: { quizId: true },
    }),
  ]);

  const watched = new Set(completions.map((row) => row.lessonId));
  const solved = new Set(quizCompletions.map((row) => row.quizId));

  const accessibleLessons = lessons.filter((lesson) => {
    if (!lessonVisibleTo(stream, lesson.streams)) return false;
    return lesson.subjects.some((subject) => {
      const months = monthsBySubject.get(subject.id);
      return months ? months.includes(lesson.month) : false;
    });
  });

  const accessibleExercises = exercises.filter((exercise) => {
    if (exercise.stream !== "NONE" && exercise.stream !== stream) return false;
    const subjectId = enrolledIds.includes(exercise.subjectId)
      ? exercise.subjectId
      : exercise.secondarySubjectId && enrolledIds.includes(exercise.secondarySubjectId)
        ? exercise.secondarySubjectId
        : null;
    if (!subjectId) return false;
    return monthsBySubject.get(subjectId)?.includes(exercise.month) ?? false;
  });

  const unwatchedLessons = accessibleLessons
    .filter((lesson) => !watched.has(lesson.id))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subjectTitle: lesson.subjects[0]?.title || "مادة",
    }));

  const lessonQuizzes = accessibleLessons.filter((lesson) => lesson.quiz);
  const unsolvedLessonQuizzes = lessonQuizzes
    .filter((lesson) => lesson.quiz && !solved.has(lesson.quiz.id))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subjectTitle: lesson.subjects[0]?.title || "مادة",
    }));

  const exercisesWithQuiz = accessibleExercises.filter((exercise) => exercise.quiz);
  const unsolvedExercises = exercisesWithQuiz
    .filter((exercise) => exercise.quiz && !solved.has(exercise.quiz.id))
    .map((exercise) => ({
      id: exercise.id,
      title: exercise.lesson?.title || exercise.title,
      subjectTitle: exercise.subject.title,
    }));

  return {
    unwatchedLessons,
    unsolvedExercises,
    unsolvedLessonQuizzes,
    lessonCount: accessibleLessons.length,
    watchedCount: accessibleLessons.length - unwatchedLessons.length,
    exerciseCount: exercisesWithQuiz.length,
    solvedExerciseCount: exercisesWithQuiz.length - unsolvedExercises.length,
    lessonQuizCount: lessonQuizzes.length,
    solvedLessonQuizCount: lessonQuizzes.length - unsolvedLessonQuizzes.length,
  };
}

export function workCounts(file: StudentWorkFile): StudentWorkCounts {
  return {
    unwatchedLessons: file.unwatchedLessons.length,
    unsolvedExercises: file.unsolvedExercises.length,
    unsolvedLessonQuizzes: file.unsolvedLessonQuizzes.length,
  };
}
