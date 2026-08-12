import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { GraduationCap, ExternalLink, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { ExamSubmissionForm } from "@/components/student/ExamSubmissionForm";

export default async function StudentExamsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      enrollments: true
    }
  });

  if (!user) redirect("/login");

  const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);

  // Fetch student's submissions directly
  const studentSubmissions = await prisma.studentSubmission.findMany({
    where: { studentId: user.id }
  });

  // Fetch exams for subjects the student is enrolled in
  const exams = await prisma.exam.findMany({
    where: {
      subjectId: { in: enrolledSubjectIds }
    },
    include: {
      subject: true,
      quiz: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="الاختبارات والفروض"
        description="استعرض اختباراتك وحمل الحل بخط يدك ليقوم الذكاء الاصطناعي بتصحيحه فوراً وتوجيهك"
        icon={GraduationCap}
      />

      {exams.length === 0 ? (
        <div className="p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
          <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-sm relative z-10">
            <GraduationCap className="w-10 h-10 text-[#000000]" />
          </div>
          <h3 className="font-black text-2xl text-[#000000] mb-3 relative z-10">لا توجد اختبارات متاحة حالياً</h3>
          <p className="text-gray-600 font-bold mt-2 relative z-10">ستظهر هنا الاختبارات الخاصة بالمواد التي سجلت فيها</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {exams.map((exam, idx) => {
            const submission = studentSubmissions.find(sub => sub.examId === exam.id);
            const hasSubmitted = !!submission;

            return (
              <div key={exam.id} className="bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] overflow-hidden flex flex-col paper-cut group transition-transform hover:-translate-y-1 hover:shadow-3d-hover relative">
                
                <div className="p-6 md:p-8 border-b-[3px] border-[#000000] bg-[#F8F9FA] flex justify-between items-start relative z-10">
                  <div className="flex-1 ml-4">
                    <h3 className="font-black text-2xl text-[#000000] mb-3">{exam.title}</h3>
                    <span className="inline-block bg-[#EAE4D9] text-[#000000] border-[2px] border-[#000000] text-xs font-black px-3 py-1.5 rounded-lg shadow-sm transform -rotate-1">
                      {exam.subject.title}
                    </span>
                  </div>
                  <div className="text-center bg-[#FFFFFF] border-[3px] border-[#000000] rounded-xl px-4 py-2 shadow-sm transform rotate-3 shrink-0">
                    <p className="text-[10px] font-black text-gray-500 mb-1">العلامة الكلية</p>
                    <p className="font-mono font-black text-2xl text-[#000000]">{exam.maxScore}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col gap-6 relative z-10 bg-white">
                  {/* View Exam A4 Image */}
                  <a 
                    href={exam.a4ImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-[#FFFFFF] border-[3px] border-[#000000] rounded-2xl hover:bg-[#FACC15] transition-colors shadow-sm group-hover:scale-[1.02]"
                  >
                    <div>
                      <h4 className="font-black text-[#000000]">تحميل أو عرض موضوع الاختبار</h4>
                      <p className="text-xs text-gray-600 font-bold mt-1">صيغة A4 لطباعة ورقة الأسئلة</p>
                    </div>
                    <div className="w-10 h-10 bg-white border-[2px] border-[#000000] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <ExternalLink className="w-5 h-5 text-[#000000]" strokeWidth={3} />
                    </div>
                  </a>

                  {/* Submit Area or Interactive Quiz */}
                  <div className="mt-auto">
                    {exam.quiz ? (
                      <Link 
                        href={`/dashboard/student/exams/${exam.id}/quiz`}
                        className="flex items-center justify-center w-full bg-[#22C55E] hover:bg-[#16A34A] text-[#000000] border-[3px] border-[#000000] font-black text-lg py-4 rounded-xl transition-all shadow-sm text-center hover:-translate-y-1 hover:shadow-3d-hover"
                      >
                        بدأ الاختبار الان
                      </Link>
                    ) : (
                      <ExamSubmissionForm 
                        examId={exam.id}
                        studentId={user.id}
                        hasSubmitted={hasSubmitted}
                        previousScore={submission?.score}
                        previousFeedback={submission?.feedback}
                      />
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
