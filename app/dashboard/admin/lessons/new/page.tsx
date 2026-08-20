import { LessonForm } from "@/components/admin/LessonForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Video, List } from "lucide-react";



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

  const recentLessons = await prisma.lesson.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { 
      subjects: { 
        select: { title: true } 
      } 
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

      <div className="mt-12 bg-white rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 border-[3px] border-black flex items-center justify-center text-purple-700 shadow-sm">
            <List className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-black">آخر الدروس المنشورة</h2>
        </div>

        {recentLessons.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-bold border-2 border-dashed border-slate-300 rounded-xl">
            لا توجد دروس منشورة بعد
          </div>
        ) : (
          <div className="space-y-4">
            {recentLessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className="flex items-center justify-between p-4 rounded-xl border-[3px] border-black bg-[#FCFBF9] hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white flex-shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-black text-lg">{lesson.title}</h3>
                    <p className="text-sm font-bold text-slate-600 mt-1">
                      المادة: <span className="text-purple-700">{lesson.subjects?.map(s => s.title).join(" | ")}</span> • الشهر: {lesson.month}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold bg-white px-3 py-1.5 border-2 border-black rounded-lg">
                  Vimeo: {lesson.vimeoVideoId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
