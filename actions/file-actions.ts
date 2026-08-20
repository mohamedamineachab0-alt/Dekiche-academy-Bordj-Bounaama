'use server'

import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import fs from 'fs'

export async function uploadFiles(formData: FormData) {
  const files = formData.getAll('files') as File[]
  
  if (!files || files.length === 0) return { error: 'No files provided' }

  const uploadDir = join(process.cwd(), 'uploads')
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  
  const savedFiles = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uniqueId = randomUUID()
      const storagePath = join(uploadDir, uniqueId)
      
      await writeFile(storagePath, buffer)
      
      return prisma.file.create({
        data: {
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          storagePath: uniqueId,
        }
      })
    })
  )

  revalidatePath('/files')
  return { success: true, files: savedFiles }
}

export async function getFiles() {
  return prisma.file.findMany({
    orderBy: { createdAt: 'desc' }
  })
}
