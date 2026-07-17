import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const viewType = searchParams.get('view'); // 'task' or 'query'
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subjects = await prisma.subjectEntry.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      }
    });

    let students;
    if (session.role === 'STUDENT') {
      students = await prisma.$queryRaw`
        SELECT id, "firstName", "secondName", subjects, "className" 
        FROM "Student" 
        WHERE status = 'Active' 
        AND "firstName" = ${session.firstName} 
        AND "secondName" = ${session.lastName} 
        ORDER BY "firstName" ASC
      `;
    } else {
      students = await prisma.$queryRaw`
        SELECT id, "firstName", "secondName", subjects, "className" 
        FROM "Student" 
        WHERE status = 'Active' 
        ORDER BY "firstName" ASC
      `;
    }

    let cellData: any[] = [];
    if (dateStr && viewType) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      if (viewType === 'task') {
        cellData = await prisma.taskEntry.findMany({
          where: {
            dueDate: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          select: {
            id: true,
            assignee: true,
            subject: true,
            status: true,
            taskType: true,
            book: true,
            chapter: true,
            topic: true,
            exercise: true,
            description: true,
            reporter: true,
            createdBy: true,
            className: true,
            dueDate: true,
            rescheduleCount: true,
            rescheduledFromId: true,
            rescheduledToId: true
          }
        });
      } else if (viewType === 'query') {
        cellData = await prisma.queryEntry.findMany({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          select: {
            id: true,
            studentName: true,
            subject: true,
            status: true
          }
        });
      }
    }

    return NextResponse.json({ subjects, students, cellData });
    } catch (error: any) {
      console.error('Error fetching bird view data:', error);
      try {
        require('fs').writeFileSync('/tmp/bird-view-error.log', error.message || String(error));
      } catch(e) {}
      return NextResponse.json(
        { error: 'Failed to fetch bird view data' },
        { status: 500 }
      );
  } finally {
    await prisma.$disconnect();
  }
}
