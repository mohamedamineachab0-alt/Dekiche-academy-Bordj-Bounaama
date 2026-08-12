import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with the specific token/key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'user-BQRTDI4AAUJeJucXMheuuVME',
});

export async function POST(req: Request) {
  try {
    const { imageBase64, numberOfQuestions, totalPoints } = await req.json();

    if (!imageBase64 || !numberOfQuestions || !totalPoints) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = `You are an expert educational evaluator for the Algerian curriculum. Generate a rigorous quiz from the provided material.
Constraints:
1. QUANTITY: Generate EXACTLY ${numberOfQuestions} questions.
2. POINTS: The total sum of points MUST be EXACTLY ${totalPoints}.
3. Provide exactly 4 choices per question (no prepended letters/numbers).
4. LANGUAGE: Match the exact language of the uploaded subject.
5. MATH FORMATTING: Use strict LaTeX for all math symbols/fractions wrapped in single $ signs. Double-escape all backslashes for JSON (e.g., \\\\frac).
6. Output a JSON object containing a single key 'quiz' with the array of questions. Each question must have 'question', 'options' (array of 4 strings), 'correctAnswerIndex' (number 0-3), and 'points' (number).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Generate a quiz from this content.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'low',
              },
            },
          ],
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
