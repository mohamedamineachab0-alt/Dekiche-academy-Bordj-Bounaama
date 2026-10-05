import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const imageUrl = "https://images.unsplash.com/photo-1546410531-bea5acadb043?q=80&w=600&auto=format&fit=crop";

  await prisma.subject.create({
    data: {
      title: "سوروبان - الحساب الذهني",
      description: "برنامج سوروبان للحساب الذهني لتطوير قدرات التركيز والسرعة في الحساب.",
      teacherName: "أستاذ سوروبان",
      image: imageUrl,
      price: 1500, // example price
      accessType: "YEARLY",
      phase: "PRIMARY",
      levels: ["PRIMARY_1", "PRIMARY_2", "PRIMARY_3", "PRIMARY_4", "PRIMARY_5"],
      streams: ["NONE"],
      isPublished: true,
    }
  });

  await prisma.subject.create({
    data: {
      title: "سوروبان - الحساب الذهني",
      description: "برنامج سوروبان للحساب الذهني لتطوير قدرات التركيز والسرعة في الحساب للمرحلة المتوسطة.",
      teacherName: "أستاذ سوروبان",
      image: imageUrl,
      price: 1500, // example price
      accessType: "YEARLY",
      phase: "MIDDLE",
      levels: ["MIDDLE_1", "MIDDLE_2", "MIDDLE_3", "MIDDLE_4"],
      streams: ["NONE"],
      isPublished: true,
    }
  });

  console.log("Soroban subjects created successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
