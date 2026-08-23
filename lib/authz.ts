import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

const SESSION_COOKIE = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, rememberMe = false) {
  const token = randomBytes(32).toString("base64url");
  const ttl = rememberMe ? 60 * 60 * 24 * 30 : SESSION_TTL_SECONDS;

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + ttl * 1000) },
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

export async function requireUser(roles?: Role[]) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new Error("UNAUTHENTICATED");

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, role: true, fullName: true, avatarUrl: true } } },
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    throw new Error("UNAUTHENTICATED");
  }
  if (roles && !roles.includes(session.user.role)) throw new Error("FORBIDDEN");
  return session.user;
}

export async function requireSubjectEnrollment(subjectId: string) {
  const user = await requireUser(["STUDENT"]);
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_subjectId: { studentId: user.id, subjectId } },
  });
  if (!enrollment) throw new Error("NOT_FOUND");
  return { user, enrollment };
}

export async function requireTeacherSubject(subjectId: string) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  if (user.role === "ADMIN") return user;
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, teacher: { userId: user.id } }, select: { id: true } });
  if (!subject) throw new Error("NOT_FOUND");
  return user;
}
