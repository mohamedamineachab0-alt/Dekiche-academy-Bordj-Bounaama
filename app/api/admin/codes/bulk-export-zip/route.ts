import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "recent";

    // 1. Fetch subjects based on filter
    let whereClause = {};
    if (filter === "recent") {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      whereClause = {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      };
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        phase: true,
      },
    });

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: "لا توجد مواد لتوليد الرموز لها" }, { status: 400 });
    }

    const zip = new JSZip();
    const codesToInsert: { code: string; subjectId: string; accessType: "MONTHLY" | "YEARLY"; validMonths?: number[] }[] = [];
    const generationDate = new Date().toISOString().split("T")[0];

    // 2. Generate 200 codes per subject
    for (const subject of subjects) {
      let fileContent = `كود الاشتراك,المادة,الطور,المدة\n`;
      const sanitizedTitle = subject.title.replace(/[\/\\?%*:|"<>]/g, "-");

      for (let i = 0; i < 200; i++) {
        // Generate random 10-char code (uppercase alphanumeric)
        const code = crypto.randomBytes(5).toString("hex").toUpperCase();
        codesToInsert.push({
          code,
          subjectId: subject.id,
          accessType: "MONTHLY",
          validMonths: [1, 2, 3], // 3 months validity
        });
        fileContent += `${code},${subject.title},${subject.phase},3 أشهر (1-2-3)\n`;
      }

      // Add the file to the zip for this subject
      zip.file(`${sanitizedTitle}.csv`, "\uFEFF" + fileContent);
    }

    // 3. Insert codes into DB
    await prisma.accessCode.createMany({
      data: codesToInsert,
      skipDuplicates: true,
    });

    // 4. Generate the ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // 5. Return as a downloadable response
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Les_Codes_${generationDate}.zip"`,
      },
    });
  } catch (error) {
    console.error("Bulk ZIP generation error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء توليد الرموز وتجهيز الملف" }, { status: 500 });
  }
}
