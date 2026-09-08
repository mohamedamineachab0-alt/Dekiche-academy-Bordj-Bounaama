import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.lesson.count();
  const withoutQuiz = await prisma.lesson.count({ where: { quiz: null } });
  const withoutImage = await prisma.lesson.count({ where: { image: null } });
  
  console.log(`Total lessons: ${total}`);
  console.log(`Lessons without quiz: ${withoutQuiz}`);
  console.log(`Lessons without image: ${withoutImage}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
