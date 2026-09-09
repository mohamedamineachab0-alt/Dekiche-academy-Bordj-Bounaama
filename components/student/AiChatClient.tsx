"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { ChatMessage } from "@/actions/ai";

export function AiChatClient({
  studentId,
  greetingText,
  userAvatarUrl,
  studentLevel,
  studentStream,
}: {
  studentId: string;
  greetingText: string;
  userAvatarUrl?: string | null;
  studentName?: string;
  studentLevel?: string;
  studentStream?: string;
  studentPoints?: number;
  studentMistakes?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newPrompt = input.trim();
    setInput("");
    setIsLoading(true);

    const updatedMessages = [...messages, { role: "user", content: newPrompt }];
    setMessages(updatedMessages as ChatMessage[]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          studentId,
          studentLevel,
          studentStream,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "حدث خطأ أثناء الاتصال");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("فشل قراءة الرد");

      let done = false;
      let streamedResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        streamedResponse += chunkValue;

        setMessages((prev) => {
          const newArr = [...prev];
          newArr[newArr.length - 1].content = streamedResponse;
          return newArr;
        });
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "حدث خطأ أثناء الاتصال بالمساعد الذكي",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface-muted relative font-sans">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full w-full min-h-[16rem]">
            <div className="flex flex-col items-center text-center space-y-4 w-full max-w-md p-7 surface-card">
              <span className="icon-tile-solid !w-16 !h-16">
                <Bot className="w-8 h-8" />
              </span>
              <div>
                <p className="text-ink font-bold text-xl">رفيق السفينة جاهز</p>
                <p className="text-muted text-sm font-medium mt-2 badge-soft inline-flex">
                  {greetingText}
                </p>
                <p className="text-ink text-sm font-medium mt-4 leading-relaxed bg-surface-muted p-3.5 rounded-xl border border-line">
                  اسأل عن درس، تمرين، أو خطأ تكرّر لك. أشرح بالخطوات ومثال من المقرر، ثم تتأكد أنك فهمت.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${
              msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center border border-line overflow-hidden ${
                msg.role === "user" ? "bg-surface" : "bg-primary"
              }`}
            >
              {msg.role === "user" ? (
                userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt="الطالب"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-ink" />
                )
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            <div
              className={`px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm font-medium border border-line ${
                msg.role === "user"
                  ? "bg-primary-soft text-ink rounded-tl-none"
                  : "bg-surface text-ink rounded-tr-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] ml-auto">
            <div className="w-10 h-10 rounded-full bg-primary border border-line flex shrink-0 items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface border border-line rounded-tr-none flex items-center gap-2.5 text-ink text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              جاري المعالجة والرد..
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="w-full sticky bottom-0 z-10 bg-surface border-t border-line shrink-0 p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full flex items-center gap-3 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="مثال: اشرح لي المشتقة بخطوات"
            className="input-field flex-1 min-w-0 !py-3.5"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
}
