import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Level, Stream } from "@/generated/prisma";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Teacher or Admin session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, fullName: true, role: true },
    });

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "غير مصرح - هذه الواجهة مخصصة للأساتذة والمشرفين فقط" },
        { status: 403 }
      );
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const subjectIds = formData.getAll("subjectIds") as string[];
    const streams = formData.getAll("streams") as Stream[];
    const levels = formData.getAll("levels") as Level[];
    const month = parseInt(formData.get("month") as string) || 1;
    const order = parseInt(formData.get("order") as string) || 1;
    const editingNotes = (formData.get("editingNotes") as string)?.trim() || "";
    const youtubeUrl = (formData.get("youtubeUrl") as string)?.trim() || "";
    const videoFile = formData.get("video") as File | null;
    const pdfFile = formData.get("pdf") as File | null;
    const bunnyVideoId = formData.get("bunnyVideoId") as string | null;

    if (!title) {
      return NextResponse.json({ error: "عنوان الدرس مطلوب" }, { status: 400 });
    }

    if (!subjectIds || subjectIds.length === 0) {
      return NextResponse.json({ error: "يرجى اختيار مادة مقررة واحدة على الأقل" }, { status: 400 });
    }

    if (!youtubeUrl && (!videoFile || videoFile.size === 0) && (!pdfFile || pdfFile.size === 0) && !bunnyVideoId) {
      return NextResponse.json({ error: "يرجى توفير ملف الدرس (PDF) أو تسجيل فيديو أو رابط يوتيوب صالح للرفع" }, { status: 400 });
    }

    let vimeoVideoId = bunnyVideoId || "";
    let finalYoutubeVideoId = null;

    if (youtubeUrl) {
      const match = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      finalYoutubeVideoId = match ? match[1] : youtubeUrl;
    } else if (videoFile && videoFile.size > 0 && !bunnyVideoId) {
      // 3. Initiate Vimeo Tus Upload Ticket
      const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
      if (!vimeoToken) {
        return NextResponse.json(
          { error: "مفتاح Vimeo API غير مهيأ في الخادم (VIMEO_ACCESS_TOKEN)" },
          { status: 500 }
        );
      }

      const vimeoName = `[مسجل] ${title} - ${user.fullName}`;
      const vimeoDesc = editingNotes ? `ملاحظات المونتاج: ${editingNotes}` : `درس مسجل بواسطة ${user.fullName}`;

      const ticketRes = await fetch("https://api.vimeo.com/me/videos", {
        method: "POST",
        headers: {
          Authorization: `bearer ${vimeoToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
        body: JSON.stringify({
          upload: {
            approach: "tus",
            size: videoFile.size,
          },
          name: vimeoName,
          description: vimeoDesc,
          privacy: {
            view: "unlisted",
            embed: "whitelist",
            download: false,
          },
        }),
      });

      if (!ticketRes.ok) {
        const errData = await ticketRes.json().catch(() => ({}));
        console.error("Vimeo ticket error for teacher recording:", errData);
        return NextResponse.json(
          { error: errData.error || errData.developer_message || "فشل الاتصال بـ Vimeo لإنشاء تذكرة الرفع" },
          { status: ticketRes.status }
        );
      }

      const vimeoData = await ticketRes.json();
      const uploadLink = vimeoData.upload?.upload_link;
      const vimeoUri = vimeoData.uri; // Format: /videos/123456789
      vimeoVideoId = vimeoUri ? vimeoUri.replace("/videos/", "") : "";

      if (!uploadLink || !vimeoVideoId) {
        return NextResponse.json(
          { error: "لم يتم استلام رابط الرفع المباشر من Vimeo" },
          { status: 502 }
        );
      }

      // 4. Stream video buffer to Vimeo Tus upload endpoint
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

      const patchRes = await fetch(uploadLink, {
        method: "PATCH",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Offset": "0",
          "Content-Type": "application/offset+octet-stream",
        },
        body: videoBuffer,
      });

      if (patchRes.status !== 204 && !patchRes.ok) {
        console.error("Vimeo PATCH error for recording:", patchRes.status, await patchRes.text());
        return NextResponse.json(
          { error: "فشل نقل محتوى التسجيل إلى سيرفرات Vimeo" },
          { status: 502 }
        );
      }
    }

    const vimeoUrl = `https://player.vimeo.com/video/${vimeoVideoId}`;

    let pdfUrl = null;
    if (pdfFile && pdfFile.size > 0) {
      const fileName = `pdf_${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("lesson-materials")
        .upload(fileName, pdfFile, { upsert: false });
        
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("lesson-materials")
          .getPublicUrl(fileName);
        pdfUrl = publicUrlData.publicUrl;
      } else {
        console.error("PDF upload error:", uploadError);
      }
    }

    // 5. Insert directly into Lesson table
    const validStreams = streams.filter(s => s !== "NONE");
    
    const lesson = await prisma.lesson.create({
      data: {
        title,
        month,
        order,
        streams: validStreams,
        levels: levels,
        vimeoVideoId: vimeoVideoId || "",
        youtubeVideoId: finalYoutubeVideoId,
        subjects: { connect: subjectIds.map(id => ({ id })) },
      }
    });

    // Determine title of the first subject for the vimeo metadata (if needed)
    let primarySubjectTitle = "درس";
    if (subjectIds.length > 0) {
      const subjectData = await prisma.subject.findUnique({
        where: { id: subjectIds[0] },
        select: { title: true }
      });
      primarySubjectTitle = subjectData?.title || "درس";
    }

    if (pdfUrl) {
      await prisma.lessonMaterial.create({
        data: {
          title: "ملف الدرس (PDF)",
          fileUrl: pdfUrl,
          lessonId: lesson.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم رفع التسجيل واعتماده كدرس بشكل مباشر",
      pendingLesson: {
        id: lesson.id,
        title: lesson.title,
        subjectTitle: primarySubjectTitle,
        vimeoVideoId: lesson.vimeoVideoId,
        vimeoUrl: lesson.vimeoVideoId ? `https://vimeo.com/${lesson.vimeoVideoId}` : null,
        editingNotes: editingNotes,
        status: "approved",
        createdAt: lesson.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Teacher recording upload error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير متوقع أثناء معالجة ورفع التسجيل" },
      { status: 500 }
    );
  }
}
