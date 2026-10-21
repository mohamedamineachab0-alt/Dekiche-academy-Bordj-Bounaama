import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { ensureAcademicMonth } from "@/lib/academic-month";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user (Admin or Teacher)
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, role: true, teacherProfile: { select: { id: true } } },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "غير مصرح - صلاحيات الأستاذ أو الإدارة مطلوبة" }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const lessonId = (formData.get("lessonId") as string)?.trim() || null;
    const title = (formData.get("title") as string)?.trim() || null;
    const subjectId = (formData.get("subjectId") as string)?.trim() || null;
    const month = parseInt(formData.get("month") as string) || 1;
    const description = (formData.get("description") as string)?.trim() || "";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "يرجى اختيار ملف فيديو صالح للرفع" }, { status: 400 });
    }

    // 3. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "uploads", "videos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Generate clean safe filename
    const ext = path.extname(file.name) || ".mp4";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");
    const safeFilename = `${Date.now()}-${baseName}${ext}`;
    const targetFilePath = path.join(uploadDir, safeFilename);

    // 5. Write file to disk directly
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(targetFilePath, buffer);

    const videoUrl = `/api/videos/${safeFilename}`;

    // 6. Handle Lesson update or creation
    let resultingLesson: any = null;

    if (lessonId) {
      // Update existing lesson
      resultingLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          vimeoVideoId: videoUrl,
        },
        include: {
          subjects: { select: { id: true, title: true } },
        },
      });

      revalidatePath(`/dashboard/student/lessons/${lessonId}`);
      resultingLesson.subjects.forEach((s: any) => {
        revalidatePath(`/dashboard/student/subjects/${s.id}`);
        revalidatePath(`/dashboard/student/subjects/${s.id}/lessons`);
      });
    } else if (title && subjectId) {
      // Create new lesson with this video
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        select: { id: true, title: true, levels: true, streams: true },
      });

      if (!subject) {
        return NextResponse.json({ error: "المادة المحددة غير موجودة" }, { status: 404 });
      }

      const academicMonth = await ensureAcademicMonth(month);

      const existingCount = await prisma.lesson.count({
        where: { subjects: { some: { id: subjectId } }, month },
      });

      resultingLesson = await prisma.lesson.create({
        data: {
          title,
          description,
          month,
          monthId: academicMonth.id,
          order: existingCount + 1,
          vimeoVideoId: videoUrl,
          levels: subject.levels,
          streams: subject.streams,
          subjects: { connect: { id: subjectId } },
        },
        include: {
          subjects: { select: { id: true, title: true } },
        },
      });

      revalidatePath(`/dashboard/student/subjects/${subjectId}`);
      revalidatePath(`/dashboard/student/subjects/${subjectId}/lessons`);
    }

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/admin/lessons");

    return NextResponse.json({
      success: true,
      message: "تم رفع الفيديو وحفظه في المنصة بنجاح!",
      url: videoUrl,
      filename: safeFilename,
      size: file.size,
      lesson: resultingLesson
        ? {
            id: resultingLesson.id,
            title: resultingLesson.title,
            description: resultingLesson.description,
            vimeoVideoId: resultingLesson.vimeoVideoId,
            embedUrl: resultingLesson.vimeoVideoId,
            subject: resultingLesson.subjects?.[0]?.title || "",
            month: resultingLesson.month,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error in /api/upload-video:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ في الخادم أثناء رفع الفيديو" },
      { status: 500 }
    );
  }
}
