import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find distinct dates where attendance is locked but not confirmed
    const pendingRecords = await prisma.attendance.findMany({
      where: {
        isLocked: true,
        isConfirmed: false
      },
      select: {
        date: true,
        userId: true
      }
    });

    // Group by date to get a summary
    const summary = pendingRecords.reduce((acc: any, record) => {
      if (!acc[record.date]) {
        acc[record.date] = 0;
      }
      acc[record.date]++;
      return acc;
    }, {});

    const pendingDates = Object.keys(summary).map(date => ({
      date,
      count: summary[date]
    })).sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json(pendingDates);
  } catch (error: any) {
    console.error('Error fetching pending attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch pending attendance' }, { status: 500 });
  }
}
