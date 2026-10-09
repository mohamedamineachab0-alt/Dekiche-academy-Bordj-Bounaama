import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getTeacherSession } from "@/lib/teacher";

export default async function TeacherStudentsPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  // Get all unique students enrolled in the teacher's subjects
  const students = await prisma.user.findMany({
    where: {
      enrollments: {
        some: {
          subjectId: { in: session.subjectIds },
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      createdAt: true,
      _count: {
        select: {
          lessonCompletions: true,
          quizCompletions: true,
          mistakes: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <HeroBanner
        variant="hero"
        title="قائمة التلاميذ"
        description="تصفح تلاميذك المسجلين في موادك، واطلع على تفاصيل تقدمهم وأخطائهم."
        icon={Users}
      />

      <div className="surface-panel p-6 overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-16">
            <span className="icon-tile mx-auto mb-4">
              <Users className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-ink mb-1">لا يوجد تلاميذ مسجلين</h3>
            <p className="text-sm text-muted">لم يقم أي تلميذ بالاشتراك في موادك بعد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full data-table min-w-[700px]">
              <thead>
                <tr>
                  <th>الاسم واللقب</th>
                  <th>رقم الهاتف</th>
                  <th className="text-center">الدروس المكتملة</th>
                  <th className="text-center">الكويزات المكتملة</th>
                  <th className="text-center">الأخطاء المسجلة</th>
                  <th className="text-left">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="font-semibold text-ink">
                      <Link
                        href={`/dashboard/teacher/students/${student.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {student.fullName}
                      </Link>
                    </td>
                    <td dir="ltr" className="text-right text-muted font-mono text-sm">
                      {student.phoneNumber}
                    </td>
                    <td className="text-center font-mono">{student._count.lessonCompletions}</td>
                    <td className="text-center font-mono">{student._count.quizCompletions}</td>
                    <td className="text-center font-mono text-red-500 font-bold">
                      {student._count.studentMistakes}
                    </td>
                    <td className="text-left">
                      <Link
                        href={`/dashboard/teacher/students/${student.id}`}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
