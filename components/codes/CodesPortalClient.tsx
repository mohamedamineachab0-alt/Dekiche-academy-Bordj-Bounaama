"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Key,
  Download,
  Copy,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Sparkles,
  Printer,
  FileSpreadsheet,
  FileArchive,
  RefreshCw,
  LogOut,
  Hash,
  ShieldCheck,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { generatePortalCodes, logoutCodesPortal } from "@/actions/codes-portal";

interface Subject {
  id: string;
  title: string;
  phase: string;
  accessType: string;
}

interface AccessCodeItem {
  id: string;
  code: string;
  accessType: string;
  validMonths: number[];
  isUsed: boolean;
  createdAt: string;
  subject: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  } | null;
}

interface Props {
  initialSubjects: Subject[];
  initialCodes: AccessCodeItem[];
  initialUsedCount: number;
  initialUnusedCount: number;
}

export function CodesPortalClient({
  initialSubjects,
  initialCodes,
  initialUsedCount,
  initialUnusedCount,
}: Props) {
  const [codes, setCodes] = useState<AccessCodeItem[]>(initialCodes);
  const [usedCount, setUsedCount] = useState(initialUsedCount);
  const [unusedCount, setUnusedCount] = useState(initialUnusedCount);
  const [search, setSearch] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNUSED" | "USED">("UNUSED");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genSubjectMode, setGenSubjectMode] = useState<"SINGLE" | "ALL">("SINGLE");
  const [genSelectedSubject, setGenSelectedSubject] = useState<string>(
    initialSubjects[0]?.id || ""
  );
  const [genAccessType, setGenAccessType] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [genMonths, setGenMonths] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const [genCount, setGenCount] = useState<number>(100);
  const [isGenerating, startGenerateTransition] = useTransition();
  const [genSuccessMessage, setGenSuccessMessage] = useState<string | null>(null);

  // Printable View State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Logout transition
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleMonth = (m: number) => {
    setGenMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b)
    );
  };

  const handleGenerate = () => {
    const targetSubjectIds =
      genSubjectMode === "ALL"
        ? initialSubjects.map((s) => s.id)
        : [genSelectedSubject];

    if (targetSubjectIds.length === 0) return;

    startGenerateTransition(async () => {
      const res = await generatePortalCodes({
        subjectIds: targetSubjectIds,
        accessType: genAccessType,
        validMonths: genAccessType === "YEARLY" ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : genMonths,
        count: genCount,
      });

      if (res.success && res.codes) {
        setGenSuccessMessage(`تم بنجاح توليد ${res.count} رمز جديد!`);
        setUnusedCount((c) => c + (res.count || 0));

        // Format and append to local codes view
        const newFormattedCodes: AccessCodeItem[] = res.codes.map((c, i) => {
          const s = initialSubjects.find((sub) => sub.id === c.subjectId);
          return {
            id: `temp-${Date.now()}-${i}`,
            code: c.code,
            accessType: c.accessType,
            validMonths: c.validMonths,
            isUsed: false,
            createdAt: new Date().toISOString(),
            subject: {
              id: c.subjectId,
              title: s?.title || "مادة تعليمية",
            },
            user: null,
          };
        });

        setCodes((prev) => [...newFormattedCodes, ...prev]);

        if (genSubjectMode === "SINGLE") {
          const lines = res.codes.map((c) => c.code).join("\n");
          const blob = new Blob(["\uFEFF" + lines], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          const subjName = initialSubjects.find((s) => s.id === genSelectedSubject)?.title || "رموز";
          link.download = `رموز_${subjName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setTimeout(() => {
          setGenSuccessMessage(null);
          setIsGeneratorOpen(false);
        }, 2500);
      }
    });
  };

  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      if (statusFilter === "UNUSED" && c.isUsed) return false;
      if (statusFilter === "USED" && !c.isUsed) return false;
      if (selectedSubjectId !== "ALL" && c.subject.id !== selectedSubjectId) return false;
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const codeMatches = c.code.toLowerCase().includes(query);
        const subjMatches = c.subject.title.toLowerCase().includes(query);
        const userMatches = c.user?.fullName?.toLowerCase().includes(query);
        if (!codeMatches && !subjMatches && !userMatches) return false;
      }
      return true;
    });
  }, [codes, statusFilter, selectedSubjectId, search]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                بوابة استخراج الرموز
                <span className="text-[11px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                  Dekich Codes
                </span>
              </h1>
              <p className="text-xs text-neutral-400 hidden sm:block">
                توليد، تصدير، وتوزيع بطاقات الاشتراك الرسمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 bg-neutral-800/80 border border-neutral-700/80 px-3 py-1.5 rounded-lg text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-neutral-300 font-mono">0663438000</span>
            </div>

            <button
              onClick={() => startLogoutTransition(() => logoutCodesPortal())}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-neutral-700"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Dashboard */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-xs font-semibold text-neutral-400 mb-1">رموز جاهزة للتوزيع</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {unusedCount.toLocaleString("ar-DZ")}
            </p>
            <div className="mt-2 text-[11px] text-emerald-400/80 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              غير مستخدمة
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-xs font-semibold text-neutral-400 mb-1">رموز مستعملة (مفعلة)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono tabular-nums">
              {usedCount.toLocaleString("ar-DZ")}
            </p>
            <div className="mt-2 text-[11px] text-purple-400/80 font-medium">مربوطة بحسابات التلاميذ</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-xs font-semibold text-neutral-400 mb-1">إجمالي الرموز</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-200 font-mono tabular-nums">
              {(unusedCount + usedCount).toLocaleString("ar-DZ")}
            </p>
            <div className="mt-2 text-[11px] text-neutral-500">في قاعدة البيانات</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-xs font-semibold text-neutral-400 mb-1">المواد المتاحة</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {initialSubjects.length}
            </p>
            <div className="mt-2 text-[11px] text-amber-400/80">تشمل جميع الأطوار</div>
          </div>
        </section>

        {/* Action Bar: Export & Generator */}
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Generate Button */}
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد رموز جديدة</span>
            </button>

            {/* Quick Export ZIP */}
            <a
              href="/api/admin/export-codes-zip"
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-700 transition"
              title="تحميل كل الأكواد الشهرية كملفات CSV في ZIP"
            >
              <FileArchive className="w-4 h-4 text-purple-400" />
              <span>تصدير ZIP (كل الشهور)</span>
            </a>

            {/* Sept & Oct Export ZIP */}
            <a
              href="/api/admin/export-codes-zip?months=9,10"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
              title="تحميل أكواد سبتمبر وأكتوبر فقط كملفات CSV مقسمة في ZIP"
            >
              <Download className="w-4 h-4" />
              <span>أكواد سبتمبر وأكتوبر (ZIP)</span>
            </a>

            {/* Quick Export Excel */}
            <a
              href="/api/admin/export-codes?format=csv&status=unused"
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-700 transition"
              title="تحميل ملف Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel (CSV)</span>
            </a>

            {/* Printable Cards */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer"
              title="معاينة بطاقات الطباعة الورقية"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>طباعة بطاقات</span>
            </button>
          </div>

          <div className="text-xs text-neutral-500 text-left" dir="ltr">
            Dekich Secure Code Engine v2.6
          </div>
        </section>

        {/* Filters & Search */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("UNUSED")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === "UNUSED"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                جاهزة للتوزيع ({unusedCount})
              </button>
              <button
                onClick={() => setStatusFilter("USED")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === "USED"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                مستعملة ({usedCount})
              </button>
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === "ALL"
                    ? "bg-neutral-800 text-white border border-neutral-700"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                الكل
              </button>
            </div>

            {/* Subject Selector & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full sm:w-56 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
                >
                  <option value="ALL">جميع المواد التعليمية ({initialSubjects.length})</option>
                  {initialSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالرمز أو التلميذ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-xl pr-9 pl-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Codes Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-neutral-800/60 border-b border-neutral-800 text-neutral-400 font-medium">
                    <th className="py-3 px-4">رمز الدخول (Code)</th>
                    <th className="py-3 px-4">المادة التعليمية</th>
                    <th className="py-3 px-4">نوع الصلاحية</th>
                    <th className="py-3 px-4">الشهور الصالحة</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">المستعمل</th>
                    <th className="py-3 px-4 text-center">نسخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredCodes.slice(0, 100).map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-neutral-800/40 transition group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sm tracking-wider text-purple-300 bg-purple-950/40 border border-purple-800/60 px-2.5 py-1 rounded-lg">
                          {c.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-200">
                        {c.subject.title}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.accessType === "YEARLY"
                              ? "bg-amber-950/40 text-amber-300 border border-amber-800/50"
                              : "bg-blue-950/40 text-blue-300 border border-blue-800/50"
                          }`}
                        >
                          {c.accessType === "YEARLY" ? "سنوي كامل" : "شهري"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 font-mono" dir="ltr">
                        {c.accessType === "YEARLY" ? "1 → 12" : c.validMonths.join(", ") || "1"}
                      </td>
                      <td className="py-3 px-4">
                        {c.isUsed ? (
                          <span className="inline-flex items-center gap-1 text-purple-400 font-semibold bg-purple-950/30 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            مستعمل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/30 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            جاهز للتوزيع
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {c.user ? (
                          <div>
                            <p className="font-bold text-neutral-200">{c.user.fullName}</p>
                            <p className="text-[10px] text-neutral-500 font-mono" dir="ltr">
                              {c.user.phoneNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
                          title="نسخ الرمز"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredCodes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        لا توجد رموز مطابقة لمعايير البحث الحالية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredCodes.length > 100 && (
              <div className="p-3 bg-neutral-850 border-t border-neutral-800 text-center text-xs text-neutral-400">
                يتم عرض أول 100 رمز للتصفح السريع. يمكنك تنزيل القائمة الكاملة عبر أزرار التصدير بالأعلى.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Code Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsGeneratorOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">توليد حزمة رموز جديدة</h3>
                <p className="text-xs text-neutral-400">
                  توليد فوري وحفظ مباشر مع تحميل ملف الرموز تلقائياً
                </p>
              </div>
            </div>

            {genSuccessMessage && (
              <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{genSuccessMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Target Subjects Mode */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  نطاق التوليد
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenSubjectMode("SINGLE")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      genSubjectMode === "SINGLE"
                        ? "bg-purple-950/40 text-purple-300 border-purple-600"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    مادة محددة
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenSubjectMode("ALL")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      genSubjectMode === "ALL"
                        ? "bg-purple-950/40 text-purple-300 border-purple-600"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    جميع المواد دفعة واحدة ({initialSubjects.length})
                  </button>
                </div>
              </div>

              {/* Subject Selection if SINGLE */}
              {genSubjectMode === "SINGLE" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    اختر المادة التعليمية
                  </label>
                  <select
                    value={genSelectedSubject}
                    onChange={(e) => setGenSelectedSubject(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {initialSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Access Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نوع صلاحية الرمز
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenAccessType("YEARLY")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      genAccessType === "YEARLY"
                        ? "bg-purple-950/40 text-purple-300 border-purple-600"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    سنوي (كامل البرنامج)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenAccessType("MONTHLY")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      genAccessType === "MONTHLY"
                        ? "bg-purple-950/40 text-purple-300 border-purple-600"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    شهري (أشهر مخصصة)
                  </button>
                </div>
              </div>

              {/* Months Selector if MONTHLY */}
              {genAccessType === "MONTHLY" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    حدد الشهور المفعلة بهذا الرمز
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMonth(m)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                          genMonths.includes(m)
                            ? "bg-purple-600 text-white border-purple-500"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Count */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  العدد لكل مادة
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 100, 250, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGenCount(num)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                        genCount === num
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد وحفظ الرموز...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد وتنزيل الملف</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Cards Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 my-auto space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">بطاقات الطباعة الورقية (Printable Cards)</h3>
                <p className="text-xs text-neutral-400">
                  عرض الرموز غير المستخدمة بتنسيق بطاقات ملائمة للطباعة والقص
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة (Ctrl + P)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {filteredCodes.slice(0, 18).map((c) => (
                <div
                  key={c.id}
                  className="bg-neutral-950 border-2 border-dashed border-neutral-700 print:border-black rounded-xl p-3.5 space-y-2.5 print:bg-white print:text-black"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold border-b border-neutral-800 print:border-gray-300 pb-1.5">
                    <span className="text-purple-400 print:text-purple-700">أكاديمية دكيش</span>
                    <span className="text-neutral-400 print:text-gray-600">
                      {c.accessType === "YEARLY" ? "اشتراك سنوي" : "اشتراك شهري"}
                    </span>
                  </div>

                  <div className="text-center py-1">
                    <p className="text-xs font-semibold text-neutral-300 print:text-black mb-1">
                      {c.subject.title}
                    </p>
                    <p className="font-mono text-base font-extrabold tracking-widest text-emerald-400 print:text-black bg-neutral-900 print:bg-gray-100 py-1 rounded-lg border border-neutral-800 print:border-gray-300">
                      {c.code}
                    </p>
                  </div>

                  <div className="text-[9px] text-neutral-500 print:text-gray-500 text-center">
                    لتفعيل الرمز: أدخل إلى حسابك واكتب الرمز في صفحة المواد
                  </div>
                </div>
              ))}
            </div>

            {filteredCodes.length > 18 && (
              <p className="text-center text-xs text-neutral-500">
                يتم عرض أول 18 بطاقة للمعاينة. للطباعة الضخمة استخدم ملف Excel أو ZIP.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
