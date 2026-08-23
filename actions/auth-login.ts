"use server";

import { createSession } from "@/lib/authz";
import { verifyLogin } from "@/lib/login-security";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };
const INVALID = "بيانات الدخول غير صحيحة، أو الحساب غير موجود";

export async function universalLoginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!phoneNumber || !password) return { error: INVALID };

  const user = await verifyLogin(phoneNumber, password);
  if (!user) return { error: INVALID };
  await createSession(user.id, formData.get("rememberMe") === "on");

  if (user.role === "ADMIN") redirect("/dashboard/admin");
  if (user.role === "TEACHER") redirect("/dashboard/teacher");
  if (user.role === "PARENT") redirect("/dashboard/parent");
  redirect("/dashboard/student");
}
