import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getForumDetails, getForumMessages } from "@/actions/forums";
import { prisma } from "@/lib/prisma";
import { ForumChatClient } from "@/components/student/ForumChatClient";
import { Lock, Unlock, Key } from "lucide-react";
import Link from "next/link";

export default async function StudentChatRoomPage(props: { params: Promise<{ forumId: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: sessionId },
    include: { user: true }
  });

  if (!studentProfile) redirect("/login");

  const forum = await getForumDetails(params.forumId);
  if (!forum) redirect("/dashboard/student/forums");

  // Security Check 1: Level & Stream match
  if (forum.level !== studentProfile.level || forum.stream !== studentProfile.stream) {
    redirect("/dashboard/student/forums");
  }

  // Security Check 2: Active enrollment in this subject
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: sessionId,
      subjectId: forum.subjectId,
    }
  });

  // Render access denied screen — do NOT redirect to avoid info leaking
  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 font-arabic" dir="rtl">
        <div className="bg-white/90 backdrop-blur-md dark:bg-white/90 rounded-3xl shadow-sm border border-slate-100 dark:border-purple-200 overflow-hidden flex flex-col group max-w-sm mx-auto w-full">
          <div className="h-36 w-full relative bg-slate-100 dark:bg-white overflow-hidden">
            <img src={forum.subject.image || "/placeholder.jpg"} alt={forum.subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <div className="bg-white/80 backdrop-blur-md text-purple-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Lock className="w-3.5 h-3.5" /> مغلق
              </div>
            </div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-black text-lg text-purple-950 dark:text-purple-950 line-clamp-1">{forum.subject.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              هذه الدردشة مقيدة. يجب أن تكون مشتركاً في المادة للوصول إلى هذه الدردشة والمشاركة فيها.
            </p>
            
            <div className="mt-6 mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-purple-800 bg-white/80 backdrop-blur-sm dark:bg-white/80 px-2 py-1 rounded-md">
                الأستاذ {forum.subject.teacherName}
              </span>
            </div>

            <div className="mt-auto space-y-3">
              <div className="relative pointer-events-none opacity-60">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Key className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="أدخل كود الإشتراك" 
                  readOnly
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-950 dark:text-purple-950 font-mono font-bold text-base"
                />
              </div>
              <Link 
                href="/dashboard/student/subjects"
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-purple-950 font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Unlock className="w-4 h-4" />
                تفعيل المادة
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messages = await getForumMessages(params.forumId);

  return (
    <ForumChatClient 
      initialMessages={messages} 
      forum={forum} 
      sessionId={sessionId} 
      studentProfile={studentProfile} 
    />
  );
}
