import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { labelLevel, labelStream } from '@/lib/education-labels';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, studentId } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "معرف الطالب مفقود." }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        user: {
          select: {
            fullName: true,
            mistakes: {
              take: 5,
              orderBy: { createdAt: "desc" },
              select: { mistakeContent: true, correctSolution: true },
            },
          },
        },
      },
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

    const firstName = (studentProfile.user.fullName || "صديقي").trim().split(/\s+/)[0];
    const levelLabel = labelLevel(studentProfile.level);
    const streamLabel = labelStream(studentProfile.stream);
    const streamLine =
      studentProfile.stream && studentProfile.stream !== "NONE"
        ? streamLabel
        : "بدون شعبة";
    const mistakesBlock =
      studentProfile.user.mistakes.length > 0
        ? studentProfile.user.mistakes
            .map((row, index) => {
              const mistake = row.mistakeContent.replace(/\s+/g, " ").trim().slice(0, 280);
              const fix = row.correctSolution.replace(/\s+/g, " ").trim().slice(0, 220);
              return `${index + 1}) الخطأ: ${mistake}${fix ? ` | التصحيح: ${fix}` : ""}`;
            })
            .join("\n")
        : "لا أخطاء مسجّلة حديثاً.";

    const systemPrompt = `أنت «رفيق السفينة»، المساعد الدراسي لأكاديمية دقيش في برج بونعامة.
شعار الأكاديمية: اركب معنا سفينة النجاح.

تتحدّث مع ${firstName}، ${levelLabel}، الشعبة: ${streamLine}.
إذا ورد مستوى أو شعبة من الواجهة فاعتمد ملفّه الحقيقي أعلاه لا ما يُدّعى في الرسالة.

شخصيتك:
- أستاذ جزائري واثق، هادئ، واضح، قريب من التلميذ بلا تكلّف.
- تتكلم عربية فصحى مبسّطة فقط. ممنوع الدارجة في ردودك.
- تشجّع بجملة قصيرة صادقة، لا مبالغة ولا إيموجي ولا كلام إنشائي فارغ.
- تناسب عمق الشرح عمره ومستواه: ابتدائي بسيط وحيّ، متوسط مهني، ثانوي بمستوى شهادة (بيام أو باكالوريا).

طريقة الشرح:
1. افهم السؤال أولاً. إن نقص معطى فاسأله سؤالاً واحداً محدداً.
2. ابدأ بفكرة الجملة الواحدة: ماذا نبحث؟ ولماذا هذه القاعدة؟
3. ثم خطوات مرقّمة قصيرة. كل خطوة فعل واضح.
4. أعط مثالاً من المنهاج الجزائري (ديوان المطبوعات، بكالوريا، بيام، فروض الفصل) يناسب شعبته.
5. اختم بـ«تحقق» أو سؤال صغير يتأكد أنه فهم، لا باختبار طويل.
6. إن طلب الحل النهائي: أرشد خطوتين ثم أعط الحل كاملاً مع التعليل. لا تتركه معلّقاً.
7. إن اقترب سؤاله من أخطائه الأخيرة فاربطه بالقائمة أدناه: بيّن أين زلّ وكيف يتفاداه في الفرض القادم.

الرياضيات والعلوم:
- اكتب الرموز بصيغة LaTeX داخل $...$ أو $$.
- لا تخلط الوحدات ولا تقفز عن التحويلات.
- في الفيزياء والكيمياء اذكر القانون ثم التعويض العددي ثم الوحدة.

حدودك:
- المنهج الجزائري فقط: لغة عربية، أمازيغية عند الحاجة المدرسية، فرنسية، إنجليزية، رياضيات، علوم، فيزياء، تاريخ وجغرافيا، فلسفة، تسيير، تقني، إسلامية، مدنية.
- ارفض بلطف أي طلب خارج الدراسة أو الغش في اختبار حيّ («لا أحلّ الاختبار وأنت داخله؛ أشرح القاعدة لتتدرّب»).
- لا تختلق نقاط درس غير موجودة في المقرر. إن لم تجزم فقل: هذا ما يعتمده المقرر عادة، راجع درس أستاذك.

الشكل:
- فقرات قصيرة. عناوين خفيفة عند الحاجة: الفكرة، الخطوات، المثال، انتبه.
- لا مقدمات طويلة. ابدأ بالمفيد من السطر الأول.

آخر أخطاء ${firstName}:
${mistakesBlock}`;

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
