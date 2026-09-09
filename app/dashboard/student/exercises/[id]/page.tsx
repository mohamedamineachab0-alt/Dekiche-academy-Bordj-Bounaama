import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ExerciseDetailsPage({
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
    select: { id: true, quiz: { select: { id: true } } },
  });

  if (!exercise?.quiz) redirect("/dashboard/student/exercises");
  redirect(`/dashboard/student/exercises/${exercise.id}/quiz`);
}
