import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "zip";
    const status = searchParams.get("status") || "unused"; // unused, used, all
    const subjectId = searchParams.get("subjectId");

    const whereClause: any = {};
    if (status === "unused") {
      whereClause.isUsed = false;
    } else if (status === "used") {
      whereClause.isUsed = true;
    }
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const codes = await prisma.accessCode.findMany({
      where: whereClause,
      include: {
        subject: true,
        user: { select: { fullName: true, phoneNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date().toISOString().split("T")[0];

    // CSV format
    if (format === "csv") {
      const header = ["الرمز", "المادة", "نوع الاشتراك", "الشهور الصالحة", "الحالة", "المستعمل", "رقم المستعمل", "تاريخ الإنشاء"];
      const rows = codes.map((c) => [
        `="${c.code}"`,
        `"${c.subject?.title || ""}"`,
        c.accessType === "YEARLY" ? "سنوي" : "شهري",
        `"${c.validMonths.join(", ")}"`,
        c.isUsed ? "مستعمل" : "غير مستعمل",
        `"${c.user?.fullName || ""}"`,
        `"${c.user?.phoneNumber || ""}"`,
        c.createdAt.toISOString().split("T")[0],
      ]);

      const csvContent = "\uFEFF" + [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Disposition": `attachment; filename="dekich_codes_${status}_${now}.csv"`,
          "Content-Type": "text/csv; charset=utf-8",
        },
      });
    }

    // Single TXT format
    if (format === "txt") {
      const textLines = codes.map((c) => c.code).join("\n");
      return new NextResponse("\uFEFF" + textLines, {
        headers: {
          "Content-Disposition": `attachment; filename="dekich_codes_${status}_${now}.txt"`,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Default ZIP format: Group by subject
    const zip = new JSZip();
    const grouped: Record<string, string[]> = {};

    for (const code of codes) {
      const subj = code.subject?.title || "عام";
      if (!grouped[subj]) grouped[subj] = [];
      grouped[subj].push(code.code);
    }

    if (Object.keys(grouped).length === 0) {
      zip.file("empty.txt", "لا توجد رموز مطابقة للتصدير");
    } else {
      for (const [subj, subjCodes] of Object.entries(grouped)) {
        const sanitized = subj.replace(/[\\/?%*:|"<>]/g, "-") + ".txt";
        zip.file(sanitized, subjCodes.join("\n"));
      }
    }

    const buf = await zip.generateAsync({ type: "blob" });

    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="dekich_codes_${status}_${now}.zip"`,
        "Content-Type": "application/zip",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
