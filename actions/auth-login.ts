"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserForLogin } from "@/lib/login-user";

export type LoginState = {
  error?: string;
};

export async function universalLoginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال الاسم الكامل ورقم الهاتف" };
  }

  const found = await findUserForLogin(fullName, phoneNumber);
  if ("error" in found) {
    return { error: found.error };
  }
  const { user } = found;

  // 4. Set the HTTP-only session cookie
  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  try {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "lastLoginAt" = NOW(),
          "loginCount" = COALESCE("loginCount", 0) + 1
      WHERE id = ${user.id}
    `;
  } catch {
    // Login must still succeed if analytics columns are missing.
  }

  // 6. Dynamic Role-based Redirect
  switch (user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
      break;
    case "TEACHER":
      redirect("/dashboard/teacher");
      break;
    case "STUDENT":
      redirect("/dashboard/student");
      break;
    case "PARENT":
      redirect("/dashboard/parent");
      break;
    default:
      redirect("/dashboard/student"); // Fallback route
  }
}
