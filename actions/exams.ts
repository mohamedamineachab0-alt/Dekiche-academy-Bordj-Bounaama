"use server";

import { prisma } from "@/lib/prisma";
import { supabase, ensureBucketExists } from "@/lib/supabase";
import { Level, Stream } from "@/generated/prisma";
import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Helper to upload a File to Supabase Storage and return its public URL
 */
async function uploadToSupabase(file: File, bucketName: string, pathPrefix: string): Promise<string> {
  const ext = file.name.split('.').pop() || "jpg";
  const filePath = `${pathPrefix}-${Date.now()}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });
    
  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error("فشل رفع الملف إلى قاعدة البيانات");
  }
  
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function createExamAndExtractQuiz(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const subjectId = formData.get("subjectId") as string;
    const level = formData.get("level") as Level;
    const stream = formData.get("stream") as Stream;
    const month = parseInt(formData.get("month") as string);
    const maxScore = parseInt((formData.get("maxScore") as string) || "20");
    const file = formData.get("file") as File;
    const triggerAi = formData.get("triggerAi") === "true";
    const quizType = formData.get("quizType") as string || (triggerAi ? "AI" : "MANUAL");
    const secondarySubjectId = formData.get("secondarySubjectId") as string || null;

    let manualQuestionsData: any = [];
    if (quizType === "MANUAL") {
      const rawQs = formData.get("manualQuestions") as string;
      if (rawQs) {
        try {
          const parsed = JSON.parse(rawQs);
          const pointsPerQuestion = 20 / parsed.length;
          manualQuestionsData = parsed.map((q: any) => ({
            ...q,
            points: pointsPerQuestion
          }));
        } catch(e) {
          console.error("Invalid manual questions JSON");
        }
      }
    }

    if (!title || !subjectId || !file) {
      return { error: "يرجى تعبئة جميع الحقول وإرفاق صورة الاختبار" };
    }

    // Upload to bucket 'exam'
    const a4ImageUrl = await uploadToSupabase(file, "exam", `exam-${subjectId}`);

    // Create Exam record
    const exam = await prisma.exam.create({
      data: {
        title,
        subjectId,
        secondarySubjectId,
        level,
        stream,
        month,
        maxScore,
        a4ImageUrl,
      }
    });

    if (quizType === "MANUAL" && manualQuestionsData.length > 0) {
      await prisma.quiz.create({
        data: {
          examId: exam.id,
          aiGenerated: false,
          maxScore,
          questions: manualQuestionsData,
        }
      });
    } else if (quizType === "AI" || triggerAi) {
      try {
        // We will pass the image URL to Groq vision model to extract questions
        // Note: llama-3.2-11b-vision-preview supports multimodal
        const completion = await groq.chat.completions.create({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are an AI teacher. Extract the quiz questions from this exam image. Output the result ONLY as a valid JSON array of objects. Each object should have 'id' (string), 'question' (string), and 'points' (number). Output nothing else but JSON."
                },
                {
                  type: "image_url",
                  image_url: { url: a4ImageUrl }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1024,
        });

        const rawJson = completion.choices[0]?.message?.content || "[]";
        
        // Clean up markdown block if model returned it
        const cleanedJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        let parsedQuestions = [];
        try {
          parsedQuestions = JSON.parse(cleanedJson);
        } catch (e) {
          console.error("Failed to parse Groq vision JSON:", e, cleanedJson);
        }

        if (parsedQuestions.length > 0) {
          await prisma.quiz.create({
            data: {
              examId: exam.id,
              aiGenerated: true,
              maxScore,
              questions: parsedQuestions,
            }
          });
        }
      } catch (aiError) {
        console.error("AI Vision extraction failed:", aiError);
        // We do not block exam creation if AI fails
      }
    }

    revalidatePath("/dashboard/admin/exams");
    return { success: true, examId: exam.id };
  } catch (error: any) {
    console.error("createExam error:", error);
    return { error: error.message || "حدث خطأ غير متوقع" };
  }
}

export async function gradeStudentSubmission(formData: FormData) {
  try {
    const studentId = formData.get("studentId") as string;
    const examId = formData.get("examId") as string;
    const file = formData.get("file") as File;

    if (!studentId || !examId || !file) {
      return { error: "بيانات مفقودة تأكد من إرفاق صورة الحل" };
    }

    // 1. Fetch Exam and linked AI Quiz questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { quiz: true }
    });

    if (!exam) return { error: "الاختبار غير موجود" };

    // 2. Upload student submission to 'exams' bucket
    const imageUrl = await uploadToSupabase(file, "exams", `submission-${studentId}-${examId}`);

    // 3. Call AI Vision to Grade
    let score = 0;
    let feedback = "تم استلام الحل بنجاح سيتم تصحيحه قريباً";

    if (exam.quiz && exam.quiz.questions) {
      try {
        const questionsStr = JSON.stringify(exam.quiz.questions);
        const prompt = `أنت أستاذ ذكي تصحح ورقة التلميذ
إليك الأسئلة الخاصة بالاختبار:
${questionsStr}

المطلوب:
1. انظر إلى صورة حل التلميذ
2. قيّم إجابته وقارنها بالمنطق الصحيح
3. أعطه علامة من ${exam.maxScore}.
4. قم بإرجاع رد بصيغة JSON حصراً يحتوي على مفتاحين:
- "score": عدد صحيح يمثل العلامة
- "feedback": نص باللغة العربية يشرح ملاحظاتك على إجابته بأسلوب مشجع ومحترم
بدون أي نص إضافي أو markdown.`;

        const completion = await groq.chat.completions.create({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1024,
        });

        const rawJson = completion.choices[0]?.message?.content || "{}";
        const cleanedJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        if (parsed.score !== undefined) score = Number(parsed.score);
        if (parsed.feedback) feedback = parsed.feedback;
      } catch (aiError) {
        console.error("AI grading failed:", aiError);
        feedback = "تعذر التصحيح التلقائي تم استلام ورقتك وسيقوم الأستاذ بمراجعتها";
      }
    }

    // 4. Save Submission
    await prisma.studentSubmission.upsert({
      where: {
        examId_studentId: { examId, studentId }
      },
      update: {
        imageUrl,
        score,
        feedback
      },
      create: {
        examId,
        studentId,
        imageUrl,
        score,
        feedback
      }
    });

    // 5. Update Student Profile totalPoints
    if (score > 0) {
      await prisma.studentProfile.update({
        where: { userId: studentId },
        data: {
          totalPoints: {
            increment: score
          }
        }
      });
    }

    revalidatePath("/dashboard/student/exams");
    return { success: true, score, feedback };
  } catch (error: any) {
    console.error("gradeStudentSubmission error:", error);
    return { error: error.message || "حدث خطأ غير متوقع أثناء إرسال الحل" };
  }
}
