import { MoonStar, BookOpen } from "lucide-react";
import { SoftOrb, SectionDivider } from "@/components/landing/LandingDecor";
import { PRAYER_LABELS, type PrayerTimesPayload } from "@/lib/prayer-times";

const DUAS = [
  {
    text: "رَبِّ زِدْنِي عِلْمًا",
    source: "طه: 114",
  },
  {
    text: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    source: "طه: 25–26",
  },
  {
    text: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    source: "دعاء التيسير",
  },
  {
    text: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا",
    source: "دعاء طلب العلم",
  },
];

export function PrayerDuaSection({ times }: { times: PrayerTimesPayload | null }) {
  return (
    <section
      id="prayer"
      dir="rtl"
      className="py-20 md:py-28 bg-background relative overflow-hidden"
    >
      <SoftOrb tone="indigo" className="w-56 h-56 top-10 end-8 opacity-50" />
      <SoftOrb tone="white" className="w-48 h-48 bottom-8 start-10 opacity-40" />
      <div className="landing-line-grid-ink absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <p className="rule-label justify-center mb-5">
            <span className="shrink-0">برج بونعامة</span>
          </p>
          <h2 className="kufi text-[clamp(1.7rem,3.2vw,2.6rem)] mb-4 text-ink">
            مواقيت الصلاة وأدعية النجاح
          </h2>
          <p className="naskh text-muted text-lg leading-[1.9] mb-5">
            مواقيت اليوم لبلدية برج بونعامة، مع أدعية تُعينك على المذاكرة والتيسير.
          </p>
          <SectionDivider />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <article className="lg:col-span-7 surface-card p-6 md:p-8">
            <div className="flex items-start gap-3 mb-6">
              <span className="icon-tile-solid">
                <MoonStar className="w-5 h-5" />
              </span>
              <div>
                <h3 className="kufi text-xl text-ink">مواقيت الصلاة</h3>
                <p className="text-sm text-muted mt-1">
                  {times?.dateLabel ? `${times.dateLabel}` : "اليوم"}
                  {times?.hijriLabel ? ` · ${times.hijriLabel}` : ""}
                </p>
              </div>
            </div>

            {times ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRAYER_LABELS.map((prayer) => {
                  const isNext = times.nextKey === prayer.key && prayer.key !== "Sunrise";
                  return (
                    <div
                      key={prayer.key}
                      className={`rounded-2xl border p-4 text-center ${
                        isNext
                          ? "border-primary bg-primary text-white"
                          : "border-line bg-surface-muted"
                      }`}
                    >
                      <p
                        className={`text-sm font-bold mb-2 ${
                          isNext ? "text-white/85" : "text-muted"
                        }`}
                      >
                        {prayer.label}
                        {isNext ? " · التالية" : ""}
                      </p>
                      <p
                        className={`text-2xl font-bold tabular-nums ${
                          isNext ? "text-white" : "text-ink"
                        }`}
                        dir="ltr"
                      >
                        {times.times[prayer.key]}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted leading-relaxed">
                تعذّر جلب المواقيت حالياً. أعد تحميل الصفحة بعد قليل.
              </p>
            )}

            {times?.method ? (
              <p className="text-xs text-muted mt-5 leading-relaxed">
                الحساب وفق {times.method}. التوقيت المحلي للجزائر.
              </p>
            ) : null}
          </article>

          <aside className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="kufi text-lg text-ink">أدعية للنجاح والتيسير</h3>
            </div>
            {DUAS.map((dua) => (
              <blockquote key={dua.text} className="surface-card p-5">
                <p className="naskh text-[1.05rem] text-ink leading-[2]">{dua.text}</p>
                <p className="text-xs font-semibold text-muted mt-3">{dua.source}</p>
              </blockquote>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
