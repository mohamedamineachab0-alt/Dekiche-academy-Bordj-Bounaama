import "dotenv/config";
import { prisma } from "../../lib/prisma";

function looksBroken(text: string) {
  return (
    text.includes("\\\\") ||
    text.includes("$$") ||
    text.includes("\\(") ||
    text.includes("\\[") ||
    /\\[a-zA-Z]+/.test(text.replace(/\$[^$]*\$/g, "")) ||
    (text.includes("\\frac") && !text.includes("$"))
  );
}

async function main() {
  const quizzes = await prisma.quiz.findMany({
    where: {
      OR: [
        { lesson: { subjects: { some: { title: { contains: "رياض" } } } } },
        { dailyExercise: { subject: { title: { contains: "رياض" } } } },
      ],
    },
    select: {
      id: true,
      lesson: { select: { title: true } },
      dailyExercise: { select: { title: true } },
      questions: true,
    },
  });

  let samples = 0;
  for (const quiz of quizzes) {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    for (const raw of questions) {
      const q = raw as { question?: string; options?: string[] };
      const texts = [q.question || "", ...(q.options || [])];
      for (const text of texts) {
        if (looksBroken(text) || text.includes("$")) {
          if (samples < 25) {
            console.log("---");
            console.log(JSON.stringify(text));
            samples += 1;
          }
        }
      }
    }
  }

  const svtExercises = await prisma.dailyExercise.findMany({
    where: { subjectId: "8998cb44-f37e-418f-8d2f-0ae784d3be42" },
    select: { id: true, title: true, stream: true, level: true, month: true, lessonId: true },
  });
  const svtCards = await prisma.reviewCard.findMany({
    where: { subjectId: "8998cb44-f37e-418f-8d2f-0ae784d3be42" },
    select: { id: true, title: true, stream: true, level: true, month: true, lessonId: true },
  });
  console.log("SVT_EXERCISES", svtExercises);
  console.log("SVT_CARDS", svtCards.map((c) => ({ id: c.id, title: c.title, stream: c.stream })));

  const mathCards = await prisma.reviewCard.count({
    where: { stream: "MATHEMATICS", subject: { title: { contains: "رياض" } } },
  });
  const mathEx = await prisma.dailyExercise.count({
    where: { stream: "MATHEMATICS", subject: { title: { contains: "رياض" } } },
  });
  console.log({ mathCards, mathEx });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
