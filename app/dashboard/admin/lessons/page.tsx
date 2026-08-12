import { prisma } from "@/lib/prisma";
import { Plus, Video, FileText, Download } from "lucide-react";
import { createLesson, addLessonMaterial } from "@/actions/lessons";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { SubjectFilterForm } from "@/components/admin/SubjectFilterForm";

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: { subjectId?: string };
}) {
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const selectedSubjectId = searchParams.subjectId || (subjects.length > 0 ? subjects[0].id : null);

  const selectedSubject = selectedSubjectId ? await prisma.subject.findUnique({
    where: { id: selectedSubjectId },
    include: {
      lessons: {
        include: { materials: true },
        orderBy: { createdAt: "asc" }
      }
    }
  }) : null;

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إدارة الدروس"
        description="ارفع الدروس والفيديوهات (Vimeo) وقم بتنظيمها حسب الأشهر لكل مادة"
        icon={Video}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div></div>
        
        {/* Subject Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-purple-800 whitespace-nowrap">اختر المادة:</label>
          <SubjectFilterForm 
            subjects={subjects.map(s => ({ id: s.id, title: s.title }))} 
            selectedSubjectId={selectedSubjectId || undefined} 
          />
        </div>
      </div>

      {!selectedSubject && (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 font-bold">
          الرجاء اختيار مادة من القائمة أعلاه أو إضافة مادة جديدة أولاً
        </div>
      )}

      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Creation Forms */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 mb-2">
                <Video className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-purple-950">إضافة درس جديد</h2>
              <p className="text-slate-500 text-sm font-medium">قم بإضافة درس جديد مع كويز وملحقات إضافية عبر الواجهة المخصصة للنشر</p>
              
              <Link 
                href="/dashboard/admin/lessons/new"
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-bold py-3.5 rounded-xl transition-all shadow-md shadow-purple-600/20"
              >
                <Plus className="w-5 h-5" />
                واجهة نشر الدروس
              </Link>
            </div>

          </div>

          {/* List of Lessons */}
          <div className="lg:col-span-2 space-y-6">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => {
              const monthLessons = selectedSubject.lessons.filter(l => l.month === month);
              if (monthLessons.length === 0) return null;

              return (
                <div key={month} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-white border-b border-slate-100 p-4">
                    <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-700"></div>
                      الشهر {month}
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {monthLessons.map(lesson => (
                      <div key={lesson.id} className="border border-slate-100 rounded-2xl p-4 flex flex-col">
                        <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-3">
                          <img src={lesson.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop"} alt={lesson.title} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-bold text-purple-950 mb-1">{lesson.title}</h4>
                        <p className="text-xs text-slate-500 font-mono mb-3">Vimeo: {lesson.vimeoVideoId}</p>
                        
                        {lesson.materials.length > 0 ? (
                          <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-100">
                            {lesson.materials.map(mat => (
                              <div key={mat.id} className="flex items-center justify-between bg-white p-2 rounded-lg text-xs font-bold text-purple-800">
                                <span className="truncate flex-1 ml-2">{mat.title}</span>
                                <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="text-purple-700 hover:text-purple-900 bg-purple-50 p-1.5 rounded-md">
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-auto pt-3 border-t border-slate-100 text-xs font-bold text-slate-400">
                            لا توجد ملحقات
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
