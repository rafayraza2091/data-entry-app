import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedDataEntries, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      school,
      className,
      subject,
      book,
      edition,
      chapter,
      chapterName,
      topicNumber,
      topicName,
      description,
      exercise,
      page,
      date,
      time,
    } = data;

    if (!subject || !book || chapter === undefined || !topicNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chapterNum = parseInt(chapter, 10) || 0;
    const pageNum = parseInt(page, 10) || 0;
    const editionNum = parseInt(edition, 10) || 1;
    const topicNumStr = (topicNumber || '').toString();

    const existingEntry = await prisma.dataEntry.findFirst({
      where: {
        school: school || '',
        className: className || '',
        subject,
        book,
        chapter: chapterNum,
        topicNumber: topicNumStr,
        exercise: exercise || '',
        page: pageNum,
      },
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'An entry with these exact details already exists' }, { status: 409 });
    }

    const newEntry = await prisma.dataEntry.create({
      data: {
        school: school || '',
        className: className || '',
        subject,
        book,
        edition: editionNum,
        chapter: chapterNum,
        chapterName: chapterName || '',
        topicNumber: topicNumStr,
        topicName: topicName || '',
        description: description || '',
        exercise: exercise || '',
        page: pageNum,
        date: date || new Date().toISOString().split('T')[0],
        time: time || new Date().toLocaleTimeString(),
      },
    });

    // Invalidate cache immediately
    revalidateCacheTag('dataentries');
    revalidatePath('/data-entry');
    revalidatePath('/view-data');

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating data entry:', error);
    return NextResponse.json({ error: 'Failed to create data entry', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await getCachedDataEntries();
    return NextResponse.json(entries, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data entries', details: error.message }, { status: 500 });
  }
}
