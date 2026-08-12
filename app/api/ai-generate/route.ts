import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'user-BQRTDI4AAUJeJucXMheuuVME', // Fallback to existing project key
});

export async function POST(req: Request) {
  try {
    const { imageBase64, metadata, type } = await req.json();

    if (!imageBase64 || !metadata || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { level, stream, subject, month, maxScore } = metadata;
    
    let systemPrompt = '';
    
    if (type === 'daily_exercise') {
      systemPrompt = `You are an expert educator. Analyze the uploaded daily exercise image for Level: ${level}, Stream: ${stream || 'N/A'}, Subject: ${subject}, Month: ${month}.
      Extract/Generate questions and output strictly as a JSON object with a 'questions' array.
      Each question object MUST have:
      - 'question': string (the question text)
      - 'options': array of 4 strings (possible answers)
      - 'correctAnswerIndex': number (0-3 indicating the correct option)
      Ensure strict LaTeX formatting for math ($...$). Double-escape backslashes.`;
    } else if (type === 'exam') {
       systemPrompt = `You are an expert educator. Analyze the uploaded exam image for Level: ${level}, Stream: ${stream || 'N/A'}, Subject: ${subject}, Month: ${month}.
      Extract the questions and allocate a total of ${maxScore || 20} marks. Output strictly as a JSON object with a 'questions' array.
      Each question object MUST have:
      - 'question': string (the extracted question text)
      - 'modelAnswer': string (the suggested model answer)
      - 'allocatedMarks': number (points assigned, summing to ${maxScore || 20})
      Ensure strict LaTeX formatting for math ($...$). Double-escape backslashes.`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Kept fast model similar to generate-quiz
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Generate structured data from this educational content.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('No response from AI');

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate questions, please try a clearer image' }, { status: 500 });
  }
}
