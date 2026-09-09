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
        if (res.redirectUrl) {
          router.push(res.redirectUrl);
        } else {
          router.refresh(); // Refresh the page to unlock the subject
        }
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
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <Key className="w-4 h-4" />
        </span>
        <input 
          type="text" 
          name="code" 
          placeholder="أدخل كود الإشتراك" 
          required
          className="input-field pr-10 text-center font-mono bg-surface-muted border-transparent focus:bg-surface"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحقق...
          </>
        ) : (
          <>
            <Unlock className="w-4 h-4" />
            تفعيل المادة
          </>
        )}
      </button>
    </form>
  );
}
