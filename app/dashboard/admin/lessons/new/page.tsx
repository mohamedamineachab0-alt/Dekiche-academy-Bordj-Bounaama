import { LessonForm } from "@/components/admin/LessonForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";



export default async function NewLessonPage() {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      title: true,
      level: true,
      stream: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin" 
          className="w-10 h-10 bg-white dark:bg-white border border-slate-200 dark:border-purple-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-purple-700 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-purple-950 dark:text-purple-950">نشر درس جديد</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">أضف درسا جديدا مع الملحقات والكويز</p>
        </div>
      </div>
      
      <LessonForm subjects={subjects} />
    </div>
  );
}
