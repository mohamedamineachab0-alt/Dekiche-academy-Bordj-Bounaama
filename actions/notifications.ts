"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Level, Stream } from "@/generated/prisma";

export async function createNotification(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const levelStr = formData.get("level") as string;
    const streamStr = formData.get("stream") as string;
    const subjectIdStr = formData.get("subjectId") as string;
    const monthStr = formData.get("month") as string;

    if (!title || !content) {
      return { error: "يرجى ملء العنوان ونص الإشعار" };
    }

    const level = levelStr ? (levelStr as Level) : null;
    const stream = streamStr ? (streamStr as Stream) : null;
    const subjectId = subjectIdStr || null;
    const month = monthStr ? parseInt(monthStr) : 1; // Default to 1 if missing, since it's required

    await prisma.notification.create({
      data: {
        title,
        content,
        level,
        stream,
        subjectId,
        month,
      }
    });

    revalidatePath("/dashboard/admin/notifications");
    revalidatePath("/dashboard/student/notifications");
    revalidatePath("/dashboard/student");
    
    return { success: true };
  } catch (error: any) {
    console.error("createNotification error:", error);
    return { error: "حدث خطأ أثناء إرسال الإشعار" };
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id }
    });

    revalidatePath("/dashboard/admin/notifications");
    revalidatePath("/dashboard/student/notifications");

    return { success: true };
  } catch (error: any) {
    console.error("deleteNotification error:", error);
    return { error: "حدث خطأ أثناء حذف الإشعار" };
  }
}
