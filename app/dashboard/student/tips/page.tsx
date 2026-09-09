import { HUNDRED_TIPS } from "@/lib/hundredTips";
import { Lightbulb } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default function TipsPage() {
  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <HeroBanner
        variant="hero"
        title="100 نصيحة ذهبية للتفوق الدراسي والامتحانات"
        description="مجموعة مختارة بعناية من أفضل النصائح والتوجيهات لبناء شخصية دراسية قوية، إدارة وقتك بفعالية، وتحقيق التفوق بكل ثقة."
        icon={Lightbulb}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HUNDRED_TIPS.map((tip, index) => (
          <article
            key={index}
            className="feature-card feature-card-soft flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-5">
              <span className="badge-accent tabular-nums">
                نصيحة {index + 1}
              </span>
              <span className="icon-tile !w-10 !h-10">
                <Lightbulb className="w-4 h-4" />
              </span>
            </div>

            <p className="text-ink font-medium leading-relaxed text-sm flex-1">
              {tip}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
