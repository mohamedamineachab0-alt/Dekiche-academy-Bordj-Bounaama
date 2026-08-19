import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redeemAccessCode } from "@/actions/subjects";
import { Key, Unlock, Lock, PlayCircle, BookOpen } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
import { SubjectActivationForm } from "@/components/student/SubjectActivationForm";

export default async function StudentSubjectsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: { studentProfile: true, enrollments: true },
  });

  if (!user || !user.studentProfile) return null;

  const { phase, level, stream } = user.studentProfile;

  // Find subjects for this phase/level/stream
  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      phase,
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
    <div className="space-y-8 font-sans pb-12">
      
      <HeroBanner 
        title="موادي الدراسية"
        description="اختر المادة التي تود دراستها و أو قم بتفعيل المواد الجديدة باستخدام رمز الدخول (كود الإشتراك) عبر البطاقات أدناه"
        icon={BookOpen}
      />

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map(subject => {
            const isEnrolled = enrolledSubjectIds.has(subject.id);
            const enrollment = enrollments.find(e => e.subjectId === subject.id);

            return (
              <div key={subject.id} className="bg-purple-900 rounded-2xl border-[3px] border-[#000000] overflow-hidden flex flex-col group max-w-sm mx-auto w-full transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative">
                {/* Graph Paper Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] z-0 pointer-events-none"></div>

                <div className="aspect-video w-full relative bg-[#F8F9FA] overflow-hidden border-b-[3px] border-[#000000] z-10">
                  <img src={subject.image} alt={subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isEnrolled ? (
                      <div className="bg-[#22C55E] text-[#000000] px-3 py-1.5 rounded-xl border-[2px] border-[#000000] text-xs font-black flex items-center gap-1.5 shadow-sm transform -rotate-2">
                        <Unlock className="w-4 h-4" /> تم الفتح
                      </div>
                    ) : (
                      <div className="bg-[#FFFFFF] text-[#000000] px-3 py-1.5 rounded-xl border-[2px] border-[#000000] text-xs font-black flex items-center gap-1.5 shadow-sm transform rotate-2">
                        <Lock className="w-4 h-4" /> مغلق
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative z-10">
                  <h3 className="font-black text-xl text-white line-clamp-1 mb-2">{subject.title}</h3>
                  <p className="text-sm font-bold text-purple-200 line-clamp-2 leading-relaxed">{subject.description}</p>
                  
                  <div className="mt-4 mb-6">
                    <span className="text-xs font-black text-white bg-purple-950 px-3 py-1.5 rounded-lg border-[2px] border-black shadow-sm">
                      الأستاذ {subject.teacherName}
                    </span>
                  </div>

                  <div className="mt-auto">
                    {isEnrolled ? (
                      <Link 
                        href={`/dashboard/student/subjects/${subject.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] border-[3px] border-[#000000] font-black py-3 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                      >
                        <PlayCircle className="w-6 h-6" />
                        الدخول للمادة
                      </Link>
                    ) : (
                      <div className="bg-white p-3 rounded-xl border-[3px] border-black shadow-sm">
                        <SubjectActivationForm subjectId={subject.id} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {subjects.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
              <div className="w-20 h-20 bg-[#F8F9FA] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center transform -rotate-6 mb-6 shadow-sm">
                <BookOpen className="w-10 h-10 text-[#000000]" />
              </div>
              <h3 className="text-2xl font-black text-[#000000] mb-3">لا توجد مواد متاحة</h3>
              <p className="text-gray-600 font-bold text-center max-w-sm leading-relaxed">
                لم يتم إضافة أي مواد دراسية تناسب مستواك الدراسي وشعبتك حتى الآن. يرجى مراجعة الإدارة أو المحاولة لاحقاً.
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
