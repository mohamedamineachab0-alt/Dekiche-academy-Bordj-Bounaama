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
        gradientClass="bg-gradient-to-r from-purple-800 to-slate-950"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-purple-800 mb-1">تنبيهات أمنية (دخول من عدة أجهزة)</p>
            <p className="text-3xl font-black text-purple-800">{studentsWithMultipleDevices}</p>
          </div>
          <ShieldAlert className="w-12 h-12 text-purple-300 opacity-50" />
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-purple-800 mb-1">الغياب (لم يسجل دخول منذ أسبوع)</p>
            <p className="text-3xl font-black text-purple-800">{inactiveStudents}</p>
          </div>
          <AlertTriangle className="w-12 h-12 text-purple-300 opacity-50" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-bold text-purple-800">تصفية النتائج:</span>
          
          <form className="flex flex-wrap gap-3 flex-1" action="/dashboard/admin/students/monitoring">
            <select name="level" defaultValue={level || ""} className="p-2 text-base rounded-lg border border-slate-200 bg-white font-bold text-purple-800">
              <option value="">جميع المستويات</option>
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            
            <select name="stream" defaultValue={stream || ""} className="p-2 text-base rounded-lg border border-slate-200 bg-white font-bold text-purple-800">
              <option value="">جميع الشعب</option>
              {STREAMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <select name="subjectId" defaultValue={subjectId || ""} className="p-2 text-base rounded-lg border border-slate-200 bg-white font-bold text-purple-800">
              <option value="">جميع المواد</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>

            <button type="submit" className="px-4 py-2 bg-white text-purple-950 rounded-lg text-sm font-bold hover:bg-white transition-colors">
              تطبيق
            </button>
            <Link href="/dashboard/admin/students/monitoring" className="px-4 py-2 bg-slate-200 text-purple-800 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors">
              إلغاء التصفية
            </Link>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-black text-purple-800">التلميذ</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800">حساب غياب</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">الترتيب والنقاط</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">الأخطاء</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">الأجهزة</th>
                <th className="px-6 py-4 text-sm font-black text-purple-800 text-center">متابعة الولي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
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
                    <tr key={m.id} className="hover:bg-white transition-colors">
                      {/* T1: Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-black text-purple-950">{m.fullName}</p>
                            <p className="text-xs font-bold text-slate-500">{levelStr} • {streamStr}</p>
                          </div>
                        </div>
                      </td>

                      {/* T2: Activity */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black ${isAbsent ? 'bg-purple-100 text-purple-900' : 'bg-purple-100 text-purple-900'}`}>
                            {isAbsent ? 'غائب / غير نشط' : 'نشط مؤخراً'} ({lastLoginStr})
                          </span>
                          <p className="text-xs font-bold text-slate-400">
                            {m.enrolledSubjects.length} مواد مشتركة
                          </p>
                        </div>
                      </td>

                      {/* T3: Points */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-lg text-purple-800 font-black text-sm">
                          <Trophy className="w-4 h-4 text-purple-700" />
                          {m.totalPoints}
                        </div>
                      </td>

                      {/* T4: Mistakes */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-purple-800 font-black text-sm">
                            <AlertTriangle className="w-4 h-4 text-slate-400" />
                            {m.mistakesCount}
                          </div>
                          {m.mistakesCount >= 3 && (
                            <span className="text-[10px] font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              يحتاج معالجة
                            </span>
                          )}
                        </div>
                      </td>

                      {/* T5: Devices */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-sm ${hasManyDevices ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-purple-800'}`}>
                          <Smartphone className={`w-4 h-4 ${hasManyDevices ? 'text-purple-700' : 'text-slate-400'}`} />
                          {m.deviceFingerprints.length}
                        </div>
                      </td>

                      {/* T6: Parent */}
                      <td className="px-6 py-4 text-center">
                        {m.isParentLinked ? (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-100">
                            <UserCheck className="w-3.5 h-3.5" />
                            مربوط بالولي
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 bg-white px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
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
