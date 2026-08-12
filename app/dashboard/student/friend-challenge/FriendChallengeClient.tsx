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
    <div className="space-y-8 pb-12 font-sans">
      
      {/* Code Share & Link Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Share My Code */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#EC4899] text-white border-[3px] border-[#000000] flex items-center justify-center mb-6 shadow-sm transform -rotate-3">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-[#000000] mb-3">رمز المنافسة الخاص بي</h3>
            <p className="text-gray-600 font-bold text-sm leading-relaxed">شارك هذا الرمز مع أصدقائك لربط حساباتكم</p>
          </div>
          
          <button 
            onClick={handleCopy}
            className="relative z-10 w-full flex items-center justify-between p-4 bg-[#7E22CE] rounded-xl border-[3px] border-[#000000] hover:-translate-y-1 hover:shadow-3d-hover transition-all duration-300 group overflow-hidden max-w-full"
          >
            <span className="font-mono font-black text-[#FACC15] text-xl tracking-widest truncate min-w-0 flex-1 text-right ml-2 drop-shadow-md">{myCode}</span>
            <div className={`w-12 h-12 shrink-0 rounded-xl border-[3px] border-[#000000] flex items-center justify-center shadow-sm transition-all duration-300 transform ${copied ? 'bg-[#22C55E] text-[#000000] rotate-3' : 'bg-[#000000] text-white group-hover:bg-[#FFFFFF] group-hover:text-[#000000] -rotate-3'}`}>
              {copied ? <Check className="w-6 h-6" strokeWidth={3} /> : <Copy className="w-5 h-5" strokeWidth={2.5} />}
            </div>
          </button>
        </div>

        {/* Link Friend Code */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#06B6D4] text-[#000000] border-[3px] border-[#000000] flex items-center justify-center mb-6 shadow-sm transform rotate-3">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black text-[#000000] mb-3">إضافة صديق</h3>
            <p className="text-gray-600 font-bold text-sm leading-relaxed">أدخل رمز صديقك لبدء المنافسة معه</p>
          </div>
          
          <form onSubmit={handleLink} className="space-y-4 relative z-10">
            <div className="flex gap-3">
              <input
                type="text"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="أدخل رمز الصديق هنا..."
                className="flex-1 bg-white border-[3px] border-[#000000] rounded-xl px-4 py-4 text-base font-mono font-black text-[#000000] focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-inner"
                dir="ltr"
              />
              <button 
                type="submit"
                disabled={!friendCode.trim() || isLinking}
                className="px-6 bg-[#FACC15] hover:bg-[#FACC15] text-[#000000] border-[3px] border-[#000000] rounded-xl font-black text-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none hover:-translate-y-1 hover:shadow-3d-hover shadow-sm shrink-0"
              >
                {isLinking ? <Loader2 className="w-6 h-6 animate-spin" /> : "إضافة"}
              </button>
            </div>
            {error && (
              <p className="text-xs font-bold text-white bg-[#EF4444] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-[2px] border-[#000000]">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Leaderboard & Metrics */}
      <div className="bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft overflow-hidden paper-cut relative">
        <div className="p-6 md:p-8 border-b-[3px] border-[#000000] bg-[#F8F9FA] relative z-10">
          <h2 className="text-2xl font-black text-[#000000] mb-2">لوحة الشرف والمنافسة</h2>
          <p className="text-gray-600 font-bold text-sm">قارن أداءك مع أصدقائك في المنصة وكن في الصدارة</p>
        </div>
        
        <div className="divide-y-[3px] divide-[#000000] relative z-10">
          {metrics.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-bold bg-white">
              لا توجد بيانات متاحة حالياً، قم بإضافة أصدقاء لبدء التحدي!
            </div>
          ) : (
            metrics.map((m, idx) => (
              <div key={m.id} className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-[#F8F9FA] transition-colors bg-white group">
                
                {/* Rank */}
                <div className={`w-12 h-12 rounded-xl border-[3px] border-[#000000] flex items-center justify-center font-black text-xl shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                  idx === 0 ? "bg-[#FACC15] text-[#000000] rotate-3" :
                  idx === 1 ? "bg-[#EAE4D9] text-[#000000] -rotate-3" :
                  idx === 2 ? "bg-[#F97316] text-white rotate-3" :
                  "bg-white text-[#000000]"
                }`}>
                  {idx + 1}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-[3px] border-[#000000] shadow-sm bg-[#F8F9FA]" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#7E22CE] text-white flex items-center justify-center font-black text-xl border-[3px] border-[#000000] shadow-sm transform -rotate-3">
                      {m.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-black text-lg text-[#000000] truncate">{m.fullName}</p>
                    <p className="text-xs font-bold text-gray-500 bg-[#000000]/5 inline-block px-2 py-1 rounded-md mt-1">منافس قوي</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <div className="text-center p-3 rounded-xl bg-white border-[3px] border-[#000000] shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                    <p className="text-[10px] font-black text-gray-500 mb-1">أقل أخطاء</p>
                    <p className="font-mono font-black text-lg text-[#EC4899]">{m.mistakesCount}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white border-[3px] border-[#000000] shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-100">
                    <p className="text-[10px] font-black text-gray-500 mb-1">الدروس المنجزة</p>
                    <p className="font-mono font-black text-lg text-[#06B6D4]">{m.enrollmentsCount}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white border-[3px] border-[#000000] shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-150 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#FACC15] border-b-[2px] border-l-[2px] border-[#000000] -rotate-12 translate-x-1 -translate-y-1"></div>
                    <p className="text-[10px] font-black text-gray-500 mb-1">نقاط التمارين</p>
                    <p className="font-mono font-black text-lg text-[#22C55E]">{m.totalPoints}</p>
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
