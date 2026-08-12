"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { askStudentAssistant, ChatMessage } from "@/actions/ai";

export function AiChatClient({ 
  studentId, 
  greetingText, 
  userAvatarUrl,
  studentName,
  studentLevel,
  studentStream,
  studentPoints,
  studentMistakes
}: { 
  studentId: string, 
  greetingText: string, 
  userAvatarUrl?: string | null,
  studentName?: string,
  studentLevel?: string,
  studentStream?: string,
  studentPoints?: number,
  studentMistakes?: string
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          studentId,
          studentLevel,
          studentStream,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'حدث خطا اثناء الاتصال');
      }

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

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
        
        setMessages(prev => {
          const newArr = [...prev];
          newArr[newArr.length - 1].content = streamedResponse;
          return newArr;
        });
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: error.message || "حدث خطا اثناء الاتصال بالمساعد الذكي" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] relative font-sans">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center text-center space-y-4 w-full max-w-md p-8 bg-[#FFFFFF] border-[3px] border-[#000000] rounded-3xl shadow-3d-soft paper-cut relative overflow-hidden">
              <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center mb-2 transform rotate-3 shadow-sm relative z-10">
                <Bot className="w-10 h-10 text-[#000000]" />
              </div>
              <div className="relative z-10">
                <p className="text-[#000000] font-black text-2xl">مرحباً بك!</p>
                <p className="text-gray-600 font-bold mt-2 bg-[#EAE4D9] inline-block px-3 py-1 rounded-lg border-[2px] border-[#000000]">{greetingText}</p>
                <p className="text-[#000000] font-black mt-4 leading-relaxed bg-[#F8F9FA] p-3 rounded-xl border-[2px] border-[#000000] shadow-sm">
                  أنا هنا لمساعدتك في دراستك ومراجعة أخطائك وشرح أي درس تحتاجه.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"}`}>
            
            <div className={`w-12 h-12 rounded-xl flex shrink-0 items-center justify-center shadow-sm border-[3px] border-[#000000] overflow-hidden transform ${msg.role === "user" ? "bg-white rotate-3" : "bg-[#7E22CE] -rotate-3"}`}>
              {msg.role === "user" ? (
                userAvatarUrl ? <img src={userAvatarUrl} alt="الطالب" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-[#000000]" strokeWidth={2.5} />
              ) : (
                <Bot className="w-7 h-7 text-white" strokeWidth={2.5} />
              )}
            </div>

            <div className={`px-5 py-4 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm text-base font-bold border-[3px] border-[#000000] ${
              msg.role === "user" 
                ? "bg-[#EAE4D9] text-[#000000] rounded-tl-none" 
                : "bg-[#FFFFFF] text-[#000000] rounded-tr-none paper-cut"
            }`}>
              {msg.content}
            </div>

          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-[85%] ml-auto">
            <div className="w-12 h-12 rounded-xl bg-[#7E22CE] border-[3px] border-[#000000] flex shrink-0 items-center justify-center shadow-sm transform -rotate-3">
              <Bot className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-[#FFFFFF] border-[3px] border-[#000000] rounded-tr-none flex items-center gap-3 text-[#000000] font-black text-sm shadow-sm paper-cut">
              <Loader2 className="w-6 h-6 animate-spin text-[#7E22CE]" />
              جاري المعالجة والرد..
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full sticky bottom-0 z-10 bg-[#F8F9FA] border-t-[3px] border-[#000000] shrink-0 p-4">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="اسألني عن دروسك أو تماريني.."
            className="flex-1 min-w-0 px-5 py-4 bg-white border-[3px] border-[#000000] rounded-xl text-[#000000] font-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all disabled:opacity-50 shadow-inner text-base"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#FACC15] hover:bg-[#FACC15] disabled:bg-gray-200 disabled:text-gray-400 text-[#000000] border-[3px] border-[#000000] font-black text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center shadow-sm shrink-0 whitespace-nowrap hover:-translate-y-1 hover:shadow-3d-hover disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            إرسال
          </button>
        </form>
      </div>

    </div>
  );
}
