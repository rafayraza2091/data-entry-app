import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const entryData = {
      title: data.title,
      className: data.className,
      subject: data.subject,
      edition: parseInt(data.edition, 10),
      publisher: data.publisher,
      school: data.school,
      page: data.page ? parseInt(data.page, 10) : null,
    };

    const existingBook = await prisma.bookEntry.findFirst({
      where: {
        title: entryData.title,
        className: entryData.className,
        subject: entryData.subject,
        edition: entryData.edition,
        publisher: entryData.publisher,
        school: entryData.school,
      }
    });

    if (existingBook) {
      return NextResponse.json({ error: 'This book entry already exists' }, { status: 409 });
    }

    const newEntry = await prisma.bookEntry.create({
      data: entryData,
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating book entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    const whereClause = subject ? { subject } : {};

    const entries = await prisma.bookEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
