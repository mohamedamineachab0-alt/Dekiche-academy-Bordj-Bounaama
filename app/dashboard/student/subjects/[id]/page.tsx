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
  Award,
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
    <div className="min-h-screen bg-[#F8F9FA] bg-notebook-grid font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        
        <Link href="/dashboard/student/subjects" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-950 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ChevronLeft className="w-5 h-5" />
          العودة إلى المواد
        </Link>

        {/* Hero Section */}
        <div className="w-full bg-purple-800 rounded-3xl shadow-[0_8px_30px_-4px_rgba(14,165,233,0.3)] py-10 px-6 md:py-14 md:px-12 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden relative border border-purple-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <h1 className="text-4xl md:text-5xl font-black text-purple-950 tracking-tight relative z-10">{subject.title}</h1>
          <p className="text-purple-100 font-medium max-w-3xl text-lg md:text-xl relative z-10 bg-white/30 px-6 py-3 rounded-2xl border border-purple-700/30">
            {subject.description}
          </p>
          <div className="inline-block bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg relative z-10 border border-purple-500">
            الأستاذ: {subject.teacherName}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Lessons (الدروس) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                الدروس المسجلة
              </h2>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-purple-100">
                <CheckCircle2 className="w-4 h-4" /> {accessibleLessons.length}
              </span>
            </div>
            {accessibleLessons.length > 0 ? (
              <div className="space-y-3">
                {accessibleLessons.slice(0, 3).map(lesson => (
                  <Link key={lesson.id} href={`/dashboard/student/lessons/${lesson.id}`} className="block bg-white p-4 rounded-2xl hover:bg-purple-50 hover:text-purple-800 transition-colors border border-slate-100 font-bold text-purple-800">
                    {lesson.title}
                  </Link>
                ))}
                {accessibleLessons.length > 3 && (
                  <Link href={`/dashboard/student/subjects/${id}/lessons`} className="block text-center text-sm font-bold text-purple-700 pt-2">
                    عرض الكل
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد دروس متاحة حالياً</p>
            )}
          </div>

          {/* Review Cards (بطاقات المراجعة) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Library className="w-5 h-5" />
                </div>
                بطاقات المراجعة
              </h2>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-purple-100">
                <CheckCircle2 className="w-4 h-4" /> {reviewCards.length}
              </span>
            </div>
            {reviewCards.length > 0 ? (
              <Link href={`/dashboard/student/review-cards`} className="block bg-purple-800 text-white text-center p-4 rounded-2xl hover:bg-purple-800 transition-colors font-bold shadow-md shadow-purple-600/20">
                تصفح البطاقات
              </Link>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد بطاقات متاحة حالياً</p>
            )}
          </div>

          {/* Daily Exercises (التمارين اليومية) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                التمارين اليومية
              </h2>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-purple-100">
                <CheckCircle2 className="w-4 h-4" /> {dailyExercises.length}
              </span>
            </div>
            {dailyExercises.length > 0 ? (
              <div className="space-y-3">
                {dailyExercises.slice(0, 3).map(ex => (
                  <Link key={ex.id} href={`/dashboard/student/exercises`} className="block bg-white p-4 rounded-2xl hover:bg-purple-50 hover:text-purple-800 transition-colors border border-slate-100 font-bold text-purple-800 truncate">
                    {ex.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد تمارين متاحة حالياً</p>
            )}
          </div>

          {/* Exams & Assignments (الاختبارات والفروض) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                الاختبارات والفروض
              </h2>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-purple-100">
                <CheckCircle2 className="w-4 h-4" /> {exams.length}
              </span>
            </div>
            {exams.length > 0 ? (
              <div className="space-y-3">
                {exams.slice(0, 3).map(exam => (
                  <Link key={exam.id} href={`/dashboard/student/exams`} className="block bg-white p-4 rounded-2xl hover:bg-purple-50 hover:text-purple-800 transition-colors border border-slate-100 font-bold text-purple-800 truncate">
                    {exam.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد اختبارات متاحة حالياً</p>
            )}
          </div>

          {/* My Mistakes (أخطائي) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                أخطائي
              </h2>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-purple-100">
                <CheckCircle2 className="w-4 h-4" /> {mistakes.length}
              </span>
            </div>
            {mistakes.length > 0 ? (
              <Link href={`/dashboard/student/mistakes`} className="block bg-purple-50 text-purple-800 text-center p-4 rounded-2xl hover:bg-purple-100 transition-colors font-bold border border-purple-200">
                مراجعة الأخطاء
              </Link>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لم تقم بأي أخطاء في الكويزات بعد!</p>
            )}
          </div>

          {/* Live Sessions (الحصص المباشرة) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                الحصص المباشرة
              </h2>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-purple-100">
                <CheckCircle2 className="w-4 h-4" /> {liveClasses.length}
              </span>
            </div>
            {liveClasses.length > 0 ? (
              <div className="space-y-3">
                {liveClasses.slice(0, 3).map(live => (
                  <Link key={live.id} href={`/dashboard/student/live-classes`} className="block bg-white p-4 rounded-2xl hover:bg-purple-50 hover:text-purple-800 transition-colors border border-slate-100 font-bold text-purple-800 truncate">
                    {live.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-center py-4">لا توجد حصص مباشرة مجدولة</p>
            )}
          </div>

          {/* Badges/Achievements (الشعارات) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                الشعارات وإنجازاتي
              </h2>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-slate-100">
              <Award className="w-16 h-16 text-purple-800 mb-4" />
              <p className="text-slate-500 font-bold text-lg">سيتم إضافة نظام الشعارات قريباً!</p>
              <p className="text-slate-400 font-medium">استمر في التعلم وحل التمارين لتجمع النقاط.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
