import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getForumDetails, getForumMessages } from "@/actions/forums";
import { prisma } from "@/lib/prisma";
import { ForumChatClient } from "@/components/student/ForumChatClient";
import { Lock, Unlock, Key } from "lucide-react";
import Link from "next/link";
import { formatTeacherName } from "@/lib/education-labels";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 font-sans" dir="rtl">
        <div className="surface-panel overflow-hidden flex flex-col max-w-sm mx-auto w-full">
          <div className="aspect-video w-full relative bg-primary-soft overflow-hidden">
            <img
              src={forum.subject.image || "/placeholder.jpg"}
              alt={forum.subject.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 start-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-muted">
                <Lock className="w-3.5 h-3.5" /> مغلق
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-ink line-clamp-1">{forum.subject.title}</h3>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              هذه الدردشة مقيدة. يجب أن تكون مشتركاً في المادة للوصول إليها.
            </p>

            <div className="mt-5 mb-2">
              <span className="badge-soft">{formatTeacherName(forum.subject.teacherName)}</span>
            </div>

            <div className="mt-auto space-y-3">
              <div className="relative pointer-events-none opacity-60">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="أدخل كود الإشتراك"
                  readOnly
                  className="input-field pr-10 font-mono"
                />
              </div>
              <Link href="/dashboard/student/subjects" className="btn-primary w-full">
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
