"use server";

import crypto from "crypto";

export async function createBunnyVideo(title: string) {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;

  if (!libraryId || !apiKey) {
    throw new Error("Bunny.net credentials are not configured in environment variables.");
  }

  // 1. Create the video in Bunny.net
  const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      "AccessKey": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create video: ${err}`);
  }

  const data = await response.json();
  const videoId = data.guid;

  // 2. Generate Authentication Signature for secure TUS client-side upload
  // Expiration time: 24 hours from now
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24; 
  
  const signatureString = `${libraryId}${apiKey}${expirationTime}${videoId}`;
  const signature = crypto.createHash("sha256").update(signatureString).digest("hex");

  return {
    videoId,
    libraryId,
    expirationTime,
    signature,
  };
}

export async function saveVideoToDatabase(videoId: string, title: string) {
  // Placeholder function to save the video GUID to your Prisma/Supabase database
  console.log(`Saving video ${videoId} with title "${title}" to database...`);
  // await prisma.lesson.create({ data: { bunnyVideoId: videoId, title } });
  
  return { success: true };
}
