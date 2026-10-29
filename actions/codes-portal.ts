"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { phoneVariants } from "@/lib/login-match";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export type PortalLoginState = {
  error?: string;
  success?: boolean;
};

export async function loginCodesPortal(
  prevState: PortalLoginState,
  formData: FormData
): Promise<PortalLoginState> {
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  if (!phoneNumber) {
    return { error: "يرجى إدخال رقم الهاتف" };
  }

  const phones = phoneVariants(phoneNumber);
  if (phones.length === 0) {
    return { error: "رقم الهاتف غير صحيح" };
  }

  // Check designated codes manager credentials: 0663438000 or 0562388099 (Said Bicha)
  const designatedManagers = ["0663438000", "0562388099"];
  const isDesignatedManager = phones.some((p) => designatedManagers.includes(p));

  let user = await prisma.user.findFirst({
    where: { phoneNumber: { in: phones } },
  });

  if (isDesignatedManager) {
    const isSaidBicha = phones.includes("0562388099");
    const managerName = isSaidBicha ? "سعيد بيشة" : "مسؤول استخراج الرموز";
    const managerPhone = isSaidBicha ? "0562388099" : "0663438000";
    const managerRole = isSaidBicha ? "EMPLOYEE" : "ADMIN";

    if (!user) {
      const hash = await bcrypt.hash("200600", 10);
      user = await prisma.user.create({
        data: {
          fullName: managerName,
          phoneNumber: managerPhone,
          passwordHash: hash,
          role: managerRole,
        },
      });
    } else if (isSaidBicha && user.role !== "EMPLOYEE") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "EMPLOYEE", fullName: user.fullName || managerName },
      });
    } else if (!isSaidBicha && user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN", fullName: user.fullName || managerName },
      });
    }
  } else {
    if (!user || (user.role !== "ADMIN" && user.role !== "EMPLOYEE")) {
      return { error: "الحساب غير موجود أو غير مصرح له بالدخول" };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  } catch {
    // Non-blocking
  }

  return { success: true };
}

export async function logoutCodesPortal() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/codes");
}

export async function generatePortalCodes(params: {
  subjectIds: string[];
  accessType: "MONTHLY" | "YEARLY";
  validMonths: number[];
  count: number;
}) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    if (!sessionId) {
      return { error: "غير مصرح" };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "EMPLOYEE")) {
      return { error: "غير مصرح لك بتوليد الرموز" };
    }

    const { subjectIds, accessType, count } = params;
    if (!subjectIds || subjectIds.length === 0 || count < 1) {
      return { error: "يرجى تحديد المواد وعدد الرموز" };
    }

    const resolvedMonths = [
      ...new Set(
        accessType === "YEARLY"
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          : params.validMonths.length > 0
          ? params.validMonths
          : [1]
      ),
    ].sort((a, b) => a - b);

    // Get or create academic month
    let academicMonth = await prisma.month.findUnique({
      where: { number: 1 },
    });
    if (!academicMonth) {
      academicMonth = await prisma.month.create({
        data: {
          number: 1,
          title: "الشهر 1",
        },
      });
    }

    const generateCode = () => {
      const part1 = Math.floor(10000000 + Math.random() * 90000000).toString();
      const part2 = Math.floor(1000 + Math.random() * 9000).toString();
      return `${part1}-${part2}`;
    };

    const newCodes: Array<{
      code: string;
      subjectId: string;
      accessType: string;
      validMonths: number[];
      monthId: string;
    }> = [];

    for (const sid of subjectIds) {
      for (let i = 0; i < count; i++) {
        newCodes.push({
          code: generateCode(),
          subjectId: sid,
          accessType,
          validMonths: resolvedMonths,
          monthId: academicMonth.id,
        });
      }
    }

    await prisma.accessCode.createMany({
      data: newCodes,
      skipDuplicates: true,
    });

    revalidatePath("/codes");
    revalidatePath("/dashboard/admin/codes");

    return { success: true, count: newCodes.length, codes: newCodes };
  } catch (err: any) {
    console.error("Code generation error:", err);
    return { error: "حدث خطأ أثناء توليد الرموز" };
  }
}

export async function extract100CodesForSubject(
  subjectId: string,
  month: number | "YEARLY" = 1,
  count: number = 100
) {
  try {
    const limit = Math.min(Math.max(count || 100, 1), 1000);
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    if (!sessionId) {
      return { error: "غير مصرح" };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "EMPLOYEE")) {
      return { error: "غير مصرح لك باستخراج الرموز" };
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, title: true, teacherName: true, levels: true, streams: true },
    });

    if (!subject) {
      return { error: "المادة غير موجودة" };
    }

    const isYearly = month === "YEARLY" || month === 0;
    const targetMonthNum = isYearly ? 1 : Math.max(1, Math.min(Number(month) || 1, 12));
    const targetValidMonths = isYearly
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      : [targetMonthNum];
    const accessType = isYearly ? "YEARLY" : "MONTHLY";

    // 1. Fetch available unused codes matching this month & subject
    let existingCodes = await prisma.accessCode.findMany({
      where: {
        subjectId,
        isUsed: false,
        ...(isYearly
          ? { accessType: "YEARLY" }
          : {
              validMonths: { has: targetMonthNum },
            }),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, code: true, accessType: true, validMonths: true, createdAt: true },
    });

    // 2. If we have less than needed, generate the difference
    const needed = limit - existingCodes.length;
    if (needed > 0) {
      let academicMonth = await prisma.month.findUnique({ where: { number: targetMonthNum } });
      if (!academicMonth) {
        academicMonth = await prisma.month.create({
          data: { number: targetMonthNum, title: `الشهر ${targetMonthNum}` },
        });
      }

      const generateCode = () => {
        const part1 = Math.floor(10000000 + Math.random() * 90000000).toString();
        const part2 = Math.floor(1000 + Math.random() * 9000).toString();
        return `${part1}-${part2}`;
      };

      const newCodes: Array<{
        code: string;
        subjectId: string;
        accessType: string;
        validMonths: number[];
        monthId: string;
      }> = [];

      for (let i = 0; i < needed; i++) {
        newCodes.push({
          code: generateCode(),
          subjectId,
          accessType,
          validMonths: targetValidMonths,
          monthId: academicMonth.id,
        });
      }

      await prisma.accessCode.createMany({
        data: newCodes,
        skipDuplicates: true,
      });

      // Refetch full list
      existingCodes = await prisma.accessCode.findMany({
        where: {
          subjectId,
          isUsed: false,
          ...(isYearly
            ? { accessType: "YEARLY" }
            : {
                validMonths: { has: targetMonthNum },
              }),
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, code: true, accessType: true, validMonths: true, createdAt: true },
      });
    }

    return {
      success: true,
      subject,
      month: isYearly ? "سنوي" : `الشهر ${targetMonthNum}`,
      monthNumber: isYearly ? "YEARLY" : targetMonthNum,
      codes: existingCodes.map((c) => ({
        id: c.id,
        code: c.code,
        accessType: c.accessType,
        validMonths: c.validMonths,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (err: any) {
    console.error("Extraction error:", err);
    return { error: "حدث خطأ أثناء استخراج الرموز" };
  }
}

