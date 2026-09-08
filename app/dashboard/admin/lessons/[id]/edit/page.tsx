import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditLessonForm } from "@/components/admin/EditLessonForm";
import { BookOpen } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function EditLessonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const lessonId = params.id;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      subjects: true,
      materials: true,
      quiz: true,
    }
  });

  if (!lesson) {
    notFound();
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="تعديل الدرس"
        description="تعديل تفاصيل الدرس الحالي وإعادة توليد الاختبارات"
        icon={BookOpen}
      />
      <div className="max-w-4xl">
        <EditLessonForm subjects={subjects} initialData={lesson} />
      </div>
    </div>
  );
}
