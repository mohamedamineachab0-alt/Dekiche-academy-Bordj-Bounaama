"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export type AlertType = "SECURITY" | "ACADEMIC" | "ACCOUNT";

export type TenebatiFlag = {
  id: string;
  type: AlertType;
  message: string;
  color: string;
};

export type TenebatiStudentAlert = {
  id: string;
  studentName: string;
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  flags: TenebatiFlag[];
};

export async function getAdminAlerts(): Promise<{ success: boolean; alerts?: TenebatiStudentAlert[]; error?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { success: false, error: "غير مصرح" };
    }

    const admin = await prisma.user.findUnique({
      where: { id: sessionId },
    });

    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "غير مصرح" };
    }

    // Fetch all students with related data
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        studentProfile: true,
        studentLinks: {
          include: { parent: true }
        },
        mistakes: true,
        enrollments: true,
      },
    });

    const alerts: TenebatiStudentAlert[] = [];

    for (const student of students) {
      if (!student.studentProfile) continue;

      const flags: TenebatiFlag[] = [];

      // 1 SECURITY Multi-device login
      if (student.deviceFingerprints && student.deviceFingerprints.length > 1) {
        flags.push({
          id: `multi-device-${student.id}`,
          type: "SECURITY",
          message: "فتح حسابه في أكثر من جهاز",
          color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900"
        });
      }

      // 2 ACCOUNT No parent linked
      if (student.studentLinks.length === 0) {
        flags.push({
          id: `no-parent-${student.id}`,
          type: "ACCOUNT",
          message: "عدم ربط حسابه لولي",
          color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
        });
      }

      // 3 ACADEMIC Excessive mistakes
      if (student.mistakes && student.mistakes.length > 10) {
        flags.push({
          id: `many-mistakes-${student.id}`,
          type: "ACADEMIC",
          message: "كثرة أخطاء",
          color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900"
        });
      }

      // 4 ACADEMIC Unwatched lessons or pending quizzes
      // If enrolled in at least one subject but has 0 total points (meaning hasn't participated/completed exercises)
      if (student.enrollments.length > 0 && student.studentProfile.totalPoints === 0) {
        flags.push({
          id: `pending-lessons-${student.id}`,
          type: "ACADEMIC",
          message: "دروس لم تشاهد وما زالت معلقة",
          color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900"
        });
        
        flags.push({
          id: `pending-quizzes-${student.id}`,
          type: "ACADEMIC",
          message: "تمارين وكويزز معلقة",
          color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900"
        });
      }

      // If student has at least one flag, add them to alerts list
      if (flags.length > 0) {
        let pName = "غير متوفر";
        let pPhone = "غير متوفر";
        if (student.studentLinks.length > 0) {
          pName = student.studentLinks[0].parent.fullName;
          pPhone = student.studentLinks[0].parent.phoneNumber;
        }

        alerts.push({
          id: student.id,
          studentName: student.fullName,
          studentPhone: student.phoneNumber,
          parentName: pName,
          parentPhone: pPhone,
          flags: flags,
        });
      }
    }

    return { success: true, alerts };
  } catch (error: any) {
    if (error?.digest?.includes("DYNAMIC_SERVER_USAGE") || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error fetching admin alerts:", error);
    return { success: false, error: "حدث خطأ غير متوقع" };
  }
}
