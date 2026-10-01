"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

// Ensure the caller is an admin
async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, role: true },
  });
  
  if (!user || user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

export async function getPlatformSettings() {
  try {
    const settings = await prisma.platformSetting.findMany();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return {};
  }
}

export async function updatePlatformSetting(key: string, value: string, description?: string) {
  try {
    const adminId = await requireAdmin();
    
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value, description, updatedByAdminId: adminId },
      create: { key, value, description, updatedByAdminId: adminId },
    });
    
    revalidatePath("/dashboard/admin/school");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update setting:", error);
    return { success: false, error: error.message };
  }
}
