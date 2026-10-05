import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, teacherId: true }
  });

  const results = [];
  let phoneCounter = 551112000;

  for (const subject of subjects) {
    if (subject.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: subject.teacherId },
        include: { user: true }
      });
      if (teacher) {
        results.push({
          subject: subject.title,
          teacherName: teacher.name,
          phone: teacher.phone,
          password: "1809010900"
        });
        continue;
      }
    }

    const teacherName = `أستاذ ${subject.title}`;
    const phone = `0${phoneCounter++}`;

    const createdUser = await prisma.user.create({
      data: {
        fullName: teacherName,
        phoneNumber: phone,
        role: "TEACHER",
        passwordHash: "",
        teacherProfile: {
          create: {
            name: teacherName,
            phone: phone,
            phases: ["SECONDARY"],
            levels: ["SECONDARY_3"],
            streams: [],
          },
        },
      },
      include: { teacherProfile: true },
    });

    await prisma.subject.update({
      where: { id: subject.id },
      data: {
        teacherId: createdUser.teacherProfile!.id,
        teacherName: teacherName
      }
    });

    results.push({
      subject: subject.title,
      teacherName: teacherName,
      phone: phone,
      password: "1809010900"
    });
  }

  console.log("TEACHERS_LIST_START");
  console.log(JSON.stringify(results, null, 2));
  console.log("TEACHERS_LIST_END");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
