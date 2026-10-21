import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const videoPath = path.join(process.cwd(), "uploads", "videos", safeFilename);

    if (!fs.existsSync(videoPath)) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    // Determine MIME type
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".ogg": "video/ogg",
      ".mov": "video/quicktime",
      ".mkv": "video/x-matroska",
      ".m4v": "video/mp4",
    };
    const contentType = mimeMap[ext] || "video/mp4";

    if (range) {
      // Parse Range header (e.g. "bytes=0-1048576" or "bytes=1048576-")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(videoPath, { start, end });

      // @ts-ignore - ReadableStream from node stream
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, immutable",
        },
      });
    } else {
      // Full file streaming
      const fileStream = fs.createReadStream(videoPath);

      // @ts-ignore
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600, immutable",
        },
      });
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
