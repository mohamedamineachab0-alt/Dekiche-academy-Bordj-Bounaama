"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { supabase, ensureBucketExists } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getUserSessionProfile() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatarUrl: true,
      }
    });

    return user;
  } catch (error: any) {
    if (error?.digest?.includes("DYNAMIC_SERVER_USAGE") || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error fetching user session profile:", error);
    return null;
  }
}

function isStudentPhotoUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  try {
    const parsed = new URL(url);
    const expected = new URL(base);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === expected.hostname &&
      parsed.pathname.includes("/storage/v1/object/public/") &&
      parsed.pathname.includes("/student-avatars/")
    );
  } catch {
    return false;
  }
}

async function requireStudentSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return { error: "غير مصرح" as const };

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return { error: "غير مصرح" as const };
  return { userId: user.id };
}

export async function uploadStudentPhoto(formData: FormData) {
  try {
    const session = await requireStudentSession();
    if ("error" in session) return session;

    const file = formData.get("photo");
    if (!(file instanceof Blob) || file.size === 0) {
      return { error: "يرجى اختيار صورة" };
    }
    if (file.size > 3 * 1024 * 1024) {
      return { error: "الصورة يجب ألا تتجاوز 3 ميغابايت" };
    }

    const type = file.type || "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(type)) {
      return { error: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG." };
    }

    const bucket = "subject-covers";
    await ensureBucketExists(bucket);
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    const fileName = `student-avatars/${session.userId}/${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, bytes, { contentType: type === "image/jpg" ? "image/jpeg" : type, upsert: false });

    if (uploadError) {
      console.error("avatar upload", uploadError);
      return { error: "فشل رفع الصورة. أعد المحاولة." };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: data.publicUrl },
    });

    revalidatePath("/dashboard/student/settings");
    revalidatePath("/dashboard/student", "layout");
    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error("Error uploading photo:", error);
    return { error: "حدث خطأ أثناء رفع الصورة" };
  }
}

export async function saveStudentPhotoUrl(photoUrl: string) {
  try {
    const session = await requireStudentSession();
    if ("error" in session) return session;
    if (!isStudentPhotoUrl(photoUrl)) {
      return { error: "رابط الصورة غير صالح" };
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: photoUrl },
    });

    revalidatePath("/dashboard/student/settings");
    revalidatePath("/dashboard/student", "layout");
    return { success: true, url: photoUrl };
  } catch (error) {
    console.error("Error saving photo url:", error);
    return { error: "حدث خطأ أثناء حفظ الصورة" };
  }
}
