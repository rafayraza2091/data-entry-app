import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: urlPath } = await context.params;
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...urlPath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type (defaulting to jpeg for query images)
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
