"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Level, Stream } from "@/generated/prisma";

export async function updateStudentProfile(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { success: false, error: "غير مصرح لك بإجراء هذا التعديل." };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: {
        studentProfile: true,
        parentLinks: true,
      }
    });

    if (!user) {
      return { success: false, error: "المستخدم غير موجود." };
    }

    const targetStudentId = formData.get("studentId") as string;
    
    // Ensure authorization
    if (user.role === "STUDENT" && user.id !== targetStudentId) {
       return { success: false, error: "غير مصرح لك بتعديل هذا الحساب." };
    }
    
    if (user.role === "PARENT") {
       const isChild = user.parentLinks?.some(c => c.studentId === targetStudentId);
       if (!isChild) {
           return { success: false, error: "هذا التلميذ غير مرتبط بحسابك." };
       }
    }

    const fullName = formData.get("fullName") as string;
    const level = (formData.get("level") as string) as Level;
    const stream = (formData.get("stream") as string) as Stream;

    if (!fullName || !level) {
      return { success: false, error: "جميع الحقول مطلوبة." };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetStudentId },
        data: { fullName }
      }),
      prisma.studentProfile.update({
        where: { userId: targetStudentId },
        data: { 
          level,
          stream: stream || "NONE"
        }
      })
    ]);

    revalidatePath("/dashboard/student/settings");
    revalidatePath("/dashboard/parent/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating student profile:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ التعديلات." };
  }
}
