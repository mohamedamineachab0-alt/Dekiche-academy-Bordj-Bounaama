import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuizClient } from "@/components/student/QuizClient";

export default async function ExerciseQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const exercise = await prisma.dailyExercise.findUnique({
    where: { id },
    include: {
      quiz: true,
      subject: true,
      lesson: { select: { title: true } },
    }
  });

  if (!exercise || !exercise.quiz) redirect(`/dashboard/student/exercises`);

  const questions = typeof exercise.quiz.questions === 'string' 
    ? JSON.parse(exercise.quiz.questions) 
    : (exercise.quiz.questions as any[]);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 font-sans min-w-0" dir="rtl">
      <QuizClient 
        lessonId={exercise.lessonId || undefined} 
        lessonTitle={exercise.lesson?.title ? `تمرين يومي — ${exercise.lesson.title}` : exercise.title} 
        quizId={exercise.quiz.id}
        questions={questions}
        contextType="exercise"
      />
    </div>
  );
}
