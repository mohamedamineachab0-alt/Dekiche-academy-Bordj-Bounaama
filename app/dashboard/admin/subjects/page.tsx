import { prisma } from "@/lib/prisma";
import { BookOpen, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { createSubject, deleteSubject } from "@/actions/subjects";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SubjectCreationClient } from "@/components/admin/SubjectCreationClient";
import Link from "next/link";

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <article key={subject.id} className="surface-card overflow-hidden flex flex-col">
                <div className="aspect-video w-full relative bg-surface-muted flex items-center justify-center overflow-hidden">
                  {subject.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={subject.image} alt={subject.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary">
                      {subject.price === 0 ? "مجاناً" : `${subject.price} دج`}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/subjects/${subject.id}/edit`}
                      className="bg-white/90 hover:bg-white p-1.5 rounded-lg text-primary"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={deleteSubject.bind(null, subject.id)}>
                      <button
                        type="submit"
                        className="bg-red-50 hover:bg-red-100 p-1.5 rounded-lg text-red-600"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-ink line-clamp-1">{subject.title}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="badge-outline">{subject.teacherName}</span>
                    <span className="badge-soft">{subject.accessType === "YEARLY" ? "سنوي" : "شهري"}</span>
                  </div>
                </div>
              </article>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full surface-card px-6 py-16 text-center">
                <span className="icon-tile mx-auto mb-4">
                  <BookOpen className="w-5 h-5" />
                </span>
                <p className="text-sm text-muted">لا توجد مواد تعليمية منشورة بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
