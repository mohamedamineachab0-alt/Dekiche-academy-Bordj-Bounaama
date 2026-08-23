"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

type MistakePayload = {
  mistakeContent: string;
  correctSolution: string;
};

export async function saveQuizMistakes(
  lessonId: string,
  quizId: string,
  mistakes: MistakePayload[]
) {
  const studentId = (await requireUser(["STUDENT"])).id;

  if (mistakes.length === 0) return { success: true };

  await prisma.studentMistake.createMany({
    data: mistakes.map((m) => ({
      studentId,
      lessonId,
      quizId,
      mistakeContent: m.mistakeContent,
      correctSolution: m.correctSolution,
    })),
  });

  return { success: true };
}
