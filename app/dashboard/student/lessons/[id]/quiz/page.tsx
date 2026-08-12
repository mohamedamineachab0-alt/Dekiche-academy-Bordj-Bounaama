import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuizClient } from "@/components/student/QuizClient";

export default async function LessonQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quiz: true,
      subject: true
    }
  });

  if (!lesson || !lesson.quiz) redirect(`/dashboard/student/lessons/${id}`);

  // Need to parse questions from JSON
  const questions = typeof lesson.quiz.questions === 'string' 
    ? JSON.parse(lesson.quiz.questions) 
    : (lesson.quiz.questions as any[]);

  return (
    <div className="max-w-4xl mx-auto py-8 font-arabic" dir="rtl">
      <QuizClient 
        lessonId={lesson.id} 
        lessonTitle={lesson.title} 
        quizId={lesson.quiz.id}
        questions={questions}
      />
    </div>
  );
}
