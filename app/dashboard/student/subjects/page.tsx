import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redeemAccessCode } from "@/actions/subjects";
import { Key, Unlock, Lock, PlayCircle, BookOpen } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";

export default async function StudentSubjectsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: { studentProfile: true, enrollments: true },
  });

  if (!user || !user.studentProfile) return null;

  const { level, stream } = user.studentProfile;

  // Find subjects for this level/stream
  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      level,
      OR: [
        { stream },
        { stream: "NONE" }
      ]
    },
    include: { teacher: true },
    orderBy: { createdAt: "desc" }
  });

  const enrollments = user.enrollments;
  const enrolledSubjectIds = new Set(enrollments.map(e => e.subjectId));

  return (
    <div className="space-y-8">
      
      <HeroBanner 
        title="موادي الدراسية"
        description="اختر المادة التي تود دراستها و أو قم بتفعيل المواد الجديدة باستخدام رمز الدخول (كود الإشتراك) عبر البطاقات أدناه"
        icon={BookOpen}
        gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
      />

      <div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {subjects.map(subject => {
            const isEnrolled = enrolledSubjectIds.has(subject.id);
            const enrollment = enrollments.find(e => e.subjectId === subject.id);

            return (
              <div key={subject.id} className="bg-white/90 backdrop-blur-md dark:bg-white/90 rounded-3xl shadow-sm border border-slate-100 dark:border-purple-200 overflow-hidden flex flex-col group max-w-sm mx-auto w-full">
                <div className="h-36 w-full relative bg-slate-100 dark:bg-white overflow-hidden">
                  <img src={subject.image} alt={subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {isEnrolled ? (
                      <div className="bg-green-500/90 backdrop-blur-md text-purple-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Unlock className="w-3.5 h-3.5" /> تم الفتح
                      </div>
                    ) : (
                      <div className="bg-white/80 backdrop-blur-md text-purple-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Lock className="w-3.5 h-3.5" /> مغلق
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-lg text-purple-950 dark:text-purple-950 line-clamp-1">{subject.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>
                  
                  <div className="mt-4 mb-5">
                    <span className="text-xs font-bold text-slate-600 dark:text-purple-800 bg-white/80 backdrop-blur-sm dark:bg-white/80 px-2 py-1 rounded-md">
                      الأستاذ {subject.teacherName}
                    </span>
                  </div>

                  <div className="mt-auto">
                    {isEnrolled ? (
                      <Link 
                        href={`/dashboard/student/subjects/${subject.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold py-3 rounded-xl transition-colors"
                      >
                        <PlayCircle className="w-5 h-5" />
                        الدخول للمادة
                      </Link>
                    ) : (
                      <form action={redeemAccessCode} className="space-y-3">
                        <input type="hidden" name="subjectId" value={subject.id} />
                        <div className="relative">
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            <Key className="w-4 h-4" />
                          </span>
                          <input 
                            type="text" 
                            name="code" 
                            placeholder="أدخل كود الإشتراك" 
                            required
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-950 dark:text-purple-950 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-white transition-all"
                          />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
                          <Unlock className="w-4 h-4" />
                          تفعيل المادة
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {subjects.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <BookOpen className="w-12 h-12 text-purple-900 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">لا توجد مواد متاحة لمستواك الدراسي حالياً</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
