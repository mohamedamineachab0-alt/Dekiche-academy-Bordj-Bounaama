"use client";

import { useEffect, useState } from "react";
import { getWilayaStats } from "@/lib/actions/stats";
import { ArrowDownUp, Map } from "lucide-react";

const ALGERIAN_WILAYAS = [
  { id: 1, name: "أدرار" }, { id: 2, name: "الشلف" }, { id: 3, name: "الأغواط" }, { id: 4, name: "أم البواقي" },
  { id: 5, name: "باتنة" }, { id: 6, name: "بجاية" }, { id: 7, name: "بسكرة" }, { id: 8, name: "بشار" },
  { id: 9, name: "البليدة" }, { id: 10, name: "البويرة" }, { id: 11, name: "تمنراست" }, { id: 12, name: "تبسة" },
  { id: 13, name: "تلمسان" }, { id: 14, name: "تيارت" }, { id: 15, name: "تيزي وزو" }, { id: 16, name: "الجزائر" },
  { id: 17, name: "الجلفة" }, { id: 18, name: "جيجل" }, { id: 19, name: "سطيف" }, { id: 20, name: "سعيدة" },
  { id: 21, name: "سكيكدة" }, { id: 22, name: "سيدي بلعباس" }, { id: 23, name: "عنابة" }, { id: 24, name: "قالمة" },
  { id: 25, name: "قسنطينة" }, { id: 26, name: "المدية" }, { id: 27, name: "مستغانم" }, { id: 28, name: "المسيلة" },
  { id: 29, name: "معسكر" }, { id: 30, name: "ورقلة" }, { id: 31, name: "وهران" }, { id: 32, name: "البيض" },
  { id: 33, name: "إليزي" }, { id: 34, name: "برج بوعريريج" }, { id: 35, name: "بومرداس" }, { id: 36, name: "الطارف" },
  { id: 37, name: "تندوف" }, { id: 38, name: "تسيمسيلت" }, { id: 39, name: "الوادي" }, { id: 40, name: "خنشلة" },
  { id: 41, name: "سوق أهراس" }, { id: 42, name: "تيبازة" }, { id: 43, name: "ميلة" }, { id: 44, name: "عين الدفلى" },
  { id: 45, name: "النعامة" }, { id: 46, name: "عين تموشنت" }, { id: 47, name: "غرداية" }, { id: 48, name: "غليزان" },
  { id: 49, name: "تيميمون" }, { id: 50, name: "برج باجي مختار" }, { id: 51, name: "أولاد جلال" }, { id: 52, name: "بني عباس" },
  { id: 53, name: "إن صالح" }, { id: 54, name: "إن قزام" }, { id: 55, name: "تقرت" }, { id: 56, name: "جانت" },
  { id: 57, name: "المغير" }, { id: 58, name: "المنيعة" }
];

interface WilayaStat {
  code: number;
  name: string;
  count: number;
}

export default function WilayaStatsWidget() {
  const [data, setData] = useState<WilayaStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default lowest to highest

  useEffect(() => {
    async function loadData() {
      const stats = await getWilayaStats();
      const formattedStats: WilayaStat[] = stats.map((s: any) => ({
        code: parseInt(s.wilaya.replace('W', ''), 10) || 0,
        name: s.wilaya,
        count: s.count
      }));
      setData(formattedStats);
      setLoading(false);
    }
    loadData();
  }, []);

  // Merge static array with fetched counts
  const mergedData = ALGERIAN_WILAYAS.map(staticWilaya => {
    const fetched = data.find(d => d.code === staticWilaya.id);
    return {
      id: staticWilaya.id,
      name: staticWilaya.name,
      count: fetched ? fetched.count : 0
    };
  });

  const sortedData = [...mergedData].sort((a, b) => {
    if (sortOrder === "asc") return a.count - b.count;
    return b.count - a.count;
  });

  // Calculate max count for the progress bar width (avoid division by 0)
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border-2 border-purple-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] p-6 mt-8"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(#f1f5f9 2px, transparent 2px), linear-gradient(90deg, #f1f5f9 2px, transparent 2px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "center center"
      }}
      dir="rtl"
    >
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-purple-900">إحصائيات الولايات (58)</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">توزيع الطلاب لتوجيه الإعلانات الممولة</p>
          </div>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95"
        >
          <ArrowDownUp className="w-4 h-4" />
          {sortOrder === "asc" ? "الأقل تسجيلاً أولاً" : "الأكثر تسجيلاً أولاً"}
        </button>
      </div>

      {/* Widget Content - Scrollable List */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl border border-purple-50 shadow-sm p-3 overflow-y-auto max-h-[400px] custom-scrollbar">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold">جاري تحميل إحصائيات الولايات...</p>
          </div>
        ) : (
          <div className="space-y-4 p-2 pr-4">
            {sortedData.map((wilaya) => {
              const percentage = (wilaya.count / maxCount) * 100;
              const isZero = wilaya.count === 0;

              return (
                <div key={wilaya.id} className={`flex items-center gap-4 group transition-opacity ${isZero ? 'opacity-75 hover:opacity-100' : ''}`}>
                  <div className={`w-10 h-10 shrink-0 font-black text-sm rounded-xl flex items-center justify-center border-2 transition-colors ${isZero
                      ? 'bg-white text-slate-400 border-slate-100'
                      : 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100'
                    }`}>
                    {wilaya.id.toString().padStart(2, '0')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className={`text-sm font-bold truncate ${isZero ? 'text-slate-500' : 'text-purple-900'}`}>
                        {wilaya.name}
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${isZero
                          ? 'text-purple-600 bg-purple-50 border-purple-100'
                          : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        }`}>
                        {wilaya.count} طالب
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isZero ? 'bg-slate-300' : 'bg-gradient-to-l from-purple-600 to-purple-400'
                          }`}
                        style={{ width: `${isZero ? 0 : Math.max(percentage, 2)}%` }} // Minimum 2% width if > 0 just to show it exists
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Style for Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(248, 250, 252, 0.8);
          border-radius: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 12px;
          border: 2px solid rgba(248, 250, 252, 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
