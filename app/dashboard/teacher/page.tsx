import { redirect } from "next/navigation";
import Link from "next/link";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Presentation, Video, Key } from "lucide-react";
import { formatTeacherName } from "@/lib/education-labels";
import { getTeacherSession } from "@/lib/teacher";

export default async function TeacherDashboardPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const { teacher } = session;

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="مرحباً بك أستاذ في فضاء الأساتذة"
        description="اختر إحدى الأدوات من الأسفل للبدء في العمل."
        icon={Presentation}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/teacher/record" className="surface-card p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors">
          <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Video className="w-6 h-6" />
          </span>
          <div className="text-center">
            <h2 className="text-lg font-bold text-ink">استوديو التسجيل</h2>
            <p className="text-sm text-muted mt-1">تسجيل ورفع الدروس</p>
          </div>
        </Link>

        <Link href="/dashboard/teacher/codes" className="surface-card p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors">
          <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Key className="w-6 h-6" />
          </span>
          <div className="text-center">
            <h2 className="text-lg font-bold text-ink">توليد الرموز</h2>
            <p className="text-sm text-muted mt-1">إنشاء وتسيير رموز الدخول</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
