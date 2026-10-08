import { redirect } from "next/navigation";
import { getUserSessionProfile } from "@/actions/user";
import { prisma } from "@/lib/prisma";
import { TeacherRecordingPortal } from "@/components/teacher/TeacherRecordingPortal";

export const dynamic = 'force-dynamic';

export default async function AdminUploadLessonPage() {
  const user = await getUserSessionProfile();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all subjects for the admin
  const rawSubjects = await prisma.subject.findMany({
    select: {
      id: true,
      title: true,
      levels: true,
      streams: true,
      phase: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const { formatSubjectTitle } = await import("@/lib/subject-formatter");

  const subjects = rawSubjects.map((sub) => {
    return {
      id: sub.id,
      title: formatSubjectTitle(sub.title, sub.levels, sub.streams),
      levels: sub.levels || [],
      streams: sub.streams || [],
    };
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink mb-2">إضافة درس جديد (الإدارة)</h1>
        <p className="text-muted text-sm">
          يمكنك من خلال هذه الصفحة رفع درس جديد أو تسجيله وتحديد المادة التي سينشر فيها الدرس.
        </p>
      </div>

      <TeacherRecordingPortal subjects={subjects} teacherName={user.fullName} />
    </div>
  );
}
