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
    const { createdBy, className, subject, book, chapter, topic, exercise, description, reporter, assignee, status, taskType, dueDate, totalMarks, obtainedMarks, images } = data;

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
        dueDate: dueDate ? new Date(dueDate) : null,
        totalMarks: 10,
        obtainedMarks: obtainedMarks !== undefined ? parseFloat(obtainedMarks) : null,
        images: Array.isArray(images) ? images : []
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

    // Date filtering (Default to today if no dates provided at all)
    if (startDate || endDate) {
      whereClause.dueDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.dueDate.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.dueDate.lte = end;
      }
    } else if (dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      if (dateFilter === 'today') {
        whereClause.dueDate = { gte: today, lte: endOfToday };
      } else if (dateFilter === 'this_week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        whereClause.dueDate = { gte: lastWeek };
      } else if (dateFilter === 'this_month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        whereClause.dueDate = { gte: lastMonth };
      }
    } else if (!dateFilter) {
      // Default fallback: today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      whereClause.dueDate = { gte: today, lte: endOfToday };
    }

    // Execute query
    const tasks = await prisma.taskEntry.findMany({
      where: whereClause,
      include: {
        comments: {
          include: {
            replies: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { dueDate: 'asc' }
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

      if (fieldName === 'obtainedMarks' || fieldName === 'totalMarks') {
        return NextResponse.json({ error: 'Students cannot update marks' }, { status: 403 });
      }
    }

    // Allowed fields
    const allowedFields = ['description', 'status', 'subject', 'book', 'chapter', 'topic', 'exercise', 'taskType', 'dueDate', 'assignee', 'reporter', 'rescheduledToId', 'totalMarks', 'obtainedMarks', 'images'];
    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    let parsedValue = newValue;
    if (fieldName === 'dueDate') {
      parsedValue = newValue ? new Date(newValue) : null;
    } else if (fieldName === 'totalMarks' || fieldName === 'obtainedMarks') {
      parsedValue = newValue !== null && newValue !== '' ? parseFloat(newValue) : null;
    } else if (fieldName === 'images') {
      parsedValue = Array.isArray(newValue) ? newValue : [];
    }

    const updateData: any = { [fieldName]: parsedValue };
    
    // Auto-set totalMarks to 10 if we are updating obtainedMarks and totalMarks is empty
    if (fieldName === 'obtainedMarks') {
      if (!existingTask.totalMarks) {
        updateData.totalMarks = 10;
      }
    }

    const updatedTask = await prisma.taskEntry.update({
      where: { id: Number(id) },
      data: updateData
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
