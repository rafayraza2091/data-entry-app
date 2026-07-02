import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("=> GET /api/classes called!");
  try {
    const classes = await prisma.classEntry.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    const newClass = await prisma.classEntry.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This class already exists' }, { status: 400 });
    }
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
