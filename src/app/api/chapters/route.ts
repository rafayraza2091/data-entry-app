import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const existingChapter = await prisma.chapterEntry.findFirst({
      where: {
        subject: data.subject,
        book: data.book,
        chapterNumber: parseInt(data.chapterNumber, 10),
      }
    });

    if (existingChapter) {
      return NextResponse.json({ error: 'This chapter already exists for this book' }, { status: 409 });
    }

    const newChapter = await prisma.chapterEntry.create({
      data: {
        subject: data.subject,
        book: data.book,
        chapterNumber: parseInt(data.chapterNumber, 10),
        chapterTitle: data.chapterTitle,
        page: data.page ? parseInt(data.page, 10) : null,
      },
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chapter entry:', error);
    return NextResponse.json({ error: 'Failed to create chapter', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');
    const subject = searchParams.get('subject');

    const whereClause: any = {};
    if (book) whereClause.book = book;
    if (subject) whereClause.subject = subject;

    const chapters = await prisma.chapterEntry.findMany({
      where: whereClause,
      orderBy: [{ subject: 'asc' }, { book: 'asc' }, { chapterNumber: 'asc' }],
    });
    return NextResponse.json(chapters, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch chapters', details: error.message }, { status: 500 });
  }
}
