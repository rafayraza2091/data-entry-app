import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const schoolName = (formData.get('schoolName') as string) || 'UnknownSchool';
    const className = (formData.get('className') as string) || 'UnknownClass';
    const studentName = (formData.get('studentName') as string) || 'UnknownStudent';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const sanitize = (name: string) => name.replace(/[^a-z0-9\s]/gi, '_').trim();

    const uploadDir = path.join(
      process.cwd(), 
      'public', 
      'uploads', 
      'queries', 
      sanitize(schoolName), 
      sanitize(className), 
      sanitize(studentName)
    );

    // Create the directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedPaths = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const randomString = Math.random().toString(36).substring(2, 8);
      const filename = `query_${Date.now()}_${randomString}.jpg`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);

      // Return the public URL path
      const publicPath = `/uploads/queries/${encodeURIComponent(sanitize(schoolName))}/${encodeURIComponent(sanitize(className))}/${encodeURIComponent(sanitize(studentName))}/${filename}`;
      uploadedPaths.push(publicPath);
    }

    return NextResponse.json({ urls: uploadedPaths }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files', details: error.message }, { status: 500 });
  }
}
