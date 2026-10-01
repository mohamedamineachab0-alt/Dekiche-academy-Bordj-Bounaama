import { prisma } from '../lib/prisma';
import { Level, Stream } from '../generated/prisma';

const STREAM_ARABIC: Record<string, string> = {
  NONE: 'بدون شعبة',
  COMMON_SCIENCE: 'جذع مشترك علوم',
  COMMON_LETTERS: 'جذع مشترك آداب',
  EXPERIMENTAL_SCIENCES: 'علوم تجريبية',
  MATHEMATICS: 'رياضيات',
  TECHNICAL_MATH: 'تقني رياضي',
  MANAGEMENT_ECONOMY: 'تسيير واقتصاد',
  LITERATURE_PHILOSOPHY: 'آداب وفلسفة',
  FOREIGN_LANGUAGES: 'لغات أجنبية'
};

const SECONDARY_LEVELS: Level[] = [
  'SECONDARY_1',
  'SECONDARY_2',
  'SECONDARY_3'
];

const LEVEL_ARABIC: Record<string, string> = {
  SECONDARY_1: 'الأولى ثانوي',
  SECONDARY_2: 'الثانية ثانوي',
  SECONDARY_3: 'الثالثة ثانوي'
};

const COMMON_STREAMS: Stream[] = ['COMMON_SCIENCE', 'COMMON_LETTERS'];
const SPECIALIZED_STREAMS: Stream[] = [
  'EXPERIMENTAL_SCIENCES', 'MATHEMATICS', 'TECHNICAL_MATH', 
  'MANAGEMENT_ECONOMY', 'LITERATURE_PHILOSOPHY', 'FOREIGN_LANGUAGES'
];

async function main() {
  const subjectsData = [
    { name: 'الرياضيات', teacherName: 'أستاذ الرياضيات' },
    { name: 'الفيزياء', teacherName: 'أستاذ الفيزياء' },
    { name: 'العلوم الطبيعية', teacherName: 'أستاذ العلوم' },
    { name: 'اللغة العربية', teacherName: 'أستاذ العربية' },
    { name: 'اللغة الفرنسية', teacherName: 'أستاذ الفرنسية' },
    { name: 'اللغة الإنجليزية', teacherName: 'أستاذ الإنجليزية' },
  ];

  for (const sub of subjectsData) {
    for (const level of SECONDARY_LEVELS) {
      const applicableStreams = level === 'SECONDARY_1' ? COMMON_STREAMS : SPECIALIZED_STREAMS;
      for (const stream of applicableStreams) {
        const title = `${sub.name}`;
        console.log(`Creating: ${title} (${level}, ${stream})`);
        await prisma.subject.create({
          data: {
            title,
            description: `دورة ${title} - ${LEVEL_ARABIC[level]} - ${STREAM_ARABIC[stream]}`,
            teacherName: sub.teacherName,
            phase: 'SECONDARY',
            levels: [level],
            streams: [stream],
            price: 2000,
            accessType: 'MONTHLY',
            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop'
          }
        });
      }
    }
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
