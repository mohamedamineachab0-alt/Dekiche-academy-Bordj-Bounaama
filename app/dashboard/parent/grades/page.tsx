
import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";
import Link from "next/link";
import { Star, UserMinus, MessageSquare, Activity } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function GradesPage() {
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
  const submissions = await prisma.studentSubmission.findMany({
    where: { studentId: { in: studentIds } },
    include: {
      student: { select: { fullName: true } },
      exam: {
        include: {
          subject: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        title="درجات أبنائي"
        description="تابع نتائج أبنائك في الاختبارات والفروض المصححة مع التفاصيل"
        icon={Star}
      />

      <div className="overflow-hidden rounded-2xl border-[4px] border-[#000000] bg-[#FFFFFF] shadow-3d-soft paper-cut">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F8F9FA] text-[#000000] border-b-[4px] border-[#000000]">
              <tr>
                <th className="px-6 py-4 text-right font-black text-base">اسم التلميذ</th>
                <th className="px-6 py-4 text-right font-black text-base">المادة</th>
                <th className="px-6 py-4 text-right font-black text-base">الاختبار</th>
                <th className="px-6 py-4 text-right font-black text-base">النقطة</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-[#000000]">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-[#000000]/50 font-black text-lg border-b-[3px] border-[#000000] border-dashed">
                    لا توجد نقاط مسجلة حالياً
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FACC15]/10 transition-colors">
                    <td className="px-6 py-4 font-black text-[#7E22CE] text-base">{s.student?.fullName || "غير متوفر"}</td>
                    <td className="px-6 py-4 font-bold text-[#000000]">{s.exam?.subject?.title || "غير متوفر"}</td>
                    <td className="px-6 py-4 font-bold text-[#000000]">{s.exam?.title || "غير متوفر"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-[#22C55E] text-[#000000] border-[2px] border-[#000000] rounded-xl font-black text-base shadow-sm transform rotate-2">
                        {s.score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
