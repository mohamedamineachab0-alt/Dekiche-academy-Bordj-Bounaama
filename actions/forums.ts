"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Level, Stream } from "@/generated/prisma";

export async function createForum(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const subjectId = formData.get("subjectId") as string;
    const level = formData.get("level") as Level;
    const stream = formData.get("stream") as Stream;
    const monthStr = formData.get("month") as string;

    if (!title || !subjectId || !level || !stream || !monthStr) {
      return { error: "يرجى ملء جميع الحقول الإلزامية" };
    }

    const month = parseInt(monthStr, 10);
    if (isNaN(month)) return { error: "الشهر يجب أن يكون رقماً" };

    await prisma.classForum.create({
      data: {
        title,
        subjectId,
        level,
        stream,
        month,
        isOpen: true,
      }
    });

    revalidatePath("/dashboard/admin/forums");
    revalidatePath("/dashboard/student/forums");
    
    return { success: true };
  } catch (error: any) {
    console.error("createForum error:", error);
    return { error: "حدث خطأ أثناء إنشاء المنتدى" };
  }
}

export async function toggleForumStatus(forumId: string, isOpen: boolean) {
  try {
    await prisma.classForum.update({
      where: { id: forumId },
      data: { isOpen }
    });
    
    revalidatePath("/dashboard/admin/forums");
    revalidatePath(`/dashboard/student/forums/${forumId}`);
    return { success: true };
  } catch (error) {
    console.error("toggleForumStatus error:", error);
    return { error: "حدث خطأ أثناء تحديث حالة المنتدى" };
  }
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

export async function getStudentForums(level: Level, stream: Stream) {
  try {
    return await prisma.classForum.findMany({
      where: {
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

    const forum = await prisma.classForum.findUnique({
      where: { id: forumId },
      select: { isOpen: true, subjectId: true }
    });

    if (!forum) return { error: "المنتدى غير موجود" };
    if (!forum.isOpen) return { error: "هذا المنتدى مغلق من قبل الإدارة ولا يقبل رسائل جديدة" };

    // Security: Verify user is enrolled in this forum's subject
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Admins and teachers bypass enrollment check
    if (user?.role === "STUDENT") {
      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: userId, subjectId: forum.subjectId }
      });
      if (!enrollment) {
        return { error: "ليس لديك اشتراك في هذه المادة" };
      }
    }

    await prisma.forumMessage.create({
      data: {
        forumId,
        userId,
        content
      }
    });

    revalidatePath(`/dashboard/student/forums/${forumId}`);
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
