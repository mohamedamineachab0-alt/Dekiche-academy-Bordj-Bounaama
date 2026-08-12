"use server";

import { prisma } from "@/lib/prisma";
import { Level, Stream } from "@/generated/prisma";

export type AdminStudentMetrics = {
  id: string;
  fullName: string;
  phone: string;
  level: Level;
  stream: Stream;
  wilaya: string;
  totalPoints: number;
  lastLoginAt: Date | null;
  deviceFingerprints: string[];
  mistakesCount: number;
  isParentLinked: boolean;
  enrolledSubjects: string[];
};

export async function getStudentMonitoringMetrics(filters?: {
  level?: Level;
  stream?: Stream;
  subjectId?: string;
}): Promise<AdminStudentMetrics[]> {
  try {
    const whereClause: any = {
      role: "STUDENT",
      studentProfile: {
        isNot: null,
      }
    };

    if (filters?.level) {
      whereClause.studentProfile.level = filters.level;
    }
    if (filters?.stream) {
      whereClause.studentProfile.stream = filters.stream;
    }
    if (filters?.subjectId) {
      whereClause.enrollments = {
        some: { subjectId: filters.subjectId }
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        studentProfile: true,
        studentLinks: true, // Parent links
        mistakes: true,
        enrollments: {
          include: { subject: true }
        }
      },
      orderBy: {
        studentProfile: {
          totalPoints: 'desc'
        }
      }
    });

    const metrics: AdminStudentMetrics[] = students.map(user => {
      const profile = user.studentProfile!;
      
      return {
        id: user.id,
        fullName: user.fullName,
        phone: user.phoneNumber,
        level: profile.level,
        stream: profile.stream,
        wilaya: profile.wilaya,
        totalPoints: profile.totalPoints,
        lastLoginAt: user.lastLoginAt,
        deviceFingerprints: user.deviceFingerprints,
        mistakesCount: user.mistakes.length,
        isParentLinked: user.studentLinks.length > 0,
        enrolledSubjects: user.enrollments.map(e => e.subject.title)
      };
    });

    return metrics;
  } catch (error) {
    console.error("getStudentMonitoringMetrics error:", error);
    return [];
  }
}
