import { prisma } from "@/lib/prisma";
import { BookOpen, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { createSubject, deleteSubject } from "@/actions/subjects";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SubjectCreationClient } from "@/components/admin/SubjectCreationClient";
import { AdminSubjectsFilterClient } from "@/components/admin/AdminSubjectsFilterClient";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "desc" },
    include: { teacher: true },
  });

  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة المواد التعليمية"
        description="أضف مواد جديدة، وحدد الأساتذة، وضبط تسعير الاشتراكات."
        icon={BookOpen}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubjectCreationClient
            teachers={teachers.map((t) => ({ id: t.id, name: t.name }))}
            action={createSubject}
          />
        </div>

        <div className="lg:col-span-2">
          <AdminSubjectsFilterClient subjects={subjects} />
        </div>
      </div>
    </div>
  );
}
