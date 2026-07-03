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
        queryStatement: data.queryStatement,
      },
    });

    return NextResponse.json(updatedQuery, { status: 200 });
  } catch (error: any) {
    console.error('Error updating query:', error);
    return NextResponse.json({ error: 'Failed to update query', details: error.message }, { status: 500 });
  }
}
