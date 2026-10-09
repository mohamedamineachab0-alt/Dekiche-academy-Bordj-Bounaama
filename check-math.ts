import { prisma } from './lib/prisma';
async function main() {
  const subjects = await prisma.subject.findMany({
    where: { title: { contains: 'الرياضيات' } }
  });
  console.log(subjects.map(s => ({ id: s.id, title: s.title, levels: s.levels, streams: s.streams })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
