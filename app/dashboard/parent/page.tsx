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
            include: { lesson: { include: { subject: true } } }
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
        gradientClass="bg-gradient-to-r from-purple-700 to-cyan-700"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Link Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-6">
            <h2 className="text-xl font-black text-purple-950 mb-2 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-700" />
              ربط حسابات أبنائي
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              أدخل الرمز السري الذي يظهر في حساب ابنك لإضافته إلى قائمة المتابعة
            </p>

            <form action={async (formData) => { "use server"; await linkStudentToParent(formData); }} className="space-y-4">
              <div className="space-y-1">
                <input 
                  type="text" 
                  name="parentCode" 
                  required 
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-base font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600 text-center" 
                  placeholder="أدخل الرمز هنا" 
                />
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition-colors">
                <LinkIcon className="w-4 h-4" />
                ربط الحساب
              </button>
            </form>
          </div>
        </div>

        {/* Children Overview with Tabs */}
        <div className="lg:col-span-2">
          {links.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
              <Users className="w-16 h-16 text-purple-800 mx-auto mb-4" />
              <h3 className="font-black text-xl text-purple-900">لا يوجد أبناء مربوطين بحسابك</h3>
              <p className="text-slate-500 font-medium mt-2">يرجى استخدام الرمز السري لإضافة ابنك إلى القائمة وبدء المتابعة</p>
            </div>
          ) : (
            <ParentDashboardClient students={links.map(l => l.student as any)} parentId={sessionId} />
          )}
        </div>
      </div>
    </div>
  );
}
