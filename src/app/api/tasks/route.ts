import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    const { createdBy, className, subject, book, chapter, topic, exercise, description, reporter, assignee, status, taskType, dueDate } = data;

    if (!createdBy || !subject || !description || !reporter || !assignee) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const taskEntry = await prisma.taskEntry.create({
      data: {
        createdBy,
        className: className || null,
        subject,
        book,
        chapter,
        topic,
        exercise,
        description,
        reporter,
        assignee,
        status: status || 'OPEN',
        taskType: taskType || 'Home Work',
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    return NextResponse.json(taskEntry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignee = searchParams.get('assignee');
    const reporter = searchParams.get('reporter');
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const taskType = searchParams.get('taskType');
    const createdBy = searchParams.get('createdBy');
    const className = searchParams.get('className');
    const dateFilter = searchParams.get('dateFilter');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};

    // Role-based access control
    if (session.role === 'STUDENT') {
      const userName = `${session.firstName} ${session.lastName}`.trim();
      whereClause.OR = [
        { assignee: userName },
        { createdBy: userName }
      ];
    }

    // Apply URL filters
    if (assignee) whereClause.assignee = assignee;
    if (reporter) whereClause.reporter = reporter;
    if (subject) whereClause.subject = subject;
    if (status) whereClause.status = status;
    if (taskType) whereClause.taskType = taskType;
    if (createdBy) whereClause.createdBy = createdBy;
    if (className) whereClause.className = className;

    // Date filtering (Default to 7 days if no dates provided at all)
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
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
    } else if (!startDate && !endDate && !dateFilter) {
      // Default fallback: 7 days
      const lastWeek = new Date();
      lastWeek.setHours(0, 0, 0, 0);
      lastWeek.setDate(lastWeek.getDate() - 7);
      whereClause.createdAt = { gte: lastWeek };
    }

    // Execute query
    const tasks = await prisma.taskEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Generate Analytics
    const statusCounts = await prisma.taskEntry.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true }
    });

    const typeCounts = await prisma.taskEntry.groupBy({
      by: ['taskType'],
      where: whereClause,
      _count: { id: true }
    });

    const studentCounts = await prisma.taskEntry.groupBy({
      by: ['assignee'],
      where: whereClause,
      _count: { id: true }
    });

    const analytics = {
      byStatus: statusCounts.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr._count.id }), {}),
      byType: typeCounts.reduce((acc: any, curr) => ({ ...acc, [curr.taskType || 'Unknown']: curr._count.id }), {}),
      byStudent: studentCounts.map(s => ({
        studentName: s.assignee,
        totalTasks: s._count.id
      }))
    };

    return NextResponse.json({
      success: true,
      data: tasks,
      analytics: analytics,
      meta: {
        totalRecords: tasks.length
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    const { id, fieldName, newValue } = data;

    if (!id || !fieldName) {
      return NextResponse.json({ error: 'Missing id or fieldName' }, { status: 400 });
    }

    // Verify task exists
    const existingTask = await prisma.taskEntry.findUnique({
      where: { id: Number(id) }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (session.role === 'STUDENT') {
      const userName = `${session.firstName} ${session.lastName}`.trim();
      if (existingTask.assignee !== userName && existingTask.createdBy !== userName) {
        return NextResponse.json({ error: 'Not authorized to edit this task' }, { status: 403 });
      }
    }

    // Allowed fields
    const allowedFields = ['description', 'status', 'subject', 'book', 'chapter', 'topic', 'exercise', 'taskType', 'dueDate', 'assignee', 'reporter', 'rescheduledToId'];
    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    let parsedValue = newValue;
    if (fieldName === 'dueDate') {
      parsedValue = newValue ? new Date(newValue) : null;
    }

    const updatedTask = await prisma.taskEntry.update({
      where: { id: Number(id) },
      data: { [fieldName]: parsedValue }
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const existingTask = await prisma.taskEntry.findUnique({
      where: { id: Number(id) }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (session.role === 'STUDENT') {
      const userName = `${session.firstName} ${session.lastName}`.trim();
      if (existingTask.assignee !== userName && existingTask.createdBy !== userName) {
        return NextResponse.json({ error: 'Not authorized to delete this task' }, { status: 403 });
      }
    }

    await prisma.taskEntry.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task', details: error.message }, { status: 500 });
  }
}
