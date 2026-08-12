"use client";

import { useState } from "react";
import { Copy, Swords, Check, Plus, AlertCircle, Loader2, User as UserIcon } from "lucide-react";
import { linkFriend } from "@/actions/friends";
import { useRouter } from "next/navigation";

export function FriendChallengeClient({ 
  myCode, 
  metrics 
}: { 
  myCode: string, 
  metrics: { id: string, fullName: string, avatarUrl: string | null, mistakesCount: number, enrollmentsCount: number, totalPoints: number }[] 
}) {
  const [friendCode, setFriendCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCopy = async () => {
    if (!myCode) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(myCode);
      } else {
        // Fallback for HTTP / local network contexts
        const textArea = document.createElement("textarea");
        textArea.value = myCode;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    
    setIsLinking(true);
    setError("");
    const result = await linkFriend(friendCode);
    
    if (result.error) {
      setError(result.error);
    } else {
      setFriendCode("");
      router.refresh();
    }
    setIsLinking(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Code Share & Link Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Share My Code */}
        <div className="bg-white dark:bg-white rounded-3xl p-6 border border-slate-100 dark:border-purple-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-white/30 text-purple-700 dark:text-purple-500 flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-purple-900 dark:text-purple-950">رمز المنافسة الخاص بي</h3>
              <p className="text-xs font-bold text-purple-900 dark:text-purple-950">شارك هذا الرمز مع أصدقائك لربط حساباتكم</p>
            </div>
          </div>
          
          <button 
            onClick={handleCopy}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-white rounded-xl border border-slate-200 dark:border-purple-200 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group overflow-hidden max-w-full"
          >
            <span className="font-mono font-black text-purple-900 dark:text-purple-950 text-xl tracking-widest truncate min-w-0 flex-1 text-right ml-2">{myCode}</span>
            <div className="w-8 h-8 shrink-0 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-400 group-hover:text-purple-700 dark:group-hover:text-purple-500 transition-colors">
              {copied ? <Check className="w-4 h-4 text-purple-700" /> : <Copy className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* Link Friend Code */}
        <div className="bg-white dark:bg-white rounded-3xl p-6 border border-slate-100 dark:border-purple-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-500 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-purple-900 dark:text-purple-950">إضافة صديق</h3>
              <p className="text-xs font-bold text-purple-900 dark:text-purple-950">أدخل رمز صديقك لبدء المنافسة</p>
            </div>
          </div>
          
          <form onSubmit={handleLink} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="أدخل رمز الصديق"
                className="flex-1 bg-white dark:bg-white border border-slate-200 dark:border-purple-200 rounded-xl px-4 py-3 text-sm font-mono font-bold dark:text-purple-950 focus:outline-none focus:border-purple-700 transition-colors"
                dir="ltr"
              />
              <button 
                type="submit"
                disabled={!friendCode.trim() || isLinking}
                className="px-6 bg-purple-800 hover:bg-purple-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : "إضافة"}
              </button>
            </div>
            {error && (
              <p className="text-xs font-bold text-purple-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Leaderboard & Metrics */}
      <div className="bg-white dark:bg-white rounded-3xl border border-slate-100 dark:border-purple-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-purple-200 bg-white dark:bg-white/50">
          <h2 className="text-lg font-black text-purple-900 dark:text-purple-950">لوحة الشرف والمنافسة</h2>
          <p className="text-sm font-bold text-purple-900 dark:text-purple-950">قارن أداءك مع أصدقائك في المنصة</p>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {metrics.length === 0 ? (
            <div className="p-8 text-center text-purple-900 dark:text-purple-950 font-bold">
              لا توجد بيانات متاحة
            </div>
          ) : (
            metrics.map((m, idx) => (
              <div key={m.id} className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 hover:bg-white dark:hover:bg-white/50 transition-colors">
                
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                  idx === 0 ? "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-700" :
                  idx === 1 ? "bg-slate-200 text-purple-800 dark:bg-white dark:text-slate-400" :
                  idx === 2 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500" :
                  "bg-slate-100 text-slate-500 dark:bg-white dark:text-slate-500"
                }`}>
                  {idx + 1}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-purple-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-white/30 text-purple-700 dark:text-purple-500 flex items-center justify-center font-black border-2 border-purple-200 dark:border-purple-900">
                      {m.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-black text-purple-900 dark:text-purple-950 truncate">{m.fullName}</p>
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-950">منافس</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 md:gap-6 w-full md:w-auto mt-4 md:mt-0">
                  <div className="text-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/20">
                    <p className="text-[10px] font-black text-purple-800 dark:text-purple-500 mb-1">عدد الأخطاء الأقل</p>
                    <p className="font-mono font-bold text-purple-950 dark:text-purple-950">{m.mistakesCount}</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-purple-50 dark:bg-white/20">
                    <p className="text-[10px] font-black text-purple-700 dark:text-purple-500 mb-1">الدروس والمواد الأكثر مشاهدة</p>
                    <p className="font-mono font-bold text-purple-950 dark:text-purple-950">{m.enrollmentsCount}</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/20">
                    <p className="text-[10px] font-black text-purple-700 dark:text-purple-500 mb-1">التمارين اليومية</p>
                    <p className="font-mono font-bold text-purple-950 dark:text-purple-950">{m.totalPoints}</p>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
