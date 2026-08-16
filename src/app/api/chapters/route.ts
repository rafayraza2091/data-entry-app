import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedChapters, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check for duplicate entry (same chapterNumber, book, and subject)
    const existingChapter = await prisma.chapterEntry.findFirst({
      where: {
        chapterNumber: { equals: Number(data.chapterNumber) },
        book: { equals: data.book },
        subject: { equals: data.subject },
      }
    });

    if (existingChapter) {
      return NextResponse.json({ error: 'Chapter with this number already exists for this book' }, { status: 409 });
    }

    const newChapter = await prisma.chapterEntry.create({
      data: {
        chapterNumber: Number(data.chapterNumber),
        chapterTitle: data.chapterTitle,
        book: data.book,
        subject: data.subject,
        page: data.page ? Number(data.page) : null,
      },
    });

    // Invalidate cache immediately
    revalidateCacheTag('chapters');
    revalidatePath('/chapter');
    revalidatePath('/view-data');

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chapter entry:', error);
    return NextResponse.json({ error: 'Failed to create chapter', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book') || undefined;
    const subject = searchParams.get('subject') || undefined;

    const chapters = await getCachedChapters(book, subject);
    return NextResponse.json(chapters, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch chapters', details: error.message }, { status: 500 });
  }
}
