import { createRequire } from "node:module";
import OpenAI from "openai";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer
) => Promise<{ text?: string }>;

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
};

export type QuizSourceFile = {
  name: string;
  mimeType?: string;
  buffer?: Buffer;
  base64?: string;
};

export type GenerateQuizInput = {
  files?: QuizSourceFile[];
  imageBase64?: string | null;
  pdfBase64?: string | null;
  docxBase64?: string | null;
  textContent?: string | null;
  pdfText?: string | null;
  numberOfQuestions?: number;
  totalPoints?: number;
  language?: string;
  title?: string;
  lessonTitle?: string;
  subjectName?: string;
  subjectTitle?: string;
  level?: string;
};

export type GenerateQuizResult = {
  questions: QuizQuestion[];
  source: "files" | "title";
};

const MAX_FILES = 10;
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_TEXT_CHARS = 24000;
const MAX_IMAGES = 4;

const STEM_HINTS = [
  "math",
  "physics",
  "science",
  "رياضيات",
  "فيزياء",
  "علوم",
  "كيمياء",
  "تقني",
  "إعلام",
];

function toBuffer(file: QuizSourceFile): Buffer | null {
  if (file.buffer && file.buffer.length > 0) return file.buffer;
  if (file.base64) {
    const raw = file.base64.includes(",")
      ? file.base64.split(",").pop() || ""
      : file.base64;
    if (!raw) return null;
    return Buffer.from(raw, "base64");
  }
  return null;
}

function extOf(name: string, mimeType?: string) {
  const fromName = name.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() || "";
  if (fromName && fromName.length <= 5) return fromName;
  const mime = (mimeType || "").toLowerCase();
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("wordprocessingml") || mime.includes("msword")) return "docx";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "xlsx";
  if (mime.startsWith("image/")) return mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  if (mime.startsWith("text/")) return "txt";
  return "";
}

function isImageExt(ext: string) {
  return ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tif", "tiff"].includes(ext);
}

function resolveLanguage(language?: string, subject?: string) {
  const raw = (language || "").trim();
  const subjectTitle = subject || "";
  const latex =
    raw.toUpperCase() === "LATEX" ||
    raw.includes("لاتيكس") ||
    STEM_HINTS.some((hint) => subjectTitle.toLowerCase().includes(hint.toLowerCase()));

  if (["English", "الإنجليزية", "انجليزية"].some((s) => raw.includes(s) || subjectTitle.includes(s))) {
    return { language: "English", latex };
  }
  if (["Français", "French", "الفرنسية", "فرنسية"].some((s) => raw.includes(s) || subjectTitle.includes(s))) {
    return { language: "French", latex };
  }
  if (["Español", "Spanish", "الإسبانية"].some((s) => raw.includes(s))) {
    return { language: "Spanish", latex };
  }
  return { language: "Arabic", latex };
}

async function extractPdfText(buffer: Buffer) {
  const data = await pdfParse(buffer);
  return (data.text || "").replace(/\u0000/g, "").trim();
}

async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || "").trim();
}

function extractSpreadsheetText(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    return `--- ${name} ---\n${XLSX.utils.sheet_to_csv(sheet)}`;
  }).join("\n");
}

type ExtractedSources = {
  textChunks: string[];
  images: { name: string; mime: string; dataUrl: string }[];
  unread: string[];
};

async function extractSources(files: QuizSourceFile[]): Promise<ExtractedSources> {
  const textChunks: string[] = [];
  const images: ExtractedSources["images"] = [];
  const unread: string[] = [];

  for (const file of files.slice(0, MAX_FILES)) {
    const buffer = toBuffer(file);
    if (!buffer || buffer.length === 0) {
      unread.push(file.name);
      continue;
    }
    if (buffer.length > MAX_FILE_BYTES) {
      unread.push(`${file.name} (كبير جداً)`);
      continue;
    }

    const ext = extOf(file.name, file.mimeType);
    try {
      if (ext === "pdf") {
        const text = await extractPdfText(buffer);
        if (text) textChunks.push(`ملف PDF «${file.name}»:\n${text}`);
        else unread.push(file.name);
      } else if (ext === "docx" || ext === "doc") {
        const text = await extractDocxText(buffer);
        if (text) textChunks.push(`ملف Word «${file.name}»:\n${text}`);
        else unread.push(file.name);
      } else if (["xlsx", "xls", "csv"].includes(ext)) {
        const text = ext === "csv" ? buffer.toString("utf-8") : extractSpreadsheetText(buffer);
        if (text.trim()) textChunks.push(`جدول «${file.name}»:\n${text}`);
        else unread.push(file.name);
      } else if (isImageExt(ext)) {
        if (images.length >= MAX_IMAGES) {
          unread.push(`${file.name} (تجاوز حد الصور)`);
          continue;
        }
        const mime =
          file.mimeType && file.mimeType.startsWith("image/")
            ? file.mimeType
            : ext === "png"
              ? "image/png"
              : ext === "webp"
                ? "image/webp"
                : ext === "gif"
                  ? "image/gif"
                  : "image/jpeg";
        images.push({
          name: file.name,
          mime,
          dataUrl: `data:${mime};base64,${buffer.toString("base64")}`,
        });
      } else if (["txt", "md", "rtf", "json", "html"].includes(ext) || (file.mimeType || "").startsWith("text/")) {
        const text = buffer.toString("utf-8").trim();
        if (text) textChunks.push(`ملف نصي «${file.name}»:\n${text}`);
        else unread.push(file.name);
      } else {
        unread.push(file.name);
      }
    } catch (error) {
      console.error("Failed to extract quiz file", file.name, error);
      unread.push(file.name);
    }
  }

  return { textChunks, images, unread };
}

function collectLegacyFiles(input: GenerateQuizInput): QuizSourceFile[] {
  const files = [...(input.files || [])];
  if (input.imageBase64) files.push({ name: "image.jpg", mimeType: "image/jpeg", base64: input.imageBase64 });
  if (input.pdfBase64) files.push({ name: "document.pdf", mimeType: "application/pdf", base64: input.pdfBase64 });
  if (input.docxBase64) {
    files.push({
      name: "document.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      base64: input.docxBase64,
    });
  }
  if (input.textContent?.trim()) {
    files.push({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(input.textContent, "utf-8"),
    });
  }
  if (input.pdfText?.trim()) {
    files.push({
      name: "extracted.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(input.pdfText, "utf-8"),
    });
  }
  return files;
}

function buildSystemPrompt(params: {
  count: number;
  points: number;
  language: string;
  latex: boolean;
  title: string;
  subject: string;
  level?: string;
  fromTitleOnly: boolean;
}) {
  const latexRule = params.latex
    ? "هذه مادة علمية. كل الرموز والمعادلات يجب أن تُكتب داخل $...$ بصيغة LaTeX صالحة لـ KaTeX. في JSON ضاعف الشرطة المائلة مرة واحدة فقط (مثال: $\\\\frac{1}{2}$ و $+\\\\infty$). ممنوع أسطر جديدة داخل $...$."
    : "لا تستخدم LaTeX إلا إذا ظهر رمز رياضي حقيقي في المصدر.";

  const sourceRule = params.fromTitleOnly
    ? `تعذّر قراءة الملفات أو أنها فارغة. أنشئ أسئلة اختيار من متعدد من عنوان الدرس والمادة وفق المنهاج الجزائري.
العنوان: ${params.title || "غير محدد"}
المادة: ${params.subject || "غير محددة"}
المستوى: ${params.level || "غير محدد"}`
    : `المصدر قد يحتوي أسئلة جاهزة أو درساً بلا أسئلة.

الترتيب الإلزامي:
1) إن وُجدت أسئلة أو تمارين في الملفات: استخرجها كلها ثم صحّح أخطاء التعرف الضوئي والصياغة والنواقص، وأكمل الخيارات إن نقصت، وحدّد الإجابة الصحيحة بدقة.
2) إن كانت الملفات شرحاً بلا أسئلة: ولّد أسئلة من مضمونها الفعلي فقط.
3) إن كان المضمون غير كافٍ: ولّد أسئلة من عنوان الدرس «${params.title || "غير محدد"}» والمادة «${params.subject || "غير محددة"}» وفق المنهاج الجزائري.

ممنوع الاعتذار أو إرجاع مصفوفة فارغة.`;

  return `أنت أستاذ خبير في المنهاج الجزائري ومصحّح لبنوك الأسئلة.
المطلوب: إنشاء ${params.count} أسئلة اختيار من متعدد (QCM).
لغة الأسئلة: ${params.language}.
${latexRule}

${sourceRule}

القواعد:
- أرجع بالضبط ${params.count} أسئلة.
- لكل سؤال 4 خيارات بالضبط، واحد صحيح وثلاثة مموهات معقولة.
- correctAnswerIndex رقم بين 0 و 3.
- لا تضع أرقام الخيارات داخل النص (لا أ، ب، ج).
- لكل سؤال points = ${Number((params.points / params.count).toFixed(2))}.

أرجع كائن JSON فقط:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswerIndex": 0
    }
  ]
}`;
}

function sanitizeQuestions(raw: unknown, count: number, totalPoints: number): QuizQuestion[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { questions?: unknown }).questions)
      ? (raw as { questions: unknown[] }).questions
      : [];

  const points = Number((totalPoints / Math.max(count, 1)).toFixed(2));

  return list
    .map((item) => {
      const q = item as {
        question?: string;
        options?: unknown;
        correctAnswerIndex?: unknown;
      };
      const question = String(q.question || "").trim();
      const options = Array.isArray(q.options)
        ? q.options.map((opt) => String(opt ?? "").trim()).filter(Boolean).slice(0, 4)
        : [];
      while (options.length < 4) options.push(`خيار ${options.length + 1}`);
      const idx = Number(q.correctAnswerIndex);
      return {
        id: crypto.randomUUID(),
        question,
        options,
        correctAnswerIndex: Number.isInteger(idx) && idx >= 0 && idx <= 3 ? idx : 0,
        points,
      };
    })
    .filter((q) => q.question.length > 1)
    .slice(0, count);
}

async function completeQuiz(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  count: number,
  totalPoints: number
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as unknown;
  const questions = sanitizeQuestions(parsed, count, totalPoints);
  if (questions.length === 0) {
    throw new Error("empty_questions");
  }
  return questions;
}

export async function generateQuizFromSources(input: GenerateQuizInput): Promise<GenerateQuizResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("مفتاح الذكاء الاصطناعي غير مضبوط");
  }

  const count = Math.min(Math.max(Number(input.numberOfQuestions) || 5, 1), 20);
  const totalPoints = Math.max(Number(input.totalPoints) || 20, 1);
  const title = (input.title || input.lessonTitle || "").trim();
  const subject = (input.subjectName || input.subjectTitle || "").trim();
  const { language, latex } = resolveLanguage(input.language, subject);

  const extracted = await extractSources(collectLegacyFiles(input));
  const combinedText = extracted.textChunks.join("\n\n").slice(0, MAX_TEXT_CHARS);
  const hasFiles = combinedText.length > 20 || extracted.images.length > 0;

  const openai = new OpenAI({ apiKey });

  const ask = async (fromTitleOnly: boolean, extraText?: string) => {
    const system = buildSystemPrompt({
      count,
      points: totalPoints,
      language,
      latex,
      title,
      subject,
      level: input.level,
      fromTitleOnly,
    });

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: fromTitleOnly
          ? `ولّد الاختبار من عنوان الدرس: ${title || "درس بدون عنوان"}${subject ? ` — المادة: ${subject}` : ""}`
          : [
              extraText || combinedText || "لا يوجد نص مستخرج.",
              extracted.unread.length
                ? `\nملفات تعذّر قراءتها: ${extracted.unread.join("، ")}`
                : "",
              extracted.images.length
                ? `\nالصور المرفقة عددها ${extracted.images.length}. استخرج منها الأسئلة وصحّحها.`
                : "",
            ].join(""),
      },
    ];

    if (!fromTitleOnly) {
      for (const image of extracted.images) {
        userContent.push({
          type: "image_url",
          image_url: { url: image.dataUrl },
        });
      }
    }

    return completeQuiz(
      openai,
      [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      count,
      totalPoints
    );
  };

  if (hasFiles) {
    try {
      const questions = await ask(false);
      return { questions, source: "files" };
    } catch (error) {
      console.error("Quiz from files failed, falling back to title", error);
    }
  }

  if (!title && !subject) {
    throw new Error("تعذّر توليد الاختبار: لا ملفات مقروءة ولا عنوان درس");
  }

  const questions = await ask(true);
  return { questions, source: "title" };
}
