"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function linkFriend(friendCode: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { error: "غير مصرح" };
    }

    const trimmedCode = friendCode.trim();
    if (!trimmedCode) {
      return { error: "رمز الصديق غير صحيح" };
    }

    const friendProfile = await prisma.studentProfile.findUnique({
      where: { friendCode: trimmedCode }
    });

    if (!friendProfile) {
      return { error: "لم يتم العثور على حساب بهذا الرمز" };
    }

    if (friendProfile.userId === sessionId) {
      return { error: "لا يمكنك إضافة نفسك" };
    }

    const existingLink = await prisma.studentFriendLink.findFirst({
      where: {
        OR: [
          { studentId: sessionId, friendId: friendProfile.userId },
          { studentId: friendProfile.userId, friendId: sessionId }
        ]
      }
    });

    if (existingLink) {
      return { error: "أنت وصديقك مرتبطان مسبقا" };
    }

    await prisma.studentFriendLink.create({
      data: {
        studentId: sessionId,
        friendId: friendProfile.userId
      }
    });

    revalidatePath("/dashboard/student/friend-challenge");
    return { success: true };
  } catch (error) {
    console.error("linkFriend error:", error);
    return { error: "حدث خطأ أثناء الربط" };
  }
}

export async function getFriendChallengeData(studentId: string) {
  try {
    const linksAsSource = await prisma.studentFriendLink.findMany({
      where: { studentId },
      include: { friend: { include: { studentProfile: true } } }
    });
    
    const linksAsTarget = await prisma.studentFriendLink.findMany({
      where: { friendId: studentId },
      include: { student: { include: { studentProfile: true } } }
    });

    const friendsIds = [
      ...linksAsSource.map(l => l.friendId),
      ...linksAsTarget.map(l => l.studentId)
    ];

    const allUserIds = [studentId, ...friendsIds];

    const usersData = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      include: {
        studentProfile: true,
        mistakes: { select: { id: true } },
        enrollments: { select: { id: true } },
      }
    });

    const metrics = usersData.map(u => ({
      id: u.id,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      mistakesCount: u.mistakes.length,
      enrollmentsCount: u.enrollments.length,
      totalPoints: u.studentProfile?.totalPoints || 0
    }));

    // Sort metrics by points descending to show leaderboard
    metrics.sort((a, b) => b.totalPoints - a.totalPoints);

    return { metrics };
  } catch (error) {
    console.error("getFriendChallengeData error:", error);
    return { metrics: [] };
  }
}
