
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";
import { AlertTriangle, UserMinus } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

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
      <div className="flex flex-col items-center justify-center h-full py-20 px-4">
        <div className="bg-[#FFFFFF] p-12 text-center rounded-2xl border-[4px] border-[#000000] shadow-3d-soft paper-cut border-dashed max-w-lg w-full">
          <div className="w-20 h-20 rounded-full bg-[#EAE4D9] border-[3px] border-[#000000] flex items-center justify-center mx-auto mb-6 transform rotate-6 shadow-sm">
            <UserMinus className="w-8 h-8 text-[#000000]" />
          </div>
          <p className="text-[#000000]/70 font-black text-xl mb-6">لم يتم ربط أي تلاميذ بحسابك.</p>
          <Link
            href="/dashboard/parent"
            className="inline-block px-8 py-4 bg-[#7E22CE] text-[#FFFFFF] rounded-xl border-[3px] border-[#000000] font-black hover:bg-[#4C1D95] transition-transform shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1"
          >
            ربط حسابات أبنائي
          </Link>
        </div>
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
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        title="غيابات الأبناء"
        description="متابعة حضور أبنائك وانضباطهم في الدروس والحصص على المنصة"
        icon={AlertTriangle}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {absences.map((a) => (
          <div key={a.name} className={`p-6 rounded-2xl border-[4px] border-[#000000] shadow-3d-soft paper-cut flex flex-col items-center text-center transform transition-transform hover:-translate-y-1 hover:shadow-3d-hover ${a.count > 0 ? "bg-[#EF4444]" : "bg-[#22C55E]"}`}>
            <h3 className={`font-black text-2xl mb-4 ${a.count > 0 ? "text-[#FFFFFF]" : "text-[#000000]"}`}>{a.name}</h3>
            
            <div className="flex flex-col items-center justify-center bg-[#FFFFFF] w-full py-4 rounded-xl border-[3px] border-[#000000] shadow-sm transform rotate-1">
              <p className={`text-4xl font-black ${a.count > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
                {a.count}
              </p>
              <p className="font-bold text-[#000000] mt-1 text-sm">غيابات مسجلة</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
