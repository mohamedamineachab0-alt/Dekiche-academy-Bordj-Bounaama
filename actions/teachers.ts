"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Phase, Level, Stream } from "@/generated/prisma";

export type AddTeacherData = {
  fullName: string;
  phoneNumber: string;
  phases: Phase[];
  levels: Level[];
  streams: Stream[];
};

export async function addTeacherAction(data: AddTeacherData) {
  try {
    if (!data.fullName || !data.phoneNumber) {
      return { error: "يرجى إدخال اسم الأستاذ ورقم الهاتف" };
    }

    // Check if phone already exists to avoid unique constraint violation
    const existingUser = await prisma.user.findUnique({ 
      where: { phoneNumber: data.phoneNumber } 
    });
    
    if (existingUser) {
      return { error: "رقم الهاتف مسجل مسبقاً في النظام" };
    }

    // Use Prisma $transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Create User (This ensures login compatibility directly via Phone + Name)
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          role: "TEACHER",
          passwordHash: "", // Defaults to empty string, compatible with basic name/phone login
        }
      });

      // 2. Create Teacher Profile linked to the User
      await tx.teacher.create({
        data: {
          userId: user.id,
          name: data.fullName,
          phone: data.phoneNumber,
          phases: data.phases,
          levels: data.levels,
          streams: data.streams,
        }
      });
    });

    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("addTeacherAction error:", error);
    return { error: "حدث خطأ غير متوقع أثناء إضافة الأستاذ" };
  }
}
