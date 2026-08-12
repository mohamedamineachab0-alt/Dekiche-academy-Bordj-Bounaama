"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function linkStudentToParent(formData: FormData) {
  try {
    const parentCode = formData.get("parentCode") as string;
    
    if (!parentCode) {
      return { error: "يرجى إدخال الرمز السري" };
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { error: "غير مصرح لك" };
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { parentCode }
    });

    if (!studentProfile) {
      return { error: "الرمز السري غير صحيح" };
    }

    // Check if link already exists
    const existingLink = await prisma.parentStudentLink.findUnique({
      where: {
        parentId_studentId: {
          parentId: sessionId,
          studentId: studentProfile.userId
        }
      }
    });

    if (existingLink) {
      return { error: "هذا الحساب مربوط مسبقاً بك" };
    }

    await prisma.parentStudentLink.create({
      data: {
        parentId: sessionId,
        studentId: studentProfile.userId
      }
    });

    revalidatePath("/dashboard/parent");
    
    return { success: true };
  } catch (error: any) {
    console.error("linkStudentToParent error:", error);
    return { error: "حدث خطأ أثناء ربط الحساب" };
  }
}

export async function getLinkedChildren(parentId: string) {
  try {
    const parentLinks = await prisma.parentStudentLink.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            lastLoginAt: true,
            studentProfile: true,
            enrollments: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });
    return parentLinks.map(link => link.student);
  } catch (error) {
    console.error("Error fetching linked children:", error);
    return [];
  }
}

export async function submitParentTicket(parentId: string, subject: string, message: string) {
  try {
    if (!subject.trim() || !message.trim()) {
      return { error: "يرجى ملء جميع الحقول" };
    }

    await prisma.parentTicket.create({
      data: {
        parentId,
        subject,
        message,
      }
    });
    
    revalidatePath("/dashboard/parent");
    return { success: true };
  } catch (error) {
    console.error("Error submitting parent ticket:", error);
    return { error: "حدث خطأ أثناء إرسال الرسالة" };
  }
}
