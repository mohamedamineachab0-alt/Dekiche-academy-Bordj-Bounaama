"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SoftOrb, SectionDivider } from "@/components/landing/LandingDecor";

const faqs = [
  {
    q: "كيف أفتح حساباً في أكاديمية دقيش؟",
    a: "اضغط على «إنشاء حساب»، اختر حساب تلميذ أو وليّ أمر، أكمل اسمك وبياناتك، ثم فعّل موادك برموز الاشتراك.",
  },
  {
    q: "ما هي المواد المتاحة؟",
    a: "المواد تظهر حسب طورك ومستواك وشعبتك. بعد التسجيل، ادخل إلى «موادي» لمعرفة المواد التي يمكنك تفعيلها.",
  },
  {
    q: "كيف يتابع وليّ الأمر ابنه؟",
    a: "ينشئ وليّ الأمر حساباً منفصلاً ويربطه بحساب الابن باستخدام رمز الربط. يمكنه الاطلاع على الغيابات والنقاط والتقدّم.",
  },
  {
    q: "كيف أتواصل مع الأستاذ؟",
    a: "عبر دردشة القسم داخل المنصة. يتابع الأساتذة الأسئلة والاستفسارات بانتظام.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" dir="rtl" className="py-20 md:py-28 bg-background relative overflow-hidden">
      <SoftOrb tone="indigo" className="w-48 h-48 top-8 start-8 opacity-45" />
      <SoftOrb tone="white" className="w-56 h-56 bottom-8 end-8 opacity-35" />
      <div className="landing-line-grid-ink absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="text-center mb-10">
          <p className="rule-label justify-center mb-5">
            <span className="shrink-0">إجابات موجزة</span>
          </p>
          <h2 className="kufi text-[clamp(1.7rem,3.2vw,2.6rem)] mb-4 text-ink">
            الأسئلة الشائعة
          </h2>
          <SectionDivider />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden ${
                  isOpen
                    ? "border-primary bg-primary-soft shadow-md"
                    : "border-line bg-white"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-start"
                >
                  <span className={`kufi text-[0.95rem] ${isOpen ? "text-primary" : "text-ink"}`}>
                    {faq.q}
                  </span>
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isOpen ? "bg-primary text-white rotate-180" : "bg-primary-soft text-primary"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>

                {isOpen ? (
                  <p className="px-5 pb-5 naskh text-muted leading-[1.85]">{faq.a}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
