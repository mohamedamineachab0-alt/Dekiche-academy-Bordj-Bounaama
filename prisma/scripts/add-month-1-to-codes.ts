import "dotenv/config";
import { prisma } from "../../lib/prisma";

async function main() {
  const codes = await prisma.$executeRaw`
    UPDATE "AccessCode"
    SET "validMonths" = CASE
      WHEN cardinality("validMonths") = 0 THEN ARRAY[1]
      WHEN 1 = ANY ("validMonths") THEN "validMonths"
      ELSE array_append("validMonths", 1)
    END
  `;

  const enrollments = await prisma.$executeRaw`
    UPDATE "Enrollment"
    SET "enrolledMonths" = CASE
      WHEN cardinality("enrolledMonths") = 0 THEN ARRAY[1]
      WHEN 1 = ANY ("enrolledMonths") THEN "enrolledMonths"
      ELSE array_append("enrolledMonths", 1)
    END
  `;

  console.log({ codesUpdated: codes, enrollmentsUpdated: enrollments });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
