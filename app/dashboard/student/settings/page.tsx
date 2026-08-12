import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Settings, Shield, UserCircle, BellRing, ShieldAlert, UserX, BookX } from "lucide-react";
import { getWilayaName } from "@/lib/constants";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { CopyParentCodeBtn } from "@/components/student/CopyParentCodeBtn";
import { AvatarSelector } from "@/components/student/AvatarSelector";

export default async function StudentSettingsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      studentProfile: true,
      studentLinks: true,
      mistakes: true,
      enrollments: true,
    }
  });

  if (!user || !user.studentProfile) redirect("/login");

  const profile = user.studentProfile;

  // Calculate Personal Alerts (Tenebati)
  const alerts = [];
  
  if (user.deviceFingerprints && user.deviceFingerprints.length > 1) {
    alerts.push({
      id: "multi-device",
      type: "SECURITY",
      message: "تم فتح حسابك في أكثر من جهاز",
      color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900",
      icon: ShieldAlert
    });
  }

  if (user.studentLinks.length === 0) {
    alerts.push({
      id: "no-parent",
      type: "ACCOUNT",
      message: "لم تربط حسابك بولي",
      color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      icon: UserX
    });
  }

  if (user.mistakes && user.mistakes.length > 10) {
    alerts.push({
      id: "many-mistakes",
      type: "ACADEMIC",
      message: "لديك أخطاء كثيرة تحتاج مراجعتها",
      color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900",
      icon: BookX
    });
  }

  if (user.enrollments.length > 0 && profile.totalPoints === 0) {
    alerts.push({
      id: "pending-lessons",
      type: "ACADEMIC",
      message: "درس لم تكمل مشاهدته",
      color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900",
      icon: BookX
    });
    alerts.push({
      id: "pending-quizzes",
      type: "ACADEMIC",
      message: "كويز لم تحله",
      color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900",
      icon: BookX
    });
    alerts.push({
      id: "pending-exercises",
      type: "ACADEMIC",
      message: "تمرين يومي لم تحله",
      color: "bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-500 border-purple-200 dark:border-purple-900",
      icon: BookX
    });
  }

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="إعدادات الحساب"
        description="تحكم في إعدادات حسابك الشخصي وشارك كود المتابعة مع ولي أمرك"
        icon={Settings}
        gradientClass="bg-gradient-to-r from-slate-700 to-slate-900"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent Linking Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-purple-950 mb-2">متابعة الولي</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
              أعطِ هذا الرمز السري لولي أمرك ليتمكن من إنشاء حساب خاص به ومتابعة تقدمك الدراسي و نتائجك في الفروض و ومستواك على منصة دقيش
            </p>
          </div>
          
          <CopyParentCodeBtn parentCode={profile.parentCode} />
        </div>

        {/* Profile Picture Management */}
        <AvatarSelector currentAvatarUrl={user.avatarUrl} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-white text-slate-600 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
            <UserCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-purple-950 mb-4">المعلومات الشخصية</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm font-bold">الاسم الكامل</span>
              <span className="text-purple-950 font-black">{user.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm font-bold">رقم الهاتف</span>
              <span className="text-purple-950 font-black" dir="ltr">{user.phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500 text-sm font-bold">الولاية</span>
              <span className="text-purple-950 font-black">{getWilayaName(profile.wilaya)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenebati Personal Monitoring Section */}
      <div className="bg-white dark:bg-white rounded-3xl p-6 border border-slate-100 dark:border-purple-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-500 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-900/50">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-purple-950 dark:text-purple-950">تنبيهاتي</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">مراقبة حالة الحساب والمستوى الدراسي</p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-500 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/50 flex flex-col items-center justify-center text-center">
            <Shield className="w-10 h-10 mb-3 opacity-80" />
            <h4 className="font-black text-lg mb-1">حسابك في وضع ممتاز وآمن</h4>
            <p className="text-sm font-bold opacity-90">لا توجد أي تنبيهات سلبية مسجلة في الوقت الحالي استمر في تألقك</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alert => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.color}`}>
                  <div className="bg-white/50 dark:bg-black/20 p-2 rounded-xl shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm mb-1">{alert.message}</h4>
                    <p className="text-xs font-bold opacity-80">
                      {alert.type === "SECURITY" && "تنبيه أمني"}
                      {alert.type === "ACCOUNT" && "تنبيه حساب"}
                      {alert.type === "ACADEMIC" && "تنبيه دراسي"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
