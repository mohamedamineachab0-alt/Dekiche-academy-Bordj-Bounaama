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
      color: "bg-[#EF4444] text-white border-[3px] border-[#000000]",
      icon: ShieldAlert
    });
  }

  if (user.studentLinks.length === 0) {
    alerts.push({
      id: "no-parent",
      type: "ACCOUNT",
      message: "لم تربط حسابك بولي",
      color: "bg-[#F97316] text-white border-[3px] border-[#000000]",
      icon: UserX
    });
  }

  if (user.mistakes && user.mistakes.length > 10) {
    alerts.push({
      id: "many-mistakes",
      type: "ACADEMIC",
      message: "لديك أخطاء كثيرة تحتاج مراجعتها",
      color: "bg-[#FACC15] text-[#000000] border-[3px] border-[#000000]",
      icon: BookX
    });
  }

  if (user.enrollments.length > 0 && profile.totalPoints === 0) {
    alerts.push({
      id: "pending-lessons",
      type: "ACADEMIC",
      message: "درس لم تكمل مشاهدته",
      color: "bg-[#06B6D4] text-[#000000] border-[3px] border-[#000000]",
      icon: BookX
    });
    alerts.push({
      id: "pending-quizzes",
      type: "ACADEMIC",
      message: "كويز لم تحله",
      color: "bg-[#EC4899] text-white border-[3px] border-[#000000]",
      icon: BookX
    });
    alerts.push({
      id: "pending-exercises",
      type: "ACADEMIC",
      message: "تمرين يومي لم تحله",
      color: "bg-[#22C55E] text-[#000000] border-[3px] border-[#000000]",
      icon: BookX
    });
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="إعدادات الحساب"
        description="تحكم في إعدادات حسابك الشخصي وشارك كود المتابعة مع ولي أمرك"
        icon={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent Linking Card */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-[3px] border-[#000000] shadow-3d-soft paper-cut flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#7E22CE] text-white border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-[#000000] mb-3">متابعة الولي</h3>
            <p className="text-gray-600 font-bold text-sm leading-relaxed mb-8">
              أعطِ هذا الرمز السري لولي أمرك ليتمكن من إنشاء حساب خاص به ومتابعة تقدمك الدراسي و نتائجك في الفروض و ومستواك على منصة دقيش
            </p>
          </div>
          
          <div className="relative z-10">
            <CopyParentCodeBtn parentCode={profile.parentCode} />
          </div>
        </div>

        {/* Profile Picture Management */}
        <div className="relative">
          <AvatarSelector currentAvatarUrl={user.avatarUrl} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
          <div className="w-14 h-14 bg-[#FACC15] text-[#000000] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mb-6 transform rotate-3 shadow-sm relative z-10">
            <UserCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-[#000000] mb-6 relative z-10">المعلومات الشخصية</h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center py-4 border-b-[3px] border-[#000000]/10 border-dashed">
              <span className="text-gray-500 text-sm font-bold bg-[#000000]/5 px-3 py-1.5 rounded-lg">الاسم الكامل</span>
              <span className="text-[#000000] font-black text-lg">{user.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b-[3px] border-[#000000]/10 border-dashed">
              <span className="text-gray-500 text-sm font-bold bg-[#000000]/5 px-3 py-1.5 rounded-lg">رقم الهاتف</span>
              <span className="text-[#000000] font-black text-lg" dir="ltr">{user.phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-500 text-sm font-bold bg-[#000000]/5 px-3 py-1.5 rounded-lg">الولاية</span>
              <span className="text-[#000000] font-black text-lg">{getWilayaName(profile.wilaya)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenebati Personal Monitoring Section */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-14 h-14 bg-[#000000] text-white rounded-2xl flex items-center justify-center border-[3px] border-[#000000] shadow-sm transform -rotate-3">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#000000]">تنبيهاتي</h3>
            <p className="text-gray-500 font-bold text-sm mt-1">مراقبة حالة الحساب والمستوى الدراسي</p>
          </div>
        </div>

        <div className="relative z-10">
          {alerts.length === 0 ? (
            <div className="bg-[#22C55E] text-[#000000] p-8 rounded-2xl border-[3px] border-[#000000] flex flex-col items-center justify-center text-center shadow-3d-soft transform rotate-1">
              <Shield className="w-12 h-12 mb-4" />
              <h4 className="font-black text-xl mb-2">حسابك في وضع ممتاز وآمن</h4>
              <p className="text-sm font-bold opacity-90 max-w-sm">لا توجد أي تنبيهات سلبية مسجلة في الوقت الحالي استمر في تألقك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map(alert => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className={`flex items-start gap-4 p-5 rounded-2xl shadow-3d-soft transition-transform hover:-translate-y-1 paper-cut ${alert.color}`}>
                    <div className="bg-white/30 p-2.5 rounded-xl border-[2px] border-[#000000] shrink-0 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base mb-1">{alert.message}</h4>
                      <p className="text-xs font-bold opacity-80 bg-[#000000]/10 inline-block px-2 py-1 rounded-md mt-1">
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
    </div>
  );
}
