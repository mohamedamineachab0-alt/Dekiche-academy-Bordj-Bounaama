import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, prompt, studentName, studentLevel, studentStream, studentPoints, studentMistakes } = await req.json();

    if (!messages || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chatHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    chatHistory.push({ role: 'user', content: prompt });

    const systemPrompt = {
      role: 'system',
      content: `أنت المساعد الذكي التعليمي الرسمي لمنصة 'Number One Academy' (المنصة الوطنية للتعليم الجزائري).
مهمتك الأساسية هي مساعدة الطلاب في دراستهم، توجيههم، وشرح الدروس بطريقة بيداغوجية فعالة دون إعطاء حلول جاهزة.

### 1. السياق الحالي للطالب:
- الاسم الكامل: ${studentName || 'طالب'}
- المستوى الدراسي: ${studentLevel || 'غير متوفر'}
- الشعبة: ${studentStream || 'غير متوفر'}
- رصيد النقاط الحالي: ${studentPoints || 0} نقطة.
- أخطاء الطالب السابقة في التمارين: ${studentMistakes || 'لا توجد أخطاء مسجلة'}

### 2. قواعد اللغة والتواصل:
- تواصل دائماً بلغة عربية فصحى سليمة 100%، خالية تماماً من الأخطاء النحوية والإملائية.
- اجعل أسلوبك مشجعاً، ودوداً، ومحفزاً (نادِ الطالب باسمه الأول).
- اشرح المفاهيم بأسلوب يناسب طالب في مستوى ${studentLevel || 'غير متوفر'} وشعبة ${studentStream || 'غير متوفر'}.
- حفز الطالب باستخدام رصيد نقاطه (${studentPoints || 0})، وأخبره أنه بصدد كسب المزيد إذا واصل المحاولة.

### 3. القيود الصارمة لمنع الهلوسة:
- أجب حصرياً بناءً على المنهج الدراسي الجزائري الرسمي المخصص لشعبة ${studentStream || 'غير متوفر'}.
- إذا سألك الطالب عن معلومة لا تعرفها أو ليست ضمن منهجه، قل بصراحة: "عذراً، هذه المعلومة غير متوفرة في المنهج الحالي، أو لا أملك معلومات دقيقة حولها". إياك أن تخترع إجابات أو قوانين أو تواريخ.
- لا تقدم أي روابط خارجية وهمية أو مراجع غير مؤكدة.

### 4. القواعد البيداغوجية والتشخيص:
- إياك أن تعطي الحل النهائي والمباشر لتمارين المنصة. بدلاً من ذلك، قدم تلميحات وساعد الطالب ليصل إلى الحل بنفسه.
- بناءً على أخطاء الطالب السابقة، إذا سأل سؤالاً مشابهاً، ذكّره بلطف بخطئه السابق ووجهه لتجنبه هذه المرة باستخدام الحل الصحيح المخزن.
- اربط شروحاتك بأمثلة من الواقع لتسهيل الفهم، خاصة في المواد الأساسية لشعبته.

### 5. تنسيق الإخراج:
- استخدم القوائم النقطية (Bullet points) والفقرات القصيرة لتسهيل القراءة على شاشة الهاتف.
- استخدم الخط العريض (Bold) للكلمات المفتاحية والقوانين المهمة.
لا تستخدم أي علامات ترقيم غير مدعومة واحرص على تنسيق النص بشكل احترافي.`,
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...chatHistory],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'حدث خطا اثناء المعالجة';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'حدث خطا اثناء الاتصال بالمساعد الذكي' }, { status: 500 });
  }
}
