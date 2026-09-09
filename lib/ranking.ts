import { prisma } from "@/lib/prisma";
import { INACTIVE_DAYS, inactiveSinceDate, labelLevel, labelStream } from "@/lib/education-labels";
import type { Level, Stream } from "@/generated/prisma";

export type RankingParts = {
  stored: number;
  exams: number;
  submissions: number;
  activity: number;
  enrollments: number;
  mistakes: number;
};

export type RankedStudent = {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  level: string;
  stream: string;
  wilaya: string | null;
  score: number;
  parts: RankingParts;
};

/** Weights used to recompute rank from live activity, not a frozen total. */
export const RANKING_RULES = [
  { key: "exams", label: "مجموع علامات الاختبارات × 2" },
  { key: "submissions", label: "كل إجابة مرسلة +8" },
  { key: "stored", label: "نقاط التمارين المسجّلة" },
  { key: "activity", label: `دخول خلال ${INACTIVE_DAYS} أيام +15` },
  { key: "enrollments", label: "كل مادة مفعّلة +4" },
  { key: "mistakes", label: "كل خطأ مسجّل −2" },
] as const;

export function computeRankingScore(input: {
  storedPoints: number;
  examScoreSum: number;
  submissionsCount: number;
  mistakesCount: number;
  enrollmentsCount: number;
  lastLoginAt: Date | null;
}): { score: number; parts: RankingParts } {
  const parts: RankingParts = {
    exams: Math.max(0, input.examScoreSum) * 2,
    submissions: input.submissionsCount * 8,
    stored: Math.max(0, input.storedPoints),
    activity: !input.lastLoginAt || input.lastLoginAt < inactiveSinceDate() ? 0 : 15,
    enrollments: input.enrollmentsCount * 4,
    mistakes: input.mistakesCount * 2,
  };
  const score = Math.max(
    0,
    parts.exams + parts.submissions + parts.stored + parts.activity + parts.enrollments - parts.mistakes
  );
  return { score, parts };
}

export async function getRankedStudents(filters?: {
  level?: Level;
  stream?: Stream;
  limit?: number;
}): Promise<RankedStudent[]> {
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
    },
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      avatarUrl: true,
      lastLoginAt: true,
      studentProfile: {
        select: { level: true, stream: true, wilaya: true, totalPoints: true },
      },
      _count: { select: { mistakes: true, enrollments: true, submissions: true } },
    },
  });

  const scoreSums = await prisma.studentSubmission.groupBy({
    by: ["studentId"],
    _sum: { score: true },
  });
  const examByStudent = new Map(scoreSums.map((row) => [row.studentId, row._sum.score ?? 0]));

  const ranked = students.map((user) => {
    const { score, parts } = computeRankingScore({
      storedPoints: user.studentProfile?.totalPoints ?? 0,
      examScoreSum: examByStudent.get(user.id) ?? 0,
      submissionsCount: user._count.submissions,
      mistakesCount: user._count.mistakes,
      enrollmentsCount: user._count.enrollments,
      lastLoginAt: user.lastLoginAt,
    });
    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      level: labelLevel(user.studentProfile?.level),
      stream: labelStream(user.studentProfile?.stream),
      wilaya: user.studentProfile?.wilaya ?? null,
      score,
      parts,
    };
  });

  ranked.sort((a, b) => b.score - a.score || a.fullName.localeCompare(b.fullName, "ar"));
  return typeof filters?.limit === "number" ? ranked.slice(0, filters.limit) : ranked;
}

export function rankOf(studentId: string, ranked: RankedStudent[]) {
  const index = ranked.findIndex((row) => row.id === studentId);
  return index >= 0 ? index + 1 : null;
}
