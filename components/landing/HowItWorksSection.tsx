import { UserPlus, BookOpen, Award } from "lucide-react";
import { DotGrid, SoftOrb, SectionDivider } from "@/components/landing/LandingDecor";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "افتح حسابك وفعّل موادك",
    desc: "سجّل كتلميذ، اختر طورك ومستواك وشعبتك، ثم فعّل كل مادة برمز الاشتراك الخاص بها.",
  },
  {
    num: "02",
    icon: BookOpen,
    title: "تابع الدروس وحل التمارين",
    desc: "تفرّج الدروس المصوّرة شهراً بشهر، وحل التمارين اليومية. التصحيح فوري والنقطة تُحتسب.",
  },
  {
    num: "03",
    icon: Award,
    title: "راجع أخطاءك واختبر نفسك",
    desc: "كل خطأ يُحفظ مع حلّه الصحيح. اختبر مستواك بالفروض قبل الامتحان ومتابعة وليّ الأمر متاحة.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" dir="rtl" className="py-20 md:py-28 band-indigo-glow relative overflow-hidden">
      <SoftOrb tone="white" className="w-72 h-72 top-[-40px] start-1/3 opacity-80" />
      <SoftOrb tone="indigo" className="w-56 h-56 bottom-[-30px] end-10 opacity-60" />
      <DotGrid className="opacity-30" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <p className="rule-label justify-center mb-5">
            <span className="shrink-0">خطوة بخطوة</span>
          </p>
          <h2 className="kufi text-[clamp(1.7rem,3.2vw,2.6rem)] mb-4 text-ink">
            كيف تستخدم المنصة
          </h2>
          <p className="naskh text-lg text-muted leading-[1.9] mb-6">
            مسار بسيط: حساب، دراسة، مراجعة. كل خطوة تُبنى على التي قبلها.
          </p>
          <SectionDivider />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative surface-card p-7 text-center">
                <span className="absolute -top-4 right-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-primary text-white text-sm kufi flex items-center justify-center shadow-lg">
                  {step.num}
                </span>
                <span className="icon-tile-solid mx-auto mb-5 mt-2">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="kufi text-lg mb-3 text-ink">{step.title}</h3>
                <p className="naskh text-[0.92rem] text-muted leading-[1.85]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
