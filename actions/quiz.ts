"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

type MistakePayload = {
  mistakeContent: string;
  correctSolution: string;
};

export async function saveQuizMistakes(
  lessonId: string,
  quizId: string,
  mistakes: MistakePayload[]
) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("session")?.value;

  if (!studentId) {
    throw new Error("غير مسجل الدخول");
  }

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
