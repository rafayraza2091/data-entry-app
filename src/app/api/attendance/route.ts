import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

    let users: any[] = [];

    // Fetch users based on role
    if (role === 'STUDENT') {
      const students = await prisma.student.findMany({
        where: { userId: { not: null } },
        select: { userId: true, firstName: true, secondName: true, className: true }
      });
      users = students.map(s => ({
        userId: s.userId,
        name: `${s.firstName} ${s.secondName}`,
        department: s.className || 'N/A'
      }));
    } else if (role === 'TEACHER') {
      const teachers = await prisma.teacher.findMany({
        where: { userId: { not: null } },
        select: { userId: true, firstName: true, secondName: true }
      });
      users = teachers.map(t => ({
        userId: t.userId,
        name: `${t.firstName} ${t.secondName}`,
        department: 'Teacher'
      }));
    } else if (role === 'COORDINATOR') {
      const admins = await prisma.admin.findMany({
        where: { userId: { not: null } },
        select: { userId: true, firstName: true, secondName: true }
      });
      users = admins.map(a => ({
        userId: a.userId,
        name: `${a.firstName} ${a.secondName}`,
        department: 'Coordinator'
      }));
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Fetch attendance for these users on this date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: date,
        userId: { in: users.map(u => u.userId) }
      }
    });

    // Merge attendance records into user list
    const enrichedUsers = users.map(user => {
      const record = attendanceRecords.find(a => a.userId === user.userId);
      return {
        ...user,
        attendanceId: record?.id || null,
        status: record?.status || 'PRESENT',
        reason: record?.reason || '',
        isLocked: record?.isLocked || false,
        isConfirmed: record?.isConfirmed || false,
        markedBy: record?.markedBy || ''
      };
    });

    return NextResponse.json(enrichedUsers);
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
        if (!isOwner && existing.isLocked) {
          continue; // Skip locked records for non-owners
        }

        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status,
            reason: status === 'ABSENT' || status === 'LEAVE' ? reason : null,
            markedBy: isOwner ? existing.markedBy : session.username,
            isLocked: isOwner ? existing.isLocked : true,
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
            isLocked: !isOwner,
            isConfirmed: false
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
