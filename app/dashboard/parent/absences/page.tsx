
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";
import { AlertTriangle, UserMinus } from "lucide-react";

export default async function AbsencesPage() {
  const profile = await getUserSessionProfile();
  if (!profile) {
    return <div className="p-8 text-center">يرجى تسجيل الدخول</div>;
  }

  const linked = await prisma.parentStudentLink.findMany({
    where: { parentId: profile.id },
    select: { studentId: true },
  });

  if (linked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <p className="text-slate-600 mb-4">لم يتم ربط أي تلاميذ بحسابك.</p>
        <Link
          href="/dashboard/parent"
          className="px-6 py-2 bg-purple-800 text-white rounded-xl hover:bg-purple-800 transition"
        >
          ربط حسابات أبنائي
        </Link>
      </div>
    );
  }

  const studentIds = linked.map(l => l.studentId);
  const students = await prisma.user.findMany({
    where: { id: { in: studentIds } },
    select: { fullName: true, lastLoginAt: true },
  });

  const now = new Date();
  const absences = students.map(s => {
    const daysInactive = Math.floor((now.getTime() - new Date(s.lastLoginAt ?? now).getTime()) / (1000 * 60 * 60 * 24));
    const count = Math.floor(daysInactive / 5);
    return { name: s.fullName, count };
  });

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-2xl text-purple-950 flex items-center gap-4">
        <UserMinus className="w-6 h-6" />
        <h2 className="text-xl font-black">غيابات أبنائي</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {absences.map((a) => (
          <div key={a.name} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-start">
            <h3 className="font-black text-purple-900">{a.name}</h3>
            <p className="mt-2 text-slate-600">
              عدد الغيابات: <span className="font-bold text-purple-800">{a.count}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
