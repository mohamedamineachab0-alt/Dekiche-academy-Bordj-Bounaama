"use client";

import { useState } from "react";
import { Key } from "lucide-react";

export function CodesPageLock({ children }: { children: React.ReactNode }) {
  const [pageUnlocked, setPageUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  if (pageUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="surface-card p-6 flex flex-col items-center justify-center space-y-5 max-w-md mx-auto mt-20 border border-line shadow-2xl">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
        <Key className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-ink">صفحة محمية</h2>
      <p className="text-muted text-center text-sm">الرجاء إدخال كلمة المرور للوصول إلى إدارة رموز الدخول</p>
      
      <div className="w-full space-y-3">
        <input
          type="password"
          value={unlockPassword}
          onChange={(e) => {
            setUnlockPassword(e.target.value);
            setUnlockError(false);
          }}
          placeholder="كلمة المرور..."
          className={`input-field text-center ${unlockError ? 'border-red-500 focus:ring-red-500' : ''}`}
          dir="ltr"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (unlockPassword === '0000') setPageUnlocked(true);
              else setUnlockError(true);
            }
          }}
        />
        {unlockError && <p className="text-red-500 text-xs text-center">كلمة المرور غير صحيحة</p>}
        
        <button 
          onClick={() => {
            if (unlockPassword === '0000') setPageUnlocked(true);
            else setUnlockError(true);
          }}
          className="btn-primary w-full"
        >
          دخول
        </button>
      </div>
    </div>
  );
}
