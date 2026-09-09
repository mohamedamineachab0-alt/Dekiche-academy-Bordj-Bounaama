import { redirect } from "next/navigation";
import { getForumDetails, getForumMessages } from "@/actions/forums";
import { ForumChatClient } from "@/components/student/ForumChatClient";
import { getTeacherSession } from "@/lib/teacher";

export default async function TeacherChatRoomPage(props: {
  params: Promise<{ forumId: string }>;
}) {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const { forumId } = await props.params;
  const forum = await getForumDetails(forumId);
  if (!forum || !session.subjectIds.includes(forum.subjectId)) {
    redirect("/dashboard/teacher/forums");
  }

  const messages = await getForumMessages(forumId);

  return (
    <ForumChatClient
      initialMessages={messages}
      forum={forum}
      sessionId={session.user.id}
      studentProfile={{
        user: {
          fullName: session.user.fullName,
          role: session.user.role,
          avatarUrl: session.user.avatarUrl,
        },
      }}
      backHref="/dashboard/teacher/forums"
      canSend
    />
  );
}
