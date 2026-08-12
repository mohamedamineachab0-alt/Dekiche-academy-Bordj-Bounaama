"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase, ensureBucketExists } from "@/lib/supabase";
import { Level, Stream } from "@/generated/prisma";

export type SubjectActionState = {
  error?: string;
  success?: boolean;
  codes?: any[];
};

export async function createSubject(
  formData: FormData
): Promise<SubjectActionState> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacherId") as string;
    const manualTeacherName = formData.get("manualTeacherName") as string;
    
    let imageUrl = "https://images.unsplash.com/photo-1546410531-bea5acadb043?q=80&w=600&auto=format&fit=crop";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      await ensureBucketExists("subject-covers");
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage.from("subject-covers").upload(fileName, imageFile, { upsert: false });
      if (data) {
        const { data: publicUrlData } = supabase.storage.from("subject-covers").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    const priceStr = formData.get("price") as string;
    const price = priceStr ? parseFloat(priceStr) : 0;
    const accessType = formData.get("accessType") as string || "YEARLY";
    const level = formData.get("level") as Level;
    const stream = formData.get("stream") as Stream;

    if (!title || !description || isNaN(price) || !level || !stream) {
      return { error: "يرجى ملء جميع الحقول المطلوبة" };
    }

    const teacher = teacherId ? await prisma.teacher.findUnique({ where: { id: teacherId } }) : null;
    const teacherName = teacher?.name || manualTeacherName || "غير محدد";

    await prisma.subject.create({
      data: {
        title,
        description,
        teacherId: teacherId || null,
        teacherName,
        image: imageUrl,
        price,
        accessType, // MONTHLY or YEARLY
        level,
        stream,
        isPublished: true,
      },
    });

    revalidatePath("/dashboard/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء إنشاء المادة" };
  }
}

export async function generateAccessCode(
  formData: FormData
): Promise<SubjectActionState> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    
    if (!sessionId) {
      return { error: "غير مصرح" };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { error: "غير مصرح" };
    }

    const subjectId = formData.get("subjectId") as string;
    const accessType = formData.get("accessType") as string; // MONTHLY or YEARLY
    const validMonthsStr = formData.getAll("validMonths") as string[];
    const count = parseInt(formData.get("count") as string) || 1;

    if (!subjectId || !accessType || count < 1) {
      return { error: "يرجى اختيار المادة ونوع الوصول والعدد" };
    }

    const validMonths = validMonthsStr.map(m => parseInt(m)).filter(n => !isNaN(n));

    // Generate N random codes
    const codes = Array.from({ length: count }).map(() => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      subjectId,
      accessType,
      validMonths,
    }));

    await prisma.accessCode.createMany({
      data: codes,
    });

    revalidatePath("/dashboard/admin/codes");
    return { success: true, codes };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء توليد رموز الدخول" };
  }
}

export async function redeemAccessCode(
  formData: FormData
): Promise<any> {
  let redirectUrl = "";
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    if (!sessionId) return { error: "يجب تسجيل الدخول" };

    const codeStr = formData.get("code") as string;
    const targetSubjectId = formData.get("subjectId") as string;

    if (!codeStr) return { error: "يرجى إدخال رمز الدخول" };

    const code = await prisma.accessCode.findUnique({
      where: { code: codeStr.toUpperCase() },
      include: { subject: true },
    });

    if (!code) return { error: "الرمز غير صحيح" };
    if (targetSubjectId && code.subjectId !== targetSubjectId) return { error: "هذا الرمز لا يخص هذه المادة" };
    if (code.isUsed) return { error: "تم استخدام هذا الرمز مسبقاً" };

    // Valid, let's redeem it
    await prisma.$transaction(async (tx) => {
      // Mark code as used
      await tx.accessCode.update({
        where: { id: code.id },
        data: {
          isUsed: true,
          studentId: sessionId,
        },
      });

      // Find or create enrollment
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          studentId_subjectId: {
            studentId: sessionId,
            subjectId: code.subjectId,
          }
        }
      });

      if (existingEnrollment) {
        // Merge months
        const newMonths = new Set([...existingEnrollment.enrolledMonths, ...code.validMonths]);
        if (code.accessType === "YEARLY") {
          // Add 1-12
          [1,2,3,4,5,6,7,8,9,10,11,12].forEach(m => newMonths.add(m));
        }
        await tx.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { enrolledMonths: Array.from(newMonths) },
        });
      } else {
        const initialMonths = code.accessType === "YEARLY" ? [1,2,3,4,5,6,7,8,9,10,11,12] : code.validMonths;
        await tx.enrollment.create({
          data: {
            studentId: sessionId,
            subjectId: code.subjectId,
            enrolledMonths: initialMonths,
          }
        });
      }
    });

    revalidatePath("/dashboard/student/subjects");
    redirectUrl = `/dashboard/student/subjects/${code.subjectId}`;
  } catch (err: any) {
    return { error: "حدث خطأ أثناء تفعيل الرمز" };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return { success: true };
}

export async function deleteSubject(
  subjectId: string
): Promise<any> {
  try {
    await prisma.subject.delete({
      where: { id: subjectId },
    });
    revalidatePath("/dashboard/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { error: "حدث خطأ أثناء حذف المادة" };
  }
}
