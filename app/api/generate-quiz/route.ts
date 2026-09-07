import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const mammoth = require('mammoth');

// Initialize the OpenAI client with the specific token/key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'user-BQRTDI4AAUJeJucXMheuuVME',
});

export async function POST(req: Request) {
  try {
    const { imageBase64, pdfBase64, docxBase64, textContent, numberOfQuestions, totalPoints, language } = await req.json();

    if ((!imageBase64 && !pdfBase64 && !docxBase64 && !textContent) || !numberOfQuestions || !totalPoints) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = `You are an elite educational evaluator and subject matter expert for the Algerian curriculum. Your task is to generate a highly rigorous, pedagogically sound, and flawlessly accurate multiple-choice quiz based ONLY on the provided lesson material.

CRITICAL INSTRUCTIONS & CONSTRAINTS:
1. QUANTITY & SCORING: Generate EXACTLY ${numberOfQuestions} questions. The total sum of 'points' across all questions MUST equal EXACTLY ${totalPoints}. Distribute points logically based on question difficulty.
2. FORMAT & CHOICES: Provide exactly 4 choices per question. The choices must be plausible distractors to test deep understanding, not just surface recall. DO NOT prepend letters (like A., B.) or numbers to the choices.
3. LANGUAGE & TONE: The quiz MUST be generated in ${language || 'the exact language of the uploaded subject'}. Maintain a formal, academic tone appropriate for Algerian students. If 'LATEX' is requested, use LaTeX for all text and math.
4. MATH & SCIENTIFIC FORMATTING: Use strict LaTeX for all mathematical formulas, symbols, and fractions, wrapped in single $ signs (e.g., $E = mc^2$). You MUST double-escape all backslashes for valid JSON (e.g., \\\\frac, \\\\sqrt).
5. ACCURACY & EXCLUSIVITY: All questions must be strictly derived from the provided content. Do not invent external facts. Ensure exactly ONE correct answer per question.
6. JSON OUTPUT STRICTNESS: Output ONLY a valid JSON object. No markdown wrapping (do not use \`\`\`json), no preamble, no explanations. The JSON must contain a single key 'quiz' containing an array of objects. Each object must strictly match this schema: { "question": string, "options": [string, string, string, string], "correctAnswerIndex": integer (0-3), "points": number }.`;

    let userContent: any[] = [];
    if (pdfBase64) {
      const pdfParse = require('pdf-parse');
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const pdfData = await pdfParse(pdfBuffer);
      userContent = [
        { type: 'text', text: `Generate a quiz from this text content:\n\n${pdfData.text}` }
      ];
    } else if (docxBase64) {
      const docxBuffer = Buffer.from(docxBase64, 'base64');
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      userContent = [
        { type: 'text', text: `Generate a quiz from this text content:\n\n${result.value}` }
      ];
    } else if (textContent) {
      userContent = [
        { type: 'text', text: `Generate a quiz from this text content:\n\n${textContent}` }
      ];
    } else if (imageBase64) {
      userContent = [
        { type: 'text', text: 'Generate a quiz from this content.' },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
            detail: 'low',
          },
        },
      ];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContent,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    const parsedResult = JSON.parse(result);
    return NextResponse.json({ questions: parsedResult.quiz });
  } catch (error: any) {
    console.error('Error generating AI quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
