"use client";

import { useEffect, useState } from "react";
import { Library } from "lucide-react";
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
        
        // Fetch from our Server Action which handles session and Prisma logic internally
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

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <HeroBanner 
          title="بطاقات المراجعة (Flashcards)"
          description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
          icon={Library}
          gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-purple-700 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-600">جاري تحميل البطاقات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-12">
        <HeroBanner 
          title="بطاقات المراجعة (Flashcards)"
          description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
          icon={Library}
          gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
        />
        <div className="p-8 text-center bg-purple-50 rounded-2xl border border-purple-100 max-w-2xl mx-auto mt-8 font-arabic" dir="rtl">
          <h3 className="font-bold text-purple-800 text-lg">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <HeroBanner 
        title="بطاقات المراجعة (Flashcards)"
        description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
        icon={Library}
        gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
      />

      {cards.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm font-arabic" dir="rtl">
          <Library className="w-16 h-16 text-purple-800 mx-auto mb-4" />
          <h3 className="font-black text-xl text-purple-900">لا توجد بطاقات متاحة حالياً</h3>
          <p className="text-slate-500 font-medium mt-2">ستظهر بطاقات المراجعة الخاصة بمستواك وشعبتك هنا قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map(card => (
            <FlipCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
