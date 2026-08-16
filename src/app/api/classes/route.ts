import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedClasses, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check for duplicate entry (same name)
    const existingClass = await prisma.classEntry.findFirst({
      where: {
        name: { equals: data.name },
      }
    });

    if (existingClass) {
      return NextResponse.json({ error: 'Class already exists' }, { status: 409 });
    }

    const newClass = await prisma.classEntry.create({
      data: {
        name: data.name,
      },
    });

    // Invalidate cache immediately
    revalidateCacheTag('classes');
    revalidateCacheTag('task-users');
    revalidatePath('/class');
    revalidatePath('/view-data');

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class entry:', error);
    return NextResponse.json({ error: 'Failed to create class', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const classes = await getCachedClasses();
    return NextResponse.json(classes, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch classes', details: error.message }, { status: 500 });
  }
}
