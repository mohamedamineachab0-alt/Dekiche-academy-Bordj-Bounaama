"use server";

import { prisma } from "@/lib/prisma";

export type TeacherFinancialLedger = {
  teacherId: string;
  teacherName: string;
  phone: string;
  subjectsCount: number;
  totalStudents: number;
  totalGrossRevenue: number;
  subjectsBreakdown: {
    subjectId: string;
    title: string;
    price: number;
    enrollmentCount: number;
    subjectRevenue: number;
  }[];
};

export async function getTeacherRevenues(): Promise<TeacherFinancialLedger[]> {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        subjects: {
          include: {
            enrollments: true
          }
        }
      }
    });

    const ledger: TeacherFinancialLedger[] = teachers.map((teacher) => {
      let totalStudents = 0;
      let totalGrossRevenue = 0;

      const subjectsBreakdown = teacher.subjects.map(subject => {
        const enrollmentCount = subject.enrollments.length;
        const subjectRevenue = enrollmentCount * subject.price;
        
        totalStudents += enrollmentCount;
        totalGrossRevenue += subjectRevenue;

        return {
          subjectId: subject.id,
          title: subject.title,
          price: subject.price,
          enrollmentCount,
          subjectRevenue
        };
      });

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        phone: teacher.phone,
        subjectsCount: teacher.subjects.length,
        totalStudents,
        totalGrossRevenue,
        subjectsBreakdown
      };
    });

    return ledger.sort((a, b) => b.totalGrossRevenue - a.totalGrossRevenue);
  } catch (error) {
    console.error("getTeacherRevenues error:", error);
    return [];
  }
}
