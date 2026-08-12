import { NextResponse } from 'next/server';
import { Vimeo } from '@vimeo/vimeo';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CLIENT_ID = process.env.VIMEO_CLIENT_ID;
const CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET;
const ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

// Initialize Vimeo client
const client = new Vimeo(CLIENT_ID || '', CLIENT_SECRET || '', ACCESS_TOKEN || '');

export async function POST(req: Request) {
  if (!CLIENT_ID || !CLIENT_SECRET || !ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Vimeo API credentials are not configured' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'New Lesson Video';
    const description = formData.get('description') as string || 'Uploaded from Number One Academy';

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Convert file to Buffer and save to a temporary location
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a temporary file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `vimeo-upload-${Date.now()}-${file.name}`);
    
    await fs.promises.writeFile(tempFilePath, buffer);

    // Upload to Vimeo
    return new Promise<NextResponse>((resolve) => {
      client.upload(
        tempFilePath,
        {
          name: title,
          description: description,
        },
        function (uri: string) {
          // Clean up the temp file after upload finishes
          fs.promises.unlink(tempFilePath).catch(console.error);

          // URI format is "/videos/123456789"
          const videoId = uri.split('/').pop();
          
          resolve(NextResponse.json({ success: true, videoId, uri }));
        },
        function (bytesUploaded: number, bytesTotal: number) {
          // Progress callback - optional logging
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`Vimeo upload progress: ${percentage}%`);
        },
        function (error: any) {
          // Clean up the temp file on error
          fs.promises.unlink(tempFilePath).catch(console.error);
          
          console.error('Failed to upload video to Vimeo:', error);
          resolve(NextResponse.json({ error: 'Failed to upload video to Vimeo', details: error }, { status: 500 }));
        }
      );
    });
  } catch (error) {
    console.error('Error processing upload request:', error);
    return NextResponse.json({ error: 'Internal server error during video upload' }, { status: 500 });
  }
}
