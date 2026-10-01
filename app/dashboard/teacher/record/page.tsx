import { getTeacherSession } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeacherRecordingPortal } from "@/components/teacher/TeacherRecordingPortal";
import { cookies } from "next/headers";

export const metadata = {
  title: "استوديو تسجيل الدروس | منصة دقيش التعليمية",
  description: "تسجيل الدروس والشاشة مباشرة ورفعها للمونتاج والاعتماد",
};

export default async function TeacherRecordPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true, fullName: true },
  });

  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  let subjects: { id: string; title: string }[] = [];

  if (user.role === "TEACHER") {
    const session = await getTeacherSession();
    if (session?.teacher?.subjects && session.teacher.subjects.length > 0) {
      subjects = session.teacher.subjects.map((s) => ({ id: s.id, title: s.title }));
    }
  }

  // Fallback: If no assigned subjects found or admin is testing, fetch published subjects
  if (subjects.length === 0) {
    const allSubjects = await prisma.subject.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
      take: 50,
    });
    subjects = allSubjects;
  }

  return (
    <div className="py-2">
      <TeacherRecordingPortal subjects={subjects} teacherName={user.fullName} />
    </div>
  );
}
