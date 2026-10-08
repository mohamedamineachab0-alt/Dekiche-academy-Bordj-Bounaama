export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { BookOpen, Image as ImageIcon, Trash2, Edit, Download } from "lucide-react";
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

      <div className="flex justify-end px-4 sm:px-0">
        <a 
          href="/api/admin/export-codes-zip" 
          download
          target="_blank"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all font-bold"
        >
          <Download className="w-5 h-5" />
          تحميل أكواد الدخول لجميع المواد (ZIP)
        </a>
      </div>

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
