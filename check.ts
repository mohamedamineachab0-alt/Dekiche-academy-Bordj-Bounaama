import { prisma } from './lib/prisma'

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: { studentProfile: true }
  })
  console.log("Students:", users.map(u => ({ id: u.id, phase: u.studentProfile?.phase, level: u.studentProfile?.level, stream: u.studentProfile?.stream })));

  const subjects = await prisma.subject.findMany()
  console.log("\nSubjects:", subjects.map(s => ({ id: s.id, title: s.title, phase: s.phase, level: s.level, streams: s.streams, isPublished: s.isPublished })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
