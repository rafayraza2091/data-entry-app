import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.studentName || !data.teacherName || !data.className || !data.subject || !data.queryStatement) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newQuery = await prisma.queryEntry.create({
      data: {
        studentName: data.studentName,
        teacherName: data.teacherName,
        className: data.className,
        schoolName: data.schoolName || '',
        subject: data.subject,
        book: data.book || null,
        chapter: data.chapter || null,
        topic: data.topic || null,
        exercise: data.exercise || null,
        pageNumber: data.pageNumber || null,
        queryStatement: data.queryStatement,
        status: data.status || 'open',
        images: data.images || [],
        createdBy: data.createdBy || '',
      },
    });

    return NextResponse.json(newQuery, { status: 201 });
  } catch (error: any) {
    console.error('Error creating query entry:', error);
    return NextResponse.json({ error: 'Failed to create query entry', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const queries = await prisma.queryEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(queries, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching queries:', error);
    return NextResponse.json({ error: 'Failed to fetch queries', details: error.message }, { status: 500 });
  }
}
