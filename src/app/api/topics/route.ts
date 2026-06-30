import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Front-end should pass localTopicNumber, we construct the full topic number here
    // or frontend can pass it directly. Let's construct it here for safety, 
    // or just assume data.topicNumber is already formatted.
    // The user said: "the topic number must be as follows: the number of the top chapter would be first, then there should be a point, and then comes the topic number"
    
    // We will assume frontend sends localTopicNumber and chapterNumber
    const formattedTopicNumber = `${data.chapterNumber}.${data.localTopicNumber}`;

    const existingTopic = await prisma.topicEntry.findFirst({
      where: {
        subject: data.subject,
        book: data.book,
        chapterNumber: parseInt(data.chapterNumber, 10),
        topicNumber: formattedTopicNumber,
      }
    });

    if (existingTopic) {
      return NextResponse.json({ error: 'This topic already exists for this chapter' }, { status: 409 });
    }

    const newTopic = await prisma.topicEntry.create({
      data: {
        subject: data.subject,
        book: data.book,
        chapterNumber: parseInt(data.chapterNumber, 10),
        chapterName: data.chapterName,
        topicNumber: formattedTopicNumber,
        topicName: data.topicName,
        exercise: data.exercise || null,
        page: data.page ? parseInt(data.page, 10) : null,
      },
    });

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error: any) {
    console.error('Error creating topic entry:', error);
    return NextResponse.json({ error: 'Failed to create topic', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');
    const chapterNumber = searchParams.get('chapterNumber');

    const whereClause: any = {};
    if (book) whereClause.book = book;
    if (chapterNumber) whereClause.chapterNumber = parseInt(chapterNumber, 10);

    const topics = await prisma.topicEntry.findMany({
      where: whereClause,
      orderBy: [{ subject: 'asc' }, { book: 'asc' }, { chapterNumber: 'asc' }, { topicNumber: 'asc' }],
    });
    return NextResponse.json(topics, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch topics', details: error.message }, { status: 500 });
  }
}
