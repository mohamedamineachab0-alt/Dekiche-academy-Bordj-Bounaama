import { prisma } from './lib/prisma';
import fs from 'fs';
import path from 'path';

const phaseMap: Record<string, string> = {
  PRIMARY: 'ابتدائي',
  MIDDLE: 'متوسط',
  SECONDARY: 'ثانوي'
};

const levelMap: Record<string, string> = {
  PRIMARY_1: 'الأولى',
  PRIMARY_2: 'الثانية',
  PRIMARY_3: 'الثالثة',
  PRIMARY_4: 'الرابعة',
  PRIMARY_5: 'الخامسة',
  MIDDLE_1: 'الأولى',
  MIDDLE_2: 'الثانية',
  MIDDLE_3: 'الثالثة',
  MIDDLE_4: 'الرابعة',
  SECONDARY_1: 'الأولى',
  SECONDARY_2: 'الثانية',
  SECONDARY_3: 'الثالثة',
};

const streamMap: Record<string, string> = {
  NONE: '',
  GENERAL: 'عام',
  COMMON_SCIENCE: 'جذع مشترك علوم',
  COMMON_LETTERS: 'جذع مشترك آداب',
  EXPERIMENTAL_SCIENCES: 'علوم تجريبية',
  MATHEMATICS: 'رياضيات',
  TECHNICAL_MATH: 'تقني رياضي',
  SCIENCES_MATH_TECH: 'شعب علمية',
  MANAGEMENT_ECONOMY: 'تسيير واقتصاد',
  LITERATURE_PHILOSOPHY: 'آداب وفلسفة',
  FOREIGN_LANGUAGES: 'لغات أجنبية',
};

async function main() {
  const dirName = 'أكواد_المواد';
  const dir = path.join(process.cwd(), dirName);
  
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  // حذف الملفات القديمة إن وجدت لتفادي التكرار
  const oldFiles = fs.readdirSync(dir);
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(dir, file));
  }

  const subjects = await prisma.subject.findMany({
    include: { 
      teacher: true, 
      codes: {
        where: { accessType: 'MONTHLY' }
      } 
    }
  });

  let exportedCount = 0;

  for (const subject of subjects) {
    const phase = phaseMap[subject.phase] || subject.phase;
    
    // إذا لم يكن هناك مستويات (مثل السوروبان أو تحسين المستوى العام)
    const levels = subject.levels.length > 0 
      ? subject.levels.map(l => levelMap[l] || l).join(' و') 
      : 'جميع المستويات';
      
    const streamsArr = subject.streams.length > 0 ? subject.streams : ['NONE'];

    const codes = subject.codes;
    if (codes.length === 0) continue;

    let csvContent = '\uFEFFالكود\n';
    for (const code of codes) {
      csvContent += `"${code.code}"\n`;
    }

    for (const s of streamsArr) {
      const streamName = streamMap[s] || s;
      let fileName = `${subject.title} - ${levels} ${phase}`;
      if (streamName && streamName !== '') {
        fileName += ` - ${streamName}`;
      }
      fileName = fileName.replace(/[\/\\?%*:|"<>]/g, '-');
      const csvPath = path.join(dir, `${fileName}.csv`);
      
      fs.writeFileSync(csvPath, csvContent, 'utf-8');
      exportedCount++;
    }
  }

  console.log(`✅ تم إنشاء مجلد '${dirName}' وتصدير الأكواد إلى ${exportedCount} ملف (ملف لكل مادة).`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
