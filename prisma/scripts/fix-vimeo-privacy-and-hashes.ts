import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { prisma } from "../../lib/prisma";

const VIMEO_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

if (!VIMEO_TOKEN) {
  console.error("❌ VIMEO_ACCESS_TOKEN is missing in .env / .env.local");
  process.exit(1);
}

interface VimeoVideoData {
  id: string;
  name: string;
  hash: string | null;
  playerEmbedUrl: string | null;
  embedPrivacy: string;
  viewPrivacy: string;
}

async function fetchAllVimeoVideos(): Promise<Map<string, VimeoVideoData>> {
  console.log("📡 Fetching all videos from Vimeo account...");
  let url: string | null = "https://api.vimeo.com/me/videos?per_page=100";
  const map = new Map<string, VimeoVideoData>();

  while (url) {
    console.log(`   GET ${url}`);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VIMEO_TOKEN}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
    });

    if (!res.ok) {
      console.error(`   ❌ Vimeo API error: ${res.status} ${await res.text()}`);
      break;
    }

    const json = await res.json();
    for (const item of json.data) {
      const vid = item.uri.split("/").pop() as string;
      const hashMatch = item.player_embed_url?.match(/[?&]h=([a-zA-Z0-9]+)/);
      const hash = hashMatch ? hashMatch[1] : null;

      map.set(vid, {
        id: vid,
        name: item.name || "",
        hash,
        playerEmbedUrl: item.player_embed_url || null,
        embedPrivacy: item.privacy?.embed || "",
        viewPrivacy: item.privacy?.view || "",
      });
    }

    url = json.paging?.next ? `https://api.vimeo.com${json.paging.next}` : null;
  }

  console.log(`✅ Loaded ${map.size} total videos from Vimeo.`);
  return map;
}

async function patchVimeoPrivacy(videoId: string, title: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VIMEO_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        privacy: {
          embed: "public",
          view: "unlisted",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`   ❌ Failed to patch video ${videoId} ("${title}"): ${res.status} ${err}`);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error(`   ❌ Error patching video ${videoId}:`, err?.message || err);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Vimeo privacy & hash synchronization...");

  // 1. Fetch all videos from Vimeo
  const vimeoMap = await fetchAllVimeoVideos();

  // 2. Check and fix embed privacy for each video on Vimeo
  console.log("\n🔒 Auditing & fixing Vimeo video privacy settings (embed: 'public', view: 'unlisted')...");
  let patchedCount = 0;
  let alreadyPublicCount = 0;
  let patchFailedCount = 0;

  // Process in small concurrent batches
  const videosArray = Array.from(vimeoMap.values());
  const batchSize = 5;

  for (let i = 0; i < videosArray.length; i += batchSize) {
    const batch = videosArray.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (v) => {
        if (v.embedPrivacy !== "public") {
          console.log(`   🔧 Fixing privacy for video ${v.id} ("${v.name}"): [${v.embedPrivacy}] -> [public]`);
          const ok = await patchVimeoPrivacy(v.id, v.name);
          if (ok) {
            v.embedPrivacy = "public";
            patchedCount++;
          } else {
            patchFailedCount++;
          }
        } else {
          alreadyPublicCount++;
        }
      })
    );
  }

  console.log(`\n📊 Privacy Audit Result:`);
  console.log(`   - Already public embed: ${alreadyPublicCount}`);
  console.log(`   - Successfully patched to public embed: ${patchedCount}`);
  console.log(`   - Failed to patch: ${patchFailedCount}`);

  // 3. Update database lessons with exact videoId:hash
  console.log("\n💾 Synchronizing Lesson records in Neon DB with Vimeo hashes...");
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      title: true,
      vimeoVideoId: true,
      youtubeVideoId: true,
    },
  });

  let dbUpdatedCount = 0;
  let dbAlreadyCorrectCount = 0;
  let dbNoVimeoCount = 0;
  let dbNotFoundOnVimeoCount = 0;

  // Create title-to-video map as secondary fallback
  const vimeoByTitle = new Map<string, VimeoVideoData>();
  for (const v of vimeoMap.values()) {
    if (v.name?.trim()) {
      vimeoByTitle.set(v.name.trim().toLowerCase(), v);
    }
  }

  for (const lesson of lessons) {
    const rawVimeo = lesson.vimeoVideoId?.trim() || "";

    // If already has hash, e.g. "1238241975:1c33965b88"
    if (rawVimeo.includes(":") && /^\d+:[a-zA-Z0-9]+$/.test(rawVimeo)) {
      dbAlreadyCorrectCount++;
      continue;
    }

    let targetVideo: VimeoVideoData | undefined;

    // Check if numeric ID matches
    if (/^\d+$/.test(rawVimeo)) {
      targetVideo = vimeoMap.get(rawVimeo);
    }

    // Secondary fallback: match by exact title if no vimeo video id or not found
    if (!targetVideo && lesson.title?.trim()) {
      targetVideo = vimeoByTitle.get(lesson.title.trim().toLowerCase());
    }

    if (targetVideo && targetVideo.hash) {
      const formattedVimeoId = `${targetVideo.id}:${targetVideo.hash}`;
      if (rawVimeo !== formattedVimeoId) {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { vimeoVideoId: formattedVimeoId },
        });
        console.log(`   ✅ Lesson "${lesson.title}": ${rawVimeo || "(none)"} -> ${formattedVimeoId}`);
        dbUpdatedCount++;
      } else {
        dbAlreadyCorrectCount++;
      }
    } else if (rawVimeo) {
      console.warn(`   ⚠️ Lesson "${lesson.title}" has Vimeo ID "${rawVimeo}" but no hash found on Vimeo.`);
      dbNotFoundOnVimeoCount++;
    } else {
      dbNoVimeoCount++;
    }
  }

  console.log(`\n=============================================`);
  console.log(`🎉 Database Sync Completed!`);
  console.log(`   - Total lessons in DB: ${lessons.length}`);
  console.log(`   - Successfully updated with videoId:hash: ${dbUpdatedCount}`);
  console.log(`   - Already had correct format: ${dbAlreadyCorrectCount}`);
  console.log(`   - Lessons without Vimeo (e.g. YouTube): ${dbNoVimeoCount}`);
  console.log(`   - Vimeo IDs not found on Vimeo: ${dbNotFoundOnVimeoCount}`);
}

main()
  .catch((e) => {
    console.error("FATAL ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
