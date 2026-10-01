import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const STREAM_ARABIC: Record<string, string> = {
  NONE: '',
  COMMON_SCIENCE: 'ج م ع',
  COMMON_LETTERS: 'ج م آ',
  EXPERIMENTAL_SCIENCES: 'ع ت',
  MATHEMATICS: 'ر',
  TECHNICAL_MATH: 'ت ر',
  MANAGEMENT_ECONOMY: 'ت إ',
  LITERATURE_PHILOSOPHY: 'آ ف',
  FOREIGN_LANGUAGES: 'ل أ'
};

const LEVEL_ARABIC: Record<string, string> = {
  PRIMARY_1: '1ابتدائي', PRIMARY_2: '2ابتدائي', PRIMARY_3: '3ابتدائي', PRIMARY_4: '4ابتدائي', PRIMARY_5: '5ابتدائي',
  MIDDLE_1: '1متوسط', MIDDLE_2: '2متوسط', MIDDLE_3: '3متوسط', MIDDLE_4: '4متوسط',
  SECONDARY_1: '1ثانوي', SECONDARY_2: '2ثانوي', SECONDARY_3: '3ثانوي'
};

async function main() {
  const dataPath = path.join(process.cwd(), "prisma", "algerian-curriculum.json");
  const fileContent = fs.readFileSync(dataPath, "utf-8");
  const subjects = JSON.parse(fileContent);

  // Clear existing subjects
  await prisma.subject.deleteMany();
  console.log("Cleared existing subjects.");

  for (const subject of subjects) {
    for (const level of subject.levels) {
      for (const stream of subject.streams) {
        
        // Filter out invalid combinations
        if (level === 'SECONDARY_1' && !['COMMON_SCIENCE', 'COMMON_LETTERS'].includes(stream)) continue;
        if ((level === 'SECONDARY_2' || level === 'SECONDARY_3') && ['COMMON_SCIENCE', 'COMMON_LETTERS', 'NONE'].includes(stream)) continue;
        if (subject.phase !== 'SECONDARY' && stream !== 'NONE') continue;

        let title = subject.title;
        if (subject.phase === 'SECONDARY' && stream !== 'NONE') {
            title = `${subject.title} - ${LEVEL_ARABIC[level]} ${STREAM_ARABIC[stream]}`;
        } else if (subject.phase !== 'SECONDARY') {
            title = `${subject.title} - ${LEVEL_ARABIC[level]}`;
        }

        console.log(`Creating: ${title}`);
        await prisma.subject.create({
          data: {
            title,
            description: subject.description,
            image: subject.image,
            price: subject.price,
            accessType: subject.accessType,
            phase: subject.phase,
            levels: [level],
            streams: [stream],
            teacherName: "الأستاذ",
            isPublished: true,
          }
        });
      }
    }
  }
  console.log("Done seeding expanded subjects!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
