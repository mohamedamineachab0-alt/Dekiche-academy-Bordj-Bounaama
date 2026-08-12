"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Level, Stream } from "@/generated/prisma";

// ─── TEACHER MANAGEMENT ──────────────────────────────────────────────────

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createTeacher(
  formData: FormData
): Promise<ActionState> {
  try {
    const fullName = (formData.get("fullName") as string)?.trim();
    const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
    const password = formData.get("password") as string;
    
    // In a real app we'd parse arrays of levels/streams, but for formData we'll get single or we can expect JSON
    const levelsStr = formData.getAll("levels") as string[];
    const streamsStr = formData.getAll("streams") as string[];
    
    const levels = levelsStr.map(l => l as Level);
    const streams = streamsStr.map(s => s as Stream);

    if (!fullName || !phoneNumber || !password) {
      return { error: "جميع الحقول المطلوبة يجب ملؤها" };
    }

    if (password.length < 6) {
      return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
    }

    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingUser) {
      return { error: "رقم الهاتف مسجل مسبقاً" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        passwordHash,
        role: "TEACHER",
        teacherProfile: {
          create: {
            name: fullName,
            phone: phoneNumber,
            levels: levels,
            streams: streams,
            subjects: {
              connect: formData.getAll("subjectIds").map(id => ({ id: id as string }))
            }
          },
        },
      },
    });

    revalidatePath("/dashboard/admin/teachers");
    return { success: true };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء إضافة الأستاذ" };
  }
}
