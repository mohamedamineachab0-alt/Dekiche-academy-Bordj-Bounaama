import { prisma } from './lib/prisma';
import fs from 'fs';
import path from 'path';

const phaseMap: Record<string, string> = { PRIMARY: 'ابتدائي', MIDDLE: 'متوسط', SECONDARY: 'ثانوي' };
const levelMap: Record<string, string> = { PRIMARY_1: 'الأولى', PRIMARY_2: 'الثانية', PRIMARY_3: 'الثالثة', PRIMARY_4: 'الرابعة', PRIMARY_5: 'الخامسة', MIDDLE_1: 'الأولى', MIDDLE_2: 'الثانية', MIDDLE_3: 'الثالثة', MIDDLE_4: 'الرابعة', SECONDARY_1: 'الأولى', SECONDARY_2: 'الثانية', SECONDARY_3: 'الثالثة' };
const streamMap: Record<string, string> = { NONE: '', GENERAL: 'عام', COMMON_SCIENCE: 'جذع مشترك علوم', COMMON_LETTERS: 'جذع مشترك آداب', EXPERIMENTAL_SCIENCES: 'علوم تجريبية', MATHEMATICS: 'رياضيات', TECHNICAL_MATH: 'تقني رياضي', SCIENCES_MATH_TECH: 'شعب علمية', MANAGEMENT_ECONOMY: 'تسيير واقتصاد', LITERATURE_PHILOSOPHY: 'آداب وفلسفة', FOREIGN_LANGUAGES: 'لغات أجنبية' };

function generateRandomCode(length: number = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
  let code = '';
  for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

async function main() {
  const dirName = 'أكواد_سبتمبر_أكتوبر';
  const dir = path.join(process.cwd(), dirName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const subjects = await prisma.subject.findMany();
  let totalGenerated = 0;

  for (const subject of subjects) {
    const codesToCreate = [];
    for (let i = 0; i < 100; i++) {
      codesToCreate.push({
        code: generateRandomCode(10),
        accessType: 'MONTHLY',
        validMonths: [9, 10],
        subjectId: subject.id,
        isUsed: false
      });
    }

    await prisma.accessCode.createMany({ data: codesToCreate });
    
    // Fetch the ones we just created for this subject (validMonths = [9,10])
    const createdCodes = await prisma.accessCode.findMany({
      where: { subjectId: subject.id, validMonths: { equals: [9, 10] } }
    });

    const phase = phaseMap[subject.phase] || subject.phase;
    const levels = subject.levels.length > 0 ? subject.levels.map(l => levelMap[l] || l).join(' و') : 'جميع المستويات';
    const streamsArr = subject.streams.length > 0 ? subject.streams : ['NONE'];
    
    let csvContent = '\uFEFFالكود\n';
    for (const code of createdCodes) {
      csvContent += `"${code.code}"\n`;
    }

    for (const s of streamsArr) {
      const streamName = streamMap[s] || s;
      let fileName = `${subject.title} - ${levels} ${phase}`;
      if (streamName && streamName !== '') fileName += ` - ${streamName}`;
      fileName = fileName.replace(/[\/\\?%*:|"<>]/g, '-');
      const csvPath = path.join(dir, `${fileName}.csv`);
      fs.writeFileSync(csvPath, csvContent, 'utf-8');
    }
    totalGenerated += 100;
  }
  console.log(`✅ تم إنشاء ${totalGenerated} كود بنجاح وتم حفظ الملفات في المجلد '${dirName}'.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
