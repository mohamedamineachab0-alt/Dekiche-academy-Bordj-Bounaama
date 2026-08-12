import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Activity, ShieldAlert, BookOpen, AlertTriangle, UserCheck, Smartphone, Trophy } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudentMonitoringMetrics } from "@/actions/admin-monitoring";
import { Level, Stream } from "@/generated/prisma";
import Link from "next/link";

export default async function AdminStudentMonitoringPage(props: {
  searchParams?: Promise<{ level?: string; stream?: string; subjectId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const level = searchParams?.level as Level | undefined;
  const stream = searchParams?.stream as Stream | undefined;
  const subjectId = searchParams?.subjectId;

  const metrics = await getStudentMonitoringMetrics({ level, stream, subjectId });
  const subjects = await prisma.subject.findMany({ select: { id: true, title: true } });

  // Calculate some overview stats
  const studentsWithMultipleDevices = metrics.filter(m => m.deviceFingerprints.length > 2).length;
  const inactiveStudents = metrics.filter(m => {
    if (!m.lastLoginAt) return true;
    const daysSinceLogin = (new Date().getTime() - m.lastLoginAt.getTime()) / (1000 * 3600 * 24);
    return daysSinceLogin > 7;
  }).length;

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="مراقبة نشاط التلاميذ"
        description="نظام المراقبة الشامل: تتبع الحضور و الأمن الأداء في المنصة و وحالة الربط مع الأولياء"
        icon={Activity}
        bgClass="bg-[#000000]"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#EF4444] border-[3px] border-[#000000] rounded-3xl p-6 flex items-center justify-between shadow-3d-soft paper-cut transform rotate-1 hover:rotate-0 hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-sm font-black text-[#FFFFFF] mb-1">تنبيهات أمنية (دخول من عدة أجهزة)</p>
            <p className="text-4xl font-black text-[#FFFFFF]">{studentsWithMultipleDevices}</p>
          </div>
          <ShieldAlert className="w-14 h-14 text-[#000000] opacity-50 transform -rotate-12" />
        </div>
        <div className="bg-[#F97316] border-[3px] border-[#000000] rounded-3xl p-6 flex items-center justify-between shadow-3d-soft paper-cut transform -rotate-1 hover:rotate-0 hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-sm font-black text-[#000000] mb-1">الغياب (لم يسجل دخول منذ أسبوع)</p>
            <p className="text-4xl font-black text-[#000000]">{inactiveStudents}</p>
          </div>
          <AlertTriangle className="w-14 h-14 text-[#000000] opacity-50 transform rotate-12" />
        </div>
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl shadow-3d-soft border-[4px] border-[#000000] overflow-hidden paper-cut">
        
        {/* Filter Bar */}
        <div className="p-4 bg-[#F8F9FA] border-b-[4px] border-[#000000] flex flex-wrap gap-4 items-center">
          <span className="text-sm font-black text-[#000000]">تصفية النتائج:</span>
          
          <form className="flex flex-wrap gap-3 flex-1" action="/dashboard/admin/students/monitoring">
            <select name="level" defaultValue={level || ""} className="p-2.5 text-sm rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] font-black text-[#000000] shadow-sm focus:outline-none">
              <option value="">جميع المستويات</option>
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            
            <select name="stream" defaultValue={stream || ""} className="p-2.5 text-sm rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] font-black text-[#000000] shadow-sm focus:outline-none">
              <option value="">جميع الشعب</option>
              {STREAMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <select name="subjectId" defaultValue={subjectId || ""} className="p-2.5 text-sm rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] font-black text-[#000000] shadow-sm focus:outline-none">
              <option value="">جميع المواد</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>

            <button type="submit" className="px-5 py-2.5 bg-[#FACC15] text-[#000000] border-[3px] border-[#000000] rounded-xl text-sm font-black hover:bg-[#EAB308] transition-transform shadow-sm hover:-translate-y-1 hover:shadow-3d-hover">
              تطبيق
            </button>
            <Link href="/dashboard/admin/students/monitoring" className="px-5 py-2.5 bg-[#FFFFFF] text-[#000000] border-[3px] border-[#000000] rounded-xl text-sm font-black hover:bg-[#F8F9FA] transition-transform shadow-sm hover:-translate-y-1">
              إلغاء التصفية
            </Link>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#EAE4D9] border-b-[3px] border-[#000000]">
              <tr>
                <th className="px-6 py-4 text-sm font-black text-[#000000]">التلميذ</th>
                <th className="px-6 py-4 text-sm font-black text-[#000000]">حساب غياب</th>
                <th className="px-6 py-4 text-sm font-black text-[#000000] text-center">الترتيب والنقاط</th>
                <th className="px-6 py-4 text-sm font-black text-[#000000] text-center">الأخطاء</th>
                <th className="px-6 py-4 text-sm font-black text-[#000000] text-center">الأجهزة</th>
                <th className="px-6 py-4 text-sm font-black text-[#000000] text-center">متابعة الولي</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-[#000000]">
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#000000]/50 font-black text-lg border-b-[3px] border-[#000000] border-dashed">
                    لا توجد بيانات مطابقة
                  </td>
                </tr>
              ) : (
                metrics.map((m, index) => {
                  const levelStr = LEVELS.find(l => l.value === m.level)?.label || m.level;
                  const streamStr = STREAMS.find(s => s.value === m.stream)?.label || m.stream;
                  
                  // Security Check
                  const hasManyDevices = m.deviceFingerprints.length > 2;
                  
                  // Absence Check
                  let isAbsent = true;
                  let lastLoginStr = "لم يسجل دخول";
                  if (m.lastLoginAt) {
                    const days = (new Date().getTime() - m.lastLoginAt.getTime()) / (1000 * 3600 * 24);
                    isAbsent = days > 7;
                    lastLoginStr = m.lastLoginAt.toLocaleDateString('ar-DZ');
                  }

                  return (
                    <tr key={m.id} className="hover:bg-[#FACC15]/10 transition-colors">
                      {/* T1: Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#22C55E] border-[2px] border-[#000000] flex items-center justify-center font-black text-[#000000] transform -rotate-3 shadow-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-black text-[#000000] text-lg">{m.fullName}</p>
                            <p className="text-xs font-bold text-[#000000]/60">{levelStr} • {streamStr}</p>
                          </div>
                        </div>
                      </td>

                      {/* T2: Activity */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 border-[2px] border-[#000000] rounded-lg text-xs font-black shadow-sm ${isAbsent ? 'bg-[#EF4444] text-[#FFFFFF]' : 'bg-[#22C55E] text-[#000000]'}`}>
                            {isAbsent ? 'غائب / غير نشط' : 'نشط مؤخراً'} ({lastLoginStr})
                          </span>
                          <p className="text-xs font-black text-[#000000]/50">
                            {m.enrolledSubjects.length} مواد مشتركة
                          </p>
                        </div>
                      </td>

                      {/* T3: Points */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FACC15] border-[2px] border-[#000000] rounded-xl text-[#000000] font-black text-sm shadow-sm transform rotate-2">
                          <Trophy className="w-4 h-4 text-[#000000]" />
                          {m.totalPoints}
                        </div>
                      </td>

                      {/* T4: Mistakes */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] border-[2px] border-[#000000] rounded-xl text-[#000000] font-black text-sm shadow-sm">
                            <AlertTriangle className={`w-4 h-4 ${m.mistakesCount >= 3 ? 'text-[#EF4444]' : 'text-[#000000]'}`} />
                            {m.mistakesCount}
                          </div>
                          {m.mistakesCount >= 3 && (
                            <span className="text-[10px] font-black text-[#FFFFFF] bg-[#EF4444] px-2 py-0.5 rounded border-[2px] border-[#000000]">
                              يحتاج معالجة
                            </span>
                          )}
                        </div>
                      </td>

                      {/* T5: Devices */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-sm border-[2px] border-[#000000] shadow-sm ${hasManyDevices ? 'bg-[#EF4444] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}`}>
                          <Smartphone className="w-4 h-4" />
                          {m.deviceFingerprints.length}
                        </div>
                      </td>

                      {/* T6: Parent */}
                      <td className="px-6 py-4 text-center">
                        {m.isParentLinked ? (
                          <span className="inline-flex items-center gap-1 text-[#FFFFFF] bg-[#8B5CF6] border-[2px] border-[#000000] px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                            <UserCheck className="w-4 h-4" />
                            مربوط بالولي
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#000000]/60 bg-[#EAE4D9] border-[2px] border-[#000000] px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                            غير مربوط
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
