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

  let subjects: { id: string; title: string; levels: string[]; streams: string[] }[] = [];

  if (user.role === "TEACHER") {
    const session = await getTeacherSession();
    if (session?.teacher?.subjects && session.teacher.subjects.length > 0) {
      subjects = session.teacher.subjects.map((s) => ({ 
        id: s.id, 
        title: s.title,
        levels: s.levels || [],
        streams: s.streams || []
      }));
    }
  }

  // Fallback: If no assigned subjects found or admin is testing, fetch published subjects
  if (subjects.length === 0) {
    const allSubjects = await prisma.subject.findMany({
      select: { id: true, title: true, levels: true, streams: true },
      orderBy: { title: "asc" },
      take: 50,
    });
    subjects = allSubjects;
  }

  // Format subjects with levels and streams
  const { formatSubjectTitle } = await import("@/lib/subject-formatter");
  const formattedSubjects = subjects.map(s => ({
    id: s.id,
    title: formatSubjectTitle(s.title, s.levels, s.streams)
  }));

  return (
    <div className="py-2">
      <TeacherRecordingPortal subjects={formattedSubjects} teacherName={user.fullName} />
    </div>
  );
}
