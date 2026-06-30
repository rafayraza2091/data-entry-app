import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const entryData = {
      book: data.book,
      subject: data.subject,
      className: data.className,
      edition: parseInt(data.edition, 10),
      chapter: parseInt(data.chapter, 10),
      chapterName: data.chapterName,
      topicNumber: data.topicNumber,
      topicName: data.topicName,
      description: data.description,
      exercise: data.exercise,
      page: parseInt(data.page, 10),
      date: new Date().toLocaleDateString('en-GB'), // e.g. 29/06/2026
      time: new Date().toLocaleTimeString('en-US'), // e.g. 9:57:43 AM
    };

    const existingEntry = await prisma.dataEntry.findFirst({
      where: {
        subject: entryData.subject,
        book: entryData.book,
        className: entryData.className,
        edition: entryData.edition,
        chapter: entryData.chapter,
        topicNumber: entryData.topicNumber,
        exercise: entryData.exercise,
        page: entryData.page,
        description: entryData.description,
      }
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'This syllabus entry already exists.' }, { status: 400 });
    }

    const newEntry = await prisma.dataEntry.create({
      data: entryData,
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating data entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await prisma.dataEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
