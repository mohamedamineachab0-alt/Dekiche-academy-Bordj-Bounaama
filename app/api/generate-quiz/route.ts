import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateQuizFromSources,
  type GenerateQuizInput,
  type QuizSourceFile,
} from "@/lib/ai/generate-quiz";

export const runtime = "nodejs";
export const maxDuration = 60;

async function parseBody(req: Request): Promise<GenerateQuizInput & { persist?: boolean; lessonId?: string }> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const uploaded = form.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    const files: QuizSourceFile[] = [];

    for (const file of uploaded) {
      files.push({
        name: file.name,
        mimeType: file.type,
        buffer: Buffer.from(await file.arrayBuffer()),
      });
    }

    return {
      files,
      numberOfQuestions: Number(form.get("numberOfQuestions") || 5),
      totalPoints: Number(form.get("totalPoints") || 20),
      language: String(form.get("language") || form.get("forcedLanguage") || ""),
      title: String(form.get("title") || form.get("lessonTitle") || ""),
      lessonTitle: String(form.get("lessonTitle") || ""),
      subjectName: String(form.get("subjectName") || form.get("subjectTitle") || ""),
      subjectTitle: String(form.get("subjectTitle") || ""),
      level: String(form.get("level") || ""),
      persist: form.get("persist") === "true",
      lessonId: String(form.get("lessonId") || "") || undefined,
    };
  }

  return (await req.json()) as GenerateQuizInput & { persist?: boolean; lessonId?: string };
}

export async function POST(req: Request) {
  try {
    const body = await parseBody(req);
    const { persist, lessonId, ...input } = body;

    const result = await generateQuizFromSources(input);

    if (persist && lessonId) {
      const quiz = await prisma.quiz.upsert({
        where: { lessonId },
        update: {
          questions: result.questions,
          maxScore: Number(input.totalPoints) || 20,
          aiGenerated: true,
        },
        create: {
          lessonId,
          questions: result.questions,
          maxScore: Number(input.totalPoints) || 20,
          aiGenerated: true,
        },
      });
      return NextResponse.json({ success: true, questions: result.questions, source: result.source, quiz });
    }

    return NextResponse.json({ success: true, questions: result.questions, source: result.source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "فشل توليد الاختبار";
    console.error("generate-quiz failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
