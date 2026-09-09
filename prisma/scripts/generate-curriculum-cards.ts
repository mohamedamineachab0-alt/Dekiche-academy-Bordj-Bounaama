/**
 * Generate 10 curriculum flashcards per lesson from the lesson title.
 *
 *   npx tsx prisma/scripts/generate-curriculum-cards.ts
 */
import "dotenv/config";
import OpenAI from "openai";
import { prisma } from "../../lib/prisma";
import { FLASHCARDS_PER_LESSON, LESSON_PACK_MODEL } from "../../lib/ai/generate-lesson-pack";

const SUBJECT_HINTS = ["رياض", "فزيا", "طبيعة"];

const FORBIDDEN = [
  "ما هي المكتسبات القبلية",
  "كيف تؤثر المكتسبات",
  "أهمية تقييم المكتسبات",
  "المعارف والمهارات التي يمتلكها",
];

const LESSON_BRIEFS: Array<{ test: RegExp; brief: string }> = [
  {
    test: /الحصة\s*01|الجزء الأول.*دوال|دوال عددية الجزء الأول/,
    brief: `3 ثانوي رياضيات — مكتسبات قبلية في الدوال (جزء 1) من برنامج 2 ثانوي:
تعريف الدالة، التمثيل البياني، المجال ومجموعة الوصول، اتجاه التغير وجدول التغيرات،
القيم الحدية، الزوجية والفردية ومحور/مركز التناظر، الدوال المرجعية: التآلفية، $x^2$، $x^3$، $1/x$، $\\sqrt{x}$.
ممنوع الكلام العام عن «المكتسبات القبلية» كمفهوم بيداغوجي.`,
  },
  {
    test: /الحصة\s*02|الجزء الثاني.*دوال|دوال عددية الجزء الثاني/,
    brief: `3 ثانوي رياضيات — مكتسبات قبلية في الدوال (جزء 2):
العمليات على الدوال، تركيب دالتين $(f\\circ g)(x)=f(g(x))$، إشارة كثير حدود وناطق،
حل المتراجحات، صورة مجال بدالة رتيبة، قراءة المنحنى.
لا تعد تعريف الدالة العام من الجزء الأول.`,
  },
  {
    test: /الحصة\s*03|الدوال العددية \(النهايات\)/,
    brief: `3 ثانوي رياضيات — مفهوم النهاية:
$\\lim_{x\\to a}f(x)$ و $\\lim_{x\\to\\infty}f(x)$، نهاية منتهية أو غير منتهية،
نهاية على يمين/يسار، المستقيم المقارب العمودي $x=a$ والأفقي $y=L$، العمليات على النهايات.
لا تشرح «ما هي الدالة»؛ الدرس عن النهايات.`,
  },
  {
    test: /الحصة\s*04|حساب النهايات/,
    brief: `3 ثانوي رياضيات — تقنيات حساب النهايات:
الأشكال غير المعينة $\\frac{\\infty}{\\infty}$، $\\frac{0}{0}$، $\\infty-\\infty$،
التبسيط، التحليل، الضرب في المرافق، نهايات الدوال الناطقة وكثيرات الحدود عند $\\infty$.
أمثلة حسابية دقيقة.`,
  },
  {
    test: /الحصة\s*05|النهايات بالمقارنة/,
    brief: `3 ثانوي رياضيات — النهايات بالمقارنة (الحصر):
إذا $f\\le g\\le h$ و $\\lim f=\\lim h=\\ell$ فإن $\\lim g=\\ell$.
المقارنة مع دوال مرجعية، نهاية $\\frac{\\sin x}{x}$ عند 0، حصر للبرهان على نهاية.`,
  },
  {
    test: /تطبيق حول النهايات/,
    brief: `3 ثانوي رياضيات — تطبيق على النهايات والمقارنة:
حساب نهايات بأشكال غير معينة، تعيين مقاربات، استعمال الحصر في تمرين تطبيقي.
بطاقات بصيغة تمرين/نتيجة وليس تعريفاً عاماً للنهاية.`,
  },
  {
    test: /الحصة\s*07|اشتقاق/,
    brief: `3 ثانوي رياضيات — الاشتقاقية:
العدد المشتق $f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}$،
التفسير الهندسي: معامل توجيه المماس، معادلة المماس $y=f'(a)(x-a)+f(a)$،
قواعد اشتقاق $x^n$، الجداء، الخارج، الدالة المركبة.`,
  },
  {
    test: /الحصة\s*08|يمين|يسار/,
    brief: `3 ثانوي رياضيات — قابلية الاشتقاق على اليمين واليسار:
$f'_+(a)=\\lim_{h\\to 0^+}\\frac{f(a+h)-f(a)}{h}$ و $f'_-(a)$ كذلك من اليسار.
قابلة للاشتقاق عند $a$ إذاً وفقط إذا وُجد المشتقان وتساويا.
الاستمرارية لازمة وغير كافية. نقطة زاوية عندما يختلف المشتقان.`,
  },
  {
    test: /فزيا.*الجزء الأول|الحصة الأولى/,
    brief: `3 ثانوي علوم فيزيائية — مكتسبات قبلية جزء 1 (كيمياء المنهاج):
كمية المادة $n=m/M=cV$، التركيز المولي والكتلي، المعادلة الحصيلة،
التقدم $x$، المتفاعل المحدّد، العلاقة بين كميات المادة في التفاعل.
ممنوع تعريف «المكتسبات القبلية» كمفهوم تربوي.`,
  },
  {
    test: /فزيا.*الجزء الثاني|الحصة الثانية/,
    brief: `3 ثانوي علوم فيزيائية — مكتسبات قبلية جزء 2 (حركية/متابعة):
السرعة المتوسطة لتفاعل $v=\\Delta n/(V\\Delta t)$، العوامل الحركية: التركيز، الحرارة، الوسيط،
المتابعة بالناقلية أو المعايرة، منحنى التقدم بدلالة الزمن.
لا تعد تعريف المكتسبات القبلية.`,
  },
  {
    test: /الحصة الثالثة|تطبيقات/,
    brief: `3 ثانوي علوم فيزيائية — تطبيقات على المكتسبات:
تمارين حساب $n$، $c$، التقدم الأعظمي، تحديد المحدّد، حساب سرعة متوسطة من جدول أو منحنى.
البطاقات نتائج/قوانين تطبيقية لا كلام عام عن «التطبيقات في الحياة».`,
  },
  {
    test: /طبيعة|حياة/,
    brief: `3 ثانوي علوم الطبيعة والحياة — مكتسبات قبلية لدخول وحدة التخصص الوظيفي للبروتينات:
الخلية والعضيات، الغشاء الهيولي، بنية الـ ADN والنكليوتيد، العلاقة مورثة–بروتين،
الأحماض الأمينية والرابطة البيبتيدية، الأنزيم كبروتين نوعي.
ممنوع تعريف «المكتسبات القبلية» كمفهوم بيداغوجي.`,
  },
];

function briefFor(lessonTitle: string, subjectTitle: string) {
  const haystack = `${subjectTitle} ${lessonTitle}`;
  const found = LESSON_BRIEFS.find((row) => row.test.test(haystack) || row.test.test(lessonTitle));
  return found?.brief || `التزم بعنوان الدرس «${lessonTitle}» من منهاج 3 ثانوي الجزائري فقط.`;
}

function asTrimmed(value: unknown) {
  return String(value ?? "").trim();
}

function parseCards(raw: unknown, lessonTitle: string) {
  const data = raw && typeof raw === "object" ? (raw as { flashcards?: unknown }) : {};
  const list = Array.isArray(data.flashcards) ? data.flashcards : Array.isArray(raw) ? raw : [];
  const cards = list
    .map((item) => {
      const row = (item || {}) as { front?: unknown; back?: unknown; question?: unknown; answer?: unknown };
      return {
        front: asTrimmed(row.front || row.question),
        back: asTrimmed(row.back || row.answer),
      };
    })
    .filter((card) => card.front.length > 1 && card.back.length > 1)
    .slice(0, FLASHCARDS_PER_LESSON);

  if (cards.length !== FLASHCARDS_PER_LESSON) {
    throw new Error(`بطاقات ناقصة: ${cards.length}/${FLASHCARDS_PER_LESSON} — ${lessonTitle}`);
  }
  return cards;
}

function isGeneric(cards: Array<{ front: string; back: string }>) {
  const text = cards.map((card) => `${card.front} ${card.back}`).join("\n");
  return FORBIDDEN.some((row) => text.includes(row));
}

async function generateCards(openai: OpenAI, lessonTitle: string, subjectTitle: string) {
  const usesLatex = /رياض|فزيا|فيزياء/.test(subjectTitle);
  const brief = briefFor(lessonTitle, subjectTitle);
  const response = await openai.chat.completions.create({
    model: LESSON_PACK_MODEL,
    temperature: 0.15,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `أنت مفتش لمادة السنة الثالثة ثانوي في الجزائر. تكتب بطاقات مراجعة للتلاميذ من المنهاج الرسمي فقط.
عربية فصحى. ممنوع الدارجة.

أرجع JSON فقط:
{ "flashcards": [ { "front": "سؤال محدد من الدرس", "back": "جواب منهاجي دقيق" } ] }

قواعد صارمة:
- بالضبط ${FLASHCARDS_PER_LESSON} بطاقات.
- كل سؤال مربوط بعنوان هذا الدرس ونقاط المنهاج المعطاة.
- الوجه سؤال علمي محدد (قانون، شرط، صيغة، حالة خاصة) لا تعريف فضفاض.
- الظهر جواب قصير فيه مصطلح أو صيغة من البرنامج.
- ممنوع: «ما هي المكتسبات القبلية؟»، أهمية التقييم، كلام تربوي عام، أمثلة من الحياة بلا قانون.
- ممنوع إعادة نفس البطاقة بأسلوب آخر.
${usesLatex ? "- الرموز داخل $...$ مع \\\\frac و \\\\infty في JSON." : ""}`,
      },
      {
        role: "user",
        content: `الدرس حصراً: ${lessonTitle}
المادة: ${subjectTitle}
المستوى: السنة الثالثة ثانوي

نقاط المنهاج الإلزامية لهذا الدرس:
${brief}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";
  const cards = parseCards(JSON.parse(content), lessonTitle);
  if (isGeneric(cards)) {
    throw new Error("بطاقات عامة خارج المنهاج");
  }
  return cards;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY غير مضبوط");

  const openai = new OpenAI({ apiKey });
  const subjects = await prisma.subject.findMany({
    include: {
      lessons: { orderBy: [{ month: "asc" }, { createdAt: "asc" }] },
    },
  });

  const summary = { created: 0, failed: 0 };
  const failures: Array<{ title: string; error: string }> = [];

  for (const subject of subjects) {
    if (!SUBJECT_HINTS.some((hint) => subject.title.includes(hint))) continue;

    console.log(`\n${subject.title.trim()} — ${subject.lessons.length} دروس`);

    for (const lesson of subject.lessons) {
      process.stdout.write(`  ${lesson.title} … `);
      try {
        let cards: Array<{ front: string; back: string }> | null = null;
        let lastError: unknown;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            cards = await generateCards(openai, lesson.title, subject.title);
            break;
          } catch (error) {
            lastError = error;
            await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          }
        }
        if (!cards) {
          throw lastError instanceof Error ? lastError : new Error("فشل التوليد");
        }

        await prisma.reviewCard.deleteMany({ where: { lessonId: lesson.id } });
        await prisma.reviewCard.createMany({
          data: cards.map((card, index) => ({
            title: `${lesson.title} — بطاقة ${index + 1}`.slice(0, 180),
            question: card.front,
            answer: card.back,
            subjectId: subject.id,
            phase: subject.phase,
            level: lesson.levels[0] || subject.levels[0] || "SECONDARY_3",
            stream: "NONE",
            month: lesson.month || 1,
            lessonId: lesson.id,
            exerciseRef: lesson.title,
          })),
        });

        summary.created += cards.length;
        console.log(`${cards.length} بطاقات`);
      } catch (error) {
        summary.failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ title: lesson.title, error: message });
        console.log(`فشل: ${message}`);
      }
    }
  }

  console.log("\nالنتيجة", summary, {
    cards: await prisma.reviewCard.count(),
  });
  if (failures.length) {
    console.error(failures);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
