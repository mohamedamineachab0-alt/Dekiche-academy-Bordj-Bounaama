import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = {
  title: "طباعة حسابات الأساتذة | منصة دقيش التعليمية",
};

export default async function PrintTeachersCredentials() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    select: { fullName: true, phoneNumber: true },
    orderBy: { fullName: "asc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="rtl">
      <div id="credentials-table-container" className="max-w-4xl mx-auto border-4 border-gray-900 rounded-[2rem] p-10 bg-white shadow-2xl relative">
        <PrintButton />

        <div className="text-center mb-12 mt-4">
          <h1 className="text-4xl font-black text-gray-900 mb-3">منصة دقيش التعليمية</h1>
          <p className="text-xl font-bold text-gray-600 mb-6">بيانات الدخول الرسمية الخاصة بأساتذة المنصة</p>
          <div className="inline-block bg-indigo-100 text-indigo-800 px-6 py-3 rounded-2xl font-black text-lg border-2 border-indigo-200">
            طريقة الدخول: الاسم الكامل + رقم الهاتف
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-gray-900 shadow-sm bg-white">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="py-4 px-6 font-bold text-xl border-b border-gray-800 text-center w-16">#</th>
                <th className="py-4 px-6 font-bold text-xl border-b border-gray-800">اسم الأستاذ (كما هو في المنصة)</th>
                <th className="py-4 px-6 font-bold text-xl border-b border-gray-800">رقم الهاتف (للدخول)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {teachers.map((teacher, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-black text-gray-500 text-center border-l-2 border-gray-100">{index + 1}</td>
                  <td className="py-4 px-6 font-black text-gray-900 text-xl border-l-2 border-gray-100">{teacher.fullName}</td>
                  <td className="py-4 px-6 font-black font-mono text-indigo-700 text-2xl tracking-wider bg-indigo-50/30" dir="ltr">
                    {teacher.phoneNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center text-base font-bold text-gray-500 bg-gray-100 py-4 rounded-xl">
          هذه الوثيقة خاصة بالإدارة والأساتذة. يرجى الاحتفاظ ببيانات الدخول في مكان آمن.
        </div>
      </div>
    </div>
  );
}
