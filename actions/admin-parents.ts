"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudentsWithParents() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        studentProfile: {
          select: {
            level: true,
            stream: true,
          }
        },
        studentLinks: {
          select: {
            parent: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return students.map(student => ({
      id: student.id,
      fullName: student.fullName,
      level: student.studentProfile?.level,
      stream: student.studentProfile?.stream,
      parent: student.studentLinks.length > 0 ? student.studentLinks[0].parent : null
    }));
  } catch (error) {
    console.error("Error fetching students with parents:", error);
    return [];
  }
}

export async function sendDirectNotification(userId: string, title: string, content: string) {
  try {
    if (!title.trim() || !content.trim()) {
      return { error: "يرجى ملء جميع الحقول" };
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12

    await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        month: currentMonth,
      }
    });

    revalidatePath("/dashboard/admin/parents");
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { error: "حدث خطأ أثناء إرسال الإشعار" };
  }
}
