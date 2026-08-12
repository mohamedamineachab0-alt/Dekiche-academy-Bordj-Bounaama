import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({
    where: { phoneNumber: "0562388085" }
  });
  console.log(user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
