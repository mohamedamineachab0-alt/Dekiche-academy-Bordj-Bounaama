import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MessageSquare, Lock, Unlock, ChevronLeft } from "lucide-react";
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

  const forums = await getStudentForums(studentProfile.phase, studentProfile.level, studentProfile.stream);

  const firstOpenIndex = forums.findIndex((forum) => forum.isOpen);
  const solidIndex = firstOpenIndex >= 0 ? firstOpenIndex : 0;

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="منتدياتي (دردشة القسم)"
        description="شارك في نقاشات القسم و اطرح أسئلتك و وتفاعل مع زملائك في مساحة آمنة ومخصصة لمستواك"
        icon={MessageSquare}
      />

      {forums.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="icon-tile mx-auto mb-5">
            <MessageSquare className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد منتديات متاحة حالياً</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            ستظهر منتديات النقاش الخاصة بمستواك وشعبتك هنا قريباً
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {forums.map((forum, index) => {
            const isSolid = index === solidIndex;

            return (
              <Link
                href={`/dashboard/student/forums/${forum.id}`}
                key={forum.id}
                className={`group feature-card flex flex-col min-h-[13rem] ${
                  isSolid ? "feature-card-solid" : "feature-card-soft"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <span
                    className={`icon-tile !w-11 !h-11 ${
                      isSolid ? "!bg-white/20 !text-white" : ""
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" strokeWidth={2} />
                  </span>
                  {forum.isOpen ? (
                    <span className={isSolid ? "badge-accent" : "badge-soft"}>
                      <Unlock className="w-3.5 h-3.5" />
                      مفتوح
                    </span>
                  ) : (
                    <span
                      className={
                        isSolid
                          ? "inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/90"
                          : "badge-outline"
                      }
                    >
                      <Lock className="w-3.5 h-3.5" />
                      مغلق
                    </span>
                  )}
                </div>

                <div className="flex-1 mb-5">
                  <h3
                    className={`text-base font-bold mb-2 line-clamp-2 ${
                      isSolid ? "text-white" : "text-ink"
                    }`}
                  >
                    {forum.title}
                  </h3>
                  <span className={isSolid ? "badge-accent" : "badge-soft"}>
                    {forum.subject.title}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between pt-4 border-t ${
                    isSolid ? "border-white/20" : "border-line"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div>
                      <p className={`text-[0.7rem] font-semibold ${isSolid ? "text-white/70" : "text-muted"}`}>
                        الشهر
                      </p>
                      <p className={`text-sm font-bold ${isSolid ? "text-white" : "text-ink"}`}>
                        {forum.month}
                      </p>
                    </div>
                    <div className={`w-px h-8 ${isSolid ? "bg-white/20" : "bg-line"}`} />
                    <div>
                      <p className={`text-[0.7rem] font-semibold ${isSolid ? "text-white/70" : "text-muted"}`}>
                        الرسائل
                      </p>
                      <p className={`text-sm font-bold tabular-nums ${isSolid ? "text-white" : "text-ink"}`} dir="ltr">
                        {forum._count.messages}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform group-hover:-translate-x-0.5 ${
                      isSolid ? "bg-white/15 text-white" : "bg-primary-soft text-primary"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}