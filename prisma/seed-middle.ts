import { Phase, Level, Stream, Role } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting Middle School Seed...');

  // تشفير كلمة المرور الافتراضية
  const defaultPassword = await bcrypt.hash('12345678', 10);
  
  // دالة توليد أرقام تبدأ بـ 09 (10 أرقام)
  // نبدأ من 5 لتفادي التعارض مع أساتذة الابتدائي (الذين أخذوا 1 إلى 4)
  let phoneCounter = 4;
  const generatePhone = () => {
    phoneCounter++;
    // يعطينا مثلا 0900000005 ، 0900000006 ...
    return `09000000${phoneCounter.toString().padStart(2, '0')}`;
  };

  // بيانات الطور المتوسط
  const teachersData = [
    {
      name: 'الأستاذ صافر قدور',
      subjects: [
        { title: 'الرياضيات', level: Level.MIDDLE_1 },
      ]
    },
    {
      name: 'الأستاذ طاليس بن عودة',
      subjects: [
        { title: 'الرياضيات', level: Level.MIDDLE_2 },
        { title: 'الرياضيات', level: Level.MIDDLE_3 },
      ]
    },
    {
      name: 'الأستاذ دقيش علي',
      subjects: [
        { title: 'الرياضيات', level: Level.MIDDLE_4 },
      ]
    },
    {
      name: 'الأستاذة عماني سهيلة',
      subjects: [
        { title: 'اللغة الفرنسية', level: Level.MIDDLE_1 },
        { title: 'اللغة الفرنسية', level: Level.MIDDLE_2 },
      ]
    },
    {
      name: 'الأستاذ بضة لخضر',
      subjects: [
        { title: 'اللغة الإنجليزية', level: Level.MIDDLE_1 },
        { title: 'اللغة الإنجليزية', level: Level.MIDDLE_2 },
      ]
    },
    {
      name: 'الأستاذة بنة حميد',
      subjects: [
        { title: 'اللغة الفرنسية', level: Level.MIDDLE_3 },
        { title: 'اللغة الفرنسية', level: Level.MIDDLE_4 },
      ]
    },
    {
      name: 'الأستاذة تومارت الزهرة',
      subjects: [
        { title: 'اللغة العربية', level: Level.MIDDLE_3 },
        { title: 'اللغة العربية', level: Level.MIDDLE_4 },
      ]
    },
    {
      name: 'الأستاذ عجوط الحسين',
      subjects: [
        { title: 'اللغة الإنجليزية', level: Level.MIDDLE_4 },
      ]
    },
    {
      name: 'الأستاذ زغاري عبد العزيز',
      subjects: [
        { title: 'العلوم الفيزيائية', level: Level.MIDDLE_4 },
      ]
    }
  ];

  const teacherNames = teachersData.map(t => t.name);

  // حذف البيانات القديمة لهؤلاء الأساتذة (إن وجدت) لتفادي التكرار
  console.log('🧹 Cleaning up old data for these specific middle school teachers...');
  
  // 1. حذف المواد المرتبطة بهم
  await prisma.subject.deleteMany({
    where: { teacherName: { in: teacherNames } }
  });

  // 2. حذف ملفات الأساتذة
  await prisma.teacher.deleteMany({
    where: { name: { in: teacherNames } }
  });

  // 3. حذف حسابات المستخدمين
  await prisma.user.deleteMany({
    where: { fullName: { in: teacherNames }, role: Role.TEACHER }
  });

  console.log('👨‍🏫 Creating Middle School Teachers and their Subjects...');
  
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
          description: `دروس ${sData.title} للطور المتوسط مع ${tData.name}`,
          teacherName: tData.name,
          teacherId: teacher.id,
          phase: Phase.MIDDLE,
          levels: [sData.level],
          streams: [Stream.NONE], // لا توجد شعب في المتوسط
          image: '', // صورة افتراضية فارغة
          price: 1500, // السعر الافتراضي
          accessType: 'MONTHLY',
          isPublished: true,
        }
      });
    }
  }

  console.log('✨ Seed completed successfully!');
  console.log('\n--- 🔑 حسابات أساتذة الطور المتوسط 🔑 ---');
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
