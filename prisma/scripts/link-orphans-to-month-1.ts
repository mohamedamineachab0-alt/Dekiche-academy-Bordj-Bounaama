/**
 * Backfill lessons and subscription codes onto the Month catalog.
 *
 * Run after applying the Month migration:
 *   npx tsx prisma/scripts/link-orphans-to-month-1.ts
 *
 * Lessons are attached to the Month matching their existing month number.
 * Remaining rows (and codes) fall back to Month 1.
 * Codes with an empty validMonths list also get [1] so redeem still unlocks Month 1.
 */
import "dotenv/config";
import { prisma } from "../../lib/prisma";

async function main() {
  const months = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const number = i + 1;
      return prisma.month.upsert({
        where: { number },
        create: { number, title: `الشهر ${number}` },
        update: {},
      });
    })
  );

  const month1 = months.find((m) => m.number === 1);
  if (!month1) {
    throw new Error("Month 1 could not be created");
  }

  const linkedByNumber = await prisma.$executeRaw`
    UPDATE "Lesson" AS l
    SET "monthId" = m.id
    FROM "Month" AS m
    WHERE l."monthId" IS NULL
      AND l.month = m.number
  `;

  const orphanLessons = await prisma.lesson.updateMany({
    where: { monthId: null },
    data: { monthId: month1.id },
  });

  const linkedCodes = await prisma.accessCode.updateMany({
    where: { monthId: null },
    data: { monthId: month1.id },
  });

  const filledEmptyValidMonths = await prisma.$executeRaw`
    UPDATE "AccessCode"
    SET "validMonths" = CASE
      WHEN "accessType" = 'YEARLY' THEN ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
      ELSE ARRAY[1]
    END
    WHERE cardinality("validMonths") = 0
  `;

  console.log("Linked records to Month catalog:", {
    month1Id: month1.id,
    linkedByNumber,
    orphanLessons: orphanLessons.count,
    linkedCodes: linkedCodes.count,
    filledEmptyValidMonths,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
