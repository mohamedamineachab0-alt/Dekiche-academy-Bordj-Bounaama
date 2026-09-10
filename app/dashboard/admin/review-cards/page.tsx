import { prisma } from "@/lib/prisma";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { Library, Trash2 } from "lucide-react";
import { createReviewCard } from "@/actions/review-cards";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ReviewCardFormClient } from "@/components/admin/ReviewCardFormClient";
import { MathPreview } from "@/components/shared/MathPreview";

export default async function AdminReviewCardsPage() {
  const cards = await prisma.reviewCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, phase: true, levels: true, streams: true },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="بطاقات المراجعة"
        description="أنشئ بطاقات مراجعة سريعة لمساعدة التلاميذ على تذكر المعلومات الأساسية."
        icon={Library}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReviewCardFormClient
            subjects={subjects.map((s) => ({
              id: s.id,
              title: s.title,
              phase: s.phase,
              levels: s.levels,
              streams: s.streams,
            }))}
            action={async (formData: FormData) => {
              "use server";
              await createReviewCard(formData);
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => {
              const levelStr = labelLevel(card.level);
              const streamStr = labelStream(card.stream);

              return (
                <article key={card.id} className="surface-card p-6 flex flex-col relative group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-ink text-lg">{card.title}</h3>
                    <form
                      action={async () => {
                        "use server";
                        await prisma.reviewCard.delete({ where: { id: card.id } });
                      }}
                    >
                      <button
                        type="submit"
                        className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  <div className="space-y-3 mt-2 flex-1">
                    <div>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">
                        السؤال
                      </span>
                      <div className="text-sm font-semibold text-primary bg-surface p-3 rounded-xl border border-line">
                        <MathPreview text={card.question} className="text-sm font-semibold text-primary leading-relaxed" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">
                        الجواب
                      </span>
                      <div className="text-sm text-ink bg-primary-soft p-3 rounded-xl border border-line">
                        <MathPreview text={card.answer} className="text-sm text-ink leading-relaxed" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-line flex flex-wrap gap-2">
                    <span className="badge-soft">{card.subject.title}</span>
                    <span className="badge-outline">
                      {levelStr} · {streamStr}
                    </span>
                    {card.exerciseRef && <span className="badge-outline">{card.exerciseRef}</span>}
                  </div>
                </article>
              );
            })}
            {cards.length === 0 && (
              <div className="col-span-full surface-card px-6 py-16 text-center">
                <span className="icon-tile mx-auto mb-4">
                  <Library className="w-5 h-5" />
                </span>
                <p className="text-sm text-muted">لا توجد بطاقات مراجعة مسجّلة بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
