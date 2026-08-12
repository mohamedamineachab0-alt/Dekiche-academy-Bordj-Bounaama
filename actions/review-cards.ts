"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Level, Stream } from "@/generated/prisma";

export async function createReviewCard(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const subjectId = formData.get("subjectId") as string;
    const level = formData.get("level") as Level;
    const stream = formData.get("stream") as Stream;
    const monthStr = formData.get("month") as string;
    const month = monthStr ? parseInt(monthStr) : 1;
    const exerciseRef = formData.get("exerciseRef") as string | null;

    if (!title || !question || !answer || !subjectId || !level || !stream || !month) {
      throw new Error("يرجى ملء جميع الحقول الإلزامية");
    }

    await prisma.reviewCard.create({
      data: {
        title,
        question,
        answer,
        subjectId,
        level,
        stream,
        month,
        exerciseRef: exerciseRef || null,
      }
    });

    revalidatePath("/dashboard/admin", "layout");
    revalidatePath("/dashboard/student", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("createReviewCard error:", error);
    throw new Error(error.message || "حدث خطأ أثناء إنشاء بطاقة المراجعة");
  }
}

export async function getStudentCards(level: Level, stream: Stream, subjectId?: string) {
  try {
    const whereClause: any = {
      level,
      stream
    };

    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const cards = await prisma.reviewCard.findMany({
      where: whereClause,
      include: {
        subject: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return cards;
  } catch (error) {
    console.error("getStudentCards error:", error);
    return [];
  }
}

export async function fetchMyReviewCards() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) throw new Error("غير مسجل الدخول");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: sessionId },
  });

  if (!studentProfile) throw new Error("الملف الشخصي غير موجود");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: sessionId },
    select: { subjectId: true, enrolledMonths: true }
  });

  const enrolledSubjectIds = enrollments.map(e => e.subjectId);
  const enrolledMonths = Array.from(new Set(enrollments.flatMap(e => e.enrolledMonths)));

  const cards = await prisma.reviewCard.findMany({
    where: {
      level: studentProfile.level,
      stream: studentProfile.stream,
      subjectId: { in: enrolledSubjectIds },
      month: { in: enrolledMonths }
    },
    include: {
      subject: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return cards;
}
