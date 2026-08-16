import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidateCacheTag, revalidatePath } from '@/lib/cached-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can confirm attendance' }, { status: 403 });
    }

    const { date, role } = await request.json();
    if (!date || !role) {
      return NextResponse.json({ error: 'Missing date or role' }, { status: 400 });
    }

    // Determine the users for this role
    let users: any[] = [];
    if (role === 'STUDENT') {
      users = await prisma.student.findMany({ where: { userId: { not: null } }, select: { userId: true } });
    } else if (role === 'TEACHER') {
      users = await prisma.teacher.findMany({ where: { userId: { not: null } }, select: { userId: true } });
    } else if (role === 'COORDINATOR') {
      users = await prisma.admin.findMany({ where: { userId: { not: null } }, select: { userId: true } });
    }

    const userIds = users.map(u => u.userId);

    // Update all attendance records for these users on this date to be confirmed
    await prisma.attendance.updateMany({
      where: {
        date,
        userId: { in: userIds }
      },
      data: {
        isConfirmed: true
      }
    });

    // Invalidate caches
    revalidateCacheTag('attendance');
    revalidateCacheTag('bird-view');
    revalidatePath('/attendance');
    revalidatePath('/bird-view');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error confirming attendance:', error);
    return NextResponse.json({ error: 'Failed to confirm attendance' }, { status: 500 });
  }
}
