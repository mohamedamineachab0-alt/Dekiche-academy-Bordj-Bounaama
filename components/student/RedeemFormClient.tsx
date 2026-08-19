"use client";

import { useActionState, useEffect } from "react";
import { redeemAccessCode } from "@/actions/subjects";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RedeemFormClient({ subjectId }: { subjectId: string }) {
  const [state, action, isPending] = useActionState(redeemAccessCode, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="subjectId" value={subjectId} />
      <div className="relative">
        <input 
          type="text" 
          name="code" 
          placeholder="أدخل كود الإشتراك" 
          required
          className="w-full bg-gray-50 border border-purple-100 rounded-lg p-3 pr-4 pl-4 outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
        />
      </div>
      {state?.error && (
        <p className="text-red-500 text-xs font-bold text-center">{state.error}</p>
      )}
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-purple-600 text-white rounded-lg p-3 font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        تفعيل المادة
      </button>
    </form>
  );
}
