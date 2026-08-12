"use server";

import { prisma } from "@/lib/prisma";

export type RoadmapNode = {
  id: string;
  type: "LESSON" | "EXAM" | "DAILY_EXERCISE" | "LIVE_CLASS";
  title: string;
  href: string;
  month: number;
  status: "COMPLETED" | "PENDING" | "NEEDS_REVIEW";
  createdAt: Date;
  score?: number;
};

export type SubjectRoadmap = {
  subjectId: string;
  subjectTitle: string;
  months: {
    month: number;
    nodes: RoadmapNode[];
  }[];
};

export async function getStudentRoadmap(studentId: string): Promise<SubjectRoadmap[]> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        subject: {
          include: {
            lessons: {
              include: {
                quiz: true,
                mistakes: {
                  where: { studentId }
                }
              }
            },
            exams: {
              include: {
                submissions: {
                  where: { studentId }
                }
              }
            },
            dailyExercises: {
              include: {
                quiz: {
                  include: {
                    mistakes: {
                      where: { studentId }
                    }
                  }
                }
              }
            },
            liveClasses: true
          }
        }
      }
    });

    const roadmaps: SubjectRoadmap[] = enrollments.map(enrollment => {
      const subject = enrollment.subject;
      const allNodes: RoadmapNode[] = [];

      // 1. Process Lessons
      subject.lessons.forEach(lesson => {
        let status: "COMPLETED" | "PENDING" | "NEEDS_REVIEW" = "PENDING";
        if (lesson.mistakes.length > 0) {
          status = "NEEDS_REVIEW";
        }
        
        allNodes.push({
          id: `lesson-${lesson.id}`,
          type: "LESSON",
          title: `درس: ${lesson.title}`,
          href: `/dashboard/student/subjects/${subject.id}`,
          month: lesson.month,
          status,
          createdAt: lesson.createdAt
        });
      });

      // 2. Process Exams
      subject.exams.forEach(exam => {
        const submission = exam.submissions[0];
        let status: "COMPLETED" | "PENDING" | "NEEDS_REVIEW" = "PENDING";
        let score = undefined;

        if (submission) {
          status = "COMPLETED";
          score = submission.score ?? undefined;
        }

        // Exams don't have a direct month, we'll try to guess based on created date or place it in a default month.
        // Let's assume month 1 for now if no month property exists.
        allNodes.push({
          id: `exam-${exam.id}`,
          type: "EXAM",
          title: `اختبار: ${exam.title}`,
          href: `/dashboard/student/exams`,
          month: 1, // Fallback
          status,
          score,
          createdAt: exam.createdAt
        });
      });

      // 3. Process Daily Exercises
      subject.dailyExercises.forEach(exercise => {
        let status: "COMPLETED" | "PENDING" | "NEEDS_REVIEW" = "PENDING";
        if (exercise.quiz?.mistakes && exercise.quiz.mistakes.length > 0) {
          status = "NEEDS_REVIEW";
        }

        allNodes.push({
          id: `exercise-${exercise.id}`,
          type: "DAILY_EXERCISE",
          title: `تمرين: ${exercise.title}`,
          href: `/dashboard/student/exercises`,
          month: 1, // Fallback
          status,
          createdAt: exercise.createdAt
        });
      });

      // 4. Process Live Classes
      subject.liveClasses.forEach(live => {
        allNodes.push({
          id: `live-${live.id}`,
          type: "LIVE_CLASS",
          title: `مباشر: ${live.title}`,
          href: `/dashboard/student/live-classes`,
          month: live.month,
          status: "PENDING", // Live classes don't have direct completion yet
          createdAt: live.createdAt
        });
      });

      // Group nodes by month
      const nodesByMonth: Record<number, RoadmapNode[]> = {};
      
      // Attempt to intelligently infer months for exams and exercises based on lessons creation dates if we have them.
      // But for simplicity, we map fallback to 1 and let chronological sorting handle the rest.
      
      allNodes.forEach(node => {
        if (!nodesByMonth[node.month]) nodesByMonth[node.month] = [];
        nodesByMonth[node.month].push(node);
      });

      const months = Object.keys(nodesByMonth).map(m => parseInt(m)).sort((a, b) => a - b).map(month => {
        return {
          month,
          // Sort nodes within the month chronologically
          nodes: nodesByMonth[month].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        }
      });

      return {
        subjectId: subject.id,
        subjectTitle: subject.title,
        months
      };
    });

    return roadmaps;
  } catch (error) {
    console.error("getStudentRoadmap error:", error);
    return [];
  }
}
