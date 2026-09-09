"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Stream } from "@/generated/prisma";
import { ensureAcademicMonth } from "@/lib/academic-month";
import { generateQuizFromSources, type QuizSourceFile } from "@/lib/ai/generate-quiz";

export type LessonMaterialInput = {
  title: string;
  fileUrl: string;
};

export type LessonPayload = {
  title: string;
  subjectIds: string[];
  streams: Stream[];
  levels: any[];
  month: number;
  vimeoVideoId: string;
  materials: LessonMaterialInput[];
  quiz?: {
    maxScore: number;
    aiGenerated: boolean;
    questions: any[];
  } | null;
  image?: string | null;
};

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createLesson(payload: LessonPayload): Promise<ActionState> {
  if (!payload.title || payload.subjectIds.length === 0 || !payload.vimeoVideoId || !payload.month) {
    return { error: "جميع الحقول الاساسية مطلوبة" };
  }

  try {
    const academicMonth = await ensureAcademicMonth(payload.month);

    const lesson = await prisma.lesson.create({
      data: {
        title: payload.title,
        subjects: {
          connect: payload.subjectIds.map(id => ({ id }))
        },
        streams: payload.streams,
        levels: payload.levels,
        month: payload.month,
        academicMonth: { connect: { id: academicMonth.id } },
        vimeoVideoId: payload.vimeoVideoId,
        image: payload.image || null,
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
    payload.subjectIds.forEach(id => revalidatePath(`/dashboard/student/subjects/${id}`));
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
    return { error: "حدث خطا اثناء الحفظ يرجى المحاولة" };
  }
}

export type UpdateLessonPayload = {
  id: string;
  title: string;
  subjectIds: string[];
  streams: Stream[];
  levels: any[];
  month: number;
  vimeoVideoId: string;
  image?: string | null;
  quiz?: {
    maxScore: number;
    aiGenerated: boolean;
    questions: any[];
  } | null;
};

export async function updateLesson(payload: UpdateLessonPayload): Promise<ActionState> {
  if (!payload.id || !payload.title || payload.subjectIds.length === 0 || !payload.vimeoVideoId || !payload.month) {
    return { error: "جميع الحقول الاساسية مطلوبة" };
  }

  try {
    const academicMonth = await ensureAcademicMonth(payload.month);

    await prisma.lesson.update({
      where: { id: payload.id },
      data: {
        title: payload.title,
        subjects: {
          set: payload.subjectIds.map(id => ({ id }))
        },
        streams: payload.streams,
        levels: payload.levels,
        month: payload.month,
        academicMonth: { connect: { id: academicMonth.id } },
        vimeoVideoId: payload.vimeoVideoId,
        ...(payload.image !== undefined && { image: payload.image }),
        ...(payload.quiz !== undefined && {
          quiz: payload.quiz ? {
            upsert: {
              create: {
                maxScore: payload.quiz.maxScore,
                aiGenerated: payload.quiz.aiGenerated,
                questions: payload.quiz.questions,
              },
              update: {
                maxScore: payload.quiz.maxScore,
                aiGenerated: payload.quiz.aiGenerated,
                questions: payload.quiz.questions,
              }
            }
          } : { delete: true }
        })
      },
    });

    revalidatePath(`/dashboard/admin/lessons`);
    payload.subjectIds.forEach(id => revalidatePath(`/dashboard/student/subjects/${id}`));
    return { success: true };
  } catch (error) {
    console.error("خطا اثناء تحديث الدرس", error);
    return { error: "حدث خطا اثناء الحفظ يرجى المحاولة" };
  }
}

function fileNameFromMaterial(title: string, fileUrl: string) {
  const fromUrl = fileUrl.split("?")[0].split("/").pop() || "";
  if (/\.[a-z0-9]+$/i.test(title)) return title;
  if (/\.[a-z0-9]+$/i.test(fromUrl)) {
    return `${title}.${fromUrl.split(".").pop()}`;
  }
  return title || fromUrl || "attachment";
}

async function loadMaterialFiles(materials: { title: string; fileUrl: string }[]): Promise<QuizSourceFile[]> {
  const files: QuizSourceFile[] = [];
  for (const material of materials) {
    try {
      const fileRes = await fetch(material.fileUrl);
      if (!fileRes.ok) continue;
      files.push({
        name: fileNameFromMaterial(material.title, material.fileUrl),
        mimeType: fileRes.headers.get("content-type") || undefined,
        buffer: Buffer.from(await fileRes.arrayBuffer()),
      });
    } catch (error) {
      console.error("Failed to fetch lesson material", material.fileUrl, error);
    }
  }
  return files;
}

export async function generateQuizForMaterial(lessonId: string, materialId: string, language: string): Promise<ActionState> {
  try {
    const preview = await previewQuizForMaterial(materialId, language);
    if (preview.error || !preview.questions?.length) {
      return { error: preview.error || "لم يتم التعرف على أسئلة صالحة" };
    }

    await prisma.quiz.upsert({
      where: { lessonId },
      update: { questions: preview.questions, maxScore: 20, aiGenerated: true },
      create: { lessonId, questions: preview.questions, maxScore: 20, aiGenerated: true },
    });
    revalidatePath(`/dashboard/admin/lessons`);
    return { success: true };
  } catch (error) {
    console.error("خطأ أثناء توليد الكويز", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}

export async function previewQuizForMaterial(materialId: string, language: string, subjectName?: string, title?: string): Promise<{ error?: string; questions?: any[]; source?: "files" | "title" }> {
  try {
    const material = await prisma.lessonMaterial.findUnique({
      where: { id: materialId },
      include: { lesson: { include: { subjects: { select: { title: true } } } } },
    });
    if (!material) return { error: "الملف غير موجود" };

    const files = await loadMaterialFiles([material]);
    const result = await generateQuizFromSources({
      files,
      numberOfQuestions: 20,
      totalPoints: 20,
      language,
      subjectName: subjectName || material.lesson.subjects[0]?.title,
      title: title || material.lesson.title,
    });
    return { questions: result.questions, source: result.source };
  } catch (error) {
    console.error("خطأ أثناء توليد الكويز كعرض مسبق", error);
    return { error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" };
  }
}

export async function previewQuizFromLesson(input: {
  lessonId: string;
  language?: string;
  subjectName?: string;
  title?: string;
  numberOfQuestions?: number;
  totalPoints?: number;
}): Promise<{ error?: string; questions?: any[]; source?: "files" | "title" }> {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: input.lessonId },
      include: {
        materials: true,
        subjects: { select: { title: true } },
      },
    });
    if (!lesson) return { error: "الدرس غير موجود" };

    const files = await loadMaterialFiles(lesson.materials);
    const result = await generateQuizFromSources({
      files,
      numberOfQuestions: input.numberOfQuestions ?? 20,
      totalPoints: input.totalPoints ?? 20,
      language: input.language,
      subjectName: input.subjectName || lesson.subjects[0]?.title,
      title: input.title || lesson.title,
    });
    return { questions: result.questions, source: result.source };
  } catch (error) {
    console.error("خطأ أثناء توليد كويز الدرس", error);
    return { error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" };
  }
}
