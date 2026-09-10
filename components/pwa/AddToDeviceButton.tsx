"use client";

import { useState } from "react";
import { Smartphone, Share } from "lucide-react";
import { CraftedButton } from "@/components/landing/CraftedButton";
import { usePwaInstall } from "@/components/pwa/usePwaInstall";

export function AddToDeviceButton() {
  const { standalone, ios, canPrompt, install } = usePwaInstall();
  const [showHint, setShowHint] = useState(false);

  if (standalone) return null;

  const onClick = async () => {
    if (canPrompt) {
      await install();
      return;
    }
    setShowHint(true);
  };

  return (
    <div className="w-full sm:w-auto">
      <CraftedButton
        type="button"
        variant="royal"
        onClick={onClick}
        icon={<Smartphone className="w-5 h-5" />}
      >
        أضف إلى جهازي
      </CraftedButton>
      {showHint ? (
        <p className="mt-3 max-w-sm text-sm text-white/85 leading-relaxed">
          {ios ? (
            <>
              على آيفون: اضغط{" "}
              <Share className="w-3.5 h-3.5 inline-block align-text-bottom" /> مشاركة ثم
              «إضافة إلى الشاشة الرئيسية».
            </>
          ) : (
            <>من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</>
          )}
        </p>
      ) : null}
    </div>
  );
}
