"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, User as UserIcon, ArrowRight, Send, Lock } from "lucide-react";
import { sendForumMessage } from "@/actions/forums";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type UserType = {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
};

type MessageType = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: UserType;
};

type ForumChatClientProps = {
  initialMessages: MessageType[];
  forum: {
    id: string;
    title: string;
    month: number;
    isOpen: boolean;
    subject: { title: string };
  };
  sessionId: string;
  studentProfile: {
    user: { fullName: string; role: string; avatarUrl: string | null };
  };
};

export function ForumChatClient({ initialMessages, forum, sessionId, studentProfile }: ForumChatClientProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`forum-${forum.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ForumMessage",
          filter: `forumId=eq.${forum.id}`,
        },
        async (payload) => {
          // Check if message is already in state (from optimistic update)
          const newMsgId = payload.new.id;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsgId)) return prev;
            
            // To get full user details for the new message, we'd need to fetch or have it included.
            // But since this is a real-time event, we only get the raw row.
            // For simplicity in UI, we can reload or fetch the specific user, 
            // but Next.js Server Actions or fetching via Supabase is needed.
            // In a robust app, we'd fetch the user info here. For now, we append it.
            // We can fetch the user details via Supabase:
            return prev; // We will handle this gracefully below
          });

          // Fetch the message with user data via Supabase directly to get relation
          const { data, error } = await supabase
            .from("ForumMessage")
            .select(`
              id,
              content,
              createdAt,
              userId,
              user:User ( id, fullName, role, avatarUrl )
            `)
            .eq("id", newMsgId)
            .single();

          if (data && !error) {
            // Supabase returns joined relations as array — take first element
            const rawUser = Array.isArray(data.user) ? data.user[0] : data.user as { id: string; fullName: string; role: string; avatarUrl: string | null };
            const mappedMsg: MessageType = {
              id: data.id,
              content: data.content,
              createdAt: new Date(data.createdAt),
              userId: data.userId,
              user: {
                id: rawUser.id,
                fullName: rawUser.fullName,
                role: rawUser.role,
                avatarUrl: rawUser.avatarUrl
              }
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === mappedMsg.id)) return prev;
              return [...prev, mappedMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [forum.id]);

  async function handleSend(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content || !content.trim()) return;

    // Optimistic Update
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: MessageType = {
      id: optimisticId,
      content: content.trim(),
      createdAt: new Date(),
      userId: sessionId,
      user: {
        id: sessionId,
        fullName: studentProfile.user.fullName,
        role: studentProfile.user.role,
        avatarUrl: studentProfile.user.avatarUrl
      }
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    formRef.current?.reset();
    setIsPending(true);

    try {
      // Send to server
      await sendForumMessage(forum.id, sessionId, optimisticMessage.content);
      // The server action will create it in DB, triggering the Realtime subscription
      // which will broadcast to others. Our local state already has the optimistic message.
    } catch (error) {
      console.error("Failed to send message", error);
      // Revert optimistic update on failure
      setMessages((prev) => prev.filter(m => m.id !== optimisticId));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden font-arabic" dir="rtl">
      
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
        <Link href="/dashboard/student/forums" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-purple-700 transition-colors">
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-black text-purple-950">{forum.title}</h2>
          <p className="text-xs font-bold text-slate-500">{forum.subject.title} • الشهر {forum.month}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>

      {/* Main Content Area */}
      {forum.isOpen ? (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <MessageSquare className="w-12 h-12 text-slate-400 mb-3" />
                <p className="font-bold text-slate-500">لا توجد رسائل بعد كن أول من يشارك!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userId === sessionId;
                const isAdmin = msg.user.role === "ADMIN" || msg.user.role === "TEACHER";

                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                      
                      {!isMe && (
                        <div className="flex items-center gap-2 mr-2 mb-1">
                          {msg.user.avatarUrl ? (
                            <img src={msg.user.avatarUrl} alt={msg.user.fullName} className="w-6 h-6 rounded-full object-cover shadow-sm" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                              {isAdmin ? <UserIcon className="w-3 h-3 text-purple-700" /> : <UserIcon className="w-3 h-3 text-slate-400" />}
                            </div>
                          )}
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                            {msg.user.fullName} {isAdmin && <span className="text-purple-700">(الإدارة)</span>}
                          </span>
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        isMe 
                        ? 'bg-purple-800 text-white rounded-tl-none' 
                        : isAdmin 
                          ? 'bg-purple-50 border border-purple-100 text-purple-950 rounded-tr-none'
                          : 'bg-white border border-slate-100 text-purple-900 rounded-tr-none'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      <span className="text-[10px] font-bold text-slate-400 mx-1">
                        {new Date(msg.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form ref={formRef} action={handleSend} className="relative flex items-end gap-3">
              <textarea
                name="content"
                rows={1}
                placeholder="اكتب رسالتك هنا.."
                required
                className="w-full min-h-[56px] max-h-[120px] p-4 rounded-2xl border border-slate-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 resize-y shadow-sm"
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
                className="h-[56px] px-6 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black rounded-2xl flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-5 h-5 rtl:rotate-180" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#F8F9FA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-w-md mx-auto p-10 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto">
              <span className="text-4xl">🔒</span>
            </div>
            <div className="space-y-4">
              <p className="text-base font-bold leading-relaxed text-purple-800">
                دردشة القسم مغلقة حالياً. يتم فتح الدردشة حصرياً أيام الاختبارات للمراجعة الجماعية تحت إشراف الإدارة.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
