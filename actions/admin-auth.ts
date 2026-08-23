"use server";

import { createSession } from "@/lib/authz";
import { verifyLogin } from "@/lib/login-security";
import { redirect } from "next/navigation";

export type AdminLoginState = { error?: string };
export async function adminLoginAction(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const user = await verifyLogin(String(formData.get("phoneNumber") ?? "").trim(), String(formData.get("password") ?? ""));
  if (!user || user.role !== "ADMIN") return { error: "بيانات الدخول غير صحيحة أو غير مصرح لك بالدخول" };
  await createSession(user.id);
  redirect("/dashboard/admin");
}
