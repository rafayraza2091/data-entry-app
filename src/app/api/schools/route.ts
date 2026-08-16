import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedSchools, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check for duplicate entry (same name and branch)
    const existingSchool = await prisma.schoolEntry.findFirst({
      where: {
        name: { equals: data.name },
        branch: { equals: data.branch }
      }
    });

    if (existingSchool) {
      return NextResponse.json({ error: 'School with this branch already exists' }, { status: 409 });
    }
    
    const newSchool = await prisma.schoolEntry.create({
      data: {
        name: data.name,
        address: data.address,
        branch: data.branch,
        city: data.city,
        code: data.code || null,
      },
    });

    // Invalidate cache immediately
    revalidateCacheTag('schools');
    revalidateCacheTag('task-users');
    revalidatePath('/school');
    revalidatePath('/view-data');

    return NextResponse.json(newSchool, { status: 201 });
  } catch (error: any) {
    console.error('Error creating school entry:', error);
    return NextResponse.json({ error: 'Failed to create school', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const schools = await getCachedSchools();
    return NextResponse.json(schools, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch schools', details: error.message }, { status: 500 });
  }
}
