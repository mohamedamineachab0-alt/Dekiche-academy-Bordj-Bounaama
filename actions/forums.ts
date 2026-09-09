"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Level, Stream, Phase } from "@/generated/prisma";
import { getTeacherSession } from "@/lib/teacher";

export async function createForum(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const subjectId = formData.get("subjectId") as string;
    const phase = formData.get("phase") as Phase;
    const level = formData.get("level") as Level;
    const stream = formData.get("stream") as Stream;
    const monthStr = formData.get("month") as string;

    if (!title || !subjectId || !phase || !level || !stream || !monthStr) {
      return { error: "يرجى ملء جميع الحقول الإلزامية" };
    }

    const month = parseInt(monthStr, 10);
    if (isNaN(month)) return { error: "الشهر يجب أن يكون رقماً" };

    await prisma.classForum.create({
      data: {
        title,
        subjectId,
        phase,
        level,
        stream,
        month,
        isOpen: true,
      }
    });

    revalidatePath("/dashboard/admin/forums");
    revalidatePath("/dashboard/teacher/forums");
    revalidatePath("/dashboard/student/forums");
    
    return { success: true };
  } catch (error: any) {
    console.error("createForum error:", error);
    return { error: "حدث خطأ أثناء إنشاء المنتدى" };
  }
}

export async function createTeacherForum(formData: FormData) {
  const session = await getTeacherSession();
  if (!session) return { error: "غير مصرح" };

  const subjectId = formData.get("subjectId") as string;
  if (!session.subjectIds.includes(subjectId)) {
    return { error: "هذه المادة ليست مسندة إليك" };
  }

  return createForum(formData);
}

export async function toggleForumStatus(forumId: string, isOpen: boolean) {
  try {
    await prisma.classForum.update({
      where: { id: forumId },
      data: { isOpen }
    });
    
    revalidatePath("/dashboard/admin/forums");
    revalidatePath("/dashboard/teacher/forums");
    revalidatePath(`/dashboard/teacher/forums/${forumId}`);
    revalidatePath(`/dashboard/student/forums/${forumId}`);
    return { success: true };
  } catch (error) {
    console.error("toggleForumStatus error:", error);
    return { error: "حدث خطأ أثناء تحديث حالة المنتدى" };
  }
}

export async function toggleTeacherForumStatus(forumId: string, isOpen: boolean) {
  const session = await getTeacherSession();
  if (!session) return { error: "غير مصرح" };

  const forum = await prisma.classForum.findUnique({
    where: { id: forumId },
    select: { subjectId: true },
  });
  if (!forum || !session.subjectIds.includes(forum.subjectId)) {
    return { error: "غير مصرح" };
  }

  return toggleForumStatus(forumId, isOpen);
}

export async function getAdminForums() {
  try {
    return await prisma.classForum.findMany({
      include: {
        subject: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("getAdminForums error:", error);
    return [];
  }
}

export async function getStudentForums(phase: Phase, level: Level, stream: Stream) {
  try {
    return await prisma.classForum.findMany({
      where: {
        phase,
        level,
        stream
      },
      include: {
        subject: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: [
        { month: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  } catch (error) {
    console.error("getStudentForums error:", error);
    return [];
  }
}

export async function sendForumMessage(forumId: string, userId: string, content: string) {
  try {
    if (!content.trim()) return { error: "لا يمكن إرسال رسالة فارغة" };

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    if (!sessionId || sessionId !== userId) return { error: "غير مصرح" };

    const forum = await prisma.classForum.findUnique({
      where: { id: forumId },
      select: { isOpen: true, subjectId: true }
    });

    if (!forum) return { error: "المنتدى غير موجود" };

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true }
    });

    if (user?.role === "STUDENT") {
      if (!forum.isOpen) {
        return { error: "الدردشة مغلقة. يكتب الأستاذ فقط." };
      }
      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: sessionId, subjectId: forum.subjectId }
      });
      if (!enrollment) {
        return { error: "ليس لديك اشتراك في هذه المادة" };
      }
    } else if (user?.role === "TEACHER") {
      const teacher = await getTeacherSession();
      if (!teacher || !teacher.subjectIds.includes(forum.subjectId)) {
        return { error: "غير مصرح" };
      }
    } else if (user?.role !== "ADMIN") {
      return { error: "غير مصرح" };
    }

    await prisma.forumMessage.create({
      data: {
        forumId,
        userId: sessionId,
        content
      }
    });

    revalidatePath(`/dashboard/student/forums/${forumId}`);
    revalidatePath(`/dashboard/teacher/forums/${forumId}`);
    return { success: true };
  } catch (error) {
    console.error("sendForumMessage error:", error);
    return { error: "حدث خطأ أثناء إرسال الرسالة" };
  }
}

export async function getForumMessages(forumId: string) {
  try {
    return await prisma.forumMessage.findMany({
      where: { forumId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  } catch (error) {
    console.error("getForumMessages error:", error);
    return [];
  }
}

export async function getForumDetails(forumId: string) {
  try {
    return await prisma.classForum.findUnique({
      where: { id: forumId },
      include: {
        subject: true
      }
    });
  } catch (error) {
    console.error("getForumDetails error:", error);
    return null;
  }
}
