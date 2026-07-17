import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { originalTaskId, newDate } = await request.json();

    if (!originalTaskId || !newDate) {
      return NextResponse.json({ error: 'Missing originalTaskId or newDate' }, { status: 400 });
    }

    // Find original task
    const originalTask = await prisma.taskEntry.findUnique({
      where: { id: Number(originalTaskId) }
    });

    if (!originalTask) {
      return NextResponse.json({ error: 'Original task not found' }, { status: 404 });
    }

    if (originalTask.rescheduledToId) {
       return NextResponse.json({ error: 'Task was already rescheduled' }, { status: 400 });
    }

    const currentUserName = `${session.firstName} ${session.lastName}`.trim();
    const newRescheduleCount = (originalTask.rescheduleCount || 0) + 1;

    // Use a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new task
      const newTask = await tx.taskEntry.create({
        data: {
          createdBy: currentUserName,
          reporter: currentUserName,
          className: originalTask.className,
          subject: originalTask.subject,
          book: originalTask.book,
          chapter: originalTask.chapter,
          topic: originalTask.topic,
          exercise: originalTask.exercise,
          description: originalTask.description,
          assignee: originalTask.assignee,
          taskType: originalTask.taskType,
          status: 'OPEN',
          dueDate: new Date(newDate),
          rescheduleCount: newRescheduleCount,
          rescheduledFromId: originalTask.id
        }
      });

      // 2. Update the original task
      const updatedOriginalTask = await tx.taskEntry.update({
        where: { id: originalTask.id },
        data: {
          status: 'PENDING',
          rescheduledToId: newTask.id
        }
      });

      return { originalTask: updatedOriginalTask, newTask };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error rescheduling task:', error);
    return NextResponse.json({ error: 'Failed to reschedule task', details: error.message }, { status: 500 });
  }
}
