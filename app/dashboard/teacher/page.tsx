import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Presentation, BookOpen, Users, AlertTriangle } from "lucide-react";
import { getWilayaName, LEVELS, STREAMS } from "@/lib/constants";

export default async function TeacherDashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      teacherProfile: {
        include: {
          subjects: true
        }
      }
    }
  });

  if (!user || !user.teacherProfile) redirect("/login");

  const teacher = user.teacherProfile;
  const subjectIds = teacher.subjects.map(s => s.id);

  // Fetch all students enrolled in the teacher's subjects
  const enrolledStudents = await prisma.studentProfile.findMany({
    where: {
      user: {
        enrollments: {
          some: {
            subjectId: { in: subjectIds }
          }
        }
      }
    },
    include: {
      user: {
        include: {
          enrollments: {
            where: { subjectId: { in: subjectIds } },
            include: { subject: true }
          },
          mistakes: {
            where: {
              lesson: {
                subjectId: { in: subjectIds }
              }
            }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-8">
      <HeroBanner 
        title={`مرحباً يا أستاذ ${teacher.name}!`}
        description="هذه لوحة التحكم الخاصة بك يمكنك متابعة تلاميذك و وتحليل مستوياتهم و والاطلاع على الأخطاء الشائعة في موادك"
        icon={Presentation}
        gradientClass="bg-gradient-to-r from-purple-700 to-slate-950"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">المواد المسندة</p>
            <p className="text-2xl font-black text-purple-950">{teacher.subjects.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">إجمالي التلاميذ</p>
            <p className="text-2xl font-black text-purple-950">{enrolledStudents.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">أخطاء مسجلة للتلاميذ</p>
            <p className="text-2xl font-black text-purple-950">
              {enrolledStudents.reduce((acc, student) => acc + student.user.mistakes.length, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-700" />
          <h2 className="font-black text-lg text-purple-950">قائمة التلاميذ المسجلين في موادك</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-black text-purple-800">التلميذ</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">المستوى والشعبة</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">المواد المشترك بها</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">عدد الأخطاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold">
                    لا يوجد تلاميذ مسجلين في موادك حالياً
                  </td>
                </tr>
              ) : (
                enrolledStudents.map(student => {
                  const levelStr = LEVELS.find(l => l.value === student.level)?.label || student.level;
                  const streamStr = STREAMS.find(s => s.value === student.stream)?.label || student.stream;

                  return (
                    <tr key={student.id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-purple-950">{student.user.fullName}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">{getWilayaName(student.wilaya)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-purple-900">{levelStr}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">{streamStr}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {student.user.enrollments.map(e => (
                            <span key={e.id} className="bg-purple-50 text-purple-800 border border-purple-100 text-xs font-bold px-2 py-1 rounded-md">
                              {e.subject.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black ${student.user.mistakes.length > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                          {student.user.mistakes.length} خطأ
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
