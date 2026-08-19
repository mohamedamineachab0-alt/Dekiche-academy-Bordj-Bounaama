import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { BookOpen, Plus, Image as ImageIcon } from "lucide-react";
import { createSubject, deleteSubject } from "@/actions/subjects";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { SubjectCreationClient } from "@/components/admin/SubjectCreationClient";
import { Trash2, Edit } from "lucide-react";
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
    <div className="space-y-6">
      <HeroBanner 
        title="إدارة المواد التعليمية"
        description="قم بإضافة مواد جديدة و تحديد الأساتذة و وتسعير الاشتراكات الخاصة بها"
        icon={BookOpen}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <SubjectCreationClient 
            teachers={teachers.map(t => ({ id: t.id, name: t.name }))} 
            action={createSubject}
          />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(subject => (
              <div key={subject.id} className="bg-white dark:bg-white rounded-3xl shadow-sm border border-slate-100 dark:border-purple-200 overflow-hidden flex flex-col">
                <div className="aspect-video w-full relative bg-slate-100 dark:bg-white flex items-center justify-center overflow-hidden">
                  {subject.image ? (
                    <img src={subject.image} alt={subject.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-purple-800 shadow-sm">
                      {subject.price === 0 ? "مجانا" : `${subject.price} دج`}
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <Link href={`/dashboard/admin/subjects/${subject.id}/edit`} className="bg-white/90 dark:bg-white/90 hover:bg-white dark:hover:bg-white backdrop-blur-sm p-1.5 rounded-lg text-purple-800 dark:text-purple-800 shadow-sm transition-colors" title="تعديل">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={deleteSubject.bind(null, subject.id)}>
                      <button type="submit" className="bg-purple-700/90 hover:bg-purple-800 backdrop-blur-sm p-1.5 rounded-lg text-white shadow-sm transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-purple-950 dark:text-purple-950 line-clamp-1">{subject.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-purple-800 bg-white dark:bg-white px-2 py-1 rounded-md">
                      {subject.teacherName}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-purple-800 bg-white dark:bg-white px-2 py-1 rounded-md">
                      {subject.accessType === "YEARLY" ? "سنوي" : "شهري"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                لا توجد مواد تعليمية منشورة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
