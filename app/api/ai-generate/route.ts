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
      systemPrompt = `أنت كبير مفتشي الامتحانات ومصممي بنوك الأسئلة في منصة "ديكيش أكاديمي" وخبير فك وتحليل الخطوط اليدوية (Expert Handwriting OCR) للمنهاج الجزائري.
حلل صورة التمرين اليومي المرفقة للمستوى: ${level}، الشعبة: ${stream || 'N/A'}، المادة: ${subject}، الشهر: ${month}.

القاعدة التشغيلية المطلقة (إلزامية التوليد):
يجب عليك دائماً وأبداً استخراج أو توليد كويز رقمي كامل يتكون من [5] أسئلة اختيار من متعدد (QCM). ممنوع الاعتذار أو إرجاع مصفوفة فارغة. اقفل على المادة المحددة والتزم بها.

لغة الصياغة:
اللغة العربية الفصحى حصراً (إلا إذا كانت المادة لغة أجنبية).

قواعد الترميز (LaTeX/KaTeX Rigor):
- لأي تعبير رياضي أو رمز: ضعه حصراً داخل علامتي دولار $...$ (مثال: $f(x) = 2x + 1$). يجب مضاعفة الهروب (Double-escape backslashes) لكي يعمل JSON (مثال: \\\\frac).
- لكل سؤال 4 خيارات حصرية: 1 صحيح، 3 مموهات.

التنسيق الإلزامي الصارم:
أخرج كائن JSON حصراً، بدون أي نصوص تمهيدية أو توديعية وبدون Markdown، بالشكل التالي:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;
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
