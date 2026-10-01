"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function generateAccessCodes(data: FormData) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return { error: "غير مصرح" };

  const admin = await prisma.user.findUnique({ where: { id: sessionId, role: "ADMIN" } });
  if (!admin) return { error: "غير مصرح" };

  const subjectId = data.get("subjectId") as string;
  const month = parseInt(data.get("month") as string);
  const count = parseInt(data.get("count") as string);

  if (!subjectId || isNaN(month) || isNaN(count) || count < 1 || count > 500) {
    return { error: "بيانات غير صالحة" };
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return { error: "المادة غير موجودة" };

  const prefix = subject.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SUB');

  const codesToCreate = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 8-character string
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const codeStr = `${prefix}-${month}-${randomPart}`;
    
    codesToCreate.push({
      code: codeStr,
      accessType: "MONTHLY",
      validMonths: [month],
      subjectId: subjectId,
      isUsed: false,
    });
  }

  await prisma.accessCode.createMany({
    data: codesToCreate,
    skipDuplicates: true,
  });

  revalidatePath("/dashboard/admin/codes");
  
  return { success: true, count: codesToCreate.length };
}
