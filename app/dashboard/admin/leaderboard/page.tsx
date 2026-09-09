import { HeroBanner } from "@/components/shared/HeroBanner";
import { Trophy, Medal, MapPin, Phone } from "lucide-react";
import { getWilayaName } from "@/lib/constants";
import { EDUCATION_LEVELS } from "@/lib/constants/education";
import { STREAM_ARABIC } from "@/lib/education-labels";
import { getRankedStudents, RANKING_RULES } from "@/lib/ranking";
import { Level, Stream } from "@/generated/prisma";
import Link from "next/link";

export default async function AdminLeaderboardPage(props: {
  searchParams?: Promise<{ level?: string; stream?: string }>;
}) {
  const searchParams = await props.searchParams;
  const level = searchParams?.level as Level | undefined;
  const stream = searchParams?.stream as Stream | undefined;

  const ranked = await getRankedStudents({ level, stream });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="الترتيب والنقاط"
        description="الترتيب يُعاد حسابه من النشاط الفعلي: الاختبارات، الإجابات، الدخول، المواد، والأخطاء."
        icon={Trophy}
      />

      <section className="surface-card p-5 md:p-6">
        <h2 className="text-lg font-bold text-ink mb-3">معايير النقاط</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {RANKING_RULES.map((rule) => (
            <li key={rule.key} className="text-sm text-muted border border-line rounded-xl px-3 py-2">
              {rule.label}
            </li>
          ))}
        </ul>
      </section>

      <form action="/dashboard/admin/leaderboard" className="flex flex-wrap gap-3">
        <select name="level" defaultValue={level || ""} className="input-field w-auto min-w-[10rem]">
          <option value="">جميع المستويات</option>
          {Object.values(EDUCATION_LEVELS).flat().map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select name="stream" defaultValue={stream || ""} className="input-field w-auto min-w-[10rem]">
          <option value="">جميع الشعب</option>
          {Object.entries(STREAM_ARABIC).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">تطبيق</button>
        <Link href="/dashboard/admin/leaderboard" className="btn-ghost">إلغاء</Link>
      </form>

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full data-table min-w-[880px]">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>التلميذ</th>
                <th>المجموع</th>
                <th>تفصيل النقاط</th>
                <th>معلومات الاتصال</th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    لا يوجد تلاميذ مسجّلون بعد
                  </td>
                </tr>
              ) : (
                ranked.map((student, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {rank <= 3 ? (
                            <Medal className="w-6 h-6 text-primary" />
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center font-bold text-muted text-sm tabular-nums">
                              #{rank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Link href={`/dashboard/admin/students/${student.id}`} className="font-semibold text-ink hover:text-primary">
                          {student.fullName}
                        </Link>
                        <p className="text-xs text-muted">
                          {student.level} · {student.stream}
                        </p>
                      </td>
                      <td>
                        <span className="badge-soft tabular-nums">{student.score} نقطة</span>
                      </td>
                      <td>
                        <p className="text-xs text-muted leading-6">
                          اختبارات {student.parts.exams} · إجابات {student.parts.submissions} · تمارين {student.parts.stored} · نشاط {student.parts.activity} · مواد {student.parts.enrollments} · أخطاء −{student.parts.mistakes}
                        </p>
                      </td>
                      <td className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Phone className="w-4 h-4 text-primary" />
                          <span dir="ltr">{student.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{getWilayaName(student.wilaya)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
