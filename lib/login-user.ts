import { prisma } from "@/lib/prisma";
import { namesMatch, phoneVariants } from "@/lib/login-match";

export async function findUserForLogin(fullName: string, phoneNumber: string) {
  const phones = phoneVariants(phoneNumber);
  if (phones.length === 0) {
    return { error: "يرجى إدخال رقم هاتف صحيح" as const };
  }

  const byPhone = await prisma.user.findMany({
    where: { phoneNumber: { in: phones } },
  });

  if (byPhone.length === 1) {
    return { user: byPhone[0] };
  }

  const matched = byPhone.find((user) => namesMatch(user.fullName, fullName));
  if (matched) return { user: matched };

  if (byPhone.length > 0) {
    return { user: byPhone[0] };
  }

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
  });
  const teacher = teachers.find(
    (user) =>
      namesMatch(user.fullName, fullName) ||
      phoneVariants(user.phoneNumber).some((phone) => phones.includes(phone))
  );
  if (teacher) return { user: teacher };

  return { error: "الحساب غير موجود بهذا الرقم" as const };
}
