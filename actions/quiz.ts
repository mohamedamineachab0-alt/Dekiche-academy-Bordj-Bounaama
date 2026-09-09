"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

type MistakePayload = {
  mistakeContent: string;
  correctSolution: string;
};

export async function saveQuizMistakes(
  quizId: string,
  mistakes: MistakePayload[],
  lessonId?: string | null
) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("session")?.value;

  if (!studentId) {
    throw new Error("غير مسجل الدخول");
  }

  if (!quizId || mistakes.length === 0) return { success: true };

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      lessonId: true,
      dailyExercise: { select: { lessonId: true } },
    },
  });

  if (!quiz) {
    throw new Error("الاختبار غير موجود");
  }

  const resolvedLessonId = lessonId || quiz.lessonId || quiz.dailyExercise?.lessonId || null;

  await prisma.studentMistake.createMany({
    data: mistakes.map((m) => ({
      studentId,
      quizId: quiz.id,
      lessonId: resolvedLessonId,
      mistakeContent: m.mistakeContent,
      correctSolution: m.correctSolution,
    })),
  });

  return { success: true };
}

export async function saveQuizResult(quizId: string, score: number) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("session")?.value;
  if (!studentId || !quizId) return { error: "غير مصرح" };

  await prisma.quizCompletion.upsert({
    where: { studentId_quizId: { studentId, quizId } },
    create: {
      studentId,
      quizId,
      score: Math.max(0, Math.min(20, Math.round(score))),
    },
    update: {
      score: Math.max(0, Math.min(20, Math.round(score))),
      completedAt: new Date(),
    },
  });

  return { success: true };
}
