import { prisma } from '../lib/prisma';

async function main() {
  const total = await prisma.subject.count();
  const subjects = await prisma.subject.findMany({
    select: { title: true },
    take: 10,
  });
  console.log(`✅ عدد المواد المتبقية في المنصة هو: ${total}`);
  console.log("بعض المواد المتبقية:");
  subjects.forEach(s => console.log("-", s.title));
}

main()
  .catch((e) => {
    console.error("حدث خطأ أثناء الحذف:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
