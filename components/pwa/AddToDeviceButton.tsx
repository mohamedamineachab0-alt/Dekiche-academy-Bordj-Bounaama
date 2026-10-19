"use client";

import { useState } from "react";
import { Download, Smartphone, Share, X } from "lucide-react";
import { CraftedButton } from "@/components/landing/CraftedButton";
import { usePwaInstall } from "@/components/pwa/usePwaInstall";

interface Props {
  variant?: "hero" | "header" | "mobile";
  isScrolled?: boolean;
}

export function AddToDeviceButton({ variant = "hero", isScrolled = false }: Props) {
  const { standalone, ios, canPrompt, install } = usePwaInstall();
  const [showHint, setShowHint] = useState(false);

  // If already opened as standalone PWA app, don't show install prompt
  if (standalone) return null;

  const onClick = async () => {
    if (canPrompt) {
      const installed = await install();
      if (installed) {
        setShowHint(false);
        return;
      }
    }
    setShowHint((prev) => !prev);
  };

  if (variant === "header") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
            isScrolled
              ? "bg-primary-soft text-primary hover:bg-primary hover:text-white"
              : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20"
          }`}
          title="تثبيت التطبيق على جهازك (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت التطبيق</span>
        </button>

        {showHint && (
          <div className="absolute top-full end-0 mt-2 z-50 w-72 p-4 rounded-2xl bg-surface/95 backdrop-blur-xl border border-line shadow-2xl text-xs text-ink space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                تثبيت منصة دقيش
              </span>
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="text-muted hover:text-ink p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {ios ? (
              <div className="space-y-1 leading-relaxed text-muted text-[11px]">
                <p className="font-semibold text-ink">على هاتف آيفون (Safari):</p>
                <p>
                  اضغط على زر المشاركة{" "}
                  <Share className="w-3 h-3 inline-block text-primary align-text-bottom" /> ثم اختر «إضافة إلى الشاشة الرئيسية».
                </p>
              </div>
            ) : (
              <div className="space-y-1 leading-relaxed text-muted text-[11px]">
                <p className="font-semibold text-ink">على هاتفك أو حاسوبك:</p>
                <p>
                  من خيارات المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="w-full relative">
        <button
          type="button"
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-soft text-primary text-sm font-bold border border-primary/20 hover:bg-primary hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>تثبيت التطبيق على الهاتف (PWA)</span>
        </button>

        {showHint && (
          <div className="mt-2 p-3.5 rounded-xl bg-surface border border-line text-xs text-ink space-y-1.5">
            {ios ? (
              <p className="text-muted leading-relaxed">
                اضغط على زر المشاركة{" "}
                <Share className="w-3.5 h-3.5 inline-block text-primary align-text-bottom" /> في متصفح سفاري ثم اختر «إضافة إلى الشاشة الرئيسية».
              </p>
            ) : (
              <p className="text-muted leading-relaxed">
                من قائمة المتصفح (النقاط الثلاث) اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full sm:w-auto relative">
      <CraftedButton
        type="button"
        variant="royal"
        onClick={onClick}
        icon={<Download className="w-5 h-5" />}
      >
        تثبيت التطبيق (PWA)
      </CraftedButton>

      {showHint && (
        <div className="absolute top-full start-0 mt-3 z-30 w-80 max-w-[calc(100vw-2rem)] p-4 rounded-2xl bg-surface/95 backdrop-blur-xl border border-line shadow-2xl text-xs text-ink space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="font-bold text-sm text-primary flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              تثبيت منصة دقيش
            </span>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="text-muted hover:text-ink p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {ios ? (
            <div className="space-y-1.5 leading-relaxed text-muted">
              <p className="font-semibold text-ink">لتثبيت التطبيق على آيفون (iPhone / iPad):</p>
              <ol className="list-decimal list-inside space-y-1 ps-1">
                <li>
                  اضغط على زر المشاركة{" "}
                  <Share className="w-3.5 h-3.5 inline-block text-primary align-text-bottom" /> في شريط متصفح سفاري.
                </li>
                <li>مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                <li>اضغط على «إضافة» في الزاوية العلوية.</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-1.5 leading-relaxed text-muted">
              <p className="font-semibold text-ink">لتثبيت التطبيق على هاتفك أو حاسوبك:</p>
              <p>
                اضغط على خيارات المتصفح (النقاط الثلاث في الأعلى أو شريط العنوان) ثم اختر{" "}
                <span className="font-bold text-primary">«تثبيت التطبيق»</span> أو{" "}
                <span className="font-bold text-primary">«إضافة إلى الشاشة الرئيسية»</span>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
