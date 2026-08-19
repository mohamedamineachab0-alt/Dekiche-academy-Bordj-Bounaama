"use client";

import { Key, Unlock } from "lucide-react";
import { redeemAccessCode } from "@/actions/subjects";

export function SubjectActivationForm({ subjectId }: { subjectId: string }) {
  
  const handleActivate = async (formData: FormData) => {
    // Calling the actual server action to redeem the code
    const res = await redeemAccessCode(formData);
    
    // If there is an error (e.g., invalid code, already used), show it to the user
    if (res?.error) {
      alert(res.error);
    }
    // If successful, the server action itself redirects the user to the subject page
  };

  return (
    <form action={handleActivate} className="space-y-3">
      <input type="hidden" name="subjectId" value={subjectId} />
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000000]">
          <Key className="w-5 h-5" />
        </span>
        <input 
          type="text" 
          name="code" 
          placeholder="أدخل كود الإشتراك" 
          required
          className="w-full pr-12 pl-4 py-3 rounded-xl border-[3px] border-[#000000] bg-white text-[#000000] font-mono font-black text-base focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-sm"
        />
      </div>
      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-800 border-[3px] border-black text-white font-black py-3 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
        <Unlock className="w-5 h-5" />
        تفعيل المادة
      </button>
    </form>
  );
}
