import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || (user.role !== "ADMIN" && file.ownerId !== user.id)) return new NextResponse("Not found", { status: 404 });

    const { data, error } = await supabaseAdmin.storage.from("private-files").download(file.storagePath);
    if (error || !data) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(data, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
