import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Stream, Level } from "@/generated/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح - صلاحيات الإدارة مطلوبة" }, { status: 403 });
    }

    const pendingLesson = await prisma.pendingLesson.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });

    if (!pendingLesson) {
      return NextResponse.json({ error: "الدرس المعلق غير موجود" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const finalTitle = (body.title as string)?.trim() || pendingLesson.title;
    const description = (body.description as string)?.trim() || "";
    const month = parseInt(body.month) || pendingLesson.month || 1;

    // 1. Ensure academic month exists
    let academicMonth = await prisma.month.findUnique({
      where: { number: month },
    });
    if (!academicMonth) {
      academicMonth = await prisma.month.create({
        data: {
          number: month,
          title: `الشهر ${month}`,
        },
      });
    }

    // 2. Transact: Create published Lesson and update PendingLesson status to 'published'
    const result = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          title: finalTitle,
          description: description,
          month: month,
          monthId: academicMonth.id,
          vimeoVideoId: pendingLesson.vimeoVideoId,
          streams: pendingLesson.stream !== "NONE" ? [pendingLesson.stream as Stream] : [],
          levels: [pendingLesson.level as Level],
          subjects: {
            connect: { id: pendingLesson.subjectId },
          },
        },
        include: {
          subjects: { select: { id: true, title: true } },
        },
      });

      if (pendingLesson.pdfUrl) {
        await tx.lessonMaterial.create({
          data: {
            title: "ملف الدرس (PDF)",
            fileUrl: pendingLesson.pdfUrl,
            lessonId: lesson.id,
          },
        });
      }

      const updatedPending = await tx.pendingLesson.update({
        where: { id: pendingLesson.id },
        data: {
          status: "published",
          publishedLessonId: lesson.id,
          title: finalTitle,
        },
      });

      return { lesson, updatedPending };
    });

    return NextResponse.json({
      success: true,
      message: "تم اعتماد ونشر الدرس بنجاح للطلاب",
      lesson: result.lesson,
      pendingLesson: result.updatedPending,
    });
  } catch (error: any) {
    console.error("Error approving pending lesson:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء اعتماد الدرس ونشره" },
      { status: 500 }
    );
  }
}
