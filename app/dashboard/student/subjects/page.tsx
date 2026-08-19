import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redeemAccessCode } from "@/actions/subjects";
import { Key, Unlock, Lock, PlayCircle, BookOpen } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
import { SubjectActivationForm } from "@/components/student/SubjectActivationForm";
import { translateLevel, translateStream } from "@/lib/utils/translations";

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
              <div key={subject.id} className="bg-white rounded-2xl border border-gray-100 flex flex-col group max-w-sm mx-auto w-full transition-shadow shadow-sm hover:shadow-md relative overflow-hidden">
                {/* Cover Image & Badge */}
                <div className="relative w-full aspect-video bg-[#1e1b4b] rounded-t-2xl overflow-hidden flex items-center justify-center">
                  <img src={subject.image} alt={subject.title} className="w-full h-full object-contain" />
                  <div className="absolute top-3 left-3">
                    {isEnrolled ? (
                      <div className="bg-white/90 backdrop-blur-sm text-green-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-green-100">
                        <Unlock className="w-3.5 h-3.5" /> تم الفتح
                      </div>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-sm text-red-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-red-100">
                        <Lock className="w-3.5 h-3.5" /> مغلق
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Subject Info */}
                  <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{subject.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-1">
                    الأستاذ {subject.teacherName} • المستوى {translateLevel(subject.level)}
                  </p>
                  
                  {/* Action Area */}
                  <div className="mt-auto border-t border-gray-100 pt-5">
                    {isEnrolled ? (
                      <Link 
                        href={`/dashboard/student/subjects/${subject.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-[#6b21a8] hover:bg-purple-800 text-white font-semibold py-3 rounded-xl transition-colors"
                      >
                        <PlayCircle className="w-5 h-5" />
                        الدخول للمادة
                      </Link>
                    ) : (
                      <div className="w-full">
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
