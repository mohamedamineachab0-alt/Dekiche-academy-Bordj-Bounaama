import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Phase, Level, Stream } from "@/generated/prisma";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "prisma", "algerian-curriculum.json");
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const subjects = JSON.parse(fileContent);

    let createdCount = 0;

    for (const subject of subjects) {
      // Check if it already exists to avoid duplicates
      const exists = await prisma.subject.findFirst({
        where: {
          title: subject.title,
          phase: subject.phase as Phase,
        }
      });

      if (!exists) {
        await prisma.subject.create({
          data: {
            title: subject.title,
            description: subject.description,
            image: subject.image,
            price: subject.price,
            accessType: subject.accessType,
            phase: subject.phase as Phase,
            levels: subject.levels as Level[],
            streams: subject.streams as Stream[],
            teacherName: "الأستاذ",
            isPublished: true,
          }
        });
        createdCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Seeded ${createdCount} new subjects successfully!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
