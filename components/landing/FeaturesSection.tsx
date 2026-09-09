import { Reveal } from "@/components/shared/Reveal";

const features = [
  {
    title: "حضوري ورقمي في آن",
    desc: "قاعة الدرس والمنصة على نفس البرنامج، فلا ينقطع التحضير بين الحصّة والأخرى.",
  },
  {
    title: "برنامج مرتّب شهراً بشهر",
    desc: "المحتوى مفتوح حسب أشهر الاشتراك، فلا يتقدّم التلميذ على نفسه ولا يتيه في المقرّر.",
  },
  {
    title: "تصحيح فوري للتمارين",
    desc: "التمرين يُقيّم لحظة تسليمه، والنقطة تُضاف إلى رصيد التلميذ في الترتيب.",
  },
  {
    title: "بنك أخطاء شخصي",
    desc: "كل خطأ يُحفظ مع حلّه الصحيح ويعود في المراجعة، بدل أن يتكرّر في الامتحان.",
  },
  {
    title: "لوحة مستقلّة لوليّ الأمر",
    desc: "الغيابات والنقاط والتقدّم في حساب منفصل يُربط بحساب الابن برمز.",
  },
  {
    title: "صلاحيات منفصلة",
    desc: "التلميذ والأستاذ ووليّ الأمر والإدارة — لكل دور ما يخصّه فقط.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-surface border-y border-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <Reveal delay={60} direction="up">
          <div className="max-w-[34ch] mb-14 md:mb-20">
            <p className="rule-label mb-6">
              <span className="shrink-0">ما تقدّمه الأكاديمية</span>
            </p>
            <h2 className="display-title text-[clamp(1.7rem,3.2vw,2.6rem)]">
              أدوات قليلة، مستعملة فعلاً
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 md:gap-y-4">
          {features.map((feat, idx) => (
            <Reveal key={feat.title} delay={idx * 60} direction="up">
              <article
                className={`border-t border-line pt-6 pb-8 ${idx % 2 === 1 ? "md:mt-14" : ""}`}
              >
                <h3 className="display-title text-lg mb-3">{feat.title}</h3>
                <p className="text-[0.95rem] text-muted leading-[1.85] max-w-[40ch]">
                  {feat.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
