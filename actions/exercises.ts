"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

async function uploadToSupabase(file: File, bucketName: string, pathPrefix: string): Promise<string> {
  const ext = file.name.split('.').pop() || "pdf";
  const filePath = `${pathPrefix}-${Date.now()}.${ext}`;
  
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });
    
  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error("فشل رفع المرفق إلى قاعدة البيانات");
  }
  
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function createDailyExercise(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const a4ImageUrl = formData.get("a4ImageUrl") as string;
  const maxScore = parseInt(formData.get("maxScore") as string) || 20;
  const phase = formData.get("phase") as any;
  const level = formData.get("level") as any;
  const stream = formData.get("stream") as any;
  const month = parseInt(formData.get("month") as string);
  const subjectId = formData.get("subjectId") as string;
  const secondarySubjectId = formData.get("secondarySubjectId") as string || null;
  const quizType = formData.get("quizType") as string || "AI";

  const rawMaterials = formData.getAll("materials") as File[];
  const materialTitle = formData.get("materialTitle") as string;
  let materialsData: { title: string, fileUrl: string }[] = [];

  for (let i = 0; i < rawMaterials.length; i++) {
    const file = rawMaterials[i];
    if (file && file.size > 0) {
      const fileUrl = await uploadToSupabase(file, "exercises", `exercise-${subjectId}-material`);
      const t = materialTitle ? (rawMaterials.length > 1 ? `${materialTitle} - ${i + 1}` : materialTitle) : file.name;
      materialsData.push({ title: t, fileUrl });
    }
  }

  let questionsData: any = [];
  if (quizType === "MANUAL") {
    const rawQuestions = formData.get("manualQuestions") as string;
    if (rawQuestions) {
      try {
        const parsed = JSON.parse(rawQuestions);
        const pointsPerQuestion = 20 / parsed.length;
        questionsData = parsed.map((q: any) => ({
          ...q,
          points: pointsPerQuestion
        }));
      } catch (e) {
        throw new Error("Invalid manual questions JSON");
      }
    }
  }

  if (!title || !a4ImageUrl || !subjectId || !phase || !level || !stream) {
    throw new Error("Missing required fields");
  }

  await prisma.$transaction(async (tx) => {
    const ex = await tx.dailyExercise.create({
      data: {
        title,
        a4ImageUrl,
        maxScore,
        phase,
        level,
        stream,
        month,
        subjectId,
        secondarySubjectId,
        materials: {
          create: materialsData.map(m => ({
            title: m.title,
            fileUrl: m.fileUrl,
          })),
        },
      },
    });

    await tx.quiz.create({
      data: {
        dailyExerciseId: ex.id,
        maxScore: 20,
        aiGenerated: quizType === "AI",
        questions: questionsData,
      }
    });
  });

  revalidatePath("/dashboard/admin/exercises");
}
