import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check for duplicate entry
    const existingSubject = await prisma.subjectEntry.findFirst({
      where: {
        name: {
          equals: data.name,
        }
      }
    });

    if (existingSubject) {
      return NextResponse.json({ error: 'Subject already exists' }, { status: 409 });
    }
    
    const newSubject = await prisma.subjectEntry.create({
      data: {
        name: data.name,
        code: data.code || null,
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject entry:', error);
    return NextResponse.json({ error: 'Failed to create subject', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subjects = await prisma.subjectEntry.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(subjects, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subjects', details: error.message }, { status: 500 });
  }
}
