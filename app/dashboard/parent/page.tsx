import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, Link as LinkIcon, Trophy, BookOpen, AlertTriangle } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { linkStudentToParent, getLinkedChildren } from "@/actions/parents";
import { ParentDashboardClient } from "@/components/parent/ParentDashboardClient";

export default async function ParentDashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const links = await prisma.parentStudentLink.findMany({
    where: { parentId: sessionId },
    include: {
      student: {
        include: {
          studentProfile: true,
          enrollments: {
            include: { subject: true }
          },
          mistakes: {
            orderBy: { createdAt: "desc" },
            take: 3,
            include: { lesson: { include: { subjects: true } } }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="بوابة الولي"
        description="اربط حسابات أبنائك وقم بمتابعة تقدمهم الدراسي و نقاطهم والمواد التي يدرسونها في منصة دقيش بكل سهولة"
        icon={Users}
        bgClass="bg-[#4C1D95]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Link Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border-[4px] border-[#000000] shadow-3d-soft sticky top-6 paper-cut">
            <h2 className="text-xl font-black text-[#000000] mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FACC15] border-[2px] border-[#000000] flex items-center justify-center transform -rotate-3 shadow-sm">
                <LinkIcon className="w-4 h-4 text-[#000000]" />
              </div>
              ربط حسابات أبنائي
            </h2>
            <p className="text-[#000000]/70 text-sm font-bold mb-6">
              أدخل الرمز السري الذي يظهر في حساب ابنك لإضافته إلى قائمة المتابعة
            </p>

            <form action={async (formData) => { "use server"; await linkStudentToParent(formData); }} className="space-y-4">
              <div className="space-y-1">
                <input 
                  type="text" 
                  name="parentCode" 
                  required 
                  className="w-full p-4 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] text-base font-black tracking-[0.2em] focus:outline-none focus:bg-[#FFFFFF] transition-all shadow-sm text-center uppercase" 
                  placeholder="أدخل الرمز هنا" 
                />
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#7E22CE] hover:bg-[#4C1D95] text-[#FFFFFF] border-[3px] border-[#000000] font-black py-4 rounded-xl transition-transform shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1">
                <LinkIcon className="w-5 h-5" />
                ربط الحساب
              </button>
            </form>
          </div>
        </div>

        {/* Children Overview with Tabs */}
        <div className="lg:col-span-2">
          {links.length === 0 ? (
            <div className="p-16 text-center bg-[#FFFFFF] rounded-2xl border-[4px] border-[#000000] border-dashed shadow-sm mt-8">
              <div className="w-20 h-20 rounded-full bg-[#EAE4D9] border-[3px] border-[#000000] flex items-center justify-center mx-auto mb-6 transform rotate-6 shadow-sm">
                <Users className="w-8 h-8 text-[#000000]" />
              </div>
              <h3 className="font-black text-2xl text-[#000000]">لا يوجد أبناء مربوطين بحسابك</h3>
              <p className="text-[#000000]/60 font-bold mt-2">يرجى استخدام الرمز السري لإضافة ابنك إلى القائمة وبدء المتابعة</p>
            </div>
          ) : (
            <ParentDashboardClient students={links.map(l => l.student as any)} parentId={sessionId} />
          )}
        </div>
      </div>
    </div>
  );
}
