"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Stream } from "@/generated/prisma";

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
    const lesson = await prisma.lesson.create({
      data: {
        title: payload.title,
        subjects: {
          connect: payload.subjectIds.map(id => ({ id }))
        },
        streams: payload.streams,
        levels: payload.levels,
        month: payload.month,
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

export async function generateQuizForMaterial(lessonId: string, materialId: string, language: string): Promise<ActionState> {
  try {
    const material = await prisma.lessonMaterial.findUnique({ where: { id: materialId } });
    if (!material) return { error: "الملف غير موجود" };

    const fileRes = await globalThis.fetch(material.fileUrl);
    if (!fileRes.ok) return { error: "فشل تحميل الملف من التخزين" };

    const buffer = await fileRes.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const ext = material.fileUrl.split('.').pop()?.toLowerCase() || '';

    let payload: any = { numberOfQuestions: 5, totalPoints: 20, language };

    if (ext === 'pdf') {
      payload.pdfBase64 = base64String;
    } else if (ext === 'docx') {
      payload.docxBase64 = base64String;
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      payload.imageBase64 = base64String;
    } else {
      payload.textContent = Buffer.from(buffer).toString('utf-8');
    }

    const apiRes = await globalThis.fetch('http://127.0.0.1:3000/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("API response not ok:", apiRes.status, errorText);
      return { error: "فشل توليد الكويز بالذكاء الاصطناعي: " + apiRes.status };
    }

    const data = await apiRes.json() as any;
    console.log("Quiz generation result:", data);
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      const pts = Number((20 / data.questions.length).toFixed(2));
      const finalQuestions = data.questions.map((q: any) => ({ ...q, points: pts }));

      await prisma.quiz.create({
        data: {
          lessonId,
          maxScore: 20,
          aiGenerated: true,
          questions: finalQuestions
        }
      });
      revalidatePath(`/dashboard/admin/lessons`);
      return { success: true };
    } else {
      return { error: "لم يتم التعرف على أسئلة صالحة" };
    }
  } catch (error) {
    console.error("خطأ أثناء توليد الكويز", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}

export async function previewQuizForMaterial(materialId: string, language: string, subjectName?: string, title?: string): Promise<{ error?: string; questions?: any[] }> {
  try {
    const material = await prisma.lessonMaterial.findUnique({ where: { id: materialId } });
    if (!material) return { error: "الملف غير موجود" };

    const fileRes = await globalThis.fetch(material.fileUrl);
    if (!fileRes.ok) return { error: "فشل تحميل الملف من التخزين" };

    const buffer = await fileRes.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const ext = material.fileUrl.split('.').pop()?.toLowerCase() || '';

    let payload: any = { numberOfQuestions: 5, totalPoints: 20, language, subjectName, title };

    if (ext === 'pdf') {
      payload.pdfBase64 = base64String;
    } else if (ext === 'docx') {
      payload.docxBase64 = base64String;
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      payload.imageBase64 = base64String;
    } else {
      payload.textContent = Buffer.from(buffer).toString('utf-8');
    }

    const apiRes = await globalThis.fetch('http://127.0.0.1:3000/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return { error: "فشل توليد الكويز بالذكاء الاصطناعي" };
    }

    const data = await apiRes.json() as any;
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      const pts = Number((20 / data.questions.length).toFixed(2));
      const finalQuestions = data.questions.map((q: any) => ({ ...q, points: pts }));
      return { questions: finalQuestions };
    } else {
      return { error: "لم يتم التعرف على أسئلة صالحة" };
    }
  } catch (error) {
    console.error("خطأ أثناء توليد الكويز كعرض مسبق", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}
