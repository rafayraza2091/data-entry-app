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
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });

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

    let whereClause: any = {};

    if (studentName) whereClause.studentName = studentName;
    if (teacherName) whereClause.teacherName = teacherName;
    if (subject) whereClause.subject = subject;
    if (status) whereClause.status = status;
    if (search) {
      whereClause.queryStatement = { contains: search, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    } else if (dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateFilter === 'today') {
        whereClause.createdAt = { gte: today };
      } else if (dateFilter === 'this_week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        whereClause.createdAt = { gte: lastWeek };
      } else if (dateFilter === 'this_month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        whereClause.createdAt = { gte: lastMonth };
      }
    } else if (!dateFilter) {
      // Default fallback: today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereClause.createdAt = { gte: today };
    }

    const queries = await prisma.queryEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Generate Analytics
    const statusCounts = await prisma.queryEntry.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true }
    });

    const subjectCounts = await prisma.queryEntry.groupBy({
      by: ['subject'],
      where: whereClause,
      _count: { id: true }
    });

    const analytics = {
      byStatus: statusCounts.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr._count.id }), {}),
      bySubject: subjectCounts.reduce((acc: any, curr) => ({ ...acc, [curr.subject || 'Unknown']: curr._count.id }), {})
    };

    return NextResponse.json({
      success: true,
      data: queries,
      analytics: analytics,
      meta: {
        totalRecords: queries.length
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching queries:', error);
    return NextResponse.json({ error: 'Failed to fetch queries', details: error.message }, { status: 500 });
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting query:', error);
    return NextResponse.json({ error: 'Failed to delete query', details: error.message }, { status: 500 });
  }
}
