import { prisma } from "@/lib/prisma";
import { Key, Plus, Hash, Copy, Download } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { CodeGeneratorClient } from "@/components/admin/CodeGeneratorClient";

export default async function AdminCodesPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true, user: true },
    take: 50, // Display last 50 codes for performance
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="رموز الدخول"
        description="توليد وتتبع الأكواد الخاصة بتفعيل المواد للطلاب"
        icon={Key}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generator Form */}
        <div className="lg:col-span-1">
          <CodeGeneratorClient subjects={subjects} />
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-purple-950 dark:text-purple-950">آخر الرموز</h2>
            <a href="/api/admin/export-codes" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              تصدير للإكسل (Excel)
            </a>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-white border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">الرمز</th>
                  <th className="px-6 py-4 font-bold">المادة</th>
                  <th className="px-6 py-4 font-bold">النوع</th>
                  <th className="px-6 py-4 font-bold">الشهور</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map(code => (
                  <tr key={code.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono font-bold text-purple-950 bg-slate-100 px-2 py-1 rounded w-fit">
                        {code.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-800">{code.subject.title}</td>
                    <td className="px-6 py-4 text-slate-500">{code.accessType === "YEARLY" ? "سنوي" : "شهري"}</td>
                    <td className="px-6 py-4 text-slate-500 dir-ltr">{code.validMonths.join(", ") || "-"}</td>
                    <td className="px-6 py-4">
                      {code.isUsed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700">
                          مستخدم ({code.user?.fullName})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-800">
                          غير مستخدم
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      لا توجد رموز دخول مولدة بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
