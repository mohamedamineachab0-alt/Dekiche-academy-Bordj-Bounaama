import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { lessonId, imageBase64, pdfText, lessonTitle, subjectTitle, level, numberOfQuestions, totalPoints, forcedLanguage } = await req.json();

    if (!lessonId || !numberOfQuestions || !totalPoints) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isSTEM = ["Math", "Physics", "Science", "رياضيات", "فيزياء", "علوم"].some(s => subjectTitle?.includes(s));
    let language = forcedLanguage;
    
    if (!language) {
      if (["English", "إنجليزية"].some(s => subjectTitle?.includes(s))) language = "English";
      else if (["French", "فرنسية"].some(s => subjectTitle?.includes(s))) language = "French";
      else language = "Arabic";
    }

    const systemPrompt = `You are an expert AI quiz generator for the Algerian curriculum.
Task: Generate exactly ${numberOfQuestions} QCM questions.
Language: ${language}. Subject: ${subjectTitle} (${level}). Lesson: ${lessonTitle}.

RULES:
1. Return exactly ${numberOfQuestions} questions.
2. Each question MUST have exactly 4 options.
3. Provide the correct answer index (0-3).
4. ${isSTEM ? "This is a STEM subject. ALL math formulas, numbers, and variables MUST be wrapped in LaTeX `$` (e.g., $f(x) = x^2$). Double-escape backslashes." : "This is a literary subject. DO NOT use LaTeX or math symbols."}

Return ONLY a JSON object in this format:
{
  "questions": [
    {
      "id": "uuid",
      "question": "Question text",
      "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
      "correctAnswerIndex": 0,
      "points": ${totalPoints / numberOfQuestions}
    }
  ]
}`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Generate questions from this image.' },
          { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: `Context: ${pdfText || lessonTitle}` });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    if (!parsed.questions || parsed.questions.length !== numberOfQuestions) {
      throw new Error('AI returned an invalid question count.');
    }

    const sanitizedQuestions = parsed.questions.map((q: any) => ({
      id: crypto.randomUUID(),
      question: q.question,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      points: Number((totalPoints / numberOfQuestions).toFixed(2))
    }));

    const quiz = await prisma.quiz.upsert({
      where: { lessonId },
      update: { questions: sanitizedQuestions, maxScore: totalPoints, aiGenerated: true },
      create: { lessonId, questions: sanitizedQuestions, maxScore: totalPoints, aiGenerated: true },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
