import "dotenv/config";
import type { Prisma, Stream } from "../../generated/prisma";
import { prisma } from "../../lib/prisma";

function uniqueStreams(values: Stream[]) {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      title: true,
      streams: true,
      dailyExercises: {
        include: { quiz: true },
      },
      reviewCards: true,
    },
  });

    let clonedExercises = 0;
    let clonedCards = 0;

    for (const subject of subjects) {
      const beforeExercises = clonedExercises;
      const beforeCards = clonedCards;
    const streams = uniqueStreams(subject.streams);
    if (streams.length === 0) continue;

    const exercisesByKey = new Map<string, typeof subject.dailyExercises>();
    for (const exercise of subject.dailyExercises) {
      const key = `${exercise.lessonId || "none"}::${exercise.title}`;
      const list = exercisesByKey.get(key) || [];
      list.push(exercise);
      exercisesByKey.set(key, list);
    }

    for (const [, copies] of exercisesByKey) {
      const template = copies.find((row) => row.quiz) || copies[0];
      const existingStreams = new Set(copies.map((row) => row.stream));
      for (const stream of streams) {
        if (existingStreams.has(stream)) continue;
        const created = await prisma.dailyExercise.create({
          data: {
            title: template.title,
            a4ImageUrl: template.a4ImageUrl,
            maxScore: template.maxScore,
            phase: template.phase,
            level: template.level,
            stream,
            subjectId: template.subjectId,
            secondarySubjectId: template.secondarySubjectId,
            month: template.month,
            lessonId: template.lessonId,
          },
        });
        if (template.quiz) {
          await prisma.quiz.create({
            data: {
              dailyExerciseId: created.id,
              maxScore: template.quiz.maxScore,
              aiGenerated: template.quiz.aiGenerated,
              questions: template.quiz.questions as Prisma.InputJsonValue,
            },
          });
        }
        clonedExercises += 1;
      }
    }

    const cardsByKey = new Map<string, typeof subject.reviewCards>();
    for (const card of subject.reviewCards) {
      const key = `${card.lessonId || "none"}::${card.title}`;
      const list = cardsByKey.get(key) || [];
      list.push(card);
      cardsByKey.set(key, list);
    }

    const cardRows: Prisma.ReviewCardCreateManyInput[] = [];
    for (const [, copies] of cardsByKey) {
      const template = copies[0];
      const existingStreams = new Set(copies.map((row) => row.stream));
      for (const stream of streams) {
        if (existingStreams.has(stream)) continue;
        cardRows.push({
          title: template.title,
          question: template.question,
          answer: template.answer,
          subjectId: template.subjectId,
          phase: template.phase,
          level: template.level,
          stream,
          month: template.month,
          lessonId: template.lessonId,
          exerciseRef: template.exerciseRef,
        });
      }
    }

    if (cardRows.length > 0) {
      const result = await prisma.reviewCard.createMany({ data: cardRows });
      clonedCards += result.count;
    }

    console.log(
      `${subject.title.trim()} — شعب: ${streams.join(", ")} — تمارين +${clonedExercises - beforeExercises} — بطاقات +${clonedCards - beforeCards}`
    );
  }

  const totals = {
    exercises: await prisma.dailyExercise.count(),
    cards: await prisma.reviewCard.count(),
    clonedExercises,
    clonedCards,
  };
  console.log("النتيجة", totals);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
