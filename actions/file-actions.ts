"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
} as const;

function detectFileType(bytes: Uint8Array): keyof typeof ALLOWED_TYPES | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && String.fromCharCode(...bytes.slice(0, 8)) === "\x89PNG\r\n\x1a\n") return "png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-") return "pdf";
  return null;
}

function safeName(name: string) {
  return name.normalize("NFKC").replace(/[^\p{L}\p{N}._ -]/gu, "_").replace(/\.{2,}/g, ".").slice(0, 100) || "upload";
}

export async function uploadFiles(formData: FormData) {
  const owner = await requireUser(["ADMIN", "TEACHER", "STUDENT"]);
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length !== 1) return { error: "Upload exactly one file" };

  const file = files[0];
  if (file.size > MAX_FILE_BYTES) return { error: "File exceeds the 2 MB limit" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = detectFileType(bytes);
  if (!extension) return { error: "Only JPEG, PNG, WebP, and PDF files are accepted" };

  const storagePath = `${owner.id}/${randomUUID()}.${extension}`;
  const { error } = await supabaseAdmin.storage.from("private-files").upload(storagePath, bytes, {
    contentType: ALLOWED_TYPES[extension], upsert: false,
  });
  if (error) return { error: "Upload failed" };

  const savedFile = await prisma.file.create({
    data: { originalName: safeName(file.name), mimeType: ALLOWED_TYPES[extension], size: file.size, storagePath, ownerId: owner.id },
  });
  revalidatePath("/files");
  return { success: true, files: [savedFile] };
}

export async function getFiles() {
  await requireUser(["ADMIN"]);
  return prisma.file.findMany({ orderBy: { createdAt: "desc" } });
}
