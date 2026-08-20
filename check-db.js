const { PrismaClient } = require('./generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const res = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Lesson'`
  console.log(res)
}
main().catch(console.error).finally(() => prisma.$disconnect())
