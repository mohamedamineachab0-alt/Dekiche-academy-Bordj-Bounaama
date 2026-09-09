"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markLessonWatched(lessonId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return { error: "يجب تسجيل الدخول" };
  if (!lessonId) return { error: "الدرس غير محدد" };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { subjects: { select: { id: true } } },
  });

  if (!lesson) return { error: "الدرس غير موجود" };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: sessionId,
      subjectId: { in: lesson.subjects.map((s) => s.id) },
      enrolledMonths: { has: lesson.month },
    },
    select: { id: true },
  });

  if (!enrollment) return { error: "هذا الدرس غير مفعّل في اشتراكك" };

  await prisma.lessonCompletion.upsert({
    where: {
      studentId_lessonId: {
        studentId: sessionId,
        lessonId,
      },
    },
    create: {
      studentId: sessionId,
      lessonId,
    },
    update: {
      completedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/student", "layout");
  revalidatePath(`/dashboard/student/lessons/${lessonId}`);
  return { success: true };
}
