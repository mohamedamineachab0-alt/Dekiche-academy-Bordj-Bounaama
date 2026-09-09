export const mistakeQuizInclude = {
  lesson: {
    include: { subjects: { select: { id: true, title: true } } },
  },
  dailyExercise: {
    include: {
      subject: { select: { id: true, title: true } },
      lesson: { select: { title: true } },
    },
  },
  exam: {
    include: {
      subject: { select: { id: true, title: true } },
    },
  },
} as const;

type MistakeSourceInput = {
  lesson?: {
    title: string;
    subjects?: Array<{ title: string }>;
  } | null;
  quiz?: {
    lesson?: {
      title: string;
      subjects?: Array<{ title: string }>;
    } | null;
    dailyExercise?: {
      title: string;
      subject?: { title: string } | null;
      lesson?: { title: string } | null;
    } | null;
    exam?: {
      title: string;
      subject?: { title: string } | null;
    } | null;
  } | null;
};

export function describeMistake(mistake: MistakeSourceInput) {
  const exercise = mistake.quiz?.dailyExercise;
  if (exercise) {
    return {
      kind: "تمرين يومي",
      title: exercise.lesson?.title || exercise.title,
      subject: exercise.subject?.title || "بدون مادة",
    };
  }

  const exam = mistake.quiz?.exam;
  if (exam) {
    return {
      kind: "فرض / اختبار",
      title: exam.title,
      subject: exam.subject?.title || "بدون مادة",
    };
  }

  const lesson = mistake.quiz?.lesson || mistake.lesson;
  return {
    kind: "اختبار الدرس",
    title: lesson?.title || "بدون عنوان",
    subject: lesson?.subjects?.[0]?.title || "بدون مادة",
  };
}

export function mistakesForSubjectWhere(subjectId: string, months?: number[]) {
  const monthFilter = months ? { month: { in: months } } : {};
  return {
    OR: [
      { lesson: { subjects: { some: { id: subjectId } }, ...monthFilter } },
      {
        quiz: {
          dailyExercise: {
            OR: [{ subjectId }, { secondarySubjectId: subjectId }],
            ...monthFilter,
          },
        },
      },
      {
        quiz: {
          exam: {
            OR: [{ subjectId }, { secondarySubjectId: subjectId }],
            ...monthFilter,
          },
        },
      },
    ],
  };
}
