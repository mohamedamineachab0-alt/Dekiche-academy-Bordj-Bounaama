import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

type MonthClient = Prisma.TransactionClient | typeof prisma;

export async function ensureAcademicMonth(number: number, db: MonthClient = prisma) {
  const safeNumber = Number.isInteger(number) && number >= 1 && number <= 12 ? number : 1;

  return db.month.upsert({
    where: { number: safeNumber },
    create: {
      number: safeNumber,
      title: `الشهر ${safeNumber}`,
    },
    update: {},
  });
}
