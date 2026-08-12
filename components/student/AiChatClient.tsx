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

    setMessages(prev => [...prev, { role: "user", content: newPrompt }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          prompt: newPrompt,
          studentName,
          studentLevel,
          studentStream,
          studentPoints,
          studentMistakes
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطا اثناء الاتصال');
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "حدث خطا اثناء الاتصال بالمساعد الذكي" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] bg-notebook-grid relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center text-center space-y-4 w-full max-w-md p-6 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-3xl shadow-sm">
              <Bot className="w-16 h-16 text-purple-600/50" />
              <div>
                <p className="text-purple-800 font-black text-xl">مرحباً بك!</p>
                <p className="text-slate-600 font-bold mt-2">{greetingText}</p>
                <p className="text-slate-500 font-medium mt-2">أنا هنا لمساعدتك في دراستك ومراجعة أخطائك وشرح أي درس تحتاجه.</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"}`}>
            
            <div className={`w-10 h-10 rounded-2xl flex shrink-0 items-center justify-center shadow-sm border overflow-hidden ${msg.role === "user" ? "bg-white border-slate-200" : "bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500"}`}>
              {msg.role === "user" ? (
                userAvatarUrl ? <img src={userAvatarUrl} alt="الطالب" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-400" />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>

            <div className={`px-6 py-4 rounded-3xl whitespace-pre-wrap leading-relaxed shadow-sm text-[15px] font-bold ${
              msg.role === "user" 
                ? "bg-white border border-purple-100 text-purple-800 rounded-tl-none" 
                : "bg-purple-50 text-purple-800 rounded-tr-none border border-purple-100"
            }`}>
              {msg.content}
            </div>

          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-[85%] ml-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 flex shrink-0 items-center justify-center shadow-sm border border-purple-500">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="px-6 py-4 rounded-3xl bg-white border border-slate-200 rounded-tr-none flex items-center gap-3 text-purple-700 font-bold text-sm shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              جاري المعالجة والرد..
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full sticky bottom-0 z-10 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 p-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="اسألني عن دروسك أو تماريني.."
            className="flex-1 min-w-0 px-4 py-3 bg-white border border-slate-200 rounded-xl text-purple-700 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center shadow-sm shrink-0 whitespace-nowrap"
          >
            إرسال
          </button>
        </form>
      </div>

    </div>
  );
}
