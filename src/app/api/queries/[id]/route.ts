import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const data = await request.json();

    const updatedQuery = await prisma.queryEntry.update({
      where: { id },
      data: {
        subject: data.subject,
        book: data.book || null,
        chapter: data.chapter || null,
        topic: data.topic || null,
        exercise: data.exercise || null,
        pageNumber: data.pageNumber || null,
        queryStatement: data.queryStatement,
        status: data.status,
      },
    });

    return NextResponse.json(updatedQuery, { status: 200 });
  } catch (error: any) {
    console.error('Error updating query:', error);
    return NextResponse.json({ error: 'Failed to update query', details: error.message }, { status: 500 });
  }
}
