/**
 * Generate daily exercises, lesson QCMs, and flashcards for every lesson on the platform.
 *
 * Requires DATABASE_URL and OPENAI_API_KEY.
 *
 *   npx tsx prisma/scripts/generate-lesson-content.ts
 *   npx tsx prisma/scripts/generate-lesson-content.ts --dry-run
 *   npx tsx prisma/scripts/generate-lesson-content.ts --limit=5
 *   npx tsx prisma/scripts/generate-lesson-content.ts --lesson-id=<id> --force
 */
import "dotenv/config";
import {
  alreadyHasExercisesAndCards,
  alreadyHasPack,
  fetchPublishedLessons,
  generateLessonContentPack,
  generateLessonQuizzes,
  persistLessonContentPack,
  persistLessonQuizzes,
  type PublishedLessonRow,
} from "../../lib/ai/generate-lesson-pack";
import { prisma } from "../../lib/prisma";

type CliOptions = {
  dryRun: boolean;
  force: boolean;
  limit: number | null;
  lessonId: string | null;
  delayMs: number;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    force: false,
    limit: null,
    lessonId: null,
    delayMs: 500,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      options.limit = Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
    } else if (arg.startsWith("--lesson-id=")) {
      options.lessonId = arg.slice("--lesson-id=".length).trim() || null;
    } else if (arg.startsWith("--delay-ms=")) {
      const value = Number(arg.slice("--delay-ms=".length));
      options.delayMs = Number.isFinite(value) && value >= 0 ? value : 500;
    }
  }

  return options;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processLesson(lesson: PublishedLessonRow, options: CliOptions) {
  if (!options.force && alreadyHasPack(lesson)) {
    return { status: "skipped" as const, reason: "المحتوى موجود مسبقاً" };
  }

  if (options.dryRun) {
    return { status: "dry-run" as const, reason: "بدون كتابة في قاعدة البيانات" };
  }

  if (!options.force && alreadyHasExercisesAndCards(lesson)) {
    const quizzes = await generateLessonQuizzes({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      levelLabel: lesson.levelLabel,
      subjectTitle: lesson.subjectTitle,
    });
    await persistLessonQuizzes(lesson, quizzes);
    return { status: "created" as const, reason: "اختبار 20 سؤالاً" };
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

  await persistLessonContentPack(lesson, pack, { replace: options.force });
  return { status: "created" as const, reason: "تم الحفظ" };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.OPENAI_API_KEY && !options.dryRun) {
    throw new Error("OPENAI_API_KEY غير مضبوط");
  }

  let lessons = await fetchPublishedLessons();
  if (options.lessonId) {
    lessons = lessons.filter((lesson) => lesson.id === options.lessonId);
  }
  if (options.limit) {
    lessons = lessons.slice(0, options.limit);
  }

  console.log(
    JSON.stringify(
      {
        total: lessons.length,
        dryRun: options.dryRun,
        force: options.force,
      },
      null,
      2
    )
  );

  const summary = { created: 0, skipped: 0, failed: 0, dryRun: 0 };
  const failures: Array<{ id: string; title: string; error: string }> = [];

  for (const lesson of lessons) {
    process.stdout.write(
      `[${lesson.lessonNumber}] ${lesson.title} — ${lesson.levelLabel} / ${lesson.streamLabel} … `
    );

    try {
      const result = await processLesson(lesson, options);
      if (result.status === "created") summary.created += 1;
      if (result.status === "skipped") summary.skipped += 1;
      if (result.status === "dry-run") summary.dryRun += 1;
      console.log(result.reason);
    } catch (error) {
      summary.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id: lesson.id, title: lesson.title, error: message });
      console.log(`فشل: ${message}`);
    }

    if (options.delayMs > 0) await sleep(options.delayMs);
  }

  console.log("\nالنتيجة:", summary);
  if (failures.length) {
    console.error("الإخفاقات:", failures);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
