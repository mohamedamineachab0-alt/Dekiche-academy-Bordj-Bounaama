import { redirect } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { revalidatePath } from "next/cache";

export default async function AdminMessagesPage() {
  const tickets = await prisma.teacherTicket.findMany({
    include: {
      teacher: { select: { fullName: true, phoneNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  async function replyTicket(formData: FormData) {
    "use server";
    const ticketId = formData.get("ticketId") as string;
    const reply = formData.get("reply") as string;
    if (!ticketId || !reply) return;

    await prisma.teacherTicket.update({
      where: { id: ticketId },
      data: {
        reply,
        status: "REPLIED",
      },
    });
    revalidatePath("/dashboard/admin/messages");
  }

  async function closeTicket(formData: FormData) {
    "use server";
    const ticketId = formData.get("ticketId") as string;
    if (!ticketId) return;

    await prisma.teacherTicket.update({
      where: { id: ticketId },
      data: { status: "CLOSED" },
    });
    revalidatePath("/dashboard/admin/messages");
  }

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <HeroBanner
        variant="hero"
        title="مراسلات الأساتذة"
        description="إدارة الرسائل والاستفسارات الواردة من أساتذة الأكاديمية والرد عليها."
        icon={MessageSquare}
      />

      <div className="surface-panel p-6">
        {tickets.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <MessageSquare className="w-8 h-8 mx-auto mb-4 opacity-50" />
            <p>لا توجد رسائل من الأساتذة حالياً.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="surface-card p-6 border border-line">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-ink">{ticket.subject}</h3>
                    <p className="text-sm text-muted mt-1">
                      من الأستاذ: <span className="font-semibold text-primary">{ticket.teacher.fullName}</span> ({ticket.teacher.phoneNumber})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        ticket.status === "REPLIED"
                          ? "bg-emerald-50 text-emerald-600"
                          : ticket.status === "CLOSED"
                          ? "bg-line text-muted"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {ticket.status === "REPLIED" ? "تم الرد" : ticket.status === "CLOSED" ? "مغلق" : "جديد"}
                    </span>
                    <span className="text-xs text-muted" dir="ltr">
                      {ticket.createdAt.toLocaleString("ar-DZ")}
                    </span>
                  </div>
                </div>

                <div className="bg-surface/50 p-4 rounded-xl border border-line text-ink mb-4 whitespace-pre-wrap">
                  {ticket.message}
                </div>

                {ticket.reply ? (
                  <div className="bg-primary-soft p-4 rounded-xl border border-primary/20 mb-4">
                    <h4 className="font-bold text-primary text-sm mb-2">رد الإدارة:</h4>
                    <p className="text-sm text-primary-dark whitespace-pre-wrap">{ticket.reply}</p>
                  </div>
                ) : (
                  <form action={replyTicket} className="flex flex-col gap-3">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <textarea
                      name="reply"
                      rows={3}
                      className="input-field resize-none"
                      placeholder="اكتب ردك هنا..."
                      required
                    />
                    <div className="flex items-center justify-end gap-3">
                      <button type="submit" className="btn-primary text-sm py-2 px-6">
                        إرسال الرد
                      </button>
                    </div>
                  </form>
                )}

                {ticket.status !== "CLOSED" && (
                  <form action={closeTicket} className="mt-4 flex justify-end">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <button type="submit" className="text-xs text-red-500 hover:underline">
                      إغلاق التذكرة نهائياً
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
