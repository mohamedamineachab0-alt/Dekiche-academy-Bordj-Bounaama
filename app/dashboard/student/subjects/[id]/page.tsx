import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  ChevronLeft, 
  Library, 
  CheckCircle2, 
  FileText, 
  BrainCircuit, 
  AlertCircle, 
  Video, 
  Play
} from "lucide-react";
import Link from "next/link";

export default async function SubjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  // Fetch subject and enrollment first to get enrolledMonths
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" }
      },
    }
  });

  if (!subject) redirect("/dashboard/student/subjects");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: sessionId,
        subjectId: id,
      }
    }
  });

  if (!enrollment) redirect("/dashboard/student/subjects");

  const enrolledMonths = enrollment.enrolledMonths;

  // Concurrent fetching of all categories using Promise.all
  // Strictly filtering by published status implicitly via enrolledMonths
  const [
    reviewCards,
    dailyExercises,
    exams,
    liveClasses,
    mistakes
  ] = await Promise.all([
    prisma.reviewCard.findMany({ 
      where: { subjectId: id, month: { in: enrolledMonths } }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.dailyExercise.findMany({ 
      where: { 
        OR: [{ subjectId: id }, { secondarySubjectId: id }], 
        month: { in: enrolledMonths } 
      }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.exam.findMany({ 
      where: { 
        OR: [{ subjectId: id }, { secondarySubjectId: id }], 
        month: { in: enrolledMonths } 
      }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.liveClass.findMany({ 
      where: { subjectId: id, month: { in: enrolledMonths } }, 
      orderBy: { date: 'asc' } 
    }),
    prisma.studentMistake.findMany({ 
      where: { 
        studentId: sessionId, 
        lesson: { subjectId: id, month: { in: enrolledMonths } } 
      } 
    }),
  ]);

  // Lessons filtered by enrolled months
  const accessibleLessons = subject.lessons.filter(l => enrolledMonths.includes(l.month));

  return (
    <div 
      className="font-arabic text-gray-900 selection:bg-[#FDE047] selection:text-[#5B21B6]" 
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        
        {/* Dashboard Vertical List */}
        <div className="flex flex-col gap-5">
          
          {/* 1. Daily Exercises (التمارين اليومية) */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">التمارين اليومية</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">تدريبات مستمرة لترسيخ الفهم</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" /> {dailyExercises.length}
              </span>
              <Link href="/dashboard/student/exercises" className="flex-1 md:flex-none text-center bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                الدخول
              </Link>
            </div>
          </div>

          {/* 2. Review Cards (بطاقات المراجعة) */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Library className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">بطاقات المراجعة</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">مراجعة سريعة ومكثفة للمعلومات</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" /> {reviewCards.length}
              </span>
              <Link href="/dashboard/student/review-cards" className="flex-1 md:flex-none text-center bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                الدخول
              </Link>
            </div>
          </div>

          {/* 3. Recorded Lessons (الدروس المسجلة) */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Play className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">الدروس المسجلة</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">شرح مفصل للمقرر الدراسي</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" /> {accessibleLessons.length}
              </span>
              <Link href={`/dashboard/student/subjects/${id}/lessons`} className="flex-1 md:flex-none text-center bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                الدخول
              </Link>
            </div>
          </div>

          {/* 4. Live Classes (الحصص المباشرة) */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">الحصص المباشرة</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">تفاعل مباشر مع الأستاذ</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" /> {liveClasses.length}
              </span>
              <Link href="/dashboard/student/live-classes" className="flex-1 md:flex-none text-center bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                الدخول
              </Link>
            </div>
          </div>

          {/* 5. My Mistakes (أخطائي) */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">أخطائي</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">راجع أخطاءك لتجنب تكرارها</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" /> {mistakes.length}
              </span>
              <Link href="/dashboard/student/mistakes" className="flex-1 md:flex-none text-center bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                الدخول
              </Link>
            </div>
          </div>

          {/* 6. Exams & Assignments (الاختبارات والفروض) */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-[0_12px_40px_rgba(91,33,182,0.08)] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">الاختبارات والفروض</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">اختبر جاهزيتك وتقييم مستواك</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-purple-100 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" /> {exams.length}
              </span>
              <Link href="/dashboard/student/exams" className="flex-1 md:flex-none text-center bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                الدخول
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
