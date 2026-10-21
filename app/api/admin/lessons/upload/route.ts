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
    // 1. Authenticate Admin session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح - صلاحيات المشرف مطلوبة" }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const subjectId = (formData.get("subjectId") as string)?.trim();
    const month = parseInt(formData.get("month") as string) || 1;
    const videoFile = formData.get("video") as File | null;

    if (!title) {
      return NextResponse.json({ error: "عنوان الدرس مطلوب" }, { status: 400 });
    }

    if (!subjectId) {
      return NextResponse.json({ error: "يرجى اختيار المادة أو الكورس" }, { status: 400 });
    }

    if (!videoFile || videoFile.size === 0) {
      return NextResponse.json({ error: "يرجى اختيار ملف فيديو صالح للرفع" }, { status: 400 });
    }

    // 3. Save file directly to Next.js server storage
    const uploadDir = path.join(process.cwd(), "uploads", "videos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(videoFile.name) || ".mp4";
    const baseName = path.basename(videoFile.name, ext).replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");
    const safeFilename = `${Date.now()}-${baseName}${ext}`;
    const targetFilePath = path.join(uploadDir, safeFilename);

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.promises.writeFile(targetFilePath, videoBuffer);

    const videoUrl = `/api/videos/${safeFilename}`;

    // 4. Ensure academic month exists
    const academicMonth = await ensureAcademicMonth(month);

    // 5. Fetch subject data to inherit levels and streams
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        title: true,
        levels: true,
        streams: true,
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "المادة المحددة غير موجودة" }, { status: 404 });
    }

    // 6. Calculate next order in month
    const existingCount = await prisma.lesson.count({
      where: {
        subjects: { some: { id: subjectId } },
        month: month,
      },
    });

    // 7. Create Lesson in Database
    const lesson = await prisma.lesson.create({
      data: {
        title: title,
        description: description,
        month: month,
        monthId: academicMonth.id,
        order: existingCount + 1,
        vimeoVideoId: videoUrl,
        streams: subject.streams,
        levels: subject.levels,
        subjects: {
          connect: { id: subjectId },
        },
      },
      include: {
        subjects: {
          select: { id: true, title: true },
        },
      },
    });

    // 8. Revalidate dashboard routes
    revalidatePath("/dashboard/admin/lessons");
    revalidatePath(`/dashboard/student/subjects/${subjectId}`);
    revalidatePath(`/dashboard/student/subjects/${subjectId}/lessons`);

    return NextResponse.json({
      success: true,
      message: "تم رفع الفيديو وحفظ الدرس بنجاح في المنصة!",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        vimeoVideoId: lesson.vimeoVideoId,
        embedUrl: lesson.vimeoVideoId,
        subject: subject.title,
        month: lesson.month,
      },
    });
  } catch (error: any) {
    console.error("Error in lesson direct upload:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير متوقع أثناء رفع وحفظ الدرس" },
      { status: 500 }
    );
  }
}
