import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function verifyLogin(phoneNumber: string, password: string) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; passwordHash: string; failedLoginCount: number; lockedUntil: Date | null }[]>`
      SELECT id, "passwordHash", "failedLoginCount", "lockedUntil"
      FROM "User" WHERE "phoneNumber" = ${phoneNumber} FOR UPDATE`;
    const user = rows[0];
    const now = new Date();
    if (!user || (user.lockedUntil && user.lockedUntil > now)) return null;

    const valid = user.passwordHash.length > 0 && await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const priorFailures = user.lockedUntil && user.lockedUntil <= now ? 0 : user.failedLoginCount;
      const failures = priorFailures + 1;
      await tx.user.update({ where: { id: user.id }, data: {
        failedLoginCount: failures,
        lockedUntil: failures >= MAX_FAILURES ? new Date(now.getTime() + LOCK_MS) : null,
      }});
      return null;
    }

    await tx.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: now } });
    return tx.user.findUnique({ where: { id: user.id }, select: { id: true, role: true } });
  }, { isolationLevel: "Serializable" });
}
