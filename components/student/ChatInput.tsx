"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { sendForumMessage } from "@/actions/forums";

type ChatInputProps = {
  forumId: string;
  userId: string;
  isOpen: boolean;
};

export function ChatInput({ forumId, userId, isOpen }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);

  if (!isOpen) {
    return (
      <div className="bg-surface-muted border border-line p-4 rounded-2xl text-center">
        <p className="text-sm font-bold text-primary">تم إغلاق هذا المنتدى من قبل الإدارة لا يمكنك إرسال رسائل جديدة</p>
      </div>
    );
  }

  async function handleSend(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content || !content.trim()) return;

    setIsPending(true);
    await sendForumMessage(forumId, userId, content);
    setIsPending(false);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSend} className="relative flex items-end gap-3">
      <textarea
        name="content"
        rows={1}
        placeholder="اكتب رسالتك هنا.."
        required
        className="input-field min-h-[56px] max-h-[120px] !rounded-2xl resize-y"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
      />
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary h-[56px] !px-6 !rounded-2xl disabled:opacity-50"
      >
        <Send className="w-5 h-5 rtl:rotate-180" />
      </button>
    </form>
  );
}
