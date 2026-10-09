import { prisma } from './lib/prisma';

async function main() {
  const subjects = await prisma.subject.findMany({
    where: {
      streams: {
        hasSome: ['LITERATURE_PHILOSOPHY', 'FOREIGN_LANGUAGES']
      }
    }
  });

  const target = subjects.filter(s => s.streams.includes('LITERATURE_PHILOSOPHY') && s.streams.includes('FOREIGN_LANGUAGES'));
  
  for (const s of target) {
    console.log("Found subject:", s.id, s.title, s.streams);
    
    // Create duplicate for FOREIGN_LANGUAGES
    const newSubject = await prisma.subject.create({
      data: {
        title: s.title,
        description: s.description,
        teacherName: s.teacherName,
        teacherId: s.teacherId,
        phase: s.phase,
        levels: s.levels,
        streams: ['FOREIGN_LANGUAGES'],
        image: s.image,
        price: s.price,
        accessType: s.accessType,
        isPublished: s.isPublished
      }
    });

    console.log("Created separate subject for FOREIGN_LANGUAGES:", newSubject.id);

    // Remove FOREIGN_LANGUAGES from original
    await prisma.subject.update({
      where: { id: s.id },
      data: {
        streams: s.streams.filter(x => x !== 'FOREIGN_LANGUAGES')
      }
    });

    console.log("Removed FOREIGN_LANGUAGES from original:", s.id);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
