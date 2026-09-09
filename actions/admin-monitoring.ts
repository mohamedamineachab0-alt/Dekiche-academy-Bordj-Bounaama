"use server";

import { prisma } from "@/lib/prisma";
import { Level, Stream } from "@/generated/prisma";

export type AdminStudentMetrics = {
  id: string;
  fullName: string;
  phone: string;
  level: string;
  stream: string;
  wilaya: string;
  totalPoints: number;
  lastLoginAt: Date | null;
  deviceFingerprints: string[];
  mistakesCount: number;
  isParentLinked: boolean;
  enrolledSubjects: string[];
  filesCount: number;
};

export async function getStudentMonitoringMetrics(filters?: {
  level?: Level;
  stream?: Stream;
  subjectId?: string;
}): Promise<AdminStudentMetrics[]> {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(filters?.level || filters?.stream
          ? {
              studentProfile: {
                ...(filters.level ? { level: filters.level } : {}),
                ...(filters.stream ? { stream: filters.stream } : {}),
              },
            }
          : {}),
        ...(filters?.subjectId
          ? { enrollments: { some: { subjectId: filters.subjectId } } }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        lastLoginAt: true,
        deviceFingerprints: true,
        studentProfile: {
          select: { level: true, stream: true, wilaya: true, totalPoints: true },
        },
        studentLinks: { select: { id: true } },
        enrollments: { select: { subject: { select: { title: true } } } },
        _count: { select: { mistakes: true, submissions: true } },
      },
      orderBy: { fullName: "asc" },
    });

    return students.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      phone: user.phoneNumber,
      level: user.studentProfile?.level || "",
      stream: user.studentProfile?.stream || "",
      wilaya: user.studentProfile?.wilaya || "",
      totalPoints: user.studentProfile?.totalPoints ?? 0,
      lastLoginAt: user.lastLoginAt,
      deviceFingerprints: user.deviceFingerprints,
      mistakesCount: user._count.mistakes,
      isParentLinked: user.studentLinks.length > 0,
      enrolledSubjects: user.enrollments.map((e) => e.subject.title),
      filesCount: user._count.submissions,
    }));
  } catch (error) {
    console.error("getStudentMonitoringMetrics error:", error);
    return [];
  }
}
