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

  // Check designated codes manager credentials: 0663438000
  const isDesignatedManager = phones.includes("0663438000");

  let user = await prisma.user.findFirst({
    where: { phoneNumber: { in: phones } },
  });

  if (isDesignatedManager) {
    if (!user) {
      const hash = await bcrypt.hash("200600", 10);
      user = await prisma.user.create({
        data: {
          fullName: "مسؤول استخراج الرموز",
          phoneNumber: "0663438000",
          passwordHash: hash,
          role: "ADMIN",
        },
      });
    } else if (user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }
  } else {
    if (!user || user.role !== "ADMIN") {
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

    if (!user || user.role !== "ADMIN") {
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
