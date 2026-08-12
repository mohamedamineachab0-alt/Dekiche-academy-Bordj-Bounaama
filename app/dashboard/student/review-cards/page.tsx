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
      <div className="space-y-8 font-sans pb-12">
        <HeroBanner 
          title="بطاقات المراجعة (Flashcards)"
          description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
          icon={Library}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#000000] flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-[4px] border-[#000000] border-t-[#FACC15] rounded-full animate-spin"></div>
            <p className="font-black text-lg bg-[#FACC15] px-4 py-2 rounded-xl border-[3px] border-[#000000] shadow-3d-soft transform -rotate-2">جاري تحميل البطاقات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 font-sans pb-12">
        <HeroBanner 
          title="بطاقات المراجعة (Flashcards)"
          description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
          icon={Library}
        />
        <div className="p-8 text-center bg-[#EF4444] rounded-3xl border-[3px] border-[#000000] max-w-2xl mx-auto mt-8 shadow-3d-soft paper-cut transform rotate-1" dir="rtl">
          <h3 className="font-black text-white text-xl">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="بطاقات المراجعة (Flashcards)"
        description="راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك وشعبتك"
        icon={Library}
      />

      {cards.length === 0 ? (
        <div className="p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden" dir="rtl">
          <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center transform -rotate-3 mx-auto mb-6 shadow-sm">
            <Library className="w-10 h-10 text-[#000000]" />
          </div>
          <h3 className="font-black text-2xl text-[#000000] mb-3">لا توجد بطاقات متاحة حالياً</h3>
          <p className="text-gray-600 font-bold max-w-sm mx-auto leading-relaxed">ستظهر بطاقات المراجعة الخاصة بمستواك وشعبتك هنا قريباً</p>
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
