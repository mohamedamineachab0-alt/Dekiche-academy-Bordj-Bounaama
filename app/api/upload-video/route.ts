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

    let lessonId: string | null = null;
    let title: string | null = null;
    let subjectId: string | null = null;
    let month = 1;
    let description = "";
    let vimeoVideoId: string | null = null;
    let file: File | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      lessonId = body.lessonId?.toString().trim() || null;
      title = body.title?.toString().trim() || null;
      subjectId = body.subjectId?.toString().trim() || null;
      month = parseInt(body.month) || 1;
      description = body.description?.toString().trim() || "";
      vimeoVideoId = body.vimeoVideoId?.toString().trim() || null;
    } else {
      const formData = await req.formData();
      file = formData.get("file") as File | null;
      lessonId = (formData.get("lessonId") as string)?.trim() || null;
      title = (formData.get("title") as string)?.trim() || null;
      subjectId = (formData.get("subjectId") as string)?.trim() || null;
      month = parseInt(formData.get("month") as string) || 1;
      description = (formData.get("description") as string)?.trim() || "";
      vimeoVideoId = (formData.get("vimeoVideoId") as string)?.trim() || null;
    }

    let videoUrl: string = vimeoVideoId || "";

    // If no vimeoVideoId provided, check file
    if (!videoUrl) {
      if (!file || file.size === 0) {
        return NextResponse.json({ error: "يرجى اختيار ملف فيديو صالح للرفع أو تقديم معرّف Vimeo" }, { status: 400 });
      }

      // Check if we can upload to Vimeo directly via server
      const vimeoToken = process.env.VIMEO_ACCESS_TOKEN || "c43079199931f07975da832cf5a35ffa";
      let vimeoUploaded = false;

      if (vimeoToken) {
        try {
          const vimeoTicketRes = await fetch("https://api.vimeo.com/me/videos", {
            method: "POST",
            headers: {
              Authorization: `bearer ${vimeoToken}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.vimeo.*+json;version=3.4",
            },
            body: JSON.stringify({
              upload: {
                approach: "tus",
                size: file.size,
              },
              name: title || file.name,
              description: description || "فيديو مرفوع من المنصة",
              privacy: {
                view: "unlisted",
                embed: "public",
                download: false,
              },
            }),
          });

          if (vimeoTicketRes.ok) {
            const vimeoData = await vimeoTicketRes.json();
            const uploadLink = vimeoData.upload?.upload_link;
            const uri = vimeoData.uri;
            if (uploadLink && uri) {
              const fileBuffer = Buffer.from(await file.arrayBuffer());
              const patchRes = await fetch(uploadLink, {
                method: "PATCH",
                headers: {
                  "Tus-Resumable": "1.0.0",
                  "Upload-Offset": "0",
                  "Content-Type": "application/offset+octet-stream",
                  Accept: "application/vnd.vimeo.*+json;version=3.4",
                },
                body: fileBuffer,
              });

              if (patchRes.ok) {
                videoUrl = uri.replace("/videos/", "");
                vimeoUploaded = true;
              }
            }
          }
        } catch (vimeoErr) {
          console.error("Vimeo server-side upload attempt failed, falling back to local file:", vimeoErr);
        }
      }

      if (!vimeoUploaded) {
        // Fallback to local file storage
        const uploadDir = path.join(process.cwd(), "uploads", "videos");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const ext = path.extname(file.name) || ".mp4";
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");
        const safeFilename = `${Date.now()}-${baseName}${ext}`;
        const targetFilePath = path.join(uploadDir, safeFilename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.promises.writeFile(targetFilePath, buffer);
        videoUrl = `/api/videos/${safeFilename}`;
      }
    }

    // Handle Lesson update or creation
    let resultingLesson: any = null;

    if (lessonId) {
      // Update existing lesson
      resultingLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          vimeoVideoId: videoUrl,
          youtubeVideoId: null,
        },
        include: {
          subjects: { select: { id: true, title: true } },
        },
      });

      // Also link pendingLesson for the teacher if it doesn't exist
      try {
        const existingRecord = await prisma.pendingLesson.findFirst({
          where: { publishedLessonId: lessonId },
        });
        if (!existingRecord) {
          await prisma.pendingLesson.create({
            data: {
              title: resultingLesson.title,
              subjectId: resultingLesson.subjects[0]?.id || "",
              month: resultingLesson.month,
              level: (resultingLesson.levels && resultingLesson.levels[0]) || "MIDDLE_1",
              vimeoVideoId: videoUrl,
              editingNotes: "تم رفع الفيديو إلى Vimeo بواسطة الأستاذ",
              status: "published",
              teacherId: user.id,
              publishedLessonId: resultingLesson.id,
            },
          });
        } else {
          await prisma.pendingLesson.update({
            where: { id: existingRecord.id },
            data: { vimeoVideoId: videoUrl },
          });
        }
      } catch (e) {
        console.error("Non-fatal pendingLesson sync:", e);
      }

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
          youtubeVideoId: null,
          levels: subject.levels,
          streams: subject.streams,
          subjects: { connect: { id: subjectId } },
        },
        include: {
          subjects: { select: { id: true, title: true } },
        },
      });

      try {
        await prisma.pendingLesson.create({
          data: {
            title,
            subjectId,
            month,
            level: (subject.levels && subject.levels[0]) || "MIDDLE_1",
            vimeoVideoId: videoUrl,
            editingNotes: description || "درس جديد تم رفعه إلى Vimeo",
            status: "published",
            teacherId: user.id,
            publishedLessonId: resultingLesson.id,
          },
        });
      } catch (e) {
        console.error("Non-fatal pendingLesson creation:", e);
      }

      revalidatePath(`/dashboard/student/subjects/${subjectId}`);
      revalidatePath(`/dashboard/student/subjects/${subjectId}/lessons`);
    }

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/admin/lessons");

    return NextResponse.json({
      success: true,
      message: "تم حفظ الفيديو وربطه بالدرس بنجاح!",
      url: videoUrl,
      vimeoVideoId: videoUrl,
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
      { error: error?.message || "حدث خطأ في الخادم أثناء معالجة الفيديو" },
      { status: 500 }
    );
  }
}
