import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;

function extensionOf(value: string) {
  const match = value.toLowerCase().match(/\.([a-z0-9]{2,5})(?:$|\?|#)/);
  return match?.[1] || "";
}

function mimeFromExt(ext: string) {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] || "";
}

function sniffBuffer(buffer: Buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("latin1") === "%PDF-") {
    return { ext: "pdf", mime: "application/pdf" };
  }
  if (buffer.length >= 3 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e) {
    return { ext: "png", mime: "image/png" };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (buffer.length >= 3 && buffer.subarray(0, 3).toString("latin1") === "GIF") {
    return { ext: "gif", mime: "image/gif" };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    const head = buffer.subarray(0, Math.min(buffer.length, 16_384)).toString("utf8");
    if (head.includes("word/")) {
      return {
        ext: "docx",
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }
    if (head.includes("ppt/")) {
      return {
        ext: "pptx",
        mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      };
    }
    if (head.includes("xl/")) {
      return {
        ext: "xlsx",
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }
  }
  return { ext: "", mime: "" };
}

function isAllowedSource(src: string, origin: string) {
  if (src.startsWith("/api/files/")) return true;
  try {
    const url = new URL(src, origin);
    if (url.origin === origin && url.pathname.startsWith("/api/files/")) return true;
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabase && url.origin === new URL(supabase).origin) return true;
    return (
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.includes("/storage/v1/object/")
    );
  } catch {
    return false;
  }
}

function fileIdFromPath(pathname: string) {
  const match = pathname.match(/\/api\/files\/([^/?#]+)/);
  return match?.[1] || null;
}

function htmlPage(body: string) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    body{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif;padding:24px;color:#2e1065;line-height:1.8;background:#fff;margin:0}
    img{max-width:100%;height:auto}
    table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px}
    th,td{border:1px solid #e9d5ff;padding:8px 10px;text-align:right}
    th{background:#f5f3ff}
    h2{font-size:1.1rem;margin:1.5rem 0 .5rem}
    iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
    html,body.office{height:100%;padding:0;overflow:hidden}
  </style></head><body>${body}</body></html>`;
}

async function loadLocalApiFile(id: string) {
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return null;
  const buffer = await readFile(join(process.cwd(), "uploads", file.storagePath));
  return {
    buffer,
    mime: file.mimeType || mimeFromExt(extensionOf(file.originalName)),
    name: file.originalName,
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const src = requestUrl.searchParams.get("src");
  const hintedName = requestUrl.searchParams.get("name") || "";
  if (!src) {
    return new NextResponse("Missing file", { status: 400 });
  }

  if (!isAllowedSource(src, requestUrl.origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    let buffer: Buffer;
    let mime = "application/octet-stream";
    let name = hintedName || "file";
    let publicUrl: string | null = null;

    const absolute = src.startsWith("/") ? new URL(src, requestUrl.origin) : new URL(src);
    const localId = fileIdFromPath(absolute.pathname);
    const isLocalApi =
      Boolean(localId) &&
      (src.startsWith("/api/files/") || absolute.origin === requestUrl.origin);

    if (isLocalApi && localId) {
      const local = await loadLocalApiFile(localId);
      if (!local) return new NextResponse("File not found", { status: 404 });
      buffer = local.buffer;
      mime = local.mime;
      name = hintedName || local.name;
    } else {
      publicUrl = src;
      const remote = await fetch(src, { cache: "no-store", redirect: "follow" });
      if (!remote.ok) {
        return new NextResponse("File not found", { status: 404 });
      }
      if (!isAllowedSource(remote.url, requestUrl.origin)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
      const bytes = await remote.arrayBuffer();
      buffer = Buffer.from(bytes);
      mime = remote.headers.get("content-type")?.split(";")[0].trim() || mime;
      const disposition = remote.headers.get("content-disposition") || "";
      const named = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      if (named?.[1]) name = decodeURIComponent(named[1].replace(/"/g, ""));
      else if (!hintedName) name = decodeURIComponent(src.split("/").pop() || name);
    }

    if (buffer.length > MAX_BYTES) {
      return new NextResponse("File too large", { status: 413 });
    }

    const sniffed = sniffBuffer(buffer);
    const fileExt = sniffed.ext || extensionOf(name) || extensionOf(src);
    if (sniffed.mime) mime = sniffed.mime;
    else if (!mime || mime === "application/octet-stream" || mime === "binary/octet-stream") {
      mime = mimeFromExt(fileExt) || mime;
    }

    const isPdf = fileExt === "pdf" || mime.includes("pdf");
    const asciiName = isPdf ? "preview.pdf" : `preview.${fileExt || "bin"}`;

    if (fileExt === "docx" || mime.includes("wordprocessingml")) {
      const result = await mammoth.convertToHtml({ buffer });
      return new NextResponse(htmlPage(result.value || "<p>الملف فارغ.</p>"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (fileExt === "xlsx" || fileExt === "xls" || mime.includes("spreadsheet")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheets = workbook.SheetNames.map((sheetName) => {
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName] || {});
        return `<h2>${sheetName}</h2>${html}`;
      }).join("");
      return new NextResponse(htmlPage(sheets || "<p>الملف فارغ.</p>"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if ((fileExt === "pptx" || fileExt === "ppt" || mime.includes("presentation")) && publicUrl) {
      const viewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
      return new NextResponse(
        htmlPage(`<iframe src="${viewer}" title="معاينة العرض"></iframe>`).replace(
          "<body>",
          '<body class="office">'
        ),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": isPdf ? "application/pdf" : mime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${asciiName}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("file-preview", error);
    return new NextResponse("Preview failed", { status: 500 });
  }
}
