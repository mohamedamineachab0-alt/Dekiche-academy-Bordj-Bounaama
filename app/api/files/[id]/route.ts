import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({ where: { id } })
    
    if (!file) {
      return new NextResponse('File not found', { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const isPreview = searchParams.get('preview') === 'true'

    const filePath = join(process.cwd(), 'uploads', file.storagePath)
    const fileBuffer = await readFile(filePath)
    
    // For preview we can use inline, but for safety with arbitrary files, only inline safe mimes if necessary.
    // The user strictly asked for accept all and view. We'll set inline for preview, attachment otherwise.
    const disposition = isPreview ? 'inline' : 'attachment'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
        'Content-Length': file.size.toString(),
        'X-Content-Type-Options': 'nosniff' 
      },
    })
  } catch (error) {
    console.error('File retrieval error:', error)
    return new NextResponse('Error retrieving file', { status: 500 })
  }
}
