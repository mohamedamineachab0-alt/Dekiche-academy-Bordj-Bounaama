"use server";

import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Level, Stream, Wilaya, Phase } from "@/generated/prisma";
  
// ─── REGISTER ──────────────────────────────────────────────────────────────

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerUser(
  formData: FormData
): Promise<any> {
  const role        = (formData.get("role")        as string)?.trim() || "STUDENT";
  const fullName    = (formData.get("fullName")    as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  
  if (!fullName || !phoneNumber) {
    return { error: "جميع الحقول مطلوبة" };
  }

  const isSuperAdmin = phoneNumber === "0562388085";

  const existing = await prisma.user.findUnique({ where: { phoneNumber } });
  if (existing) return { error: "رقم الهاتف مسجل مسبقا جرب تسجيل الدخول" };

  const passwordHash = "";

  if (role === "PARENT") {
    const user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        passwordHash,
        role: isSuperAdmin ? "ADMIN" : "PARENT",
        parentProfile: {
          create: {},
        },
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (isSuperAdmin) {
      redirect("/dashboard/admin");
    } else {
      redirect("/dashboard/parent");
    }
  } else {
    // STUDENT ROLE
    const phase       = formData.get("phase")       as string;
    const level       = formData.get("level")       as string;
    const stream      = formData.get("stream")      as string || "NONE";
    const parentName  = "غير محدد";
    const parentPhone = "غير محدد";

    if (!phase || !level) {
      return { error: "جميع الحقول مطلوبة" };
    }

    if (!Object.values(Phase).includes(phase as Phase))   return { error: "الطور غير صالح" };
    if (!Object.values(Level).includes(level as Level))   return { error: "المستوى غير صالح" };
    if (!Object.values(Stream).includes(stream as Stream)) return { error: "الشعبة غير صالحة" };

    const user = await prisma.user.create({
      data: {
        fullName,
        phoneNumber,
        passwordHash,
        role: isSuperAdmin ? "ADMIN" : "STUDENT",
        studentProfile: {
          create: {
            parentName,
            parentPhone,
            phase: phase as Phase,
            level: level as Level,
            stream: stream as Stream,
            wilaya: "W16",
          },
        },
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (isSuperAdmin) {
      redirect("/dashboard/admin");
    } else {
      redirect("/dashboard/student");
    }
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function loginUser(
  formData: FormData
): Promise<any> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  
  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال اسمك الكامل ورقم الهاتف" };
  }

  let user = await prisma.user.findFirst({
    where: {
      phoneNumber: phoneNumber
    }
  });

  const isSuperAdmin = phoneNumber === "0562388085";

  if (!user) {
    return { error: "بيانات الدخول غير صحيحة، أو الحساب غير موجود" };
  } else if (user.fullName !== fullName) {
    return { error: "بيانات الدخول غير صحيحة، أو الحساب غير موجود" };
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown Device";
  const fingerprints = new Set(user.deviceFingerprints || []);
  fingerprints.add(userAgent);

  // Session handling
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      lastLoginAt: new Date(),
      deviceFingerprints: Array.from(fingerprints),
      ...(isSuperAdmin ? { role: "ADMIN" } : {})
    },
  });

  const rememberMe = formData.get("rememberMe") === "on";

  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}), // 30 days if remembered, otherwise session cookie
  });

  const finalRole = isSuperAdmin ? "ADMIN" : user.role;

  // Role-based redirect
  if (finalRole === "ADMIN")   redirect("/dashboard/admin");
  if (finalRole === "TEACHER") redirect("/dashboard/teacher");
  if (finalRole === "PARENT")  redirect("/dashboard/parent");
  redirect("/dashboard/student");
}

// ─── LOGOUT ────────────────────────────────────────────────────────────────
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
