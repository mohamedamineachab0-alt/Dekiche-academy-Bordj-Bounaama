"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Key,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  LogOut,
  Layers,
  GraduationCap,
  BookOpen,
  School,
  Loader2,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { extract100CodesForSubject, logoutCodesPortal } from "@/actions/codes-portal";

interface Subject {
  id: string;
  title: string;
  phase: string;
  levels?: string[];
  streams?: string[];
  teacherName?: string | null;
  accessType?: string;
}

// 1. الأطوار التعليمية
const phaseOptions = [
  { value: "ALL", label: "جميع الأطوار" },
  { value: "SECONDARY", label: "الطور الثانوي" },
  { value: "MIDDLE", label: "الطور المتوسط" },
  { value: "PRIMARY", label: "الطور الابتدائي" },
];

// 2. جميع المستويات الدراسية مفصلة (12 مستوى بالكامل)
const allLevelOptions = [
  // الطور الثانوي
  { value: "SECONDARY_3", label: "3 ثانوي (بكالوريا)", phase: "SECONDARY" },
  { value: "SECONDARY_2", label: "2 ثانوي", phase: "SECONDARY" },
  { value: "SECONDARY_1", label: "1 ثانوي", phase: "SECONDARY" },
  // الطور المتوسط
  { value: "MIDDLE_4", label: "4 متوسط (شهادة BEM)", phase: "MIDDLE" },
  { value: "MIDDLE_3", label: "3 متوسط", phase: "MIDDLE" },
  { value: "MIDDLE_2", label: "2 متوسط", phase: "MIDDLE" },
  { value: "MIDDLE_1", label: "1 متوسط", phase: "MIDDLE" },
  // الطور الابتدائي (جميع المستويات الـ 5)
  { value: "PRIMARY_5", label: "5 ابتدائي", phase: "PRIMARY" },
  { value: "PRIMARY_4", label: "4 ابتدائي", phase: "PRIMARY" },
  { value: "PRIMARY_3", label: "3 ابتدائي", phase: "PRIMARY" },
  { value: "PRIMARY_2", label: "2 ابتدائي", phase: "PRIMARY" },
  { value: "PRIMARY_1", label: "1 ابتدائي", phase: "PRIMARY" },
];

// 3. جميع الشعب مفصلة
const allStreamOptions = [
  { value: "ALL", label: "جميع الشعب" },
  { value: "EXPERIMENTAL_SCIENCES", label: "علوم تجريبية" },
  { value: "MATHEMATICS", label: "رياضيات" },
  { value: "TECHNICAL_MATH", label: "تقني رياضي" },
  { value: "SCIENCES_MATH_TECH", label: "شعب علمية (علوم + رياضيات + تقني)" },
  { value: "MANAGEMENT_ECONOMY", label: "تسيير واقتصاد" },
  { value: "LITERATURE_PHILOSOPHY", label: "آداب وفلسفة" },
  { value: "FOREIGN_LANGUAGES", label: "لغات أجنبية" },
  { value: "COMMON_SCIENCE", label: "جذع مشترك علوم وتكنولوجيا" },
  { value: "COMMON_LETTERS", label: "جذع مشترك آداب" },
  { value: "GENERAL", label: "عام" },
  { value: "NONE", label: "بدون شعبة / أساسي" },
];

const levelLabelMap: Record<string, string> = {
  PRIMARY_1: "1 ابتدائي",
  PRIMARY_2: "2 ابتدائي",
  PRIMARY_3: "3 ابتدائي",
  PRIMARY_4: "4 ابتدائي",
  PRIMARY_5: "5 ابتدائي",
  MIDDLE_1: "1 متوسط",
  MIDDLE_2: "2 متوسط",
  MIDDLE_3: "3 متوسط",
  MIDDLE_4: "4 متوسط",
  SECONDARY_1: "1 ثانوي",
  SECONDARY_2: "2 ثانوي",
  SECONDARY_3: "3 ثانوي",
};

function formatSubjectLevels(levels?: string[]): string {
  if (!levels || levels.length === 0) return "";
  if (levels.length === 5 && levels.every((l) => l.startsWith("PRIMARY_"))) {
    return "1 إلى 5 ابتدائي";
  }
  if (levels.length === 4 && levels.every((l) => l.startsWith("MIDDLE_"))) {
    return "1 إلى 4 متوسط";
  }
  return levels.map((l) => levelLabelMap[l] || l).join(" و ");
}

interface Props {
  initialSubjects: Subject[];
}

export function CodesPortalClient({ initialSubjects }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedStream, setSelectedStream] = useState<string>("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [extractedCodes, setExtractedCodes] = useState<Array<{ code: string; accessType: string }>>([]);
  const [lastSubjectName, setLastSubjectName] = useState<string>("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Determine available levels based on selected phase
  const availableLevels = useMemo(() => {
    if (selectedPhase === "ALL") {
      return allLevelOptions;
    }
    return allLevelOptions.filter((lvl) => lvl.phase === selectedPhase);
  }, [selectedPhase]);

  // Determine available streams based on selected phase/level
  const availableStreams = useMemo(() => {
    if (selectedPhase === "PRIMARY" || selectedPhase === "MIDDLE") {
      return [
        { value: "ALL", label: "جميع الشعب / عام" },
        { value: "NONE", label: "بدون شعبة / أساسي" },
        { value: "GENERAL", label: "عام" },
      ];
    }
    if (selectedLevel === "SECONDARY_1") {
      return [
        { value: "ALL", label: "جميع الشعب" },
        { value: "COMMON_SCIENCE", label: "جذع مشترك علوم وتكنولوجيا" },
        { value: "COMMON_LETTERS", label: "جذع مشترك آداب" },
        { value: "NONE", label: "بدون شعبة / عام" },
      ];
    }
    return allStreamOptions;
  }, [selectedPhase, selectedLevel]);

  // Handle phase change
  const handlePhaseChange = (phase: string) => {
    setSelectedPhase(phase);
    if (phase !== "ALL") {
      const match = allLevelOptions.find((l) => l.value === selectedLevel && l.phase === phase);
      if (!match) {
        setSelectedLevel("ALL");
      }
    }
    setSelectedStream("ALL");
    setSelectedSubjectId("");
  };

  // Handle level change
  const handleLevelChange = (lvl: string) => {
    setSelectedLevel(lvl);
    if (lvl !== "ALL") {
      const found = allLevelOptions.find((l) => l.value === lvl);
      if (found && found.phase !== selectedPhase) {
        setSelectedPhase(found.phase);
      }
    }
    setSelectedStream("ALL");
    setSelectedSubjectId("");
  };

  // Handle stream change
  const handleStreamChange = (str: string) => {
    setSelectedStream(str);
    setSelectedSubjectId("");
  };

  // Filter subjects according to phase, level & stream
  const filteredSubjects = useMemo(() => {
    return initialSubjects.filter((s) => {
      // 1. Phase check
      if (selectedPhase !== "ALL" && s.phase !== selectedPhase) {
        return false;
      }

      // 2. Level check
      if (selectedLevel !== "ALL") {
        if (!s.levels || !s.levels.includes(selectedLevel)) {
          return false;
        }
      }

      // 3. Stream check
      if (selectedStream !== "ALL") {
        if (s.phase !== "SECONDARY") {
          // Primary and Middle subjects don't have secondary streams
          if (selectedPhase === "SECONDARY") return false;
          return true;
        }
        if (!s.streams || s.streams.length === 0) {
          return selectedStream === "NONE" || selectedStream === "GENERAL";
        }
        if (!s.streams.includes(selectedStream)) {
          if (selectedStream === "NONE" && s.streams.includes("NONE")) {
            return true;
          }
          return false;
        }
      }

      return true;
    });
  }, [initialSubjects, selectedPhase, selectedLevel, selectedStream]);

  // Keep selectedSubjectId aligned with filtered list
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      const exists = filteredSubjects.some((s) => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(filteredSubjects[0].id);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [filteredSubjects, selectedSubjectId]);

  // Handle Extraction and Automatic CSV Download
  const handleExtractAndDownload = async () => {
    const targetSubjectId = selectedSubjectId || filteredSubjects[0]?.id;
    if (!targetSubjectId) {
      setErrorMsg("يرجى اختيار المادة الدراسية أولاً");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setCopiedAll(false);

    try {
      const res = await extract100CodesForSubject(targetSubjectId);

      if (!res || res.error || !res.codes) {
        setErrorMsg(res?.error || "حدث خطأ أثناء استخراج الأكواد");
        setIsLoading(false);
        return;
      }

      setExtractedCodes(res.codes);
      const subjectTitle = res.subject.title;
      setLastSubjectName(subjectTitle);

      // ONLY THE CODES IN CSV - strictly one column
      const csvContent = "\uFEFFالكود\r\n" + res.codes.map((item) => `"${item.code}"`).join("\r\n");

      // Automatic download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = subjectTitle.replace(/[\/\\?%*:|"<>]/g, "_");
      link.href = url;
      link.setAttribute("download", `أكواد_${safeTitle}_100.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("تعذر تحميل الملف، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAllToClipboard = () => {
    if (extractedCodes.length === 0) return;
    const allText = extractedCodes.map((c) => c.code).join("\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-16" dir="rtl">
      {/* Top Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">بوابة استخراج أكواد الاشتراك</h1>
              <p className="text-xs text-neutral-400">توليد وتصدير فوري لـ 100 كود في ملف CSV (الأكواد فقط)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-xs font-medium text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              المسؤول: سعيد بيشة
            </span>

            <button
              onClick={() => logoutCodesPortal()}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-800 hover:border-red-500/40 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                استخراج دفعة 100 كود (ملف CSV يحتوي الأكواد فقط)
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                المواد المتاحة: {filteredSubjects.length}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              اختر الطور، المستوى، الشعبة، ثم المادة الدراسية، واضغط على الزر لتحميل ملف CSV فوري يحتوي على 100 كود بدون أي أعمدة إضافية.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 4 Hierarchical Selectors (Phase -> Level -> Stream -> Subject) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. الطور الدراسي */}
            <div>
              <label className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-400" />
                1. الطور الدراسي
              </label>
              <select
                value={selectedPhase}
                onChange={(e) => handlePhaseChange(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-2xl px-3 py-3 text-sm text-neutral-100 focus:outline-none transition cursor-pointer font-medium"
              >
                {phaseOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. المستوى الدراسي */}
            <div>
              <label className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                2. المستوى الدراسي
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-2xl px-3 py-3 text-sm text-neutral-100 focus:outline-none transition cursor-pointer font-medium"
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  جميع المستويات
                </option>

                {selectedPhase === "ALL" ? (
                  <>
                    <optgroup label="── الطور الثانوي ──" className="bg-neutral-950 text-purple-300 font-bold">
                      {allLevelOptions
                        .filter((l) => l.phase === "SECONDARY")
                        .map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white font-normal">
                            {opt.label}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="── الطور المتوسط ──" className="bg-neutral-950 text-indigo-300 font-bold">
                      {allLevelOptions
                        .filter((l) => l.phase === "MIDDLE")
                        .map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white font-normal">
                            {opt.label}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="── الطور الابتدائي ──" className="bg-neutral-950 text-emerald-300 font-bold">
                      {allLevelOptions
                        .filter((l) => l.phase === "PRIMARY")
                        .map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white font-normal">
                            {opt.label}
                          </option>
                        ))}
                    </optgroup>
                  </>
                ) : (
                  availableLevels.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                      {opt.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 3. الشعبة */}
            <div>
              <label className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                3. الشعبة
              </label>
              <select
                value={selectedStream}
                onChange={(e) => handleStreamChange(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-2xl px-3 py-3 text-sm text-neutral-100 focus:outline-none transition cursor-pointer font-medium"
              >
                {availableStreams.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. المادة */}
            <div>
              <label className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                4. المادة الدراسية ({filteredSubjects.length})
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 rounded-2xl px-3 py-3 text-sm text-neutral-100 focus:outline-none transition cursor-pointer font-medium"
              >
                {filteredSubjects.length === 0 ? (
                  <option value="" disabled>
                    لا توجد مواد لهذا الاختيار
                  </option>
                ) : (
                  filteredSubjects.map((s) => {
                    const levelLabel = formatSubjectLevels(s.levels);
                    return (
                      <option key={s.id} value={s.id} className="bg-neutral-900 text-white">
                        {s.title} {levelLabel ? `[${levelLabel}]` : ""} {s.teacherName ? `(${s.teacherName})` : ""}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleExtractAndDownload}
              disabled={isLoading || filteredSubjects.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري استخراج 100 كود وتوليد ملف CSV...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>استخراج 100 كود وتحميل ملف CSV فورا 📥</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Preview */}
        {extractedCodes.length > 0 && (
          <div className="mt-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    تم استخراج 100 كود لمادة: <span className="text-emerald-400 font-black">{lastSubjectName}</span>
                  </h3>
                  <p className="text-xs text-neutral-400">تم تنزيل ملف CSV يحتوي على عمود الكود فقط بنجاح</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyAllToClipboard}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedAll ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ 100 كود!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ جميع الأكواد</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExtractAndDownload}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>إعادة تحميل CSV</span>
                </button>
              </div>
            </div>

            {/* Codes Grid (100 items preview) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {extractedCodes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between font-mono text-xs text-neutral-200 group hover:border-purple-500/50 transition"
                >
                  <span className="text-neutral-500 text-[10px]">#{idx + 1}</span>
                  <span className="font-bold tracking-wider">{item.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
