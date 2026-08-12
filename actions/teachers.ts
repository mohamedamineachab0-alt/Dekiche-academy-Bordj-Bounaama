"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeacher(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    
    // subjectIds comes from multiple checkboxes or multi-select
    const subjectIds = formData.getAll("subjectIds") as string[];

    if (!name || !phone) {
      return { error: "يرجى إدخال اسم الأستاذ ورقم الهاتف" };
    }

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (existingUser) {
      return { error: "رقم الهاتف مسجل مسبقاً في النظام" };
    }

    // 1. Create User
    const user = await prisma.user.create({
      data: {
        fullName: name,
        phoneNumber: phone,
        role: "TEACHER",
      }
    });

    // 2. Create Teacher Profile linked to User and Subjects
    await prisma.teacher.create({
      data: {
        userId: user.id,
        name: name,
        phone: phone,
        subjects: {
          connect: subjectIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("createTeacher error:", error);
    return { error: "حدث خطأ غير متوقع أثناء إضافة الأستاذ" };
  }
}
