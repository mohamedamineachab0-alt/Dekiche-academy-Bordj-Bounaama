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
    <div className="space-y-8">
      <HeroBanner 
        title="الاختبارات والفروض"
        description="استعرض اختباراتك وحمل الحل بخط يدك ليقوم الذكاء الاصطناعي بتصحيحه فوراً وتوجيهك"
        icon={GraduationCap}
        gradientClass="bg-gradient-to-r from-purple-700 to-purple-800"
      />

      {exams.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <GraduationCap className="w-16 h-16 text-purple-800 mx-auto mb-4" />
          <h3 className="font-black text-xl text-purple-900">لا توجد اختبارات متاحة حالياً</h3>
          <p className="text-slate-500 font-medium mt-2">ستظهر هنا الاختبارات الخاصة بالمواد التي سجلت فيها</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {exams.map(exam => {
            const submission = studentSubmissions.find(sub => sub.examId === exam.id);
            const hasSubmitted = !!submission;

            return (
              <div key={exam.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                
                <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-xl text-purple-950">{exam.title}</h3>
                    <span className="inline-block mt-2 bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1 rounded-full">
                      {exam.subject.title}
                    </span>
                  </div>
                  <div className="text-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400">العلامة الكلية</p>
                    <p className="font-black text-purple-900">{exam.maxScore}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-6">
                  {/* View Exam A4 Image */}
                  <a 
                    href={exam.a4ImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-purple-900">تحميل أو عرض موضوع الاختبار</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">صيغة A4 لطباعة ورقة الأسئلة</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </a>

                  {/* Submit Area or Interactive Quiz */}
                  <div className="mt-auto">
                    {exam.quiz ? (
                      <Link 
                        href={`/dashboard/student/exams/${exam.id}/quiz`}
                        className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-purple-950 font-bold py-4 rounded-xl transition-colors shadow-sm text-center"
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
