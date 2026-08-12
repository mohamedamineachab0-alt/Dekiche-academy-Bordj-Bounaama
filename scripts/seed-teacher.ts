import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const phone = '05662388085';
  const fullName = 'عشاب امين';
  const password = 'password123';

  const existing = await prisma.user.findUnique({ where: { phoneNumber: phone } });
  if (existing) {
    console.log('User already exists!', existing);
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
          levels: ['SECONDARY_2', 'SECONDARY_3'],
          streams: ['MATHEMATICS', 'EXPERIMENTAL_SCIENCES', 'TECHNICAL_MATH', 'MANAGEMENT_ECONOMY', 'LITERATURE_PHILOSOPHY', 'FOREIGN_LANGUAGES', 'NONE'],
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
