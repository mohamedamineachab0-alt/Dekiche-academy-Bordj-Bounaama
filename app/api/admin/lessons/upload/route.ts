import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

    // 3. Initiate Vimeo Tus Upload Ticket
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!vimeoToken) {
      return NextResponse.json(
        { error: "إعدادات Vimeo API غير مكتملة في الخادم (VIMEO_ACCESS_TOKEN مفقود)" },
        { status: 500 }
      );
    }

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
        name: title,
        description: description,
        privacy: {
          view: "unlisted", // Protect from public listing
          embed: "whitelist", // Protected embed
          download: false, // Prevent unauthorized downloads
        },
      }),
    });

    if (!ticketRes.ok) {
      const errData = await ticketRes.json().catch(() => ({}));
      console.error("Vimeo ticket error:", errData);
      return NextResponse.json(
        { error: errData.error || errData.developer_message || "فشل الاتصال بمنصة Vimeo لإنشاء تذكرة الرفع" },
        { status: ticketRes.status }
      );
    }

    const vimeoData = await ticketRes.json();
    const uploadLink = vimeoData.upload?.upload_link;
    const vimeoUri = vimeoData.uri; // Format: /videos/123456789
    const vimeoVideoId = vimeoUri ? vimeoUri.replace("/videos/", "") : "";

    if (!uploadLink || !vimeoVideoId) {
      return NextResponse.json(
        { error: "لم يتم استلام رابط الرفع من Vimeo" },
        { status: 502 }
      );
    }

    // 4. Stream upload binary chunks to Vimeo via Tus
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
      console.error("Vimeo patch error:", patchRes.status, await patchRes.text());
      return NextResponse.json(
        { error: "فشل نقل ملف الفيديو إلى سيرفرات Vimeo" },
        { status: 502 }
      );
    }

    // 5. Ensure academic month exists
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

    // 6. Save lesson to Supabase / PostgreSQL database
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        month,
        monthId: academicMonth.id,
        vimeoVideoId,
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

    const embedUrl = `https://player.vimeo.com/video/${vimeoVideoId}`;

    return NextResponse.json({
      success: true,
      message: "تم رفع الفيديو وحفظ الدرس بنجاح",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        vimeoVideoId: lesson.vimeoVideoId,
        embedUrl,
        subject: lesson.subjects[0]?.title || "",
        month: lesson.month,
      },
    });
  } catch (error: any) {
    console.error("Lesson creation/upload error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير متوقع أثناء معالجة ونشر الدرس" },
      { status: 500 }
    );
  }
}
