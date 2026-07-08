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
    const { createdBy, className, subject, book, chapter, topic, exercise, description, reporter, assignee, status, taskType } = data;

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
        taskType: taskType || 'Home Work'
      }
    });

    return NextResponse.json(taskEntry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let whereClause = {};
    if (session.role === 'STUDENT') {
      const userName = `${session.firstName} ${session.lastName}`.trim();
      whereClause = {
        OR: [
          { assignee: userName },
          { createdBy: userName }
        ]
      };
    }

    const tasks = await prisma.taskEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tasks, { status: 200 });
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
    const allowedFields = ['description', 'status', 'subject', 'book', 'chapter', 'topic', 'exercise', 'taskType'];
    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    const updatedTask = await prisma.taskEntry.update({
      where: { id: Number(id) },
      data: { [fieldName]: newValue }
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task', details: error.message }, { status: 500 });
  }
}
