"use client";

import { useEffect, useState } from "react";
import { Library, AlertCircle } from "lucide-react";
import { fetchMyReviewCards } from "@/actions/review-cards";
import { FlipCard } from "@/components/student/FlipCard";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default function StudentReviewCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCards = await fetchMyReviewCards();
        setCards(fetchedCards || []);
      } catch (err: any) {
        console.error("Error fetching cards:", err);
        setError(err.message || "حدث خطأ أثناء جلب بطاقات المراجعة");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCards();
  }, []);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="مكتبة المراجعة"
        description="بطاقات مراجعة مرتبطة بكل درس — اقلب البطاقة لكشف الإجابة."
        icon={Library}
        action={
          !isLoading && !error && cards.length > 0 ? (
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center rounded-full glass-pill px-3 py-1.5 text-sm font-bold tabular-nums text-white" dir="ltr">
                {cards.length}
              </span>
              <span className="text-xs text-white/70">بطاقة</span>
            </div>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card p-6 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-surface-muted mb-4" />
              <div className="h-3 w-full rounded bg-surface-muted mb-2" />
              <div className="h-3 w-4/5 rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="surface-card px-6 py-12 text-center" dir="rtl">
          <span className="icon-tile mx-auto mb-5">
            <AlertCircle className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">تعذّر تحميل البطاقات</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">{error}</p>
        </div>
      )}

      {!isLoading && !error && cards.length === 0 && (
        <div className="surface-card px-6 py-16 text-center" dir="rtl">
          <span className="icon-tile mx-auto mb-5">
            <Library className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد بطاقات بعد</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            ستظهر هنا بطاقات المراجعة الخاصة بمستواك وشعبتك فور نشرها.
          </p>
        </div>
      )}

      {!isLoading && !error && cards.length > 0 && (
        <div className="space-y-8">
          {Object.entries(
            cards.reduce((groups: Record<string, typeof cards>, card) => {
              const key = card.lesson?.title || card.subject.title;
              if (!groups[key]) groups[key] = [];
              groups[key].push(card);
              return groups;
            }, {})
          ).map(([lessonTitle, lessonCards]) => (
            <section key={lessonTitle} className="space-y-4">
              <div className="flex items-center justify-between gap-3 px-1">
                <h2 className="text-base font-bold text-ink">{lessonTitle}</h2>
                <span className="badge-outline tabular-nums">{lessonCards.length} بطاقة</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {lessonCards.map((card) => (
                  <FlipCard key={card.id} card={card} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
