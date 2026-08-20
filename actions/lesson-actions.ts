'use server'

import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import { Stream } from '@/generated/prisma'

export async function createPublishedLesson(formData: FormData) {
  const title = formData.get('title') as string
  const month = parseInt(formData.get('month') as string)
  const vimeoVideoId = formData.get('vimeoVideoId') as string
  const subjectIds = formData.getAll('subjects') as string[]
  const streams = formData.getAll('streams') as Stream[]
  const files = formData.getAll('files') as any[]

  const uploadDir = join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  const uploadedMaterials = await Promise.all(
    files.filter(f => f.size > 0).map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uniqueId = randomUUID()
      const storagePath = join(uploadDir, uniqueId)
      
      await writeFile(storagePath, buffer)
      
      const savedFile = await prisma.file.create({
        data: {
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          storagePath: uniqueId,
        }
      })
      
      return {
        title: file.name,
        fileUrl: `/api/files/${savedFile.id}`,
      }
    })
  )

  const lesson = await prisma.lesson.create({
    data: {
      title,
      month,
      vimeoVideoId,
      subjects: {
        connect: subjectIds.map(id => ({ id }))
      },
      streams,
      materials: {
        create: uploadedMaterials
      }
    }
  })

  revalidatePath('/dashboard/admin/lessons')
  return { success: true, lessonId: lesson.id }
}
