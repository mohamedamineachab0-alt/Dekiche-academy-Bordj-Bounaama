"use server";

import { prisma } from "@/lib/prisma";
import { getTeacherSession } from "@/lib/teacher";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ensureAcademicMonth } from "@/lib/academic-month";

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

/**
 * Extract 11-char YouTube Video ID from any URL or string
 */
export async function extractYoutubeId(input: string): Promise<string | null> {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

/**
 * Save or update the YouTube video of an existing lesson
 */
export async function saveTeacherLessonVideo(
  lessonId: string,
  youtubeUrlOrId: string
): Promise<ActionResponse> {
  try {
    if (!lessonId) return { error: "معرّف الدرس مطلوب" };
    if (!youtubeUrlOrId?.trim()) return { error: "يرجى إدخال رابط فيديو يوتيوب" };

    const youtubeVideoId = await extractYoutubeId(youtubeUrlOrId);
    if (!youtubeVideoId) {
      return {
        error:
          "رابط يوتيوب غير صالح. يرجى إدخال رابط فيديو يوتيوب صحيح (مثال: https://www.youtube.com/watch?v=... أو https://youtu.be/...)",
      };
    }

    const { lesson } = await verifyTeacherLessonAccess(lessonId);

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        youtubeVideoId,
      },
    });

    const session = await getTeacherSession();
    if (session) {
      try {
        const existingRecord = await prisma.pendingLesson.findFirst({
          where: {
            publishedLessonId: lessonId,
            teacherId: session.user.id,
          },
        });
        if (!existingRecord) {
          await prisma.pendingLesson.create({
            data: {
              title: lesson.title,
              subjectId: lesson.subjects[0]?.id || session.subjectIds[0],
              month: lesson.month,
              level: (lesson.levels && lesson.levels[0]) || "MIDDLE_1",
              vimeoVideoId: "",
              editingNotes: "تم رفع فيديو يوتيوب بواسطة الأستاذ",
              status: "published",
              teacherId: session.user.id,
              publishedLessonId: lesson.id,
            },
          });
        }
      } catch (e) {
        console.error("Non-fatal: could not link pendingLesson:", e);
      }
    }

    revalidatePath("/dashboard/teacher");
    lesson.subjects.forEach((s) => {
      revalidatePath(`/dashboard/student/subjects/${s.id}`);
      revalidatePath(`/dashboard/student/subjects/${s.id}/lessons`);
    });
    revalidatePath(`/dashboard/student/lessons/${lessonId}`);

    return { success: true, data: { youtubeVideoId } };
  } catch (error: any) {
    console.error("Error in saveTeacherLessonVideo:", error);
    return { error: error?.message || "حدث خطأ أثناء حفظ رابط الفيديو" };
  }
}

/**
 * Remove YouTube video from a lesson
 */
export async function removeTeacherLessonVideo(lessonId: string): Promise<ActionResponse> {
  try {
    if (!lessonId) return { error: "معرّف الدرس مطلوب" };
    const { lesson } = await verifyTeacherLessonAccess(lessonId);

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        youtubeVideoId: null,
      },
    });

    revalidatePath("/dashboard/teacher");
    lesson.subjects.forEach((s) => {
      revalidatePath(`/dashboard/student/subjects/${s.id}`);
      revalidatePath(`/dashboard/student/subjects/${s.id}/lessons`);
    });
    revalidatePath(`/dashboard/student/lessons/${lessonId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in removeTeacherLessonVideo:", error);
    return { error: error?.message || "حدث خطأ أثناء حذف رابط الفيديو" };
  }
}

/**
 * Create a new lesson with YouTube video for a subject
 */
export async function createTeacherLessonWithVideo(payload: {
  title: string;
  subjectId: string;
  month: number;
  youtubeUrlOrId: string;
  description?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getTeacherSession();
    if (!session) throw new Error("غير مسجل الدخول كأستاذ");

    if (session.user.role !== "ADMIN" && !session.subjectIds.includes(payload.subjectId)) {
      return { error: "غير مصرح لك بنشر درس في هذه المادة" };
    }

    if (!payload.title?.trim()) {
      return { error: "عنوان الدرس مطلوب" };
    }

    const month = Number(payload.month);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { error: "يرجى تحديد الشهر الدراسي (من 1 إلى 12)" };
    }

    const youtubeVideoId = await extractYoutubeId(payload.youtubeUrlOrId);
    if (!youtubeVideoId) {
      return {
        error:
          "رابط يوتيوب غير صالح. يرجى إدخال رابط فيديو يوتيوب صحيح (مثال: https://www.youtube.com/watch?v=...)",
      };
    }

    const subject = await prisma.subject.findUnique({
      where: { id: payload.subjectId },
      select: { id: true, levels: true, streams: true },
    });

    if (!subject) {
      return { error: "المادة غير موجودة" };
    }

    const academicMonth = await ensureAcademicMonth(month);

    const existingCount = await prisma.lesson.count({
      where: {
        subjects: { some: { id: payload.subjectId } },
        month,
      },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: payload.title.trim(),
        description: payload.description?.trim() || "",
        month,
        academicMonth: { connect: { id: academicMonth.id } },
        vimeoVideoId: "",
        youtubeVideoId,
        order: existingCount + 1,
        levels: subject.levels,
        streams: subject.streams,
        subjects: { connect: { id: payload.subjectId } },
      },
    });

    try {
      await prisma.pendingLesson.create({
        data: {
          title: payload.title.trim(),
          subjectId: payload.subjectId,
          month,
          level: (subject.levels && subject.levels[0]) || "MIDDLE_1",
          vimeoVideoId: "",
          editingNotes: payload.description || "درس منشور برابط يوتيوب",
          status: "published",
          teacherId: session.user.id,
          publishedLessonId: lesson.id,
        },
      });
    } catch (e) {
      console.error("Non-fatal: could not create pendingLesson record:", e);
    }

    revalidatePath("/dashboard/teacher");
    revalidatePath(`/dashboard/student/subjects/${payload.subjectId}`);
    revalidatePath(`/dashboard/student/subjects/${payload.subjectId}/lessons`);

    return { success: true, data: lesson };
  } catch (error: any) {
    console.error("Error in createTeacherLessonWithVideo:", error);
    return { error: error?.message || "حدث خطأ أثناء إنشاء الدرس" };
  }
}
