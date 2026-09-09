import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  alreadyHasExercisesAndCards,
  alreadyHasPack,
  fetchPublishedLessons,
  generateLessonContentPack,
  generateLessonQuizzes,
  persistLessonContentPack,
  persistLessonQuizzes,
} from "@/lib/ai/generate-lesson-pack";

export const runtime = "nodejs";
export const maxDuration = 300;

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { role: true },
  });

  return user?.role === "ADMIN" ? user : null;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    lessonId?: string;
    limit?: number;
    force?: boolean;
    dryRun?: boolean;
  };

  let lessons = await fetchPublishedLessons();
  if (body.lessonId) {
    lessons = lessons.filter((lesson) => lesson.id === body.lessonId);
  }
  const limit = Number(body.limit);
  lessons = lessons.slice(0, Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1);

  const results: Array<{ id: string; title: string; status: string; error?: string }> = [];

  for (const lesson of lessons) {
    try {
      if (!body.force && alreadyHasPack(lesson)) {
        results.push({ id: lesson.id, title: lesson.title, status: "skipped" });
        continue;
      }
      if (body.dryRun) {
        results.push({ id: lesson.id, title: lesson.title, status: "dry-run" });
        continue;
      }

      if (!body.force && alreadyHasExercisesAndCards(lesson)) {
        const quizzes = await generateLessonQuizzes({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          levelLabel: lesson.levelLabel,
          subjectTitle: lesson.subjectTitle,
        });
        await persistLessonQuizzes(lesson, quizzes);
        results.push({ id: lesson.id, title: lesson.title, status: "created" });
        continue;
      }

      const pack = await generateLessonContentPack({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonNumber: lesson.lessonNumber,
        levelLabel: lesson.levelLabel,
        streamLabel: lesson.streamLabel,
        subjectTitle: lesson.subjectTitle,
        month: lesson.month,
      });
      await persistLessonContentPack(lesson, pack, { replace: Boolean(body.force) });
      results.push({ id: lesson.id, title: lesson.title, status: "created" });
    } catch (error) {
      results.push({
        id: lesson.id,
        title: lesson.title,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ count: results.length, results });
}
