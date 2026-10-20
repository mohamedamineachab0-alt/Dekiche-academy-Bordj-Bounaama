import { prisma } from "@/lib/prisma";

/**
 * Check if the platform is currently paused in maintenance mode.
 * Supports environment variable override or database platformSetting.
 */
export async function isMaintenanceActive(): Promise<boolean> {
  // 1. Explicit env override
  if (process.env.MAINTENANCE_MODE === "false") {
    return false;
  }
  if (process.env.MAINTENANCE_MODE === "true") {
    return true;
  }

  // 2. Database Setting check
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "MAINTENANCE_MODE" },
    });
    if (setting) {
      return setting.value === "true";
    }
  } catch (error) {
    console.error("Non-fatal: could not read MAINTENANCE_MODE from database:", error);
  }

  // Active by default as requested by administrator
  return true;
}
