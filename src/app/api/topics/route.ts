import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedTopics, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const topicNumStr = (data.topicNumber || data.localTopicNumber || '').toString();
    
    // Check for duplicate entry (same topicNumber, chapterNumber, and book)
    const existingTopic = await prisma.topicEntry.findFirst({
      where: {
        topicNumber: { equals: topicNumStr },
        chapterNumber: { equals: Number(data.chapterNumber) },
        book: { equals: data.book }
      }
    });

    if (existingTopic) {
      return NextResponse.json({ error: 'Topic with this number already exists for this chapter' }, { status: 409 });
    }

    const newTopic = await prisma.topicEntry.create({
      data: {
        topicNumber: topicNumStr,
        topicName: data.topicName,
        chapterNumber: Number(data.chapterNumber),
        chapterName: data.chapterName || '',
        subject: data.subject || '',
        book: data.book,
        exercise: data.exercise || null,
        page: data.page ? Number(data.page) : null,
      },
    });

    // Invalidate cache immediately
    revalidateCacheTag('topics');
    revalidatePath('/topic');
    revalidatePath('/view-data');

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error: any) {
    console.error('Error creating topic entry:', error);
    return NextResponse.json({ error: 'Failed to create topic', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book') || undefined;
    const chapterNumberStr = searchParams.get('chapterNumber');
    const chapterNumber = chapterNumberStr ? parseInt(chapterNumberStr, 10) : undefined;

    const topics = await getCachedTopics(book, chapterNumber);
    return NextResponse.json(topics, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch topics', details: error.message }, { status: 500 });
  }
}
