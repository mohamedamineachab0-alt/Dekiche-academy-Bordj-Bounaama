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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="surface-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="mb-8">
            <span className="icon-tile-solid mb-6">
              <Swords className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold text-ink mb-3">رمز المنافسة الخاص بي</h3>
            <p className="text-muted text-sm leading-relaxed">شارك هذا الرمز مع أصدقائك لربط حساباتكم</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between p-4 bg-hero rounded-xl border border-line hover:-translate-y-0.5 transition-all group overflow-hidden max-w-full"
          >
            <span className="font-mono font-bold text-white text-xl tracking-widest truncate min-w-0 flex-1 text-right ml-2">{myCode}</span>
            <span className={`w-12 h-12 shrink-0 rounded-xl border border-white/20 flex items-center justify-center transition-all ${copied ? 'bg-accent text-accent-text' : 'bg-white/15 text-white group-hover:bg-white group-hover:text-primary'}`}>
              {copied ? <Check className="w-6 h-6" strokeWidth={3} /> : <Copy className="w-5 h-5" strokeWidth={2.5} />}
            </span>
          </button>
        </div>

        <div className="surface-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="mb-8">
            <span className="icon-tile-solid mb-6">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </span>
            <h3 className="text-xl font-bold text-ink mb-3">إضافة صديق</h3>
            <p className="text-muted text-sm leading-relaxed">أدخل رمز صديقك لبدء المنافسة معه</p>
          </div>

          <form onSubmit={handleLink} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="أدخل رمز الصديق هنا..."
                className="flex-1 bg-surface border border-line rounded-xl px-4 py-4 text-base font-mono font-bold text-ink focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={!friendCode.trim() || isLinking}
                className="btn-secondary px-6 disabled:opacity-50 shrink-0"
              >
                {isLinking ? <Loader2 className="w-6 h-6 animate-spin" /> : "إضافة"}
              </button>
            </div>
            {error && (
              <p className="text-xs font-semibold text-white bg-red-500 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </form>
        </div>

      </div>

      <div className="surface-panel overflow-hidden">
        <div className="p-6 md:p-8 border-b border-line bg-surface-muted">
          <h2 className="text-xl font-bold text-ink mb-2">لوحة الشرف والمنافسة</h2>
          <p className="text-muted text-sm">قارن أداءك مع أصدقائك في المنصة وكن في الصدارة</p>
        </div>

        <div className="divide-y divide-line">
          {metrics.length === 0 ? (
            <div className="p-12 text-center">
              <span className="icon-tile mx-auto mb-4">
                <UserIcon className="w-5 h-5" />
              </span>
              <p className="text-sm text-muted">لا توجد بيانات متاحة حالياً، قم بإضافة أصدقاء لبدء التحدي!</p>
            </div>
          ) : (
            metrics.map((m, idx) => (
              <div key={m.id} className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-surface-muted transition-colors group">

                <div className={`w-12 h-12 rounded-xl border border-line flex items-center justify-center font-bold text-xl shrink-0 ${
                  idx === 0 ? "bg-primary text-white" :
                  idx === 1 ? "bg-surface-muted text-ink" :
                  idx === 2 ? "bg-amber-100 text-amber-800" :
                  "bg-surface text-muted"
                }`}>
                  {idx + 1}
                </div>

                <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border border-line bg-surface-muted" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl border border-line">
                      {m.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-bold text-lg text-ink truncate">{m.fullName}</p>
                    <p className="text-xs font-medium text-muted badge-soft inline-flex mt-1">منافس قوي</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <div className="text-center p-3 rounded-xl bg-surface border border-line">
                    <p className="text-[10px] font-semibold text-muted mb-1">أقل أخطاء</p>
                    <p className="font-mono font-bold text-lg text-primary tabular-nums">{m.mistakesCount}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface border border-line">
                    <p className="text-[10px] font-semibold text-muted mb-1">الدروس المنجزة</p>
                    <p className="font-mono font-bold text-lg text-primary tabular-nums">{m.enrollmentsCount}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface border border-line">
                    <p className="text-[10px] font-semibold text-muted mb-1">نقاط التمارين</p>
                    <p className="font-mono font-bold text-lg text-emerald-600 tabular-nums">{m.totalPoints}</p>
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
