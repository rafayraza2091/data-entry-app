import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getCachedAttendanceGrid, revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const role = searchParams.get('role');

    if (!date || !role) {
      return NextResponse.json({ error: 'Missing date or role' }, { status: 400 });
    }

    if (!['STUDENT', 'TEACHER', 'COORDINATOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const enrichedUsers = await getCachedAttendanceGrid(date, role);
    return NextResponse.json(enrichedUsers, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=120',
      }
    });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, records } = await request.json();
    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const isOwner = session.role === 'OWNER';
    const isCoordinator = session.role === 'COORDINATOR';
    const isTeacher = session.role === 'TEACHER';

    if (!isOwner && !isCoordinator && !isTeacher) {
      return NextResponse.json({ error: 'Unauthorized to mark attendance' }, { status: 403 });
    }

    // Process each record
    for (const record of records) {
      const { userId, status, reason } = record;

      const existing = await prisma.attendance.findUnique({
        where: { userId_date: { userId, date } }
      });

      if (existing) {
        if (!isOwner && !isCoordinator && existing.isLocked) {
          continue; // Skip locked records for non-owners
        }

        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status,
            reason: status === 'ABSENT' || status === 'LEAVE' ? reason : null,
            markedBy: (isOwner || isCoordinator) ? existing.markedBy : session.username,
            isLocked: true,
          }
        });
      } else {
        await prisma.attendance.create({
          data: {
            userId,
            date,
            status,
            reason: status === 'ABSENT' || status === 'LEAVE' ? reason : null,
            markedBy: session.username,
            isLocked: true,
            isConfirmed: false
          }
        });
      }
    }

    // Invalidate caches
    revalidateCacheTag('attendance');
    revalidateCacheTag('bird-view');
    revalidatePath('/attendance');
    revalidatePath('/bird-view');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
