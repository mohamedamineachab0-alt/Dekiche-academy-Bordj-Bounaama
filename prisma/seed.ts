import { prisma } from '../lib/prisma'

async function main() {
  const user = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      phoneNumber: '1234567890',
      role: 'STUDENT',
    },
  })
  console.log('Created user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
