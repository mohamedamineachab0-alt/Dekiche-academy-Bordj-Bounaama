"use server";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function getUserSessionProfile() {
  try {
    const sessionId = (await requireUser()).id;

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatarUrl: true,
      }
    });

    return user;
  } catch (error: any) {
    if (error?.digest?.includes("DYNAMIC_SERVER_USAGE") || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Error fetching user session profile:", error);
    return null;
  }
}

export async function updateUserAvatar(avatarUrl: string) {
  try {
    const sessionId = (await requireUser()).id;

    await prisma.user.update({
      where: { id: sessionId },
      data: { avatarUrl },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { error: "حدث خطأ أثناء تحديث الصورة" };
  }
}
