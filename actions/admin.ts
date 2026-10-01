"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Level, Stream, Phase } from "@/generated/prisma";

// ─── TEACHER MANAGEMENT ──────────────────────────────────────────────────

export type ActionState = {
  error?: string;
  success?: boolean;
  credentials?: {
    phone: string;
  };
};

export async function createTeacher(
  formData: FormData
): Promise<ActionState> {
  try {
    const fullName = (formData.get("fullName") as string)?.trim();
    const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
    
    const phasesStr = formData.getAll("phases") as string[];
    const levelsStr = formData.getAll("levels") as string[];
    const streamsStr = formData.getAll("streams") as string[];
    
    const phases = phasesStr.map(p => p as Phase);
    const levels = levelsStr.map(l => l as Level);
    const streams = streamsStr.map(s => s as Stream);

    if (!fullName || !phoneNumber || phases.length === 0) {
      return { error: "جميع الحقول المطلوبة يجب ملؤها" };
    }

    // Generate random phone
    const generatedPhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();

    await prisma.user.create({
      data: {
        fullName,
        phoneNumber: generatedPhone,
        passwordHash: "",
        role: "TEACHER",
        teacherProfile: {
          create: {
            name: fullName,
            phone: generatedPhone,
            phases: phases,
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
    return { 
      success: true, 
      credentials: { phone: generatedPhone } 
    };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء إضافة الأستاذ" };
  }
}
