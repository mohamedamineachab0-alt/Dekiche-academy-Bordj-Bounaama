import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Phase, Level, Stream } from '../generated/prisma';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Reading algerian-curriculum.json...');
  const dataPath = path.join(__dirname, 'algerian-curriculum.json');
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const subjects = JSON.parse(fileContent);

  console.log(`Found ${subjects.length} subjects to insert.`);

  for (const subject of subjects) {
    try {
      await prisma.subject.create({
        data: {
          title: subject.title,
          description: subject.description,
          image: subject.image,
          price: subject.price,
          accessType: subject.accessType,
          phase: subject.phase as Phase,
          levels: subject.levels as Level[],
          streams: subject.streams as Stream[],
          teacherName: "الأستاذ", // Default teacher name since it's required
          isPublished: true,
        }
      });
      console.log(`Created: ${subject.title} (${subject.phase})`);
    } catch (error) {
      console.error(`Failed to create ${subject.title}:`, error);
    }
  }

  console.log('✅ All subjects seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
