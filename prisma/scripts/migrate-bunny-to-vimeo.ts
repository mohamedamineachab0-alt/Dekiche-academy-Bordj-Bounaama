import { Client } from 'pg'
import { Vimeo } from '@vimeo/vimeo'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { pipeline } from 'stream/promises'

// Environment variables
const DB_URL = process.env.DIRECT_URL || 'postgresql://neondb_owner:npg_sKIZfr5jVN0i@ep-bitter-cherry-b5q85yfk.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require'
const CLIENT_ID = process.env.VIMEO_CLIENT_ID || '2755a22d8840c429934dac8991b335df2f28f810'
const CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET || 'zUAYHj2srmHrm5T2b28KnMRX0QlQ5QqheyBSYrFQD2JPfVsV1VkSCey4BM9INIJ32ud6Ydtc4kLqlVk18wb3FY7myfGMV6HYXZXyBLf4tZERB1i8xzidnfn+rAsODwjF'
const ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN || 'c43079199931f07975da832cf5a35ffa'
const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || 'vz-08fda30d-f55.b-cdn.net'

const vimeoClient = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN)

async function downloadBunnyVideo(bunnyGuid: string, destinationPath: string): Promise<boolean> {
  const candidateUrls = [
    `https://${BUNNY_CDN_HOSTNAME}/${bunnyGuid}/play_720p.mp4`,
    `https://${BUNNY_CDN_HOSTNAME}/${bunnyGuid}/original`,
    `https://${BUNNY_CDN_HOSTNAME}/${bunnyGuid}/play_480p.mp4`,
    `https://${BUNNY_CDN_HOSTNAME}/${bunnyGuid}/play_360p.mp4`
  ]

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'Referer': 'https://iframe.mediadelivery.net'
        }
      })

      if (res.ok && res.body) {
        // Stream download to file
        const fileStream = fs.createWriteStream(destinationPath)
        // @ts-ignore
        await pipeline(res.body, fileStream)
        const stats = fs.statSync(destinationPath)
        if (stats.size > 1000) {
          return true
        }
      }
    } catch {
      // Try next URL
    }
  }

  return false
}

function uploadToVimeo(filePath: string, title: string): Promise<string> {
  return new Promise((resolve, reject) => {
    vimeoClient.upload(
      filePath,
      {
        name: title,
        description: 'Transferred from Bunny.net to Vimeo - Dekiche Academy',
        privacy: {
          view: 'unlisted', // unlisted or disable for embedded only
          embed: 'whitelist'
        }
      },
      (uri: string) => {
        // uri format: "/videos/123456789"
        const videoId = uri.split('/').pop() || ''
        resolve(videoId)
      },
      (bytesUploaded: number, bytesTotal: number) => {
        const pct = Math.round((bytesUploaded / bytesTotal) * 100)
        process.stdout.write(`       Uploading to Vimeo: ${pct}%\r`)
      },
      (error: any) => {
        reject(error)
      }
    )
  })
}

async function main() {
  console.log('🚀 Starting Bunny.net to Vimeo video migration...')

  const pgClient = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  })

  await pgClient.connect()
  console.log('✅ Connected to database.')

  // Fetch all lessons with Bunny GUIDs
  const res = await pgClient.query(`
    SELECT id, title, "vimeoVideoId" 
    FROM "Lesson" 
    WHERE "vimeoVideoId" ~ '^[0-9a-fA-F-]{36}$'
    ORDER BY "createdAt" ASC;
  `)

  const lessons = res.rows
  console.log(`📋 Found ${lessons.length} lessons with Bunny.net videos to migrate.\n`)

  if (lessons.length === 0) {
    console.log('🎉 No Bunny videos found needing migration. All videos are already on Vimeo!')
    await pgClient.end()
    return
  }

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    const bunnyGuid = lesson.vimeoVideoId.trim()
    const tempFile = path.join(os.tmpdir(), `bunny_migrate_${bunnyGuid}.mp4`)

    console.log(`\n▶️ [${i + 1}/${lessons.length}] "${lesson.title}"`)
    console.log(`   Bunny GUID: ${bunnyGuid}`)

    try {
      process.stdout.write('   ⏳ Downloading from Bunny.net CDN...')
      const downloaded = await downloadBunnyVideo(bunnyGuid, tempFile)

      if (!downloaded) {
        console.log('\n   ❌ Failed to download video from Bunny.net. Skipping.')
        failCount++
        continue
      }

      const sizeMB = (fs.statSync(tempFile).size / (1024 * 1024)).toFixed(1)
      console.log(` Done! (${sizeMB} MB)`)

      console.log('   ⏳ Uploading to Vimeo...')
      const newVimeoId = await uploadToVimeo(tempFile, lesson.title)
      console.log(`\n   ✅ Uploaded to Vimeo! New Vimeo ID: ${newVimeoId}`)

      // Update database
      await pgClient.query(`
        UPDATE "Lesson" 
        SET "vimeoVideoId" = $1 
        WHERE id = $2
      `, [newVimeoId, lesson.id])

      console.log(`   💾 Database updated: Lesson ${lesson.id} -> ${newVimeoId}`)
      successCount++
    } catch (err: any) {
      console.error(`\n   ❌ Error migrating lesson "${lesson.title}":`, err?.message || err)
      failCount++
    } finally {
      // Remove temporary file
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile)
        } catch {}
      }
    }
  }

  console.log('\n=============================================')
  console.log('🎉 Migration Completed!')
  console.log(`   ✅ Successfully migrated: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📊 Remaining Bunny videos: ${lessons.length - successCount}`)
  console.log('=============================================')

  await pgClient.end()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
