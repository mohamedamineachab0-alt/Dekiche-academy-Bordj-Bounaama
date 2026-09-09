import OpenAI from "openai";
import type { Level, Phase, Stream } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { labelLevel, labelStream } from "@/lib/education-labels";
import {
  generateQuizFromSources,
  type QuizQuestion,
  type QuizSourceFile,
} from "@/lib/ai/generate-quiz";

export const LESSON_PACK_MODEL = "gpt-4o-mini";
export const EXERCISES_PER_LESSON = 1;
export const QUIZZES_PER_LESSON = 20;
export const FLASHCARDS_PER_LESSON = 10;
export const QUESTIONS_PER_EXERCISE = 20;

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#ede9fe"/>
      <text x="480" y="300" text-anchor="middle" fill="#5b21b6" font-size="36" font-family="IBM Plex Sans Arabic, sans-serif">تمرين يومي</text>
    </svg>`
  );

export type LessonContentPack = {
  exercises: Array<{
    title: string;
    statement: string;
    questions: QuizQuestion[];
  }>;
  quizzes: QuizQuestion[];
  flashcards: Array<{ front: string; back: string }>;
};

export type PublishedLessonRow = {
  id: string;
  title: string;
  month: number;
  lessonNumber: number;
  level: Level;
  stream: Stream;
  streams: Stream[];
  phase: Phase;
  subjectId: string;
  subjectTitle: string;
  levelLabel: string;
  streamLabel: string;
  hasQuiz: boolean;
  quizQuestionCount: number;
  exerciseCount: number;
  cardCount: number;
};

function uniqueStreams(values: Stream[]) {
  return [...new Set(values.filter(Boolean))];
}

type RawQuestion = {
  question?: unknown;
  options?: unknown;
  correctAnswerIndex?: unknown;
};

function asTrimmed(value: unknown) {
  return String(value ?? "").trim();
}

function sanitizeMcq(raw: unknown, count: number, totalPoints: number): QuizQuestion[] {
  const list = Array.isArray(raw) ? raw : [];
  const points = Number((totalPoints / Math.max(count, 1)).toFixed(2));

  return list
    .map((item) => {
      const row = (item || {}) as RawQuestion;
      const question = asTrimmed(row.question);
      const options = Array.isArray(row.options)
        ? row.options.map((opt) => asTrimmed(opt)).filter(Boolean).slice(0, 4)
        : [];
      while (options.length < 4) options.push(`خيار ${options.length + 1}`);
      const idx = Number(row.correctAnswerIndex);
      return {
        id: crypto.randomUUID(),
        question,
        options,
        correctAnswerIndex: Number.isInteger(idx) && idx >= 0 && idx <= 3 ? idx : 0,
        points,
      };
    })
    .filter((q) => q.question.length > 1)
    .slice(0, count);
}

function padExercises(raw: unknown, fallbackTitle: string): LessonContentPack["exercises"] {
  const list = Array.isArray(raw) ? raw : [];
  const exercises: LessonContentPack["exercises"] = [];

  for (let i = 0; i < EXERCISES_PER_LESSON; i++) {
    const row = (list[i] || {}) as {
      title?: unknown;
      statement?: unknown;
      questions?: unknown;
    };
    const title = asTrimmed(row.title) || `تمرين ${i + 1} — ${fallbackTitle}`;
    const statement = asTrimmed(row.statement) || title;
    const questions = sanitizeMcq(row.questions, QUESTIONS_PER_EXERCISE, 20);
    if (questions.length < QUESTIONS_PER_EXERCISE) continue;
    exercises.push({ title, statement, questions });
  }

  return exercises;
}

function padFlashcards(raw: unknown, fallbackTitle: string) {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item) => {
      const row = (item || {}) as { front?: unknown; back?: unknown; question?: unknown; answer?: unknown };
      const front = asTrimmed(row.front || row.question);
      const back = asTrimmed(row.back || row.answer);
      return { front, back };
    })
    .filter((card) => card.front.length > 1 && card.back.length > 1)
    .slice(0, FLASHCARDS_PER_LESSON)
    .map((card, index) =>
      card.front ? card : { front: `${fallbackTitle} — بطاقة ${index + 1}`, back: card.back }
    );
}

function parseExercisesAndCards(raw: unknown, lessonTitle: string) {
  const data = (raw && typeof raw === "object" ? raw : {}) as {
    exercises?: unknown;
    flashcards?: unknown;
  };

  const exercises = padExercises(data.exercises, lessonTitle);
  const flashcards = padFlashcards(data.flashcards, lessonTitle);

  if (
    exercises.length !== EXERCISES_PER_LESSON ||
    flashcards.length !== FLASHCARDS_PER_LESSON
  ) {
    throw new Error(
      `حزمة ناقصة: تمارين ${exercises.length}/${EXERCISES_PER_LESSON}، بطاقات ${flashcards.length}/${FLASHCARDS_PER_LESSON}`
    );
  }

  return { exercises, flashcards };
}

export function parseLessonContentPack(raw: unknown, lessonTitle: string): LessonContentPack {
  const data = (raw && typeof raw === "object" ? raw : {}) as {
    quizzes?: unknown;
  };
  const { exercises, flashcards } = parseExercisesAndCards(raw, lessonTitle);
  const quizzes = sanitizeMcq(data.quizzes, QUIZZES_PER_LESSON, 20);
  if (quizzes.length !== QUIZZES_PER_LESSON) {
    throw new Error(`حزمة ناقصة: اختبارات ${quizzes.length}/${QUIZZES_PER_LESSON}`);
  }
  return { exercises, quizzes, flashcards };
}

function buildSystemPrompt() {
  return `أنت أستاذ خبير في المنهاج التربوي الجزائري الرسمي (وزارة التربية الوطنية).
اكتب كل المحتوى بالعربية الفصحى فقط. ممنوع الدارجة. ممنوع اختلاق دروس خارج عنوان الدرس المعطى.

أرجع JSON فقط بالشكل:
{
  "exercises": [
    {
      "title": "عنوان قصير",
      "statement": "نص التمرين",
      "questions": [
        {
          "question": "سؤال اختيار من متعدد مرتبط بالتمرين",
          "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
          "correctAnswerIndex": 0
        }
      ]
    }
  ],
  "flashcards": [
    { "front": "السؤال أو الوجه", "back": "الجواب أو الظهر" }
  ]
}

القواعد:
- بالضبط تمرين يومي واحد مرتبط بهذا الدرس فقط، وفيه بالضبط ${QUESTIONS_PER_EXERCISE} سؤال QCM.
- بالضبط ${FLASHCARDS_PER_LESSON} بطاقات مراجعة (وجه/ظهر) تلخّص ذلك الدرس فقط.
- لكل سؤال 4 خيارات، واحد صحيح. correctAnswerIndex بين 0 و 3.
- لا تضع أرقام الخيارات داخل النص.
- للرموز الرياضية استخدم $...$ بصيغة KaTeX، مع \\\\frac و \\\\infty داخل JSON.
- راعِ المستوى والشعبة والمنهاج الجزائري.`;
}

async function completeExercisesAndCards(
  openai: OpenAI,
  userPrompt: string,
  lessonTitle: string
) {
  const response = await openai.chat.completions.create({
    model: LESSON_PACK_MODEL,
    temperature: 0.25,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";
  return parseExercisesAndCards(JSON.parse(content), lessonTitle);
}

function fileNameFromMaterial(title: string, fileUrl: string) {
  const fromUrl = fileUrl.split("?")[0].split("/").pop() || "";
  if (/\.[a-z0-9]+$/i.test(title)) return title;
  if (/\.[a-z0-9]+$/i.test(fromUrl)) {
    return `${title}.${fromUrl.split(".").pop()}`;
  }
  return title || fromUrl || "attachment";
}

async function loadLessonMaterialFiles(lessonId: string): Promise<QuizSourceFile[]> {
  const materials = await prisma.lessonMaterial.findMany({
    where: { lessonId },
    select: { title: true, fileUrl: true },
  });
  const files: QuizSourceFile[] = [];
  for (const material of materials) {
    try {
      const fileRes = await fetch(material.fileUrl);
      if (!fileRes.ok) continue;
      files.push({
        name: fileNameFromMaterial(material.title, material.fileUrl),
        mimeType: fileRes.headers.get("content-type") || undefined,
        buffer: Buffer.from(await fileRes.arrayBuffer()),
      });
    } catch (error) {
      console.error("Failed to fetch lesson material", material.fileUrl, error);
    }
  }
  return files;
}

function withEqualPoints(questions: QuizQuestion[]): QuizQuestion[] {
  const points = Number((20 / QUIZZES_PER_LESSON).toFixed(2));
  return questions.slice(0, QUIZZES_PER_LESSON).map((question) => ({
    ...question,
    id: question.id || crypto.randomUUID(),
    points,
  }));
}

export async function generateLessonQuizzes(input: {
  lessonId?: string;
  lessonTitle: string;
  levelLabel: string;
  subjectTitle: string;
}): Promise<QuizQuestion[]> {
  const language = input.subjectTitle.includes("رياضيات") ? "LATEX" : "arabic";
  const files = input.lessonId ? await loadLessonMaterialFiles(input.lessonId) : [];
  const collected: QuizQuestion[] = [];

  for (let attempt = 0; attempt < 6 && collected.length < QUIZZES_PER_LESSON; attempt++) {
    const remaining = QUIZZES_PER_LESSON - collected.length;
    const askCount = remaining < 6 ? 10 : remaining;
    const result = await generateQuizFromSources({
      files,
      numberOfQuestions: askCount,
      totalPoints: askCount,
      language,
      title: input.lessonTitle,
      lessonTitle: input.lessonTitle,
      subjectName: input.subjectTitle,
      subjectTitle: input.subjectTitle,
      level: input.levelLabel,
    });
    const fresh = result.questions.filter(
      (question) =>
        !collected.some((existing) => existing.question === question.question)
    );
    collected.push(...fresh);
  }

  if (collected.length < QUIZZES_PER_LESSON) {
    throw new Error(`اختبار ناقص: ${collected.length}/${QUIZZES_PER_LESSON}`);
  }

  return withEqualPoints(collected);
}

export async function generateLessonContentPack(input: {
  lessonId?: string;
  lessonTitle: string;
  lessonNumber: number;
  levelLabel: string;
  streamLabel: string;
  subjectTitle: string;
  month: number;
}): Promise<LessonContentPack> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY غير مضبوط");
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = `ولّد الحزمة التعليمية لهذا الدرس فقط:
- رقم الدرس: ${input.lessonNumber}
- اسم الدرس: ${input.lessonTitle}
- المادة: ${input.subjectTitle}
- المستوى: ${input.levelLabel}
- الشعبة: ${input.streamLabel}
- الشهر الدراسي: ${input.month}

لا تخرج عن هذا الدرس.`;

  let lastError: unknown;
  let exercisesAndCards: ReturnType<typeof parseExercisesAndCards> | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      exercisesAndCards = await completeExercisesAndCards(
        openai,
        userPrompt,
        input.lessonTitle
      );
      break;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
  }

  if (!exercisesAndCards) {
    throw lastError instanceof Error ? lastError : new Error("فشل توليد الحزمة");
  }

  const quizzes = await generateLessonQuizzes({
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,
    levelLabel: input.levelLabel,
    subjectTitle: input.subjectTitle,
  });

  return { ...exercisesAndCards, quizzes };
}

export async function fetchPublishedLessons(): Promise<PublishedLessonRow[]> {
  const lessons = await prisma.lesson.findMany({
    where: {
      subjects: { some: {} },
    },
    include: {
      subjects: {
        select: {
          id: true,
          title: true,
          phase: true,
          levels: true,
          streams: true,
          isPublished: true,
        },
      },
      quiz: { select: { id: true, questions: true } },
      _count: {
        select: {
          dailyExercises: true,
          reviewCards: true,
        },
      },
    },
    orderBy: [{ month: "asc" }, { createdAt: "asc" }],
  });

  return lessons
    .map((lesson, index) => {
      const subject =
        lesson.subjects.find((row) => row.isPublished) || lesson.subjects[0];
      if (!subject) return null;

      const level = lesson.levels[0] || subject.levels[0] || ("SECONDARY_1" as Level);
      const streams = uniqueStreams([
        ...lesson.streams,
        ...subject.streams,
      ]);
      const stream = streams[0] || ("NONE" as Stream);

      return {
        id: lesson.id,
        title: lesson.title,
        month: lesson.month || 1,
        lessonNumber: index + 1,
        level,
        stream,
        streams: streams.length > 0 ? streams : ["NONE"],
        phase: subject.phase,
        subjectId: subject.id,
        subjectTitle: subject.title,
        levelLabel: labelLevel(level),
        streamLabel: labelStream(stream),
        hasQuiz: Boolean(lesson.quiz),
        quizQuestionCount: Array.isArray(lesson.quiz?.questions)
          ? lesson.quiz.questions.length
          : 0,
        exerciseCount: lesson._count.dailyExercises,
        cardCount: lesson._count.reviewCards,
      };
    })
    .filter((row): row is PublishedLessonRow => Boolean(row));
}

export function alreadyHasExercisesAndCards(lesson: PublishedLessonRow) {
  return lesson.exerciseCount >= 1 && lesson.cardCount >= FLASHCARDS_PER_LESSON;
}

export function alreadyHasFullQuiz(lesson: PublishedLessonRow) {
  return lesson.quizQuestionCount >= QUIZZES_PER_LESSON;
}

export function alreadyHasPack(lesson: PublishedLessonRow) {
  return alreadyHasExercisesAndCards(lesson) && alreadyHasFullQuiz(lesson);
}

export async function persistLessonQuizzes(
  lesson: PublishedLessonRow,
  quizzes: QuizQuestion[]
) {
  await prisma.quiz.upsert({
    where: { lessonId: lesson.id },
    create: {
      lessonId: lesson.id,
      maxScore: 20,
      aiGenerated: true,
      questions: quizzes,
    },
    update: {
      aiGenerated: true,
      questions: quizzes,
      maxScore: 20,
    },
  });
}

export async function persistLessonContentPack(
  lesson: PublishedLessonRow,
  pack: LessonContentPack,
  options?: { replace?: boolean }
) {
  await prisma.$transaction(
    async (tx) => {
      if (options?.replace) {
        await tx.dailyExercise.deleteMany({ where: { lessonId: lesson.id } });
        await tx.reviewCard.deleteMany({ where: { lessonId: lesson.id } });
      }

      await tx.quiz.upsert({
        where: { lessonId: lesson.id },
        create: {
          lessonId: lesson.id,
          maxScore: 20,
          aiGenerated: true,
          questions: pack.quizzes,
        },
        update: {
          aiGenerated: true,
          questions: pack.quizzes,
          maxScore: 20,
        },
      });

      const exercisePack = pack.exercises[0];
      const exerciseQuestions =
        exercisePack?.questions.length === QUESTIONS_PER_EXERCISE
          ? exercisePack.questions
          : pack.quizzes;

      const created = await tx.dailyExercise.create({
        data: {
          title: `تمرين يومي — ${lesson.title}`.slice(0, 180),
          a4ImageUrl: PLACEHOLDER_IMAGE,
          maxScore: 20,
          phase: lesson.phase,
          level: lesson.level,
          stream: "NONE",
          subjectId: lesson.subjectId,
          month: lesson.month,
          lessonId: lesson.id,
        },
      });

      await tx.quiz.create({
        data: {
          dailyExerciseId: created.id,
          maxScore: 20,
          aiGenerated: true,
          questions: exerciseQuestions,
        },
      });

      await tx.reviewCard.createMany({
        data: pack.flashcards.map((card, index) => ({
          title: `${lesson.title} — بطاقة ${index + 1}`.slice(0, 180),
          question: card.front,
          answer: card.back,
          subjectId: lesson.subjectId,
          phase: lesson.phase,
          level: lesson.level,
          stream: "NONE",
          month: lesson.month,
          lessonId: lesson.id,
          exerciseRef: lesson.title,
        })),
      });
    },
    { timeout: 60_000, maxWait: 10_000 }
  );
}
