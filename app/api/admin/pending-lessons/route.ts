import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const pendingLessons = await prisma.pendingLesson.findMany({
      where: status ? { status } : undefined,
      include: {
        subject: {
          select: { id: true, title: true, teacherName: true },
        },
        teacher: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        publishedLesson: {
          select: { id: true, title: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      pendingLessons,
    });
  } catch (error: any) {
    console.error("Error fetching pending lessons:", error);
    return NextResponse.json({ error: "فشل استرجاع الدروس المعلقة" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الدرس مطلوب" }, { status: 400 });
    }

    await prisma.pendingLesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "تم حذف الدرس بنجاح" });
  } catch (error: any) {
    console.error("Error deleting pending lesson:", error);
    return NextResponse.json({ error: "فشل حذف الدرس" }, { status: 500 });
  }
}
