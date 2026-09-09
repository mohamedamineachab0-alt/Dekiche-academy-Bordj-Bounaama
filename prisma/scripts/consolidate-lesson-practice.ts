import "dotenv/config";
import type { Prisma, Stream } from "../../generated/prisma";
import { prisma } from "../../lib/prisma";

type QuizQuestion = {
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  points?: number;
  id?: string;
};

function asQuestions(raw: unknown): QuizQuestion[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item) => {
      const row = (item || {}) as QuizQuestion;
      return {
        id: row.id,
        question: String(row.question || "").trim(),
        options: Array.isArray(row.options)
          ? row.options.map((opt) => String(opt ?? "").trim())
          : [],
        correctAnswerIndex: Number(row.correctAnswerIndex) || 0,
        points: Number(row.points) || 1,
      };
    })
    .filter((row) => row.question.length > 1 && row.options.length >= 2);
}

function uniqueQuestions(lists: QuizQuestion[][]) {
  const seen = new Set<string>();
  const merged: QuizQuestion[] = [];
  for (const list of lists) {
    for (const question of list) {
      const key = question.question;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({
        ...question,
        id: question.id || crypto.randomUUID(),
        points: Number((20 / 20).toFixed(2)),
      });
    }
  }
  return merged.slice(0, 20);
}

function uniqueStreams(values: Stream[]) {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    include: {
      quiz: true,
      subjects: { select: { streams: true } },
      dailyExercises: { include: { quiz: true } },
    },
  });

  let kept = 0;
  let removed = 0;
  let created = 0;

  for (const lesson of lessons) {
    const streams = uniqueStreams([
      ...lesson.streams,
      ...lesson.subjects.flatMap((subject) => subject.streams),
    ]);
    if (streams.length === 0) continue;

    const subject = await prisma.subject.findFirst({
      where: { lessons: { some: { id: lesson.id } } },
    });
    if (!subject) continue;

    const lessonQuestions = asQuestions(lesson.quiz?.questions);

    for (const stream of streams) {
      const group = lesson.dailyExercises.filter((row) => row.stream === stream);
      const exerciseQuestions = group.flatMap((row) => asQuestions(row.quiz?.questions));
      const questions = uniqueQuestions([exerciseQuestions, lessonQuestions]);
      if (questions.length < 4) continue;

      while (questions.length < 20 && lessonQuestions.length > 0) {
        questions.push({
          ...lessonQuestions[questions.length % lessonQuestions.length],
          id: crypto.randomUUID(),
        });
      }

      const points = Number((20 / questions.length).toFixed(2));
      const normalized = questions.slice(0, 20).map((question) => ({
        ...question,
        points,
      }));

      if (group.length === 0) {
        const exercise = await prisma.dailyExercise.create({
          data: {
            title: `تمرين يومي — ${lesson.title}`.slice(0, 180),
            a4ImageUrl: lesson.image || "",
            maxScore: 20,
            phase: subject.phase,
            level: lesson.levels[0] || subject.levels[0] || "SECONDARY_3",
            stream,
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
            questions: normalized as Prisma.InputJsonValue,
          },
        });
        created += 1;
        continue;
      }

      const keep = group[0];
      await prisma.dailyExercise.update({
        where: { id: keep.id },
        data: {
          title: `تمرين يومي — ${lesson.title}`.slice(0, 180),
          maxScore: 20,
          lessonId: lesson.id,
          month: lesson.month || keep.month,
        },
      });

      if (keep.quiz) {
        await prisma.quiz.update({
          where: { id: keep.quiz.id },
          data: {
            maxScore: 20,
            questions: normalized as Prisma.InputJsonValue,
          },
        });
      } else {
        await prisma.quiz.create({
          data: {
            dailyExerciseId: keep.id,
            maxScore: 20,
            aiGenerated: true,
            questions: normalized as Prisma.InputJsonValue,
          },
        });
      }

      const extras = group.slice(1);
      if (extras.length > 0) {
        await prisma.dailyExercise.deleteMany({
          where: { id: { in: extras.map((row) => row.id) } },
        });
        removed += extras.length;
      }
      kept += 1;
    }
  }

  console.log({
    kept,
    created,
    removed,
    exercises: await prisma.dailyExercise.count(),
    cards: await prisma.reviewCard.count(),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
