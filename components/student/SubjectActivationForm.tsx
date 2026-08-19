"use client";

import { useState } from "react";
import { Key, Unlock, Loader2 } from "lucide-react";
import { redeemAccessCode } from "@/actions/subjects";
import { useRouter } from "next/navigation";

export function SubjectActivationForm({ subjectId }: { subjectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleActivate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await redeemAccessCode(formData);
      
      if (res?.error) {
        alert(res.error);
      } else {
        alert("تم تفعيل المادة بنجاح!");
        router.refresh(); // Refresh the page to unlock the subject
      }
    } catch (err) {
      alert("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleActivate} className="space-y-3">
      <input type="hidden" name="subjectId" value={subjectId} />
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Key className="w-5 h-5" />
        </span>
        <input 
          type="text" 
          name="code" 
          placeholder="أدخل كود الإشتراك" 
          required
          className="w-full pr-11 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-800 font-mono text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#6b21a8] hover:bg-purple-800 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري التحقق...
          </>
        ) : (
          <>
            <Unlock className="w-5 h-5" />
            تفعيل المادة
          </>
        )}
      </button>
    </form>
  );
}
