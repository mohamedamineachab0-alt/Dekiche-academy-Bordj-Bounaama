"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/authz";
import { verifyLogin } from "@/lib/login-security";
import { redirect } from "next/navigation";
import { Level, Stream, Phase } from "@/generated/prisma";

export type RegisterState = { error?: string; success?: boolean };
export type LoginState = { error?: string; success?: boolean };

function validPassword(password: string) {
  return password.length >= 12 && /[a-z]/i.test(password) && /\d/.test(password);
}

export async function registerUser(formData: FormData): Promise<RegisterState> {
  const requestedRole = String(formData.get("role") ?? "STUDENT");
  const role = requestedRole === "PARENT" ? "PARENT" : "STUDENT";
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!fullName || !phoneNumber || !validPassword(password)) return { error: "كلمة المرور يجب أن تحتوي على 12 حرفاً وأرقاماً" };
  if (await prisma.user.findUnique({ where: { phoneNumber } })) return { error: "رقم الهاتف مسجل مسبقا جرب تسجيل الدخول" };

  const passwordHash = await bcrypt.hash(password, 12);
  if (role === "PARENT") {
    const user = await prisma.user.create({ data: { fullName, phoneNumber, passwordHash, role, parentProfile: { create: {} } } });
    await createSession(user.id);
    redirect("/dashboard/parent");
  }

  const phase = String(formData.get("phase") ?? "");
  const level = String(formData.get("level") ?? "");
  const stream = String(formData.get("stream") ?? "NONE");
  if (!Object.values(Phase).includes(phase as Phase) || !Object.values(Level).includes(level as Level) || !Object.values(Stream).includes(stream as Stream)) return { error: "البيانات التعليمية غير صالحة" };
  const user = await prisma.user.create({ data: { fullName, phoneNumber, passwordHash, role: "STUDENT", studentProfile: { create: { parentName: "غير محدد", parentPhone: "غير محدد", phase: phase as Phase, level: level as Level, stream: stream as Stream, wilaya: "W16" } } } });
  await createSession(user.id);
  redirect("/dashboard/student");
}

export async function loginUser(formData: FormData): Promise<LoginState> {
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = phoneNumber && password ? await verifyLogin(phoneNumber, password) : null;
  if (!user) return { error: "بيانات الدخول غير صحيحة، أو الحساب غير موجود" };
  await createSession(user.id, formData.get("rememberMe") === "on");
  return { success: true };
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
