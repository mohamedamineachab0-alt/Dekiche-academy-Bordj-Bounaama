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

    const codesList = codes.map(c => c.code).join('\n');

    return new NextResponse(codesList, {
      headers: {
        "Content-Disposition": 'attachment; filename="codes.txt"',
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
