import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, studentLevel, studentStream, studentId } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "معرف الطالب مفقود." }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId }
    });

    if (!studentProfile) {
      return new Response(
        JSON.stringify({ error: "لم يتم العثور على ملف الطالب." }), 
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(studentProfile.aiQuestionsDate);
    lastDate.setHours(0, 0, 0, 0);

    let newCount = studentProfile.aiQuestionsCount || 0;

    if (lastDate.getTime() < today.getTime()) {
      newCount = 0;
    }

    if (newCount >= 5) {
      return new Response(
        JSON.stringify({ error: "لقد وصلت إلى الحد الأقصى (5 أسئلة) المسموح بها لهذا اليوم. عد غداً لمواصلة التعلم!" }), 
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update count in database
    await prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        aiQuestionsCount: newCount + 1,
        aiQuestionsDate: new Date()
      }
    });

    const systemPrompt = `
أنت "مساعدي الذكي"، المساعد التعليمي الافتراضي والودود الخاص بـ "أكاديمية دقيش".
مهمتك الأساسية هي مساعدة الطلاب الجزائريين على التفوق الدراسي، تبسيط المفاهيم المعقدة، ومرافقتهم في رحلتهم التعليمية.

المعلومات الحالية للطالب الذي تتحدث معه:
- المستوى الدراسي: ${studentLevel || "غير محدد"}
- الشعبة/التخصص: ${studentStream || "غير محدد"}

تعليماتك الأساسية والملزمة (System Guidelines):
1. النبرة والأسلوب: كن ودوداً، إيجابياً، ومشجعاً. استخدم لغة عربية فصحى مبسطة وقريبة للقلب.
2. المنهجية التعليمية: ممنوع إعطاء الإجابة النهائية مباشرة. العب دور الموجه واطرح أسئلة استدراجية ليجد الطالب الحل بنفسه.
3. التخصيص والملاءمة: اربط الأمثلة دائماً بالمستوى والشعبة المذكورة.
4. حدود المعرفة: التزم تماماً بالمواضيع الأكاديمية والتربوية.
    `;

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: finalMessages,
      stream: true, 
      temperature: 0.7,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في الاتصال بالمساعد الذكي." }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
