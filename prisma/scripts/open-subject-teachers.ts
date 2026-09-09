import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const TEACHERS = [
  {
    fullName: "قصري عبد الحق",
    phone: "0551111001",
    subjectId: "cd048627-74f9-4661-84e8-e9119aee8cce",
    teacherName: "قصري عبد الحق",
  },
  {
    fullName: "حميد بطوم",
    phone: "0551111002",
    subjectId: "59e1198c-a617-4fad-837f-50b62abf65c6",
    teacherName: "حميد بطوم",
  },
  {
    fullName: "قمور آسيا",
    phone: "0551111003",
    subjectId: "8998cb44-f37e-418f-8d2f-0ae784d3be42",
    teacherName: "قمور آسيا",
  },
] as const;

async function upsertTeacher(entry: (typeof TEACHERS)[number]) {
  const existingByPhone = await prisma.user.findUnique({
    where: { phoneNumber: entry.phone },
    include: { teacherProfile: true },
  });

  const existingByName = existingByPhone
    ? null
    : await prisma.user.findFirst({
        where: { fullName: entry.fullName, role: "TEACHER" },
        include: { teacherProfile: true },
      });

  const existing = existingByPhone || existingByName;
  let userId: string;
  let teacherId: string;

  if (existing) {
    userId = existing.id;
    if (existing.role !== "TEACHER") {
      throw new Error(`${entry.fullName}: الرقم مستعمل لحساب غير أستاذ`);
    }
    await prisma.user.update({
      where: { id: userId },
      data: { fullName: entry.fullName, phoneNumber: existing.phoneNumber },
    });
    if (existing.teacherProfile) {
      teacherId = existing.teacherProfile.id;
      await prisma.teacher.update({
        where: { id: teacherId },
        data: {
          name: entry.fullName,
          phases: ["SECONDARY"],
          levels: ["SECONDARY_3"],
          streams: ["EXPERIMENTAL_SCIENCES", "MATHEMATICS"],
        },
      });
    } else {
      const teacher = await prisma.teacher.create({
        data: {
          userId,
          name: entry.fullName,
          phone: existing.phoneNumber,
          phases: ["SECONDARY"],
          levels: ["SECONDARY_3"],
          streams: ["EXPERIMENTAL_SCIENCES", "MATHEMATICS"],
        },
      });
      teacherId = teacher.id;
    }
  } else {
    const created = await prisma.user.create({
      data: {
        fullName: entry.fullName,
        phoneNumber: entry.phone,
        role: "TEACHER",
        passwordHash: "",
        teacherProfile: {
          create: {
            name: entry.fullName,
            phone: entry.phone,
            phases: ["SECONDARY"],
            levels: ["SECONDARY_3"],
            streams: ["EXPERIMENTAL_SCIENCES", "MATHEMATICS"],
          },
        },
      },
      include: { teacherProfile: true },
    });
    userId = created.id;
    teacherId = created.teacherProfile!.id;
  }

  const subject = await prisma.subject.update({
    where: { id: entry.subjectId },
    data: { teacherId, teacherName: entry.teacherName },
    select: { title: true, teacherName: true },
  });

  const loginUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, phoneNumber: true },
  });

  return { subject, loginUser };
}

async function main() {
  const results = [];
  for (const entry of TEACHERS) {
    results.push({ ...entry, ...(await upsertTeacher(entry)) });
  }
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
