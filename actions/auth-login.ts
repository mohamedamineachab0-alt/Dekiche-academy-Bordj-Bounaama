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

  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const isSuperAdmin =
    cleanPhone.endsWith("562388085") ||
    cleanPhone.endsWith("5623388085") ||
    phoneNumber.includes("0562388085");

  if (isSuperAdmin) {
    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: "0562388085" },
          { phoneNumber: "05623388085" },
          { phoneNumber: { contains: "562388085" } },
        ],
      },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          fullName: fullName || "amine",
          phoneNumber: "0562388085",
          passwordHash: "",
          role: "ADMIN",
        },
      });
    } else if (adminUser.role !== "ADMIN") {
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: "ADMIN" },
      });
    }

    return await performLogin(adminUser);
  }

  const found = await findUserForLogin(fullName, phoneNumber);
  if ("error" in found) {
    return { error: found.error };
  }
  const { user } = found;

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

  // Find teacher or admin by phone
  const staff = await prisma.user.findMany({
    where: { role: { in: ["TEACHER", "ADMIN"] } },
  });

  // Simple check for phone number inclusion
  const staffUser = staff.find(t => 
    t.phoneNumber.replace(/\D/g, '').endsWith(phoneNumber.replace(/\D/g, '').slice(-9))
  );

  if (!staffUser) {
    return { error: "لا يوجد حساب مسجل بهذا الرقم" };
  }

  // If logging in via teacher portal, direct to teacher dashboard
  if (staffUser.role === "ADMIN") {
    const cookieStore = await cookies();
    cookieStore.set("session", staffUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/dashboard/teacher");
  }

  return await performLogin(staffUser);
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
