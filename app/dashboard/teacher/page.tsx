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
        bgClass="bg-[#3B82F6]"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border-[4px] border-[#000000] shadow-3d-soft paper-cut flex items-center gap-4 hover:-translate-y-1 hover:shadow-3d-hover transition-transform cursor-default">
          <div className="w-14 h-14 bg-[#3B82F6] text-[#FFFFFF] rounded-xl border-[3px] border-[#000000] flex items-center justify-center shrink-0 transform -rotate-3 shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#000000]/60">المواد المسندة</p>
            <p className="text-3xl font-black text-[#000000]">{teacher.subjects.length}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border-[4px] border-[#000000] shadow-3d-soft paper-cut flex items-center gap-4 hover:-translate-y-1 hover:shadow-3d-hover transition-transform cursor-default">
          <div className="w-14 h-14 bg-[#22C55E] text-[#000000] rounded-xl border-[3px] border-[#000000] flex items-center justify-center shrink-0 transform rotate-3 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#000000]/60">إجمالي التلاميذ</p>
            <p className="text-3xl font-black text-[#000000]">{enrolledStudents.length}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border-[4px] border-[#000000] shadow-3d-soft paper-cut flex items-center gap-4 hover:-translate-y-1 hover:shadow-3d-hover transition-transform cursor-default">
          <div className="w-14 h-14 bg-[#EF4444] text-[#FFFFFF] rounded-xl border-[3px] border-[#000000] flex items-center justify-center shrink-0 transform -rotate-3 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#000000]/60">أخطاء مسجلة للتلاميذ</p>
            <p className="text-3xl font-black text-[#000000]">
              {enrolledStudents.reduce((acc, student) => acc + student.user.mistakes.length, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border-[4px] border-[#000000] bg-[#FFFFFF] shadow-3d-soft paper-cut">
        <div className="p-6 border-b-[4px] border-[#000000] bg-[#F8F9FA] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFFFF] border-[3px] border-[#000000] rounded-xl flex items-center justify-center shadow-sm transform rotate-2">
            <Users className="w-5 h-5 text-[#000000]" />
          </div>
          <h2 className="font-black text-xl text-[#000000]">قائمة التلاميذ المسجلين في موادك</h2>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right min-w-[700px]">
            <thead className="bg-[#FFFFFF] border-b-[4px] border-[#000000]">
              <tr>
                <th className="px-6 py-5 text-base font-black text-[#000000]">التلميذ</th>
                <th className="px-6 py-5 text-base font-black text-[#000000]">المستوى والشعبة</th>
                <th className="px-6 py-5 text-base font-black text-[#000000]">المواد المشترك بها</th>
                <th className="px-6 py-5 text-base font-black text-[#000000] text-center">عدد الأخطاء</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-[#000000]">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-[#000000]/50 font-black text-lg border-dashed">
                    لا يوجد تلاميذ مسجلين في موادك حالياً
                  </td>
                </tr>
              ) : (
                enrolledStudents.map(student => {
                  const levelStr = LEVELS.find(l => l.value === student.level)?.label || student.level;
                  const streamStr = STREAMS.find(s => s.value === student.stream)?.label || student.stream;

                  return (
                    <tr key={student.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-lg text-[#3B82F6]">{student.user.fullName}</p>
                        <p className="text-sm font-bold text-[#000000]/60 mt-1">{getWilayaName(student.wilaya)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-base font-bold text-[#000000]">{levelStr}</p>
                        <p className="text-sm font-bold text-[#000000]/60 mt-1">{streamStr}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {student.user.enrollments.map(e => (
                            <span key={e.id} className="bg-[#FFFFFF] text-[#000000] border-[2px] border-[#000000] shadow-sm text-xs font-black px-3 py-1.5 rounded-lg transform -rotate-1">
                              {e.subject.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl border-[2px] border-[#000000] shadow-sm text-sm font-black transform rotate-2 ${student.user.mistakes.length > 0 ? 'bg-[#EF4444] text-[#FFFFFF]' : 'bg-[#EAE4D9] text-[#000000]'}`}>
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
