import { prisma } from './lib/prisma';
import fs from 'fs';

async function main() {
  const subjects = await prisma.subject.findMany({
    include: { teacher: true }
  });

  const codesToCreate = [];
  // إضافة BOM لدعم العربية في ملف الإكسيل
  const csvRows = ['\uFEFFالمادة,الأستاذ,الكود,الأشهر المفتوحة'];

  // Delete old codes to avoid duplicates or clutter
  await prisma.accessCode.deleteMany({});
  
  // توليد 200 كود لكل مادة
  for (const subject of subjects) {
    for (let i = 0; i < 200; i++) {
      // توليد كود رقمي فقط يتكون من 10 أرقام
      let numericCode = '';
      for (let j = 0; j < 10; j++) {
        numericCode += Math.floor(Math.random() * 10).toString();
      }
      
      codesToCreate.push({
        code: numericCode,
        accessType: 'MONTHLY',
        validMonths: [9, 10], // شهر سبتمبر وأكتوبر
        subjectId: subject.id,
      });

      const teacherName = subject.teacher?.name || subject.teacherName || 'بدون أستاذ';
      // استخدام JSON.stringify لتجنب مشاكل الفواصل في ملف CSV
      csvRows.push(`"${subject.title}","${teacherName}","${numericCode}","سبتمبر، أكتوبر"`);
    }
  }

  // إدخال الأكواد في قاعدة البيانات
  await prisma.accessCode.createMany({
    data: codesToCreate,
    skipDuplicates: true
  });

  fs.writeFileSync('أكواد_سبتمبر_أكتوبر.csv', csvRows.join('\n'), 'utf-8');
  console.log(`✅ تم توليد وحفظ ${codesToCreate.length} كود بنجاح!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
