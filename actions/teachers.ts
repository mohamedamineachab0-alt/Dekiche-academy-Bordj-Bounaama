"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

export async function enterTeacherSpaceAction(teacherId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("فقط مدير المنصة مخول بالدخول إلى فضاء الأساتذة");
  }

  const teacher = await prisma.teacher.findFirst({
    where: {
      OR: [{ id: teacherId }, { userId: teacherId }],
    },
    include: { user: true },
  });

  if (!teacher) {
    throw new Error("الأستاذ غير موجود");
  }

  // Ensure user account exists and is linked
  if (!teacher.userId) {
    let teacherUser = await prisma.user.findUnique({
      where: { phoneNumber: teacher.phone },
    });
    if (!teacherUser) {
      teacherUser = await prisma.user.create({
        data: {
          fullName: teacher.name,
          phoneNumber: teacher.phone,
          role: "TEACHER",
          passwordHash: "",
        },
      });
    }
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { userId: teacherUser.id },
    });
  }

  cookieStore.set("impersonate_teacher_id", teacher.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  revalidatePath("/dashboard/teacher");
  redirect("/dashboard/teacher");
}

export async function exitTeacherSpaceAction() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonate_teacher_id");
  revalidatePath("/dashboard/admin/teachers");
  redirect("/dashboard/admin/teachers");
}

