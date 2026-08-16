import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedFilteredQueries, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

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
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });

    // Invalidate caches
    revalidateCacheTag('queries');
    revalidateCacheTag('bird-view');
    revalidatePath('/view-queries');
    revalidatePath('/bird-view');

    return NextResponse.json(newQuery, { status: 201 });
  } catch (error: any) {
    console.error('Error creating query entry:', error);
    return NextResponse.json({ error: 'Failed to create query entry', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentName = searchParams.get('studentName');
    const teacherName = searchParams.get('teacherName');
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const dateFilter = searchParams.get('dateFilter');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const { queries, analytics } = await getCachedFilteredQueries({
      studentName,
      teacherName,
      subject,
      status,
      dateFilter,
      startDate,
      endDate,
      search,
    });

    return NextResponse.json({
      success: true,
      data: queries,
      analytics: analytics,
      meta: {
        totalRecords: queries.length
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=120',
      }
    });
  } catch (error: any) {
    console.error('Error fetching queries:', error);
    return NextResponse.json({ error: 'Failed to fetch queries', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, fieldName, newValue } = data;

    if (!id || !fieldName) {
      return NextResponse.json({ error: 'Missing id or fieldName' }, { status: 400 });
    }

    const existingQuery = await prisma.queryEntry.findUnique({
      where: { id: Number(id) }
    });

    if (!existingQuery) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    const allowedFields = ['subject', 'book', 'chapter', 'topic', 'exercise', 'pageNumber', 'queryStatement', 'status', 'images'];
    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    let parsedValue = newValue;
    if (fieldName === 'images') {
      parsedValue = Array.isArray(newValue) ? newValue : [];
    }

    const updateData: any = { [fieldName]: parsedValue };

    const updatedQuery = await prisma.queryEntry.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json(updatedQuery, { status: 200 });
  } catch (error: any) {
    console.error('Error updating query:', error);
    return NextResponse.json({ error: 'Failed to update query', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const existingQuery = await prisma.queryEntry.findUnique({
      where: { id: Number(id) }
    });

    if (!existingQuery) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    await prisma.queryEntry.delete({
      where: { id: Number(id) }
    });

    // Invalidate caches
    revalidateCacheTag('queries');
    revalidateCacheTag('bird-view');
    revalidatePath('/view-queries');
    revalidatePath('/bird-view');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting query:', error);
    return NextResponse.json({ error: 'Failed to delete query', details: error.message }, { status: 500 });
  }
}
