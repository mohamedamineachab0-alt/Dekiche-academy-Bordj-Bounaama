const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const e = await prisma.enrollment.findFirst();
  console.log(e);
}
main();
