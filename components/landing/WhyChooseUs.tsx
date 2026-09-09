"use client";

import { motion, Variants } from "framer-motion";
import {
  WhyClockIcon,
  WhyCompleteIcon,
  WhyLiveIcon,
  WhyParentsIcon,
  WhyPathIcon,
  WhyUnifiedIcon,
} from "@/components/landing/art/HeroIcons";
import { DotGrid, GeoAccents, SoftOrb } from "@/components/landing/LandingDecor";

const reasons = [
  {
    icon: WhyClockIcon,
    title: "ادرس في وقتك",
    desc: "تفرّج الدروس وحل التمارين في الوقت اللي يناسبك، من البيت أو أي مكان.",
  },
  {
    icon: WhyUnifiedIcon,
    title: "محتوى موحّد من نفس الأستاذ",
    desc: "قل وداعاً لتعدد المصادر. الدروس والتمارين والفروض من نفس الأستاذ متسلسلة.",
  },
  {
    icon: WhyCompleteIcon,
    title: "دروس وتمارين وفروض",
    desc: "كل الجوانب المطلوبة للتحضير: شرح مصوّر، تمرين يومي، وفرض قبل الامتحان.",
  },
  {
    icon: WhyPathIcon,
    title: "دروس مرتّبة شهراً بشهر",
    desc: "لا تتقدّم على نفسك ولا تتيه في المقرّر. كل مادة مفتوحة حسب أشهر اشتراكك.",
  },
  {
    icon: WhyLiveIcon,
    title: "حصص مباشرة للمراجعة",
    desc: "تفاعل مع الأستاذ في حصص البث المباشر، وطرح أسئلتك قبل الامتحان.",
  },
  {
    icon: WhyParentsIcon,
    title: "متابعة حقيقية لوليّ الأمر",
    desc: "غيابات، نقاط، وتقدّم دراسي في لوحة مخصّصة يُربط فيها الوليّ بحساب الابن.",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

export function WhyChooseUs() {
  return (
    <section id="why-us" dir="rtl" className="py-20 md:py-28 band-soft-grid relative overflow-hidden">
      <SoftOrb tone="indigo" className="w-64 h-64 -top-16 -start-10 opacity-70" />
      <SoftOrb tone="white" className="w-48 h-48 bottom-0 end-0 opacity-50" />
      <DotGrid />
      <GeoAccents variant="light" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <p className="rule-label mb-5">
              <span className="shrink-0">لماذا أكاديمية دقيش؟</span>
            </p>
            <h2 className="kufi text-[clamp(1.8rem,3.2vw,2.8rem)] mb-5 text-ink">
              دراسة منظّمة من البيت
            </h2>
            <p className="naskh text-[1.05rem] text-muted leading-[1.95] max-w-[38ch]">
              عام الدراسة يحتاج متابعة وطريق واضح. المنصة تجمع الدراسة والمراجعة والفروض في مكان واحد.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {reasons.map((reason, idx) => {
              const Icon = reason.icon;
              const featured = idx === 1;
              return (
                <motion.div
                  key={reason.title}
                  variants={itemVariant}
                  className={`feature-card ${featured ? "feature-card-solid sm:row-span-1" : "feature-card-soft"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      featured ? "bg-white/20 text-white" : "bg-primary text-white"
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className={`kufi text-lg mb-2 ${featured ? "text-white" : "text-ink"}`}>
                    {reason.title}
                  </h3>
                  <p className={`naskh text-[0.95rem] leading-[1.85] ${featured ? "text-white/85" : "text-muted"}`}>
                    {reason.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
