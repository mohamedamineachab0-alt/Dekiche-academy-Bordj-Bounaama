import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.subject.count();
  if (count === 0) {
    console.log("No subjects found. Adding default subjects...");
    // Just a dry run log
  } else {
    console.log(`Found ${count} subjects.`);
  }
}
main().finally(() => prisma.$disconnect());
