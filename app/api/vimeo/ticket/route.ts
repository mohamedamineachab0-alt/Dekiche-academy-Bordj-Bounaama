import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
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
      return NextResponse.json({ error: "غير مصرح - صلاحيات الأستاذ أو الإدارة مطلوبة" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const title = (body.title as string)?.trim() || `تسجيل الأستاذ ${user.fullName}`;
    const size = parseInt(body.size as string) || 0;
    const description = (body.description as string)?.trim() || `رفع بواسطة ${user.fullName}`;

    if (!size || size <= 0) {
      return NextResponse.json({ error: "حجم الفيديو غير صالح" }, { status: 400 });
    }

    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN || "c43079199931f07975da832cf5a35ffa";

    const vimeoRes = await fetch("https://api.vimeo.com/me/videos", {
      method: "POST",
      headers: {
        Authorization: `bearer ${vimeoToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        upload: {
          approach: "tus",
          size: size,
        },
        name: title,
        description: description,
        privacy: {
          view: "unlisted",
          embed: "public",
          download: false,
        },
      }),
    });

    if (!vimeoRes.ok) {
      const err = await vimeoRes.json().catch(() => ({}));
      console.error("Vimeo ticket error:", err);
      return NextResponse.json(
        { error: err.error || err.developer_message || "فشل الاتصال بـ Vimeo لإنشاء تذكرة الرفع" },
        { status: vimeoRes.status }
      );
    }

    const vimeoData = await vimeoRes.json();
    const uploadLink = vimeoData.upload?.upload_link;
    const uri = vimeoData.uri; // e.g. "/videos/123456789"
    const videoId = uri ? uri.replace("/videos/", "") : "";

    if (!uploadLink || !videoId) {
      return NextResponse.json({ error: "لم يتم استلام رابط الرفع من Vimeo" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      uploadLink,
      uri,
      videoId,
      playerUrl: `https://player.vimeo.com/video/${videoId}`,
    });
  } catch (error: any) {
    console.error("Error in /api/vimeo/ticket:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير متوقع أثناء الاتصال بـ Vimeo" },
      { status: 500 }
    );
  }
}
