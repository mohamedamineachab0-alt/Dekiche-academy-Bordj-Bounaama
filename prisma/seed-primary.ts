import { Phase, Level, Stream, Role } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting Primary School Seed...');

  // تشفير كلمة المرور الافتراضية
  const defaultPassword = await bcrypt.hash('12345678', 10);
  
  // دالة توليد أرقام تبدأ بـ 09 (10 أرقام)
  let phoneCounter = 0;
  const generatePhone = () => {
    phoneCounter++;
    // يعطينا مثلا 0900000001 ، 0900000002 ...
    return `090000000${phoneCounter}`;
  };

  // بيانات الطور الابتدائي
  const teachersData = [
    {
      name: 'الأستاذ عباد حمزة',
      subjects: [
        { title: 'اللغة العربية', level: Level.PRIMARY_2 },
        { title: 'الرياضيات', level: Level.PRIMARY_2 },
        { title: 'اللغة العربية', level: Level.PRIMARY_5 },
        { title: 'الرياضيات', level: Level.PRIMARY_5 },
      ]
    },
    {
      name: 'الأستاذ بوشارب منير',
      subjects: [
        { title: 'اللغة العربية', level: Level.PRIMARY_3 },
        { title: 'الرياضيات', level: Level.PRIMARY_3 },
        { title: 'اللغة العربية', level: Level.PRIMARY_4 },
        { title: 'الرياضيات', level: Level.PRIMARY_4 },
      ]
    },
    {
      name: 'الأستاذة بضة لخضر',
      subjects: [
        { title: 'اللغة الإنجليزية', level: Level.PRIMARY_3 },
        { title: 'اللغة الإنجليزية', level: Level.PRIMARY_4 },
        { title: 'اللغة الإنجليزية', level: Level.PRIMARY_5 },
      ]
    },
    {
      name: 'الأستاذ شاشا الجيلالي',
      subjects: [
        { title: 'اللغة الفرنسية', level: Level.PRIMARY_4 },
        { title: 'اللغة الفرنسية', level: Level.PRIMARY_5 },
      ]
    }
  ];

  console.log('👨‍🏫 Creating Primary Teachers and their Subjects...');
  
  // مصفوفة لحفظ بيانات الدخول لطباعتها في النهاية
  const createdCredentials = [];

  for (const tData of teachersData) {
    const phone = generatePhone();
    
    // 1. إنشاء حساب مستخدم واحد للأستاذ
    const user = await prisma.user.create({
      data: {
        fullName: tData.name,
        phoneNumber: phone,
        passwordHash: defaultPassword,
        role: Role.TEACHER,
      }
    });

    // 2. إنشاء ملف تعريف الأستاذ وربطه بحساب المستخدم (One-to-One)
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

    // 3. إنشاء سجل مادة مستقل لكل (مادة + مستوى) وربطه بنفس الأستاذ (One-to-Many)
    for (const sData of tData.subjects) {
      await prisma.subject.create({
        data: {
          title: sData.title,
          description: `دروس ${sData.title} للطور الابتدائي مع ${tData.name}`,
          teacherName: tData.name,
          teacherId: teacher.id,
          phase: Phase.PRIMARY,
          levels: [sData.level],
          streams: [Stream.NONE], // لا توجد شعب في الابتدائي
          image: '', // صورة افتراضية فارغة
          price: 1500, // السعر الافتراضي
          accessType: 'MONTHLY',
          isPublished: true,
        }
      });
    }
  }

  console.log('✨ Seed completed successfully!');
  console.log('\n--- 🔑 حسابات أساتذة الطور الابتدائي 🔑 ---');
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
