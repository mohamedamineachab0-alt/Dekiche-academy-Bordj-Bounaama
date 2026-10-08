import { Phase, Level, Stream, Role } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting Comprehensive Seed for Dekiche Platform...');

  

  const defaultPassword = await bcrypt.hash('12345678', 10);
  let phoneCounter = 0;
  const generatePhone = () => {
    phoneCounter++;
    return `09000000${phoneCounter.toString().padStart(2, '0')}`;
  };

  const teachersData = [
    {
      name: 'الأستاذ بضة لخضر',
      subjects: [
        { title: 'اللغة الإنجليزية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_3], streams: [Stream.NONE] },
        { title: 'اللغة الإنجليزية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_4], streams: [Stream.NONE] },
        { title: 'اللغة الإنجليزية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_5], streams: [Stream.NONE] },
        { title: 'اللغة الإنجليزية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_1], streams: [Stream.NONE] },
        { title: 'اللغة الإنجليزية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_2], streams: [Stream.NONE] },
        { title: 'تحسين المستوى في اللغة الإنجليزية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_1, Level.PRIMARY_2, Level.PRIMARY_3, Level.PRIMARY_4, Level.PRIMARY_5], streams: [Stream.NONE] },
        { title: 'تحسين المستوى في اللغة الإنجليزية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_1, Level.MIDDLE_2, Level.MIDDLE_3, Level.MIDDLE_4], streams: [Stream.NONE] },
        { title: 'تحسين المستوى في اللغة الإنجليزية', phase: Phase.SECONDARY, levels: [Level.SECONDARY_1, Level.SECONDARY_2, Level.SECONDARY_3], streams: [Stream.GENERAL] },
      ]
    },
    {
      name: 'الأستاذ عباد حمزة',
      subjects: [
        { title: 'اللغة العربية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_2], streams: [Stream.NONE] },
        { title: 'الرياضيات', phase: Phase.PRIMARY, levels: [Level.PRIMARY_2], streams: [Stream.NONE] },
        { title: 'اللغة العربية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_5], streams: [Stream.NONE] },
        { title: 'الرياضيات', phase: Phase.PRIMARY, levels: [Level.PRIMARY_5], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ بوشارب منير',
      subjects: [
        { title: 'اللغة العربية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_3], streams: [Stream.NONE] },
        { title: 'الرياضيات', phase: Phase.PRIMARY, levels: [Level.PRIMARY_3], streams: [Stream.NONE] },
        { title: 'اللغة العربية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_4], streams: [Stream.NONE] },
        { title: 'الرياضيات', phase: Phase.PRIMARY, levels: [Level.PRIMARY_4], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ شاشا الجيلالي',
      subjects: [
        { title: 'اللغة الفرنسية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_4], streams: [Stream.NONE] },
        { title: 'اللغة الفرنسية', phase: Phase.PRIMARY, levels: [Level.PRIMARY_5], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ صافر قدور',
      subjects: [
        { title: 'الرياضيات', phase: Phase.MIDDLE, levels: [Level.MIDDLE_1], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ طاليس بن عودة',
      subjects: [
        { title: 'الرياضيات', phase: Phase.MIDDLE, levels: [Level.MIDDLE_2], streams: [Stream.NONE] },
        { title: 'الرياضيات', phase: Phase.MIDDLE, levels: [Level.MIDDLE_3], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ دقيش علي',
      subjects: [
        { title: 'الرياضيات', phase: Phase.MIDDLE, levels: [Level.MIDDLE_4], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذة عماني سهيلة',
      subjects: [
        { title: 'اللغة الفرنسية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_1], streams: [Stream.NONE] },
        { title: 'اللغة الفرنسية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_2], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذة بنة حميد',
      subjects: [
        { title: 'اللغة الفرنسية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_3], streams: [Stream.NONE] },
        { title: 'اللغة الفرنسية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_4], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذة تومارت الزهرة',
      subjects: [
        { title: 'اللغة العربية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_3], streams: [Stream.NONE] },
        { title: 'اللغة العربية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_4], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ عجوط الحسين',
      subjects: [
        { title: 'اللغة الإنجليزية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_4], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ زغاري عبد العزيز',
      subjects: [
        { title: 'العلوم الفيزيائية', phase: Phase.MIDDLE, levels: [Level.MIDDLE_4], streams: [Stream.NONE] },
      ]
    },
    {
      name: 'الأستاذ بطوم حميد',
      subjects: [
        { title: 'الرياضيات', phase: Phase.SECONDARY, levels: [Level.SECONDARY_1], streams: [Stream.COMMON_SCIENCE] },
        { title: 'الرياضيات', phase: Phase.SECONDARY, levels: [Level.SECONDARY_2], streams: [Stream.SCIENCES_MATH_TECH, Stream.EXPERIMENTAL_SCIENCES, Stream.MATHEMATICS, Stream.TECHNICAL_MATH] },
        { title: 'الرياضيات', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.SCIENCES_MATH_TECH, Stream.EXPERIMENTAL_SCIENCES, Stream.MATHEMATICS, Stream.TECHNICAL_MATH] },
        { title: 'الرياضيات', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.MANAGEMENT_ECONOMY] },
      ]
    },
    {
      name: 'الأستاذ قصري عبد الحق',
      subjects: [
        { title: 'العلوم الفيزيائية', phase: Phase.SECONDARY, levels: [Level.SECONDARY_1], streams: [Stream.COMMON_SCIENCE] },
        { title: 'العلوم الفيزيائية', phase: Phase.SECONDARY, levels: [Level.SECONDARY_2], streams: [Stream.SCIENCES_MATH_TECH, Stream.EXPERIMENTAL_SCIENCES, Stream.MATHEMATICS, Stream.TECHNICAL_MATH] },
        { title: 'العلوم الفيزيائية', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.SCIENCES_MATH_TECH, Stream.EXPERIMENTAL_SCIENCES, Stream.MATHEMATICS, Stream.TECHNICAL_MATH] },
      ]
    },
    {
      name: 'الأستاذ طبيب محمد',
      subjects: [
        { title: 'علوم الطبيعة والحياة', phase: Phase.SECONDARY, levels: [Level.SECONDARY_1], streams: [Stream.COMMON_SCIENCE] },
      ]
    },
    {
      name: 'الأستاذة قمور آسيا',
      subjects: [
        { title: 'علوم الطبيعة والحياة', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.SCIENCES_MATH_TECH, Stream.EXPERIMENTAL_SCIENCES, Stream.MATHEMATICS, Stream.TECHNICAL_MATH] },
      ]
    },
    {
      name: 'الأستاذة قمجي سناء',
      subjects: [
        { title: 'اللغة الفرنسية', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.LITERATURE_PHILOSOPHY, Stream.FOREIGN_LANGUAGES] },
      ]
    },
    {
      name: 'الأستاذ صانع أحمد',
      subjects: [
        { title: 'اللغة العربية وآدابها', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.LITERATURE_PHILOSOPHY, Stream.FOREIGN_LANGUAGES] },
      ]
    },
    {
      name: 'الأستاذة عايش شيماء',
      subjects: [
        { title: 'اللغة العربية وآدابها', phase: Phase.SECONDARY, levels: [Level.SECONDARY_2], streams: [Stream.LITERATURE_PHILOSOPHY, Stream.FOREIGN_LANGUAGES] },
      ]
    },
    {
      name: 'الأستاذة بابو فاطمة',
      subjects: [
        { title: 'اللغة الإنجليزية', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.LITERATURE_PHILOSOPHY, Stream.FOREIGN_LANGUAGES] },
      ]
    },
    {
      name: 'الأستاذة سايب حياة',
      subjects: [
        { title: 'الفلسفة', phase: Phase.SECONDARY, levels: [Level.SECONDARY_2], streams: [Stream.LITERATURE_PHILOSOPHY, Stream.FOREIGN_LANGUAGES] },
        { title: 'الفلسفة', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.LITERATURE_PHILOSOPHY, Stream.FOREIGN_LANGUAGES] },
      ]
    },
    {
      name: 'الأستاذ كباس نور الدين',
      subjects: [
        { title: 'التسيير المحاسبي والمالي', phase: Phase.SECONDARY, levels: [Level.SECONDARY_3], streams: [Stream.MANAGEMENT_ECONOMY] },
      ]
    },
    {
      name: 'الأستاذ بوز عبد العزيز',
      subjects: [
        { title: 'السوروبان', phase: Phase.PRIMARY, levels: [Level.PRIMARY_1, Level.PRIMARY_2, Level.PRIMARY_3, Level.PRIMARY_4, Level.PRIMARY_5], streams: [Stream.NONE] },
        { title: 'السوروبان', phase: Phase.MIDDLE, levels: [Level.MIDDLE_1, Level.MIDDLE_2, Level.MIDDLE_3, Level.MIDDLE_4], streams: [Stream.NONE] },
      ]
    },
  ];

  console.log('🧹 Wiping all old Subject, Teacher, and Teacher User data...');

  const teacherNames = teachersData.map(t => t.name);
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  const teachers = await prisma.user.findMany({ 
    where: { 
      role: Role.TEACHER,
      fullName: { in: teacherNames } 
    } 
  });
  for (const t of teachers) {
    try { await prisma.user.delete({ where: { id: t.id } }); } catch (e) { }
  }


  console.log('👨‍🏫 Creating Teachers and their Subjects...');
  
  const createdCredentials = [];

  for (const tData of teachersData) {
    const phone = generatePhone();
    
    // Create or Update User (Role: TEACHER)
    const user = await prisma.user.upsert({
      where: { phoneNumber: phone },
      update: {
        fullName: tData.name,
        passwordHash: defaultPassword,
        role: Role.TEACHER,
      },
      create: {
        fullName: tData.name,
        phoneNumber: phone,
        passwordHash: defaultPassword,
        role: Role.TEACHER,
      }
    });

    // Create Teacher Profile linked to the User
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        name: tData.name,
        phone: phone, 
      }
    });

    createdCredentials.push({
      "اسم الأستاذ": tData.name,
      "رقم الهاتف (ID)": phone,
      "كلمة المرور": '12345678'
    });

    for (const sData of tData.subjects) {
      await prisma.subject.create({
        data: {
          title: sData.title,
          description: `دروس ${sData.title} للطور ${sData.phase === 'PRIMARY' ? 'الابتدائي' : sData.phase === 'MIDDLE' ? 'المتوسط' : 'الثانوي'} مع ${tData.name}`,
          teacherName: tData.name,
          teacherId: teacher.id,
          phase: sData.phase,
          levels: sData.levels,
          streams: sData.streams,
          image: '',
          price: 1500,
          accessType: 'MONTHLY',
          isPublished: true,
        }
      });
    }
  }

  // Adding the Spanish subject without a teacher
  console.log('📚 Adding unassigned subjects...');
  await prisma.subject.create({
    data: {
      title: 'اللغة الإسبانية',
      description: 'دروس اللغة الإسبانية للسنة الثالثة ثانوي',
      teacherName: 'بدون أستاذ',
      teacherId: null,
      phase: Phase.SECONDARY,
      levels: [Level.SECONDARY_3],
      streams: [Stream.FOREIGN_LANGUAGES],
      image: '',
      price: 1500,
      accessType: 'MONTHLY',
      isPublished: true,
    }
  });

  console.log('✨ Comprehensive Seed completed successfully!');
  console.log('\n--- 🔑 حسابات الأساتذة 🔑 ---');
  console.table(createdCredentials);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
