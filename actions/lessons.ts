"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type LessonMaterialInput = {
  title: string;
  fileUrl: string;
};

export type LessonPayload = {
  title: string;
  subjectId: string;
  month: number;
  vimeoVideoId: string;
  materials: LessonMaterialInput[];
  quiz?: {
    maxScore: number;
    aiGenerated: boolean;
    questions: any[];
  } | null;
};

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createLesson(payload: LessonPayload): Promise<ActionState> {
  if (!payload.title || !payload.subjectId || !payload.vimeoVideoId || !payload.month) {
    return { error: "جميع الحقول الاساسية مطلوبة" };
  }

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title: payload.title,
        subjectId: payload.subjectId,
        month: payload.month,
        vimeoVideoId: payload.vimeoVideoId,
        materials: {
          create: payload.materials.map(m => ({
            title: m.title,
            fileUrl: m.fileUrl,
          })),
        },
        ...(payload.quiz && {
          quiz: {
            create: {
              maxScore: payload.quiz.maxScore,
              aiGenerated: payload.quiz.aiGenerated,
              questions: payload.quiz.questions,
            }
          }
        })
      },
    });

    revalidatePath(`/dashboard/admin/lessons`);
    revalidatePath(`/dashboard/student/subjects/${payload.subjectId}`);
    return { success: true };
  } catch (error) {
    console.error("خطا اثناء حفظ الدرس", error);
    return { error: "حدث خطا اثناء الحفظ يرجى المحاولة" };
  }
}

export async function addLessonMaterial(
  formData: FormData
): Promise<ActionState> {
  try {
    const lessonId = formData.get("lessonId") as string;
    const title = formData.get("title") as string;
    const fileUrl = formData.get("fileUrl") as string;

    if (!lessonId || !title || !fileUrl) {
      return { error: "جميع الحقول مطلوبة" };
    }

    await prisma.lessonMaterial.create({
      data: {
        lessonId,
        title,
        fileUrl,
      },
    });

    revalidatePath("/dashboard/admin/lessons");
    return { success: true };
  } catch (error) {
    console.error("خطا اثناء رفع الملف", error);
    return { error: "حدث خطا اثناء الرفع يرجى المحاولة" };
  }
}
