const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const phone = '05662388085';
  const fullName = 'عشاب امين';
  const password = 'password123'; // secure default

  const existing = await prisma.user.findUnique({ where: { phoneNumber: phone } });
  if (existing) {
    console.log('User already exists!');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      phoneNumber: phone,
      fullName: fullName,
      passwordHash: passwordHash,
      role: 'ADMIN',
      teacherProfile: {
        create: {
          name: fullName,
          phone: phone,
          levels: ['AS1', 'AS2', 'AS3', 'BEM', 'CEM1', 'CEM2', 'CEM3', 'CEM4'],
          streams: ['MATH', 'SCIENCES', 'PHY', 'LITERATURE', 'LANGUAGES', 'MANAGEMENT', 'ALL', 'COMMON_TRUNK'],
        }
      }
    }
  });

  console.log('Successfully created Admin/Teacher account:', user);
  console.log('Phone:', phone);
  console.log('Password:', password);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
