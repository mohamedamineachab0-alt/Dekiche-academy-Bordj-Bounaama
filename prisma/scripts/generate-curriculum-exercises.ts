/**
 * Generate one 20-question daily exercise per planned slot
 * from the lesson title + official Algerian 3AS curriculum.
 *
 *   npx tsx prisma/scripts/generate-curriculum-exercises.ts
 */
import "dotenv/config";
import type { Prisma } from "../../generated/prisma";
import { prisma } from "../../lib/prisma";
import { generateQuizFromSources } from "../../lib/ai/generate-quiz";
import { QUIZZES_PER_LESSON } from "../../lib/ai/generate-lesson-pack";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#ede9fe"/>
      <text x="480" y="300" text-anchor="middle" fill="#5b21b6" font-size="36" font-family="IBM Plex Sans Arabic, sans-serif">تمرين يومي</text>
    </svg>`
  );

const PLAN: Array<{ match: string; exercisesPerLesson: number }> = [
  { match: "رياض", exercisesPerLesson: 2 },
  { match: "فزيا", exercisesPerLesson: 1 },
  { match: "طبيعة", exercisesPerLesson: 1 },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateTwenty(input: {
  lessonTitle: string;
  subjectTitle: string;
  variant: "practice" | "application";
}) {
  const language =
    /رياض|فزيا|فيزياء|علوم/.test(input.subjectTitle) ? "LATEX" : "arabic";
  const focus =
    input.variant === "application"
      ? "ركّز على تطبيقات وتمارين حسابية ووضعيات إدماجية من المنهاج، لا تعيد نفس أسئلة المراجعة النظرية."
      : "ركّز على المكتسبات الأساسية والتعاريف والنتائج المباشرة من المنهاج.";

  const collected = [];
  for (let attempt = 0; attempt < 6 && collected.length < QUIZZES_PER_LESSON; attempt++) {
    const remaining = QUIZZES_PER_LESSON - collected.length;
    const result = await generateQuizFromSources({
      numberOfQuestions: remaining < 6 ? 10 : remaining,
      totalPoints: 20,
      language,
      title: input.lessonTitle,
      lessonTitle: input.lessonTitle,
      subjectName: input.subjectTitle,
      subjectTitle: input.subjectTitle,
      level: "السنة الثالثة ثانوي",
      textContent: `المنهاج التربوي الجزائري الرسمي (وزارة التربية الوطنية) — السنة الثالثة ثانوي.
المادة: ${input.subjectTitle}
عنوان الدرس فقط: ${input.lessonTitle}

ولّد أسئلة اختيار من متعدد من هذا الدرس حصراً وفق المنهاج الجزائري.
${focus}
ممنوع الخروج إلى درس آخر.`,
    });
    for (const question of result.questions) {
      if (!collected.some((row) => row.question === question.question)) {
        collected.push(question);
      }
    }
  }

  if (collected.length < QUIZZES_PER_LESSON) {
    throw new Error(`ناقص: ${collected.length}/${QUIZZES_PER_LESSON}`);
  }

  const points = Number((20 / QUIZZES_PER_LESSON).toFixed(2));
  return collected.slice(0, QUIZZES_PER_LESSON).map((question) => ({
    ...question,
    id: question.id || crypto.randomUUID(),
    points,
  }));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY غير مضبوط");
  }

  const subjects = await prisma.subject.findMany({
    include: {
      lessons: { orderBy: [{ month: "asc" }, { createdAt: "asc" }] },
    },
  });

  const summary = { created: 0, failed: 0 };
  const failures: Array<{ title: string; error: string }> = [];

  for (const subject of subjects) {
    const plan = PLAN.find((row) => subject.title.includes(row.match));
    if (!plan) continue;

    console.log(`\n${subject.title.trim()} — ${subject.lessons.length} دروس × ${plan.exercisesPerLesson}`);

    for (const lesson of subject.lessons) {
      await prisma.dailyExercise.deleteMany({ where: { lessonId: lesson.id } });

      for (let index = 0; index < plan.exercisesPerLesson; index++) {
        const variant = index === 0 ? "practice" : "application";
        const title =
          variant === "practice"
            ? `تمرين يومي — ${lesson.title}`
            : `تطبيق منهاجي — ${lesson.title}`;

        process.stdout.write(`  ${title} … `);
        try {
          const questions = await generateTwenty({
            lessonTitle: lesson.title,
            subjectTitle: subject.title,
            variant,
          });

          const exercise = await prisma.dailyExercise.create({
            data: {
              title: title.slice(0, 180),
              a4ImageUrl: PLACEHOLDER_IMAGE,
              maxScore: 20,
              phase: subject.phase,
              level: lesson.levels[0] || subject.levels[0] || "SECONDARY_3",
              stream: "NONE",
              subjectId: subject.id,
              month: lesson.month || 1,
              lessonId: lesson.id,
            },
          });

          await prisma.quiz.create({
            data: {
              dailyExerciseId: exercise.id,
              maxScore: 20,
              aiGenerated: true,
              questions: questions as Prisma.InputJsonValue,
            },
          });

          summary.created += 1;
          console.log("20 سؤالاً");
        } catch (error) {
          summary.failed += 1;
          const message = error instanceof Error ? error.message : String(error);
          failures.push({ title, error: message });
          console.log(`فشل: ${message}`);
        }

        await sleep(400);
      }
    }
  }

  const counts = await prisma.dailyExercise.groupBy({
    by: ["subjectId"],
    _count: true,
  });
  console.log("\nالنتيجة", summary);
  console.log("العدد حسب المادة", counts);
  if (failures.length) {
    console.error(failures);
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
