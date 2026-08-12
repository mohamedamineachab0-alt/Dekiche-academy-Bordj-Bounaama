"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLiveClass(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const zoomLink = formData.get("zoomLink") as string;
    const subjectId = formData.get("subjectId") as string;
    const dateStr = formData.get("date") as string;
    const month = parseInt(formData.get("month") as string);

    if (!title || !zoomLink || !subjectId || !dateStr || isNaN(month)) {
      return { error: "يرجى ملء جميع الحقول المطلوبة برمجة الحصة" };
    }

    const date = new Date(dateStr);

    await prisma.liveClass.create({
      data: {
        title,
        zoomLink,
        subjectId,
        date,
        month,
      }
    });

    revalidatePath("/dashboard/admin/live");
    revalidatePath("/dashboard/teacher/live");
    
    return { success: true };
  } catch (error: any) {
    console.error("createLiveClass error:", error);
    return { error: "حدث خطأ أثناء برمجة الحصة" };
  }
}

export async function deleteLiveClass(id: string) {
  try {
    await prisma.liveClass.delete({
      where: { id }
    });

    revalidatePath("/dashboard/admin/live");
    revalidatePath("/dashboard/teacher/live");

    return { success: true };
  } catch (error: any) {
    console.error("deleteLiveClass error:", error);
    return { error: "حدث خطأ أثناء حذف الحصة" };
  }
}
