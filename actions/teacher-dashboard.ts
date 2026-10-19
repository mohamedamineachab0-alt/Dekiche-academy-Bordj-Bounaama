"use server";

import { prisma } from "@/lib/prisma";
import { getTeacherSession } from "@/lib/teacher";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  data?: any;
};

async function verifyTeacherLessonAccess(lessonId: string) {
  const session = await getTeacherSession();
  if (!session) {
    throw new Error("غير مسجل الدخول كأستاذ");
  }

  const { user, subjectIds } = session;

  // Admins have access to all lessons
  if (user.role === "ADMIN") {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { subjects: { select: { id: true } } },
    });
    if (!lesson) throw new Error("الدرس غير موجود");
    return { session, lesson };
  }

  // Teacher must be assigned to at least one subject of this lesson
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      subjects: { some: { id: { in: subjectIds } } },
    },
    include: { subjects: { select: { id: true } } },
  });

  if (!lesson) {
    throw new Error("غير مصرح لك بتعديل هذا الدرس");
  }

  return { session, lesson };
}

/**
 * Upload a PDF or attachment to a lesson
 */
export async function uploadTeacherLessonMaterial(formData: FormData): Promise<ActionResponse> {
  try {
    const lessonId = formData.get("lessonId") as string;
    const title = (formData.get("title") as string)?.trim();
    const file = formData.get("file") as File;

    if (!lessonId || !title || !file || file.size === 0) {
      return { error: "يرجى إدخال عنوان الملحق وتحديد الملف" };
    }

    const { lesson } = await verifyTeacherLessonAccess(lessonId);

    const ext = file.name.split(".").pop() || "pdf";
    const cleanName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 50);
    const filePath = `teacher-materials/${lessonId}/${Date.now()}-${cleanName}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("lesson-materials")
      .upload(filePath, file, {
        contentType: file.type || "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: "فشل رفع الملف إلى مساحة التخزين" };
    }

    const { data: publicUrlData } = supabase.storage
      .from("lesson-materials")
      .getPublicUrl(filePath);

    const material = await prisma.lessonMaterial.create({
      data: {
        lessonId,
        title,
        fileUrl: publicUrlData.publicUrl,
      },
    });

    revalidatePath("/dashboard/teacher");
    lesson.subjects.forEach((s) => {
      revalidatePath(`/dashboard/student/subjects/${s.id}`);
      revalidatePath(`/dashboard/student/subjects/${s.id}/lessons`);
    });
    revalidatePath(`/dashboard/student/lessons/${lessonId}`);

    return { success: true, data: material };
  } catch (error: any) {
    console.error("Error in uploadTeacherLessonMaterial:", error);
    return { error: error?.message || "حدث خطأ أثناء رفع الملحق" };
  }
}

/**
 * Delete a lesson material (PDF)
 */
export async function deleteTeacherLessonMaterial(materialId: string): Promise<ActionResponse> {
  try {
    const material = await prisma.lessonMaterial.findUnique({
      where: { id: materialId },
      include: { lesson: { include: { subjects: { select: { id: true } } } } },
    });

    if (!material) {
      return { error: "الملف غير موجود" };
    }

    await verifyTeacherLessonAccess(material.lessonId);

    await prisma.lessonMaterial.delete({
      where: { id: materialId },
    });

    revalidatePath("/dashboard/teacher");
    material.lesson.subjects.forEach((s) => {
      revalidatePath(`/dashboard/student/subjects/${s.id}`);
    });
    revalidatePath(`/dashboard/student/lessons/${material.lessonId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteTeacherLessonMaterial:", error);
    return { error: error?.message || "حدث خطأ أثناء حذف الملف" };
  }
}

/**
 * Save or update an interactive Quiz for a lesson
 */
export async function saveTeacherLessonQuiz(
  lessonId: string,
  questions: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    points: number;
  }>,
  maxScore: number = 20
): Promise<ActionResponse> {
  try {
    if (!lessonId) {
      return { error: "معرّف الدرس مفقود" };
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return { error: "يجب إضافة سؤال واحد على الأقل للكويز" };
    }

    // Validate questions structure
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) {
        return { error: `نص السؤال رقم ${i + 1} مطلوب` };
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return { error: `السؤال رقم ${i + 1} يجب أن يحتوي على خيارين على الأقل` };
      }
      if (
        typeof q.correctAnswerIndex !== "number" ||
        q.correctAnswerIndex < 0 ||
        q.correctAnswerIndex >= q.options.length
      ) {
        return { error: `يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}` };
      }
    }

    const { lesson } = await verifyTeacherLessonAccess(lessonId);

    const savedQuiz = await prisma.quiz.upsert({
      where: { lessonId },
      update: {
        questions,
        maxScore,
        aiGenerated: false,
      },
      create: {
        lessonId,
        questions,
        maxScore,
        aiGenerated: false,
      },
    });

    revalidatePath("/dashboard/teacher");
    lesson.subjects.forEach((s) => {
      revalidatePath(`/dashboard/student/subjects/${s.id}`);
    });
    revalidatePath(`/dashboard/student/lessons/${lessonId}`);

    return { success: true, data: savedQuiz };
  } catch (error: any) {
    console.error("Error in saveTeacherLessonQuiz:", error);
    return { error: error?.message || "حدث خطأ أثناء حفظ الكويز" };
  }
}

/**
 * Delete a Quiz from a lesson
 */
export async function deleteTeacherLessonQuiz(lessonId: string): Promise<ActionResponse> {
  try {
    const { lesson } = await verifyTeacherLessonAccess(lessonId);

    await prisma.quiz.deleteMany({
      where: { lessonId },
    });

    revalidatePath("/dashboard/teacher");
    lesson.subjects.forEach((s) => {
      revalidatePath(`/dashboard/student/subjects/${s.id}`);
    });
    revalidatePath(`/dashboard/student/lessons/${lessonId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteTeacherLessonQuiz:", error);
    return { error: error?.message || "حدث خطأ أثناء حذف الكويز" };
  }
}
