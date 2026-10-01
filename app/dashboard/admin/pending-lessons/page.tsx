import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PendingLessonsReview, PendingLessonItem } from "@/components/admin/PendingLessonsReview";

export const metadata = {
  title: "مراجعة الدروس المعلقة | إدارة منصة دقيش التعليمية",
  description: "مراجعة واعتماد الدروس المسجلة من الأساتذة ومونتاجها ونشرها للطلاب",
};

export const dynamic = "force-dynamic";

export default async function AdminPendingLessonsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value || cookieStore.get("admin_session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard/teacher");
  }

  const pendingLessons = await prisma.pendingLesson.findMany({
    include: {
      subject: {
        select: { id: true, title: true, teacherName: true },
      },
      teacher: {
        select: { id: true, fullName: true, phoneNumber: true },
      },
      publishedLesson: {
        select: { id: true, title: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedLessons: PendingLessonItem[] = pendingLessons.map((l) => ({
    id: l.id,
    title: l.title,
    stream: l.stream,
    level: l.level,
    month: l.month,
    editingNotes: l.editingNotes || "",
    vimeoVideoId: l.vimeoVideoId,
    vimeoUrl: l.vimeoUrl,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    subject: l.subject,
    teacher: l.teacher,
    publishedLesson: l.publishedLesson
      ? {
          id: l.publishedLesson.id,
          title: l.publishedLesson.title,
          createdAt: l.publishedLesson.createdAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="py-2">
      <PendingLessonsReview initialLessons={formattedLessons} />
    </div>
  );
}
