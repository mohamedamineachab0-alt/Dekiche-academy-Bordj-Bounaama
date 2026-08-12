import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MessageSquare, Lock, Unlock, ArrowLeft } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudentForums } from "@/actions/forums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StudentForumsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: sessionId },
  });

  if (!studentProfile) redirect("/login");

  const forums = await getStudentForums(studentProfile.level, studentProfile.stream);

  return (
    <div className="space-y-8 pb-12">
      <HeroBanner 
        title="منتدياتي (دردشة القسم)"
        description="شارك في نقاشات القسم و اطرح أسئلتك و وتفاعل مع زملائك في مساحة آمنة ومخصصة لمستواك"
        icon={MessageSquare}
        gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
      />

      {forums.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <MessageSquare className="w-16 h-16 text-purple-800 mx-auto mb-4" />
          <h3 className="font-black text-xl text-purple-900">لا توجد منتديات متاحة حالياً</h3>
          <p className="text-slate-500 font-medium mt-2">ستظهر منتديات النقاش الخاصة بمستواك وشعبتك هنا قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forums.map(forum => (
            <Link href={`/dashboard/student/forums/${forum.id}`} key={forum.id} className="block group">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative overflow-hidden h-full flex flex-col">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  {forum.isOpen ? (
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-md border border-purple-100">
                      <Unlock className="w-3 h-3" /> مفتوح
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-md border border-purple-100">
                      <Lock className="w-3 h-3" /> مغلق
                    </span>
                  )}
                </div>

                <div className="mb-6 flex-1">
                  <h3 className="text-lg font-black text-purple-950 mb-1 line-clamp-1">{forum.title}</h3>
                  <p className="text-sm font-bold text-purple-700">{forum.subject.title}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">الشهر</span>
                      <span className="text-sm font-black text-purple-800">{forum.month}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">الرسائل</span>
                      <span className="text-sm font-black text-purple-800">{forum._count.messages}</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-purple-800 group-hover:text-purple-700 group-hover:-translate-x-1 transition-all" />
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
