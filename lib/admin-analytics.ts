import { prisma } from "@/lib/prisma";
import { getStudentWorkFile, type StudentWorkFile } from "@/lib/student-work";
import { getWilayaName } from "@/lib/constants";
import { describeMistake } from "@/lib/mistake-source";
import {
  INACTIVE_DAYS,
  daysSince,
  inactiveSinceDate,
  labelLevel,
  labelStream,
} from "@/lib/education-labels";

export type ChartPoint = { name: string; value: number };
export type DualPoint = { name: string; mistakes: number; submissions: number };

export type InactiveStudentRow = {
  id: string;
  fullName: string;
  phone: string;
  level: string;
  stream: string;
  lastLoginAt: string | null;
  daysInactive: number;
  parentName: string;
  parentPhone: string;
  parentLinked: boolean;
};

export type StudentRosterRow = InactiveStudentRow & {
  isInactive: boolean;
  totalPoints: number;
};

export type InsightItem = {
  title: string;
  detail: string;
  severity: "high" | "medium" | "info";
  href?: string;
};

export type AdminAnalyticsHubData = {
  generatedAt: string;
  inactiveDays: number;
  kpis: {
    students: number;
    parents: number;
    teachers: number;
    publishedSubjects: number;
    lessons: number;
    enrollments: number;
    mistakes: number;
    submissions: number;
    unusedCodes: number;
    usedCodes: number;
    inactiveStudents: number;
    unlinkedParents: number;
    parentLinked: number;
  };
  weeklyActivity: DualPoint[];
  mistakesBySubject: ChartPoint[];
  studentsByLevel: ChartPoint[];
  parentLinkSplit: ChartPoint[];
  inactiveStudents: InactiveStudentRow[];
  allStudents: StudentRosterRow[];
  heuristicInsights: InsightItem[];
};

function arDayLabel(date: Date) {
  return date.toLocaleDateString("ar-DZ", { weekday: "short", day: "numeric" });
}

function emptyDays(days: number): DualPoint[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    return { name: arDayLabel(d), mistakes: 0, submissions: 0 };
  });
}

export async function getAdminAnalyticsHub(): Promise<AdminAnalyticsHubData> {
  const now = new Date();
  const since = inactiveSinceDate(now);
  const weekAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
  weekAgo.setHours(0, 0, 0, 0);

  const [
    students,
    parents,
    teachers,
    publishedSubjects,
    lessons,
    enrollments,
    mistakes,
    submissions,
    unusedCodes,
    usedCodes,
    parentLinked,
    studentsTotalForLink,
    recentMistakes,
    recentSubmissions,
    mistakeLessons,
    levelGroups,
    allStudentsRaw,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.subject.count({ where: { isPublished: true } }),
    prisma.lesson.count(),
    prisma.enrollment.count(),
    prisma.studentMistake.count(),
    prisma.studentSubmission.count(),
    prisma.accessCode.count({ where: { isUsed: false } }),
    prisma.accessCode.count({ where: { isUsed: true } }),
    prisma.user.count({
      where: { role: "STUDENT", studentLinks: { some: {} } },
    }),
    prisma.user.count({ where: { role: "STUDENT", studentProfile: { isNot: null } } }),
    prisma.studentMistake.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    }),
    prisma.studentSubmission.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    }),
    prisma.studentMistake.groupBy({
      by: ["lessonId"],
      _count: { _all: true },
    }),
    prisma.studentProfile.groupBy({
      by: ["level"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        lastLoginAt: true,
        studentProfile: { select: { level: true, stream: true, parentName: true, parentPhone: true, totalPoints: true } },
        studentLinks: {
          take: 1,
          select: {
            parent: { select: { fullName: true, phoneNumber: true, lastLoginAt: true } },
          },
        },
      },
    }),
  ]);

  const weeklyActivity = emptyDays(14);
  const dayIndex = new Map(weeklyActivity.map((row, i) => [row.name, i]));

  const bump = (date: Date, key: "mistakes" | "submissions") => {
    const label = arDayLabel(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    const idx = dayIndex.get(label);
    if (idx === undefined) return;
    weeklyActivity[idx][key] += 1;
  };
  recentMistakes.forEach((row) => bump(row.createdAt, "mistakes"));
  recentSubmissions.forEach((row) => bump(row.createdAt, "submissions"));

  const lessonsMeta = await prisma.lesson.findMany({
    where: { id: { in: mistakeLessons.map((row) => row.lessonId) } },
    select: { id: true, subjects: { select: { title: true } } },
  });
  const subjectCounts = new Map<string, number>();
  for (const row of mistakeLessons) {
    const lesson = lessonsMeta.find((item) => item.id === row.lessonId);
    const title = lesson?.subjects[0]?.title || "بدون مادة";
    subjectCounts.set(title, (subjectCounts.get(title) || 0) + (row._count?._all ?? 0));
  }
  const mistakesBySubject = Array.from(subjectCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const studentsByLevel = levelGroups
    .map((row) => ({ name: labelLevel(row.level), value: row._count._all }))
    .sort((a, b) => b.value - a.value);

  const unlinkedParents = Math.max(0, studentsTotalForLink - parentLinked);
  const parentLinkSplit: ChartPoint[] = [
    { name: "مربوط بولي", value: parentLinked },
    { name: "غير مربوط", value: unlinkedParents },
  ];

  const allStudents: StudentRosterRow[] = allStudentsRaw.map((user) => {
    const linked = user.studentLinks[0]?.parent;
    const isInactive = !user.lastLoginAt || user.lastLoginAt < since;
    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phoneNumber,
      level: labelLevel(user.studentProfile?.level),
      stream: labelStream(user.studentProfile?.stream),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      daysInactive: daysSince(user.lastLoginAt, now),
      parentName: linked?.fullName || user.studentProfile?.parentName || "غير مربوط",
      parentPhone: linked?.phoneNumber || user.studentProfile?.parentPhone || "—",
      parentLinked: Boolean(linked),
      isInactive,
      totalPoints: user.studentProfile?.totalPoints ?? 0,
    };
  });
  const inactiveList = allStudents.filter((row) => row.isInactive);

  const weakestSubject = mistakesBySubject[0];
  const heuristicInsights: InsightItem[] = [];

  if (inactiveList.length > 0) {
    heuristicInsights.push({
      title: `خمول ${INACTIVE_DAYS} أيام`,
      detail: `${inactiveList.length} تلميذاً لم يسجّلوا دخولاً منذ ${INACTIVE_DAYS} أيام متتالية. يُفضَّل التواصل مع أوليائهم.`,
      severity: "high",
      href: "/dashboard/admin/students/monitoring",
    });
  }
  if (unlinkedParents > 0) {
    heuristicInsights.push({
      title: "حسابات بلا ولي",
      detail: `${unlinkedParents} تلميذاً غير مربوطين بولي أمر، فتنقص متابعة المنزل.`,
      severity: "high",
      href: "/dashboard/admin/parents",
    });
  }
  if (weakestSubject && weakestSubject.value >= 3) {
    heuristicInsights.push({
      title: `تعثّر في ${weakestSubject.name}`,
      detail: `سُجّل ${weakestSubject.value} خطأ في هذه المادة. راجع الدروس الأخيرة وقدّم تدخّلاً جماعياً.`,
      severity: "medium",
      href: "/dashboard/admin/mistakes",
    });
  }
  if (inactiveList[0]) {
    heuristicInsights.push({
      title: `تدخّل فردي: ${inactiveList[0].fullName}`,
      detail: `انقطع عن المنصة منذ ${inactiveList[0].daysInactive} يوماً. ولي الأمر: ${inactiveList[0].parentName} — ${inactiveList[0].parentPhone}.`,
      severity: "high",
      href: `/dashboard/admin/students/${inactiveList[0].id}`,
    });
  }
  if (heuristicInsights.length === 0) {
    heuristicInsights.push({
      title: "المنصة مستقرة",
      detail: "لا توجد مؤشرات خمول أو تعثّر بارزة حالياً. واصل متابعة الأخطاء الأسبوعية.",
      severity: "info",
    });
  }

  return {
    generatedAt: now.toISOString(),
    inactiveDays: INACTIVE_DAYS,
    kpis: {
      students,
      parents,
      teachers,
      publishedSubjects,
      lessons,
      enrollments,
      mistakes,
      submissions,
      unusedCodes,
      usedCodes,
      inactiveStudents: inactiveList.length,
      unlinkedParents,
      parentLinked,
    },
    weeklyActivity,
    mistakesBySubject,
    studentsByLevel,
    parentLinkSplit,
    inactiveStudents: inactiveList,
    allStudents,
    heuristicInsights,
  };
}

export type Student360Data = {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  loginCount: number;
  daysInactive: number;
  isInactive: boolean;
  level: string;
  stream: string;
  wilaya: string;
  totalPoints: number;
  progressPercent: number;
  enrolledSubjects: { id: string; title: string; months: number }[];
  guardian: {
    listedName: string;
    listedPhone: string;
    linked: boolean;
    linkedName: string | null;
    linkedPhone: string | null;
    parentLastLoginAt: string | null;
    parentDaysSinceLogin: number | null;
    parentReviewCount: number;
    tickets: number;
  };
  mistakesCount: number;
  mistakes: {
    id: string;
    mistakeContent: string;
    correctSolution: string;
    lessonTitle: string;
    subjectTitle: string;
    createdAt: string;
  }[];
  mistakesBySubject: ChartPoint[];
  weeklyMistakes: ChartPoint[];
  submissions: { id: string; examTitle: string; score: number | null; createdAt: string; imageUrl: string }[];
  devices: number;
  work: StudentWorkFile;
};

export function studentHeuristicInsights(profile: Student360Data): InsightItem[] {
  const weakest = profile.mistakesBySubject[0];
  const rules: InsightItem[] = [];
  if (profile.isInactive) {
    rules.push({
      title: "انقطاع عن المنصة",
      detail: `لم يسجّل دخولاً منذ ${profile.daysInactive} يوماً. تواصل مع الولي ${profile.guardian.listedName}.`,
      severity: "high",
    });
  }
  if (!profile.guardian.linked) {
    rules.push({
      title: "ولي الأمر غير مربوط",
      detail: `رقم الولي المسجّل عند التسجيل: ${profile.guardian.listedPhone}. اطلب ربط الحساب لمتابعة التقدّم.`,
      severity: "high",
    });
  }
  if (weakest && weakest.value >= 2) {
    rules.push({
      title: `يحتاج تدخّلاً في ${weakest.name}`,
      detail: `لدى التلميذ ${weakest.value} أخطاء في هذه المادة. راجع التصحيحات الأخيرة معه.`,
      severity: "medium",
    });
  }
  if (rules.length === 0) {
    rules.push({
      title: "أداء مستقر",
      detail: "لا مؤشرات حرجة حالياً. تابع الأخطاء الجديدة بعد كل اختبار.",
      severity: "info",
    });
  }
  return rules;
}

export async function getStudent360(
  studentId: string,
  options?: { subjectIds?: string[] },
): Promise<Student360Data | null> {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: true,
      studentLinks: {
        include: {
          parent: {
            include: { parentProfile: true },
          },
        },
      },
      enrollments: { include: { subject: { select: { id: true, title: true } } } },
      mistakes: {
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          lesson: { include: { subjects: { select: { title: true } } } },
          quiz: {
            include: {
              lesson: { include: { subjects: { select: { title: true } } } },
              dailyExercise: {
                include: {
                  subject: { select: { title: true } },
                  lesson: { select: { title: true } },
                },
              },
              exam: { include: { subject: { select: { title: true } } } },
            },
          },
        },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { exam: { select: { title: true } } },
      },
      _count: { select: { mistakes: true } },
    },
  });

  if (!user || user.role !== "STUDENT" || !user.studentProfile) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
  const parent = user.studentLinks[0]?.parent;
  const tickets = parent
    ? await prisma.parentTicket.count({ where: { parentId: parent.id } })
    : 0;

  const subjectCounts = new Map<string, number>();
  for (const mistake of user.mistakes) {
    const source = describeMistake(mistake);
    subjectCounts.set(source.subject, (subjectCounts.get(source.subject) || 0) + 1);
  }

  const weeklyMistakes = emptyDays(14).map((row) => ({ name: row.name, value: 0 }));
  const weekIndex = new Map(weeklyMistakes.map((row, i) => [row.name, i]));
  user.mistakes
    .filter((m) => m.createdAt >= weekAgo)
    .forEach((m) => {
      const label = arDayLabel(new Date(m.createdAt.getFullYear(), m.createdAt.getMonth(), m.createdAt.getDate()));
      const idx = weekIndex.get(label);
      if (idx !== undefined) weeklyMistakes[idx].value += 1;
    });

  const monthsUnlocked = new Set(user.enrollments.flatMap((e) => e.enrolledMonths)).size;
  const progressPercent = Math.min(100, Math.round((monthsUnlocked / 12) * 100));
  const work = await getStudentWorkFile(studentId, options?.subjectIds);

  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    loginCount: user.loginCount,
    daysInactive: daysSince(user.lastLoginAt, now),
    isInactive: !user.lastLoginAt || user.lastLoginAt < inactiveSinceDate(now),
    level: labelLevel(user.studentProfile.level),
    stream: labelStream(user.studentProfile.stream),
    wilaya: getWilayaName(user.studentProfile.wilaya),
    totalPoints: user.studentProfile.totalPoints,
    progressPercent,
    enrolledSubjects: user.enrollments.map((e) => ({
      id: e.subject.id,
      title: e.subject.title,
      months: e.enrolledMonths.length,
    })),
    guardian: {
      listedName: user.studentProfile.parentName,
      listedPhone: user.studentProfile.parentPhone,
      linked: Boolean(parent),
      linkedName: parent?.fullName ?? null,
      linkedPhone: parent?.phoneNumber ?? null,
      parentLastLoginAt: parent?.lastLoginAt?.toISOString() ?? null,
      parentDaysSinceLogin: parent ? daysSince(parent.lastLoginAt, now) : null,
      parentReviewCount: parent?.parentProfile?.reviewCount ?? 0,
      tickets,
    },
    mistakesCount: user._count.mistakes,
    mistakes: user.mistakes.map((m) => {
      const source = describeMistake(m);
      return {
        id: m.id,
        mistakeContent: m.mistakeContent,
        correctSolution: m.correctSolution,
        lessonTitle: `${source.kind} — ${source.title}`,
        subjectTitle: source.subject,
        createdAt: m.createdAt.toISOString(),
      };
    }),
    mistakesBySubject: Array.from(subjectCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    weeklyMistakes,
    submissions: user.submissions.map((s) => ({
      id: s.id,
      examTitle: s.exam.title,
      score: s.score,
      createdAt: s.createdAt.toISOString(),
      imageUrl: s.imageUrl,
    })),
    devices: user.deviceFingerprints.length,
    work: work || {
      unwatchedLessons: [],
      unsolvedExercises: [],
      unsolvedLessonQuizzes: [],
      lessonCount: 0,
      watchedCount: 0,
      exerciseCount: 0,
      solvedExerciseCount: 0,
      lessonQuizCount: 0,
      solvedLessonQuizCount: 0,
    },
  };
}
