"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserForLogin } from "@/lib/login-user";
import bcrypt from "bcryptjs";

export type LoginState = {
  error?: string;
};

export async function universalLoginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال الاسم الكامل ورقم الهاتف" };
  }

  const found = await findUserForLogin(fullName, phoneNumber);
  if ("error" in found) {
    return { error: found.error };
  }
  const { user } = found;

  // Removed password check so teachers can log in with just Full Name and Phone Number
  // like students on the standard /login page.
  return await performLogin(user);
}

export async function teacherLoginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!phoneNumber || !password) {
    return { error: "يرجى إدخال رقم الهاتف وكلمة المرور" };
  }

  if (password !== "1809010900") {
    return { error: "كلمة المرور غير صحيحة" };
  }

  // Find the teacher by phone only (they can have multiple variants, so we use findFirst)
  // Actually, we can fetch all teachers and check phone variants like findUserForLogin does.
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
  });

  // Simple check for phone number inclusion
  const teacher = teachers.find(t => 
    t.phoneNumber.replace(/\D/g, '').endsWith(phoneNumber.replace(/\D/g, '').slice(-9))
  );

  if (!teacher) {
    return { error: "لا يوجد حساب أستاذ مسجل بهذا الرقم" };
  }

  return await performLogin(teacher);
}

async function performLogin(user: any): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  try {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "lastLoginAt" = NOW(),
          "loginCount" = COALESCE("loginCount", 0) + 1
      WHERE id = ${user.id}
    `;
  } catch {}

  switch (user.role) {
    case "ADMIN": redirect("/dashboard/admin");
    case "TEACHER": redirect("/dashboard/teacher");
    case "PARENT": redirect("/dashboard/parent");
    default: redirect("/dashboard/student");
  }
}
