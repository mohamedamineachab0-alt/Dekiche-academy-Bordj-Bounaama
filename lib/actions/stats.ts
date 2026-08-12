"use server";

import { prisma } from "@/lib/prisma";

export async function getWilayaStats() {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      studentProfile: {
        select: {
          wilaya: true
        }
      }
    }
  });

  const stats = users.reduce((acc: Record<string, number>, user: any) => {
    const wilaya = user.studentProfile?.wilaya || "Unknown";
    acc[wilaya] = (acc[wilaya] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(stats).map(key => ({
    wilaya: key,
    count: stats[key]
  })).sort((a, b) => b.count - a.count);
}
