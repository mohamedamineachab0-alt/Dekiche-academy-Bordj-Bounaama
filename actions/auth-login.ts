"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

export async function universalLoginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  // 1. Validate inputs are present
  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال الاسم الكامل ورقم الهاتف" };
  }

  // 2. Exact match validation against the database
  const user = await prisma.user.findFirst({
    where: {
      fullName: fullName,
      phoneNumber: phoneNumber,
    },
  });

  // 3. Reject if the user does not exist
  if (!user) {
    return { error: "بيانات الدخول غير صحيحة، أو الحساب غير موجود" };
  }

  // 4. Set the HTTP-only session cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // 5. Update last login safely
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

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
