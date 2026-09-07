import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { cookies } from 'next/headers';

export async function GET() {
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

    const codes = await prisma.accessCode.findMany({
      where: { isUsed: false },
      include: { subject: true },
      orderBy: { createdAt: 'desc' }
    });

    const data = codes.map(c => ({
      "الرمز": c.code,
      "المادة": c.subject.title,
      "النوع": c.accessType === "YEARLY" ? "سنوي" : "شهري",
      "الشهور": c.validMonths?.join(", ") || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الرموز غير المستخدمة");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": 'attachment; filename="codes.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
