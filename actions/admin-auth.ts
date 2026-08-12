"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminLoginState = {
  error?: string;
};

export async function adminLoginAction(
  prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  // 1. Validate inputs are present
  if (!fullName || !phoneNumber) {
    return { error: "يرجى إدخال الاسم الكامل ورقم الهاتف" };
  }

  // 2. Strict exact-match validation against the database
  const user = await prisma.user.findFirst({
    where: {
      fullName: fullName,
      phoneNumber: phoneNumber,
      role: "ADMIN", // Ensuring only admins can access this route
    },
  });

  // 3. Reject if the user does not exist or credentials don't match
  if (!user) {
    return { error: "بيانات الدخول غير صحيحة أو غير مصرح لك بالدخول" };
  }

  // 4. Set the HTTP-only session cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // 5. Redirect on success
  redirect("/dashboard/admin");
}
