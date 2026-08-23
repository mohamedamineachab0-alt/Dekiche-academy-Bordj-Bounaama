import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuizClient } from "@/components/student/QuizClient";
import { requireUser } from "@/lib/authz";

export default async function ExamQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionId = (await requireUser()).id;

  if (!sessionId) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      quiz: true,
      subject: true
    }
  });

  if (!exam || !exam.quiz) redirect(`/dashboard/student/exams`);

  const questions = typeof exam.quiz.questions === 'string' 
    ? JSON.parse(exam.quiz.questions) 
    : (exam.quiz.questions as any[]);

  return (
    <div className="max-w-4xl mx-auto py-8 font-arabic" dir="rtl">
      <QuizClient 
        lessonId={undefined} 
        lessonTitle={exam.title} 
        quizId={exam.quiz.id}
        questions={questions}
        contextType="exam"
      />
    </div>
  );
}
