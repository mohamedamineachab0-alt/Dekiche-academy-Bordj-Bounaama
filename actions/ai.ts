"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateQuizFromImage(base64Image: string, mimeType: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح الواجهة البرمجية مفقود");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as it supports image inputs and structured outputs well
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      أنت أستاذ خبير. قم باستخراج الأسئلة من هذه الصورة وقم بإنشاء كويز.
      يجب أن يكون الإخراج عبارة عن مصفوفة JSON فقط بدون أي نص آخر أو علامات توضيحية.
      لكل سؤال، قم بتوفير 4 خيارات للإجابة، وحدد رقم الإجابة الصحيحة (من 0 إلى 3).
      
      مثال على الهيكل المطلوب:
      [
        {
          "question": "نص السؤال الأول هنا",
          "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
          "correctAnswerIndex": 0
        }
      ]
      
      أخرج الـ JSON فقط بدون \`\`\`json.
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("فشل توليد الكويز تأكد من جودة الصورة أو إعدادات المفتاح");
  }
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askStudentAssistant(
  studentId: string,
  history: ChatMessage[],
  newMessage: string
) {
  // Mock logic to unbreak the build
  return "عذراً، هذا الرد مؤقت حتى يتم ربط النظام بالمساعد الذكي الفعلي.";
}
