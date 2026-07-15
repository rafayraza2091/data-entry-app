import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allUsers = await prisma.dataentryUser.findMany({
      select: {
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { firstName: 'asc' }
    });

    const teachers = allUsers.filter(u => u.role === 'TEACHER' || u.role === 'COORDINATOR');
    const rawStudents = allUsers.filter(u => u.role === 'STUDENT');
    const admins = allUsers.filter(u => u.role === 'OWNER' || u.role === 'ASSISTANT'); // Removed COORDINATOR from here since they act like teachers
    const owners = allUsers.filter(u => u.role === 'OWNER');

    const studentsDb = await prisma.student.findMany({
      select: { firstName: true, secondName: true, className: true, schoolName: true }
    });

    const students = rawStudents.map(u => {
      const studentData = studentsDb.find(s => {
        const uFirst = u.firstName?.trim().toLowerCase() || '';
        const sFirst = s.firstName?.trim().toLowerCase() || '';
        if (uFirst !== sFirst) return false;

        const uLast = (u.lastName || '').trim().toLowerCase();
        const sLast = (s.secondName || '').trim().toLowerCase();
        
        return uLast === sLast || uLast === '.' || uLast === '';
      });
      return {
        ...u,
        className: studentData?.className || '',
        schoolName: studentData?.schoolName || ''
      };
    });

    return NextResponse.json({ teachers, students, admins, owners }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching task users:', error);
    return NextResponse.json({ error: 'Failed to fetch task users' }, { status: 500 });
  }
}
